import React from "react";
import {
  Text as RNText,
  TextProps,
  TextStyle,
} from "react-native";
import { useThemeColors } from "@/lib/theme";

export type TextVariant =
  | "display"
  | "title"
  | "heading"
  | "subheading"
  | "body"
  | "bodySmall"
  | "label"
  | "caption";

export type TextColor =
  | "text"
  | "textMuted"
  | "textSubtle"
  | "lime"
  | "limeText"
  | "mint"
  | "mintText"
  | "danger"
  | "warning"
  | "success"
  | (string & {});

interface DrioTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: "left" | "center" | "right";
  weight?: TextStyle["fontWeight"];
}

const WEIGHT_FAMILY: Record<string, string> = {
  "400": "Poppins_400Regular",
  "500": "Poppins_500Medium",
  "600": "Poppins_600SemiBold",
  "700": "Poppins_600SemiBold",
};

const WEIGHT_VALUE: Record<string, number> = {
  "400": 400,
  "500": 500,
  "600": 600,
  "700": 600,
  "bold": 700,
  "normal": 400,
};

const VARIANTS: Record<TextVariant, TextStyle> = {
  display: { fontFamily: "Poppins_500Medium", fontSize: 28, lineHeight: 34, fontWeight: 500, letterSpacing: -0.6 },
  title: { fontFamily: "Poppins_500Medium", fontSize: 18, lineHeight: 24, fontWeight: 500, letterSpacing: -0.4 },
  heading: { fontFamily: "Poppins_600SemiBold", fontSize: 20, lineHeight: 26, fontWeight: 600, letterSpacing: -0.2 },
  subheading: { fontFamily: "Poppins_600SemiBold", fontSize: 17, lineHeight: 22, fontWeight: 600 },
  body: { fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 20, fontWeight: 400 },
  bodySmall: { fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 20, fontWeight: 400 },
  label: { fontFamily: "Poppins_600SemiBold", fontSize: 14, lineHeight: 18, fontWeight: 600 },
  caption: { fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16, fontWeight: 400 },
};

const toFontWeight = (value: TextStyle["fontWeight"] | undefined): TextStyle["fontWeight"] =>
  value === undefined ? 400 : (WEIGHT_VALUE[String(value)] as TextStyle["fontWeight"]);

export function Text({
  variant = "body",
  color = "text",
  align,
  weight,
  style,
  ...rest
}: DrioTextProps) {
  const colors = useThemeColors();
  const palette = colors as unknown as Record<string, string>;
  const resolvedColor = palette[color] ?? color;
  const variantStyle = VARIANTS[variant];
  const resolvedFontWeight = toFontWeight(weight ?? variantStyle.fontWeight);
  const resolvedFontFamily = weight
    ? WEIGHT_FAMILY[String(weight)] ?? variantStyle.fontFamily
    : variantStyle.fontFamily;

  return (
    <RNText
      style={[
        variantStyle,
        {
          fontFamily: resolvedFontFamily,
          fontWeight: resolvedFontWeight,
        },
        { color: resolvedColor },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    />
  );
}

export function MoneyText({
  variant = "body",
  color = "text",
  style,
  ...rest
}: DrioTextProps) {
  const colors = useThemeColors();
  const palette = colors as unknown as Record<string, string>;
  const resolvedColor = palette[color] ?? color;

  return (
    <RNText
      style={[
        VARIANTS[variant],
        { color: resolvedColor, fontVariant: ["tabular-nums"] },
        style,
      ]}
      {...rest}
    />
  );
}
