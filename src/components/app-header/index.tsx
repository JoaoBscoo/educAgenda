import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { theme } from "../../global/themes";

type Props = { title: string; subtitle?: string };

export default function AppHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {!!subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent", // 👈 sem “caixa”
  },
  title: {
    color: theme.colors.white,
    fontSize: 40,
    marginTop: 25,
    fontWeight: "700",
    textAlign: "left",
    includeFontPadding: false, // 👈 evita espaço extra
    backgroundColor: "transparent", // 👈 sem fundo atrás do texto
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
    includeFontPadding: false,
    fontSize: 25,
    backgroundColor: "transparent",
  },
});
