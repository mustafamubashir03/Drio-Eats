import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { useThemeColors } from "@/lib/theme";

export function Card({ style, children, ...rest }: ViewProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    borderCurve: "continuous",
  },
});
