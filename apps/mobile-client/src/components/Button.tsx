import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { useTheme, useThemeColors } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  iconRight?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const HEIGHTS: Record<ButtonSize, number> = { sm: 44, md: 52, lg: 60 };
const FONT_SIZE: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 16 };
const LINE_HEIGHT: Record<ButtonSize, number> = { sm: 20, md: 22, lg: 22 };
const PADDING: Record<ButtonSize, number> = { sm: 18, md: 24, lg: 28 };

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight = false,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const isDisabled = disabled || loading;

  // Light-mode primary CTA: lime fill with an onAccent label, plus a 1px
  // limeDeep border at 40% opacity (the spec's approved light-mode CTA shape).
  const primaryBorder = isDark ? colors.lime : "#4F660066";

  const palette: Record<
    ButtonVariant,
    { bg: string; fg: string; border: string }
  > = {
    primary: { bg: colors.lime, fg: colors.onPrimary, border: primaryBorder },
    secondary: { bg: colors.mint, fg: colors.mintText, border: colors.mint },
    outline: { bg: "transparent", fg: colors.text, border: colors.border },
    ghost: { bg: "transparent", fg: colors.textMuted, border: "transparent" },
  };

  const p = palette[variant];
  const contentColor = isDisabled ? colors.textSubtle : p.fg;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHTS[size],
          paddingHorizontal: PADDING[size],
          backgroundColor: p.bg,
          borderColor: p.border,
          borderWidth:
            variant === "outline" || variant === "primary" ? 1 : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        <View style={styles.content}>
          {icon && !iconRight ? (
            <Ionicons name={icon} size={18} color={contentColor} />
          ) : null}
          <Text
            variant="label"
            color={contentColor}
            weight="600"
            style={{ fontSize: FONT_SIZE[size], lineHeight: LINE_HEIGHT[size] }}
          >
            {label}
          </Text>
          {icon && iconRight ? (
            <Ionicons name={icon} size={18} color={contentColor} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderCurve: "continuous",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
