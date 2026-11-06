import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { Text } from "./Text";
import { useThemeColors } from "@/lib/theme";

type BadgeTone = "neutral" | "lime" | "mint" | "danger" | "warning" | "success";

interface BadgeProps extends ViewProps {
  tone?: BadgeTone;
  children: string;
}

export function Badge({ tone = "neutral", children, style, ...rest }: BadgeProps) {
  const colors = useThemeColors();

  const palette: Record<BadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    lime: { bg: colors.lime, fg: colors.limeText },
    mint: { bg: colors.mint, fg: colors.mintText },
    danger: { bg: colors.danger, fg: "#FFFFFF" },
    warning: { bg: colors.warning, fg: "#0A0A0A" },
    success: { bg: colors.success, fg: "#0A0A0A" },
  };

  const p = palette[tone];

  return (
    <View style={[styles.badge, { backgroundColor: p.bg }, style]} {...rest}>
      <Text variant="caption" color={p.fg} weight="700">
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderCurve: "continuous",
  },
});
