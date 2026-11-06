import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { useThemeColors } from "@/lib/theme";

export function Divider({ style, ...rest }: ViewProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }, style]}
      {...rest}
    />
  );
}
