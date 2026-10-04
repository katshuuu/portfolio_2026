export const SITE = {
  name: "katshu",
  role: "Go-разработчик",
  tagline: "High-load · Microservices · Clean Architecture",
  email: "schustalova.katya@yandex.ru",
  location: "Remote / EU",
  github: "https://github.com/katshuuu",
  linkedin: "https://linkedin.com",
  telegram: "https://t.me/katshuuu",
  vk: "https://vk.ru/katshuuu",
  resumeUrl: "/resume.pdf",
} as const;

export const NAV_ITEMS = [
  { id: "hero", label: "Главная", href: "#hero" },
  { id: "about", label: "Обо мне", href: "#about" },
  { id: "projects", label: "Проекты", href: "#projects" },
  { id: "skills", label: "Стек", href: "#skills" },
  { id: "contact", label: "Контакты", href: "#contact" },
] as const;

export const STACK_BADGES = [
  "Go",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "gRPC",
  "Kafka",
] as const;

export const METRICS = [
  { value: "5+", label: "лет опыта" },
  { value: "12+", label: "продакшен-систем" },
  { value: "50k+", label: "RPS в пике" },
  { value: "8", label: "макс. размер команды" },
] as const;
