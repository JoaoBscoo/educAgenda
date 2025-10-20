// src/components/app-header/index.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../global/themes";
import { useSettings, ts } from "../../context/settings";

import { useThemeColors } from "../../hooks/useThemeColors";

type Props = {
  title: string;
  subtitle?: string;
};

export default function AppHeader({ title, subtitle }: Props) {
  const { fontScale } = useSettings();
  const colors = useThemeColors();
  return (
    <LinearGradient
      colors={[colors.gradStart, colors.gradEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View>
        <Text style={styles.appTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  appTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 20,
    marginTop: 4,
  },
});
