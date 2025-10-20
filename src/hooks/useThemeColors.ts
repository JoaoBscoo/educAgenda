// src/hooks/useThemeColors.ts
import { theme } from "../global/themes";
import { useSettings } from "../context/settings";

export function useThemeColors() {
  const { highContrast } = useSettings();

  if (!highContrast) return theme.colors;

  // Paleta de alto contraste (WCAG-friendly)
  return {
    ...theme.colors,

    text: "#000000",
    muted: "#111111",
    white: "#FFFFFF",
    bg: "#FFFFFF",
    gradStart: "#000000",
    gradEnd: "#333333",
    primary: "#ffffff",
    secundary: "#424B54",
    background: "#93A8AC",
    destaque: "#3C00EE",
    // categorias com contraste forte
    cat: {
      Pessoal: "#0B63FF",
      Trabalho: "#0A7A00",
      Saúde: "#B00020",
      Educação: "#7B1FA2",
      Outro: "#111111",
    } as typeof theme.colors.cat,
  };
}
