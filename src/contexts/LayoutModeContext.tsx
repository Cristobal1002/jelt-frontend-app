import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LayoutMode = "modern" | "classic";

const STORAGE_KEY = "jelt-layout-mode";
const SIDEBAR_COLLAPSED_KEY = "jelt-classic-sidebar-collapsed";

type LayoutModeContextValue = {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleLayoutMode: () => void;
  /** Solo vista clásica: menú lateral estrecho (iconos). */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
};

const LayoutModeContext = createContext<LayoutModeContextValue | null>(null);

function readStoredMode(): LayoutMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "classic" || v === "modern") return v;
  } catch {
    /* ignore */
  }
  return "modern";
}

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function LayoutModeProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>("modern");
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  useEffect(() => {
    setLayoutModeState(readStoredMode());
    setSidebarCollapsedState(readSidebarCollapsed());
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setLayoutModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLayoutMode = useCallback(() => {
    setLayoutMode(layoutMode === "modern" ? "classic" : "modern");
  }, [layoutMode, setLayoutMode]);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      layoutMode,
      setLayoutMode,
      toggleLayoutMode,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebarCollapsed,
    }),
    [layoutMode, setLayoutMode, toggleLayoutMode, sidebarCollapsed, setSidebarCollapsed, toggleSidebarCollapsed],
  );

  return <LayoutModeContext.Provider value={value}>{children}</LayoutModeContext.Provider>;
}

export function useLayoutMode() {
  const ctx = useContext(LayoutModeContext);
  if (!ctx) throw new Error("useLayoutMode must be used within LayoutModeProvider");
  return ctx;
}
