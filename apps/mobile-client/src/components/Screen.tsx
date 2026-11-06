import React from "react";
import { ViewProps } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { useThemeColors } from "@/lib/theme";

export function Screen({ style, children, ...rest }: SafeAreaViewProps & ViewProps) {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
}
