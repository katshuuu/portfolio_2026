export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  title: string;
  tagline: string;
  role: string;
  roleHref?: string;
  stack: string[];
  tags: Array<"Микросервисы" | "High-load" | "CLI" | "Open Source">;
  metrics: string;
  github: string;
  extraLinks?: ProjectLink[];
  demo?: string;
  demoLabel?: string;
  problem: string;
  solution: string;
  result: string;
  accent: string;
};

export const PROJECTS: Project[] = [
  {
    id: "golandia",
    title: "Golandia",
    tagline:
      "Интерактивная платформа для изучения Go с AI-репетитором — уроки, песочница и автопроверка",
    role: "github.com/katshuuu/golandia",
    roleHref: "https://github.com/katshuuu/golandia",
    stack: ["Go", "Gin", "PostgreSQL", "React", "Docker"],
    tags: ["Open Source"],
    metrics: "",
    github: "https://github.com/katshuuu/golandia",
    demo: "https://disk.yandex.ru/i/1cPlzhjvkyaXvg",
    demoLabel: "Презентация",
    problem:
      "Хотелось учить Go на практике, а не только читать теорию — с проверкой кода и подсказками рядом.",
    solution:
      "Собрала веб-платформу: курс по мотивам A Tour of Go, изолированная песочница, стратегии автопроверки и LLM-чат в контексте урока.",
    result:
      "Полноценный учебный продукт на Go + React: 7 модулей, профиль студента и уровень героя. Код открыт на GitHub.",
    accent: "#00ADD8",
  },
  {
    id: "floramind",
    title: "FloraMind",
    tagline:
      "AI-флорист: опрос предпочтений, генерация букета и Telegram-бот на Go для визуального теста",
    role: "github.com/katshuuu/mood-vibecheck-bot",
    roleHref: "https://github.com/katshuuu/mood-vibecheck-bot",
    stack: ["Go", "Telegram Bot API", "JavaScript", "YandexART"],
    tags: ["Open Source"],
    metrics: "",
    github: "https://github.com/katshuuu/front_flora",
    extraLinks: [
      { label: "github.com/katshuuu/front_flora", href: "https://github.com/katshuuu/front_flora" },
      {
        label: "github.com/katshuuu/mood-vibecheck-bot",
        href: "https://github.com/katshuuu/mood-vibecheck-bot",
      },
    ],
    demo: "https://disk.yandex.ru/i/UsopYQy9drZquA",
    demoLabel: "Презентация",
    problem:
      "Сложно угадать вкус получателя букета — даритель часто выбирает «на глаз», а не по реальным предпочтениям.",
    solution:
      "Собрала FloraMind: веб-опрос и генерация букета через YandexART плюс Telegram-бот на Go с визуальным тестом характера.",
    result:
      "Два связанных продукта — фронтенд сервиса и Go-бот — собирают промпт и ведут к персональному букету-сюрпризу.",
    accent: "#e879a9",
  },
  {
    id: "moszapros",
    title: "MosZapros",
    tagline:
      "Умный персонализированный поиск по СТЕ для Портала поставщиков Москвы — опечатки, синонимы и обучение на действиях",
    role: "github.com/katshuuu/moszapros",
    roleHref: "https://github.com/katshuuu/moszapros",
    stack: ["Next.js", "PostgreSQL", "pgvector", "TypeScript"],
    tags: ["Open Source"],
    metrics: "",
    github: "https://github.com/katshuuu/moszapros",
    demo: "https://disk.yandex.ru/i/Z9n72-94eJ6Flw",
    demoLabel: "Презентация",
    problem:
      "Обычный поиск по справочнику СТЕ не прощает опечаток и выдаёт всем одинаковый результат — школе и поликлинике нужны разные товары.",
    solution:
      "Собрала пайплайн: морфология, исправление опечаток, синонимы, персонализация по ИНН и самообучение на кликах и покупках.",
    result:
      "На хакатоне Tender Hack 2026 — NDCG@10 до 81% и ответ пайплайна около 45 мс. Код открыт на GitHub.",
    accent: "#dc2626",
  },
  {
    id: "pr-pigeon",
    title: "PR-pigeon",
    tagline:
      "Telegram-бот — почтовый голубь для код-ревью: личные уведомления о назначении на PR, ревью и комментариях",
    role: "github.com/katshuuu/pr-pigeon",
    roleHref: "https://github.com/katshuuu/pr-pigeon",
    stack: ["Go", "Telegram Bot API", "PostgreSQL", "Docker"],
    tags: ["Open Source", "CLI"],
    metrics: "",
    github: "https://github.com/katshuuu/pr-pigeon",
    problem:
      "Легко пропустить назначение на PR или комментарий к ревью, если вкладка GitHub не всегда открыта.",
    solution:
      "Собрала бота на Go: GitHub webhooks с проверкой подписи, бизнес-логика уведомлений и доставка в Telegram без дублей.",
    result:
      "Финальный проект курса по Go: HTTPS-сервер, привязка аккаунта и понятные сообщения о PR прямо в личку.",
    accent: "#7c3aed",
  },
];
