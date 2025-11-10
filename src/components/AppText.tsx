// src/components/AppText.tsx
import React from "react";
import { Text, TextProps, StyleSheet, TextStyle } from "react-native";
import { useSettings, ts } from "../context/settings";
import { useThemeColors } from "../hooks/useThemeColors";

type Props = TextProps & {
  size?: number; // tamanho base (ex.: 16)
  weight?: TextStyle["fontWeight"];
  color?: string;
};

export default function AppText({
  children,
  size = 14,
  weight = "400",
  color,
  style,
  ...rest
}: Props) {
  const { fontScale } = useSettings();
  const colors = useThemeColors();

  return (
    <Text
      {...rest}
      allowFontScaling={false} // quem escala é o ts() do contexto
      style={[
        styles.base,
        {
          fontSize: ts(size, fontScale),
          fontWeight: weight,
          color: color ?? colors.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
