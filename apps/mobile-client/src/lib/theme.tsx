import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { getStoredItem, setStoredItem } from "./storage";

/**
 * Semantic colour tokens shared by every screen.
 *
 * Keep this list aligned with the names components actually read. Components
 * reference `colors.text`, `colors.textMuted`, `colors.surfaceAlt`, etc. — a
 * missing key resolves to `undefined`, which React Native renders as the
 * platform default (black text / transparent backgrounds) and makes dark
 * screens look empty.
 */
export interface ThemeColors {
  background: string;
  elevated: string;
  card: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  divider: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  primary: string;
  secondary: string;
  onPrimary: string;
  lime: string;
  limeDeep: string;
  limeTint: string;
  limeText: string;
  mint: string;
  mintDeep: string;
  mintTint: string;
  mintText: string;
  amber: string;
  amberDeep: string;
  amberTint: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  cardAlt: string;
  timelineDone: string;
  timelinePending: string;
}

const DARK_COLORS: ThemeColors = {
  background: "#0B0B0B",
  elevated: "#0D0D0D",
  card: "#0D0D0D",
  surface: "#0D0D0D",
  surfaceAlt: "#1C1D21",
  border: "#3A3A3A",
  borderStrong: "#C9CCD1",
  divider: "#1C1D21",
  text: "#FFFFFF",
  textSecondary: "#C8C9CD",
  textMuted: "#94969A",
  textSubtle: "#66676B",
  textInverse: "#0C1600",
  primary: "#ECFF7F",
  secondary: "#A0FFBD",
  onPrimary: "#0C1600",
  lime: "#ECFF7F",
  limeDeep: "#4F6600",
  limeTint: "#F6FFC4",
  limeText: "#0C1600",
  mint: "#A0FFBD",
  mintDeep: "#0A6B34",
  mintTint: "#DDFFE8",
  mintText: "#0C1600",
  amber: "#FFCD54",
  amberDeep: "#8F5E00",
  amberTint: "#FFF1CC",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  cardAlt: "#EEF0F3",
  timelineDone: "#00BE40",
  timelinePending: "#525252",
};

const LIGHT_COLORS: ThemeColors = {
  background: "#F6F7F4",
  elevated: "#FFFFFF",
  card: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF0F3",
  border: "#E3E5E8",
  borderStrong: "#C9CCD1",
  divider: "#E3E5E8",
  text: "#0B0B0B",
  textSecondary: "#3F424A",
  textMuted: "#5F626B",
  textSubtle: "#7A7D86",
  textInverse: "#0C1600",
  primary: "#ECFF7F",
  secondary: "#A0FFBD",
  onPrimary: "#0C1600",
  lime: "#ECFF7F",
  limeDeep: "#4F6600",
  limeTint: "#F6FFC4",
  limeText: "#0C1600",
  mint: "#A0FFBD",
  mintDeep: "#0A6B34",
  mintTint: "#DDFFE8",
  mintText: "#0C1600",
  amber: "#FFCD54",
  amberDeep: "#8F5E00",
  amberTint: "#FFF1CC",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#2563EB",
  cardAlt: "#EEF0F3",
  timelineDone: "#008A30",
  timelinePending: "#C9CCD1",
};

const THEME_STORAGE_KEY = "drio-theme-mode";

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  initialMode,
}: {
  children: React.ReactNode;
  initialMode?: "light" | "dark";
}) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(() =>
    initialMode ? initialMode === "dark" : systemColorScheme !== "light"
  );

  // Restore the last explicit choice so the toggle survives a reload.
  useEffect(() => {
    let mounted = true;
    getStoredItem(THEME_STORAGE_KEY).then((stored) => {
      if (!mounted) return;
      if (stored === "light" || stored === "dark") {
        setIsDark(stored === "dark");
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggle = useCallback(() => {
    setIsDark((previous) => {
      const next = !previous;
      void setStoredItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  const colors = useMemo(() => (isDark ? DARK_COLORS : LIGHT_COLORS), [isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({ colors, isDark, toggle }),
    [colors, isDark, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

/** Colour tokens only — the shape every component expects. */
export function useThemeColors(): ThemeColors {
  return useTheme().colors;
}
