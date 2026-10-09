/**
 * Everything the portfolio says, in one place. Content comes straight from
 * the resume; edit here and every section follows.
 */

export const profile = {
  name: "Muhammad Uzair Nisar",
  firstName: "Uzair",
  title: "Technical Team Lead",
  location: "Lahore, Pakistan",
  email: "muhammaduzairnisar01@gmail.com",
  phone: "+92 311 7046530",
  /** Served from /public. Replace that file to update the download. */
  resume: "/Muhammad_Uzair_Nisar_Resume.pdf",
  // TODO: replace with the real LinkedIn profile URL.
  linkedin: "https://www.linkedin.com/",
  github: "https://github.com/MuhammadUzairNisar",
  summary:
    "Senior Software Engineer with 5+ years of experience architecting and delivering full-stack enterprise systems. I lead feature ownership across web platforms, design scalable architecture, build RESTful APIs and integrations, and mentor engineers through hands-on collaboration.",
  summaryMore:
    "A published IEEE researcher in automated systems design, I bring a rigorous, research-driven approach to engineering problems — and I'm actively deepening hands-on expertise in LLM, RAG, and AI-agent engineering.",
};

export const stats = [
  { value: "5+", label: "Years shipping production software" },
  { value: "6", label: "Enterprise & consumer platforms delivered" },
  { value: "IEEE", label: "Published researcher, automated systems" },
  { value: "3", label: "Roles grown through, junior to lead" },
];

export const competencies = [
  "Technical Leadership & Mentoring",
  "System Design & Software Architecture",
  "Microservices & API Development",
  "Cross-Functional Project Ownership",
  "Enterprise Application Development",
  "Full-Stack Engineering",
  "Database Design",
  "Cloud-Deployed Systems",
  "Agile / Scrum Delivery",
  "Code Review & Quality Ownership",
  "AI-Assisted Development Workflows",
];

export type Role = {
  title: string;
  company: string;
  period: string;
  points: string[];
};

export const experience: Role[] = [
  {
    title: "Technical Team Lead",
    company: "Biafo Tech Pvt. Ltd.",
    period: "Jan 2024 — Present",
    points: [
      "Lead end-to-end development of full-stack web applications, owning architectural decisions across frontend and backend for scalability, maintainability and performance.",
      "Drive feature delivery from requirements through deployment, translating business needs into technical specifications with product and design.",
      "Architect performance and reliability improvements that reduce technical debt and strengthen production resilience.",
      "Mentor junior engineers on code quality, architecture patterns and best practices.",
      "Integrate AI-assisted development tools (GitHub Copilot-based workflows) to speed up and standardise code review.",
    ],
  },
  {
    title: "Senior Software Engineer",
    company: "Biafo Tech Pvt. Ltd.",
    period: "Jan 2023 — Dec 2023",
    points: [
      "Built and maintained production MERN applications, optimising frontend rendering and backend response times.",
      "Designed RESTful APIs supporting multiple concurrent client projects with consistent contracts across services.",
      "Worked directly with clients to scope features, troubleshoot production issues and ship iterative releases.",
    ],
  },
  {
    title: "Junior Software Engineer",
    company: "Biafo Tech Pvt. Ltd.",
    period: "Apr 2021 — Dec 2022",
    points: [
      "Developed features for production web applications across the full development lifecycle.",
      "Built and tested RESTful APIs and frontend components under senior guidance.",
      "Took part in code reviews and debugging sessions, building a strong engineering foundation.",
    ],
  },
];

export type Project = {
  name: string;
  client: string;
  summary: string;
  highlights: string[];
  tags: string[];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    name: "PCSIR Digital Transformation",
    client: "Enterprise / Government",
    summary:
      "Led a cross-functional team delivering a national research institution's digital transformation — ERP, LMS and SIMS unified into one platform.",
    highlights: [
      "Owned architecture and delivery milestones end-to-end",
      "Centralised workflows and automated institutional processes",
      "AI-assisted document and data-entry automation across LMS & SIMS",
    ],
    tags: ["ERP", "LMS", "SIMS", "Architecture", "AI Automation"],
    featured: true,
  },
  {
    name: "BZU Examination & Results",
    client: "Bahauddin Zakariya University",
    summary:
      "A web platform digitising examination operations for a major public university, serving students and exam staff at scale.",
    highlights: [
      "Self-service roll number slips, date sheets and results",
      "Staff tooling to manage records and publish results",
      "AI anomaly detection flags irregular results before publication",
    ],
    tags: ["Web Platform", "Scale", "Anomaly Detection"],
    featured: true,
  },
  {
    name: "Worklog",
    client: "Time Tracking & Productivity",
    summary:
      "A multi-platform system — web, desktop and admin — for tracking work hours, tasks and team-level productivity.",
    highlights: [
      "Admin panel for employees, activity monitoring and reporting",
      "AI-driven insights surface workload trends and burnout risk",
    ],
    tags: ["Multi-platform", "Desktop", "AI Insights"],
  },
  {
    name: "Green Basket",
    client: "Grocery Delivery Mobile App",
    summary:
      "A consumer mobile app for end-to-end grocery ordering and delivery, from browsing to checkout.",
    highlights: [
      "Cloud-backed data layer for inventory, orders and users",
      "Reliable under concurrent usage",
    ],
    tags: ["Mobile", "Cloud", "E-commerce"],
  },
  {
    name: "UOL Admission System",
    client: "University of Lahore",
    summary:
      "A full digital admissions platform replacing paper-based processing: registration, document upload, tracking and status updates.",
    highlights: [
      "Admin panel for review, verification and decision workflows",
    ],
    tags: ["Workflows", "Admin Panel"],
  },
  {
    name: "UOL GymXS",
    client: "Membership & Activity Management",
    summary:
      "A gym management system covering attendance tracking, subscriptions and member performance monitoring.",
    highlights: ["Attendance, subscriptions and performance in one place"],
    tags: ["Management System"],
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["JavaScript", "TypeScript", "Python", "C#"] },
  {
    group: "Frontend",
    items: ["React", "Next.js", "Redux", "Tailwind CSS", "Material UI", "Bootstrap", "jQuery", "HTML / CSS"],
  },
  {
    group: "Backend",
    items: ["Node.js", "Express", "ASP.NET Core", ".NET", "FastAPI", "Django"],
  },
  { group: "Mobile", items: ["Flutter", "React Native"] },
  {
    group: "Databases",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Firebase", "Supabase"],
  },
  { group: "Messaging & Integration", items: ["Kafka", "RabbitMQ", "REST API Design"] },
  { group: "Cloud & DevOps", items: ["AWS", "GCP", "Docker", "CI/CD"] },
  {
    group: "AI Engineering",
    items: ["GitHub Copilot workflows", "LLM applications", "RAG pipelines", "AI agents"],
  },
  {
    group: "Architecture",
    items: ["System Design", "Microservices", "Scalable Architecture", "API Integration"],
  },
  {
    group: "Tools",
    items: ["Git", "GitHub", "GitLab", "Postman", "Thunder Client", "Agile / Scrum"],
  },
];

export const education = [
  {
    degree: "Bachelor's in Computer Science",
    school: "The University of Faisalabad",
    period: "2016 — 2020",
  },
  {
    degree: "Intermediate in Science",
    school: "MAO College, Lahore",
    period: "2014 — 2016",
  },
];
