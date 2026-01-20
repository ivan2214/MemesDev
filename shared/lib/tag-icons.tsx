import {
  Binary,
  Bot,
  Brain,
  Bug,
  Cloud,
  Code,
  Code2,
  Coffee,
  Cpu,
  Database,
  FileCode,
  Gamepad2,
  GitBranch,
  Globe,
  Hash,
  Laptop,
  Layout,
  Lightbulb,
  Lock,
  type LucideIcon,
  MonitorSmartphone,
  Package,
  Palette,
  Rocket,
  Server,
  Smartphone,
  Terminal,
  TestTube,
  Timer,
  Zap,
} from "lucide-react";

// Mapeo de nombres de iconos a componentes de Lucide
export const iconMap: Record<string, LucideIcon> = {
  Binary,
  Bot,
  Brain,
  Bug,
  Cloud,
  Code,
  Code2,
  Coffee,
  Cpu,
  Database,
  FileCode,
  Gamepad2,
  GitBranch,
  Globe,
  Hash,
  Laptop,
  Layout,
  Lightbulb,
  Lock,
  MonitorSmartphone,
  Package,
  Palette,
  Rocket,
  Server,
  Smartphone,
  Terminal,
  TestTube,
  Timer,
  Zap,
};

// Mapeo de tags a iconos de lucide-react (para tags que no tienen icono en DB)
const tagIconMap: Record<string, LucideIcon> = {
  // Languages
  javascript: FileCode,
  typescript: FileCode,
  python: Binary,
  java: Coffee,
  cpp: Code2,
  "c++": Code2,
  rust: Code,
  go: Code,
  php: Code,
  ruby: Code,
  swift: Smartphone,
  kotlin: Smartphone,

  // Frontend
  react: Code2,
  vue: Code2,
  angular: Code2,
  nextjs: Globe,
  css: Palette,
  html: Layout,
  frontend: Layout,
  ui: Palette,
  ux: Lightbulb,

  // Backend
  backend: Server,
  nodejs: Server,
  api: Globe,
  rest: Globe,
  graphql: Globe,

  // DevOps / Infrastructure
  docker: Package,
  kubernetes: Cloud,
  aws: Cloud,
  azure: Cloud,
  gcp: Cloud,
  cloud: Cloud,
  devops: Rocket,
  cicd: Rocket,

  // Databases
  database: Database,
  sql: Database,
  nosql: Database,
  mongodb: Database,
  postgres: Database,
  mysql: Database,
  redis: Database,

  // Development concepts
  git: GitBranch,
  github: GitBranch,
  debug: Bug,
  debugging: Bug,
  bug: Bug,
  bugs: Bug,
  testing: TestTube,
  test: TestTube,
  security: Lock,

  // General tech
  programming: Terminal,
  coding: Terminal,
  developer: Laptop,
  code: Code,
  terminal: Terminal,
  cli: Terminal,
  ai: Brain,
  ml: Brain,
  "machine-learning": Brain,
  bot: Bot,
  chatgpt: Bot,
  mobile: MonitorSmartphone,
  ios: Smartphone,
  android: Smartphone,
  game: Gamepad2,
  gamedev: Gamepad2,

  // Other
  performance: Timer,
  optimization: Timer,
  algorithm: Binary,
  algorithms: Binary,
};

/**
 * Obtiene el icono para un tag basándose en su nombre o slug
 */
export function getTagIcon(tag: string): LucideIcon {
  const normalizedTag = tag.toLowerCase().replace(/\s+/g, "-");
  return tagIconMap[normalizedTag] || Hash;
}

/**
 * Obtiene el componente de icono basándose en el nombre guardado en DB
 */
export function getIconByName(iconName: string): LucideIcon {
  return iconMap[iconName] || Hash;
}

// Colores disponibles para categorías
export const CATEGORY_COLORS = [
  "violet",
  "cyan",
  "emerald",
  "orange",
  "slate",
  "pink",
  "blue",
  "amber",
  "red",
  "green",
  "purple",
  "teal",
  "indigo",
  "rose",
  "lime",
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

// Colores para cada categoría - mapeo dinámico basado en el color guardado en DB
const colorStyles: Record<CategoryColor, string> = {
  violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  slate: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  lime: "bg-lime-500/20 text-lime-400 border-lime-500/30",
};

/**
 * Obtiene los estilos CSS para una categoría basándose en su color
 */
export function getCategoryStyles(color: string): string {
  const normalized = color.toLowerCase() as CategoryColor;
  return colorStyles[normalized] || colorStyles.slate;
}

// Categorías por defecto para seed inicial
export const DEFAULT_CATEGORIES = [
  {
    name: "Programming",
    slug: "programming",
    icon: "Terminal",
    color: "violet",
  },
  { name: "Frontend", slug: "frontend", icon: "Layout", color: "cyan" },
  { name: "Backend", slug: "backend", icon: "Server", color: "emerald" },
  { name: "DevOps", slug: "devops", icon: "Rocket", color: "orange" },
  { name: "General", slug: "general", icon: "Hash", color: "slate" },
  { name: "AI", slug: "ai", icon: "Brain", color: "pink" },
  { name: "Mobile", slug: "mobile", icon: "Smartphone", color: "blue" },
  { name: "Database", slug: "database", icon: "Database", color: "amber" },
  { name: "Security", slug: "security", icon: "Lock", color: "red" },
] as const;

// Tags por defecto para seed inicial
export const DEFAULT_TAGS = [
  { name: "JavaScript", slug: "javascript" },
  { name: "Python", slug: "python" },
  { name: "React", slug: "react" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Git", slug: "git" },
  { name: "Debugging", slug: "debugging" },
  { name: "Docker", slug: "docker" },
  { name: "CSS", slug: "css" },
  { name: "Node.js", slug: "nodejs" },
  { name: "API", slug: "api" },
] as const;
