export const theme = {
  colors: {
    bg: "#F5F7FB",
    text: "#1F2937",
    muted: "#6B7280",
    white: "#FFFFFF",
    primary: "#928992ff",
    secundary: "#424B54",
    background: "#93A8AC",
    destaque: "#3C00EE",

    // Gradiente do cabeçalho
    gradStart: "#3EC3FF",
    gradEnd: "#8B5CF6",

    // Cartões por categoria
    cat: {
      Pessoal: "#FBBF24", // amarelo
      Trabalho: "#60A5FA", // azul
      Saúde: "#F472B6", // rosa
      Educação: "#34D399", // verde
      Outro: "#A78BFA", // roxo claro
    },

    // Botões
    danger: "#FF3B30",
  },
  radius: {
    lg: 16,
    md: 12,
    sm: 8,
    xl: 24,
  },
  spacing: (n: number) => n * 8,
};
