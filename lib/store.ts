import { create } from "zustand";

type Theme = "dark" | "light";

interface UIStore {
  theme: Theme;
  cursorLabel: string | null;
  scrollProgress: number;
  reducedMotion: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setCursorLabel: (label: string | null) => void;
  setScrollProgress: (value: number) => void;
  setReducedMotion: (value: boolean) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  theme: "dark",
  cursorLabel: null,
  scrollProgress: 0,
  reducedMotion: false,
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", theme === "light");
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
  setCursorLabel: (cursorLabel) => set({ cursorLabel }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
