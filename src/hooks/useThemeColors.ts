// src/hooks/useThemeColors.ts
import { theme } from "../global/themes";
import { useSettings } from "../context/settings";

/**
 * Retorna as cores do tema já adaptadas ao Alto Contraste.
 * Export NOMEADO para combinar com o import do Dashboard.
 */
export function useThemeColors() {
  const { highContrast } = useSettings();

  if (highContrast) {
    return {
      ...theme.colors,
      primary: "#0000FF",
      text: "#000",
      white: "#FFF",
      bg: "#FFF",
      muted: "#111",
    } as typeof theme.colors;
  }

  return theme.colors;
}
