import React from "react";
import { StyleSheet, Text as RNText } from "react-native";
import { useThemeColors } from "@/lib/theme";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  initials?: string;
  size?: AvatarSize;
}

const DIM: Record<AvatarSize, number> = { sm: 34, md: 44, lg: 52 };
const FONT: Record<AvatarSize, number> = { sm: 12, md: 14, lg: 17 };

export function Avatar({ initials = "?", size = "md" }: AvatarProps) {
  const colors = useThemeColors();
  const dim = DIM[size];

  return (
    <RNText
      style={[
        styles.avatar,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: colors.mint,
          color: colors.mintText,
          fontSize: FONT[size],
        },
      ]}
    >
      {initials.slice(0, 2).toUpperCase()}
    </RNText>
  );
}

const styles = StyleSheet.create({
  avatar: {
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "700",
    overflow: "hidden",
    includeFontPadding: false,
  },
});
