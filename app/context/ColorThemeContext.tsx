"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import {
  COLOR_THEMES,
  DEFAULT_COLOR_THEME,
  isColorThemeId,
  type ColorTheme,
  type ColorThemeId,
} from "@/lib/colorThemes";

const STORAGE_KEY = "app-color-theme";

interface ColorThemeContextValue {
  themeId: ColorThemeId;
  theme: ColorTheme;
  setThemeId: (id: ColorThemeId) => void;
  isSaving: boolean;
}

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null);

function subscribeNoop() {
  return () => {};
}

function getLocalSnapshot(): ColorThemeId {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && isColorThemeId(stored) ? stored : DEFAULT_COLOR_THEME;
}

function getServerSnapshot(): ColorThemeId {
  return DEFAULT_COLOR_THEME;
}

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useUser();
  const currentUser = useQuery(api.user.getMe, isSignedIn ? {} : "skip");
  const setUserColorTheme = useMutation(api.user.setColorTheme);

  const localTheme = useSyncExternalStore(
    subscribeNoop,
    getLocalSnapshot,
    getServerSnapshot,
  );

  const [overrideThemeId, setOverrideThemeId] = useState<ColorThemeId | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const remoteTheme = currentUser?.colorTheme;
  const themeId: ColorThemeId =
    overrideThemeId ??
    (remoteTheme && isColorThemeId(remoteTheme) ? remoteTheme : localTheme);

  useEffect(() => {
    document.documentElement.dataset.accent = themeId;
    window.localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId]);

  const setThemeId = useCallback(
    (id: ColorThemeId) => {
      setOverrideThemeId(id);
      if (!isSignedIn) return;
      setIsSaving(true);
      setUserColorTheme({ colorTheme: id })
        .catch((error: unknown) => {
          console.error("[ColorThemeProvider] failed to save theme", error);
        })
        .finally(() => setIsSaving(false));
    },
    [isSignedIn, setUserColorTheme],
  );

  const value = useMemo<ColorThemeContextValue>(
    () => ({
      themeId,
      theme: COLOR_THEMES[themeId],
      setThemeId,
      isSaving,
    }),
    [themeId, setThemeId, isSaving],
  );

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme(): ColorThemeContextValue {
  const ctx = useContext(ColorThemeContext);
  if (!ctx) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return ctx;
}
