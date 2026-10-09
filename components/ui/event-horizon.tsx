"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/*  A light black hole                                                        */
/*                                                                            */
/*  The ray-marched version walks every pixel's light through curved space,   */
/*  hundreds of steps a frame. This one draws the same picture directly, in   */
/*  one pass, from what that march would have found:                          */
/*                                                                            */
/*    - the shadow, a black disc                                              */
/*    - the photon ring, light that circled once before escaping              */
/*    - the disc, seen almost edge-on: its near half crosses in front of the  */
/*      shadow, its far half goes behind it                                   */
/*    - the halo, that same far half lifted over and under the shadow by the  */
/*      bending of light, so it hugs the rim as a band                        */
/*                                                                            */
/*  The halo reads the same gas as the disc, so the two always agree. Gas     */
/*  orbits on Kepler's law, which shears it into spirals, and the side coming */
/*  toward the camera is beamed brighter. Stars behind it are lensed too.     */
/*                                                                            */
/*  Units in the shader are shadow radii: r = 1 is the edge of the shadow.    */
/* -------------------------------------------------------------------------- */

export interface EventHorizonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Radius of the shadow, as a fraction of the frame's height. */
  size?: number;
  /** Degrees the camera sits above the disc plane. Small is the cinematic edge-on view. */
  tilt?: number;
  /** Turns the picture about the line of sight, in degrees. */
  roll?: number;
  /** Turns of the inner rim per second. The rest of the disc lags, by Kepler. */
  spinSpeed?: number;
  /** Size of the turbulence in the gas. Higher is finer. */
  grain?: number;
  /** Relativistic beaming, 0 to 1: how much brighter the approaching side is. */
  doppler?: number;
  /** Overall brightness of the gas. */
  brightness?: number;
  /** Brightest gas, at the inner rim. */
  hotColor?: string;
  /** Mid-disc. */
  midColor?: string;
  /** Coolest gas, at the outer edge. */
  coolColor?: string;
  /** Background stars, 0 to 2. */
  starBrightness?: number;
  /**
   * How far the stars drift toward the mouse, as a fraction of the frame's
   * height. 0 holds the sky still. Mouse and pen only; touch scrolling would
   * otherwise drag the sky around.
   */
  starParallax?: number;
  /** Soft glow around the ring and along the disc, 0 to 2. */
  glow?: number;
  /** Exposure into the tone curve. */
  exposure?: number;
  /** Corner darkening, 0 to 1. */
  vignette?: number;
  /** Render scale, 0.4 to 1. The picture is soft by nature; 0.75 is plenty. */
  resolution?: number;
  /** Cap on device pixel ratio. */
  maxDpr?: number;
  /** Where the hole sits, as fractions of width and height from the top left. */
  focus?: [number, number];
  /** Darkens one edge so text can sit there. */
  scrim?: "none" | "left" | "right" | "top" | "bottom";
  /** How dark that edge gets, 0 to 1. */
  scrimStrength?: number;
  /** Stops drawing entirely and holds the last frame. */
  paused?: boolean;
  children?: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Shaders                                                                   */
/* -------------------------------------------------------------------------- */

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uFocus;
uniform float uSize;
uniform float uRoll;
uniform float uIncl;
uniform float uSpin;
uniform float uGrain;
uniform float uDoppler;
uniform float uBright;
uniform vec3  uHot;
uniform vec3  uMid;
uniform vec3  uCool;
uniform float uStars;
uniform float uGlow;
uniform float uExposure;
uniform float uVignette;
uniform float uScrimDir;
uniform float uScrimAmt;
uniform float uSeed;
uniform vec2  uStarShift;

// Inner edge of the disc — the innermost stable orbit, just outside the shadow
// as the camera sees it — and the outer edge.
#define R_IN  1.18
#define R_OUT 6.0

// Seconds before the sheared gas hands over to a fresh copy. Without this the
// spirals wind tighter forever and end in moire. Short enough that the inner
// rim winds only a turn or so past the outer edge: long arms, not tight rings.
#define WIND 18.0

// How far the halo spreads the far side of the disc out from the rim.
#define HALO_SPREAD 2.2

/* --- noise ---------------------------------------------------------------- */

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * noise(p);
    p = p * 2.03 + vec2(17.1, 9.7);
    a *= 0.5;
  }
  return s;
}

/**
 * fbm that knows how big a pixel is. fw is the width of one pixel in noise
 * units; any octave whose cells would be smaller than about a pixel and a half
 * is faded to its average instead of sampled. Sampled, it beats against the
 * pixel grid — which is what turns the squashed front of the disc into dashes.
 */
float fbmL(vec2 p, float fw) {
  float s = 0.0;
  float a = 0.5;
  float f = 1.0;
  for (int i = 0; i < 4; i++) {
    float keep = clamp(1.6 - fw * f * 2.2, 0.0, 1.0);
    s += a * mix(0.5, noise(p), keep);
    p = p * 2.03 + vec2(17.1, 9.7);
    a *= 0.5;
    f *= 2.03;
  }
  return s;
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

/* --- the gas -------------------------------------------------------------- */

/**
 * Light from the disc at a point on its plane, in shadow radii. rgb is the
 * glow; a is how much it hides whatever is behind it.
 */
vec4 gas(vec2 d, float fw) {
  float r = length(d);
  if (r < R_IN * 0.9 || r > R_OUT) return vec4(0.0);

  // Kepler: every radius turns at its own rate, and that shear is what draws
  // the trailing spirals. Two copies run half a cycle apart and crossfade, so
  // neither ever winds past one cycle's worth.
  float omega = uSpin * pow(R_IN / r, 1.5);
  float u = uTime / WIND;
  float fA = fract(u);
  float fB = fract(u + 0.5);
  float w = abs(2.0 * fA - 1.0);
  float lr = log(r) * 3.0;
  float fwN = fw * uGrain;
  float na = fbmL(rot(omega * fA * WIND) * d * uGrain + vec2(lr, 0.0), fwN);
  float nb = fbmL(rot(omega * fB * WIND) * d * uGrain + vec2(lr + 31.0, 7.0), fwN);
  float n = mix(na, nb, w);

  // Bright at the rim, gone by the outer edge. Squared so the gaps between
  // filaments go properly dark.
  float inner = smoothstep(R_IN * 0.9, R_IN * 1.12, r);
  float outer = 1.0 - smoothstep(R_OUT * 0.3, R_OUT, r);
  float dens = max(0.0, n * n * 1.9 - 0.2) * inner * outer * pow(R_IN / r, 1.3);

  // Temperature falls with radius; the colour ramp rides it.
  float heat = pow(R_IN / r, 0.85) * (0.7 + 0.6 * n);
  vec3 tint = mix(uCool, uMid, smoothstep(0.12, 0.55, heat));
  tint = mix(tint, uHot, smoothstep(0.55, 1.05, heat));

  // Beaming. Gas on the approaching side (x < 0 here) is thrown brighter and
  // bluer, the receding side dimmer and redder. Faster near the rim.
  float beta = 0.55 * sqrt(R_IN / r);
  float toward = -d.x / r;
  float boost = pow(max(0.05, 1.0 + beta * toward), 3.0 * uDoppler);
  vec3 shift = mix(
    vec3(1.0),
    toward > 0.0 ? vec3(0.9, 0.96, 1.1) : vec3(1.1, 0.84, 0.68),
    abs(toward) * beta * uDoppler
  );

  float emit = uBright * (0.3 + 2.2 * heat * heat);
  return vec4(tint * shift * (emit * boost * dens * 2.4), clamp(dens * 1.5, 0.0, 1.0));
}

/* --- stars ---------------------------------------------------------------- */

/**
 * Two layers of stars. shift slides the sky toward the pointer, the near
 * (coarser) layer further than the far one, so moving the mouse reads as depth.
 * The shift is applied before the sky is drawn but after the lensing, so stars
 * still bend around the hole as they drift past it.
 */
vec3 stars(vec2 q, vec2 shift) {
  vec3 col = vec3(0.0);
  for (int k = 0; k < 2; k++) {
    float sc = 70.0 * (1.0 + float(k) * 1.8);
    vec2 g = (q - shift * (1.3 - 0.75 * float(k))) * sc;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash(id + float(k) * 13.1);
    if (h > 0.94) {
      vec2 o = vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5;
      float dd = length(f - o * 0.6);
      col += smoothstep(0.09, 0.0, dd) * (0.4 + 2.0 * fract(h * 91.0))
           * mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.75), hash(id + 5.0))
           / (1.0 + float(k));
    }
  }
  return col;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

/* --- frame ---------------------------------------------------------------- */

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - uFocus * uRes) / uRes.y;
  p = rot(uRoll) * p / uSize;
  float r = length(p);
  vec3 col = vec3(0.0);

  // The sky, bent. Each point is drawn from where gravity moved it, so stars
  // near the rim are pulled into arcs around it.
  if (uStars > 0.001 && r > 1.0) {
    float E = 1.9;
    vec2 src = p * (1.0 - (E * E) / (r * r));
    col += stars(src * uSize, rot(uRoll) * uStarShift) * uStars * smoothstep(1.0, 1.25, r);
  }

  // The disc plane, seen nearly edge-on: its depth is squashed into height.
  // One pixel, in shadow radii.
  float px = 1.0 / (uRes.y * uSize);
  vec2 d = vec2(p.x, p.y / uIncl);
  // Squashed by the tilt, one pixel spans far more disc in depth than across.
  vec4 disc = gas(d, px / uIncl);
  bool front = p.y < 0.0;

  // The halo: the far half of the disc, bent up over the shadow and down under
  // it, spread into a broad band that hugs the rim. Read from the same gas.
  // It is strongest straight over and under the hole; at the sides the real
  // disc is already there.
  if (r > 0.97 && r < 1.0 + (R_OUT - R_IN) / HALO_SPREAD) {
    float ang = atan(p.y, p.x);
    float hr = R_IN + (r - 1.0) * HALO_SPREAD;
    vec4 h = gas(vec2(cos(ang), abs(sin(ang))) * hr, px * HALO_SPREAD);
    float side = p.y > 0.0 ? 1.0 : 0.55;
    float overUnder = mix(0.35, 1.0, smoothstep(0.1, 0.7, abs(sin(ang))));
    col += h.rgb * exp(-(r - 1.0) * 1.1) * side * overUnder * 1.15;
  }

  // The far half of the disc is behind the hole.
  if (!front) col += disc.rgb;

  // The shadow takes everything behind it.
  col *= smoothstep(0.985, 1.01, r);

  // Photon ring: thin and hot, flickering with the gas it reflects.
  vec2 dir = p / max(r, 1e-3);
  float ring = exp(-pow((r - 1.015) / 0.013, 2.0));
  float flicker = 0.55 + 0.9 * fbm(dir * 3.0 + vec2(uTime * 0.2, 0.0));
  col += mix(uMid, uHot, 0.75) * ring * flicker * 1.4 * uBright;

  // The near half crosses in front of everything.
  if (front) col = col * (1.0 - disc.a) + disc.rgb;

  // Glow the camera would bloom: around the rim, and a long streak along the
  // plane of the disc.
  float glowRim = exp(-max(r - 1.0, 0.0) * 2.4) * smoothstep(0.8, 1.0, r);
  float glowPlane = exp(-abs(p.y) * 4.0) * exp(-abs(p.x) * 0.32);
  col += uGlow * (mix(uMid, uHot, 0.45) * 0.12 * glowRim + uMid * 0.07 * glowPlane);

  // Tone, gamma, corners.
  col = aces(col * uExposure);
  col = pow(max(col, 0.0), vec3(0.4545));
  vec2 c = uv - 0.5;
  col *= 1.0 - uVignette * dot(c, c) * 1.9;

  // The edge the copy sits on.
  if (uScrimDir > 0.5) {
    float x = uScrimDir < 1.5 ? uv.x
            : uScrimDir < 2.5 ? 1.0 - uv.x
            : uScrimDir < 3.5 ? 1.0 - uv.y
            : uv.y;
    col *= 1.0 - uScrimAmt * pow(1.0 - clamp(x, 0.0, 1.0), 2.4);
  }

  // A grain of dither, so the long dark ramps do not band.
  col += (hash(gl_FragCoord.xy + uSeed) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const RAD = Math.PI / 180;

/** Hex to linear light. The shader works in linear and gamma-encodes at the end. */
function hexToLinear(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function EventHorizon({
  size = 0.14,
  tilt = 6,
  roll = -20,
  spinSpeed = 0.06,
  grain = 1.5,
  doppler = 0.45,
  brightness = 1,
  hotColor = "#FFF3DE",
  midColor = "#FF9838",
  coolColor = "#8E3A0B",
  starBrightness = 0,
  starParallax = 0.05,
  glow = 1,
  exposure = 1,
  vignette = 0.28,
  resolution = 0.75,
  maxDpr = 1.5,
  focus = [0.72, 0.46],
  scrim = "none",
  scrimStrength = 0.9,
  paused = false,
  className = "",
  children,
  ...rest
}: EventHorizonProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Read every frame, so prop changes land without rebuilding anything.
  const props = useRef({
    size, tilt, roll, spinSpeed, grain, doppler, brightness, hotColor, midColor,
    coolColor, starBrightness, starParallax, glow, exposure, vignette, resolution, maxDpr,
    focus, scrim, scrimStrength, paused,
  });
  props.current = {
    size, tilt, roll, spinSpeed, grain, doppler, brightness, hotColor, midColor,
    coolColor, starBrightness, starParallax, glow, exposure, vignette, resolution, maxDpr,
    focus, scrim, scrimStrength, paused,
  };

  /** Set by the effect: wakes the loop when `paused` is lifted. */
  const wake = useRef<() => void>(() => {});
  useEffect(() => {
    if (!paused) wake.current();
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });

    // A dead or missing canvas paints white over the page; better to show the
    // black background and the copy alone.
    const giveUp = (why: string) => {
      host.dataset.webgl = why;
      canvas.style.display = "none";
    };
    if (!gl) {
      giveUp("unsupported");
      return;
    }

    /* --- program ---------------------------------------------------------- */

    let program: WebGLProgram | null = null;
    let vbo: WebGLBuffer | null = null;
    let u: Record<string, WebGLUniformLocation | null> = {};

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("event-horizon: shader failed —", gl.getShaderInfoLog(sh) || "no log");
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const build = () => {
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const prog = gl.createProgram();
      if (!prog) return false;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.bindAttribLocation(prog, 0, "aPos");
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
        return false;
      }
      program = prog;
      u = {};
      const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(prog, i);
        if (info) u[info.name] = gl.getUniformLocation(prog, info.name);
      }
      // One triangle that covers the frame.
      vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.useProgram(prog);
      return true;
    };

    /* --- size ------------------------------------------------------------- */

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const C = props.current;
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(1, C.maxDpr));
      const scale = Math.min(1, Math.max(0.4, C.resolution));
      const w = Math.max(2, Math.round(rect.width * dpr * scale));
      const h = Math.max(2, Math.round(rect.height * dpr * scale));
      if (w === width && h === height) return false;
      width = w;
      height = h;
      // The canvas is drawn small and stretched by CSS; the picture is soft
      // light and glow, so the upscale costs nothing you can see.
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      return true;
    };

    /* --- draw ------------------------------------------------------------- */

    let clock = reduced ? 8 : 0;
    let lastFrame = 0;
    let raf = 0;
    let visible = true;
    let alive = true;

    // Where the pointer is over the frame, -1 to 1 each way, and where the sky
    // has eased to so far. The sky chases the pointer instead of snapping to
    // it, which is what makes it feel like depth rather than a cursor effect.
    let targetX = 0;
    let targetY = 0;
    let skyX = 0;
    let skyY = 0;

    const draw = () => {
      if (!program) return;
      const C = props.current;
      const hot = hexToLinear(C.hotColor);
      const mid = hexToLinear(C.midColor);
      const cool = hexToLinear(C.coolColor);
      gl.uniform2f(u.uRes!, width, height);
      gl.uniform1f(u.uTime!, clock);
      gl.uniform2f(u.uFocus!, C.focus[0], 1 - C.focus[1]);
      gl.uniform1f(u.uSize!, Math.max(0.02, C.size));
      gl.uniform1f(u.uRoll!, C.roll * RAD);
      gl.uniform1f(u.uIncl!, Math.max(0.02, Math.sin(Math.max(1, Math.min(80, C.tilt)) * RAD)));
      gl.uniform1f(u.uSpin!, C.spinSpeed * Math.PI * 2);
      gl.uniform1f(u.uGrain!, Math.max(0.1, C.grain));
      gl.uniform1f(u.uDoppler!, Math.max(0, Math.min(1, C.doppler)));
      gl.uniform1f(u.uBright!, Math.max(0, C.brightness));
      gl.uniform3f(u.uHot!, hot[0], hot[1], hot[2]);
      gl.uniform3f(u.uMid!, mid[0], mid[1], mid[2]);
      gl.uniform3f(u.uCool!, cool[0], cool[1], cool[2]);
      gl.uniform1f(u.uStars!, Math.max(0, C.starBrightness));
      gl.uniform1f(u.uGlow!, Math.max(0, C.glow));
      gl.uniform1f(u.uExposure!, Math.max(0.05, C.exposure));
      gl.uniform1f(u.uVignette!, Math.max(0, Math.min(1, C.vignette)));
      gl.uniform1f(
        u.uScrimDir!,
        C.scrim === "left" ? 1 : C.scrim === "right" ? 2 : C.scrim === "top" ? 3 : C.scrim === "bottom" ? 4 : 0
      );
      gl.uniform1f(u.uScrimAmt!, Math.max(0, Math.min(1, C.scrimStrength)));
      gl.uniform1f(u.uSeed!, (clock * 60) % 1000);
      // gl_FragCoord counts y up; the pointer counts it down.
      const par = Math.max(0, C.starParallax);
      gl.uniform2f(u.uStarShift!, skyX * par, -skyY * par);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // The loop only runs while there is something to show. Off screen, in a
    // hidden tab, paused, or for a reader who wants no motion, it stops
    // outright — not idling, stopped — and is woken when that changes.
    const shouldRun = () => alive && visible && !document.hidden && !reduced && !props.current.paused;

    const tick = (now: number) => {
      raf = 0;
      if (!shouldRun()) return;
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
      lastFrame = now;
      clock += dt;
      const ease = 1 - Math.exp(-dt * 4);
      skyX += (targetX - skyX) * ease;
      skyY += (targetY - skyY) * ease;
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || !shouldRun()) return;
      lastFrame = 0;
      raf = requestAnimationFrame(tick);
    };
    wake.current = start;

    if (!build()) {
      giveUp("build-failed");
      return;
    }
    resize();
    draw();
    start();

    /* --- the world -------------------------------------------------------- */

    const ro = new ResizeObserver(() => {
      if (resize()) draw();
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        start();
      },
      { threshold: 0 }
    );
    io.observe(host);

    const onVisibility = () => start();

    // Listened for on the window, not the canvas: in a hero the copy sits on
    // top of the canvas and would swallow the events.
    const clampUnit = (v: number) => Math.max(-1.2, Math.min(1.2, v));
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      targetX = clampUnit(((e.clientX - rect.left) / rect.width) * 2 - 1);
      targetY = clampUnit(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    // The pointer left the window: let the sky drift home.
    const onPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) targetX = targetY = 0;
    };
    const onBlur = () => {
      targetX = targetY = 0;
    };
    if (!reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerout", onPointerOut, { passive: true });
      window.addEventListener("blur", onBlur);
    }
    const onLost = (e: Event) => {
      e.preventDefault();
      alive = false;
      cancelAnimationFrame(raf);
      raf = 0;
      canvas.style.display = "none";
    };
    const onRestored = () => {
      width = height = 0;
      if (!build()) {
        giveUp("lost");
        return;
      }
      canvas.style.display = "";
      host.dataset.webgl = "";
      alive = true;
      resize();
      draw();
      start();
    };

    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wake.current = () => {};
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", onBlur);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (vbo) gl.deleteBuffer(vbo);
      if (program) gl.deleteProgram(program);
      // The context itself is left alive: StrictMode runs effects twice on the
      // same canvas, and a deliberately lost context comes back dead.
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`relative isolate h-full w-full overflow-hidden bg-black ${className}`}
      {...rest}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}

export default EventHorizon;
