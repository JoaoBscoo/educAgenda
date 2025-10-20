// src/context/settings.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

type Settings = {
  fontScale: number; // 1.0 a 1.6
  setFontScale: (v: number) => void;

  highContrast: boolean;
  setHighContrast: (v: boolean) => void;

  ttsEnabled: boolean;
  setTtsEnabled: (v: boolean) => void;
};

const SettingsContext = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontScale, setFontScale] = useState(1.0);
  const [highContrast, setHighContrast] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const value = useMemo(
    () => ({
      fontScale,
      setFontScale,
      highContrast,
      setHighContrast,
      ttsEnabled,
      setTtsEnabled,
    }),
    [fontScale, highContrast, ttsEnabled]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings precisa estar dentro de <SettingsProvider/>");
  return ctx;
}

// helper para escalar fontes facilmente
export function ts(base: number, scale: number) {
  return Math.round(base * scale);
}
