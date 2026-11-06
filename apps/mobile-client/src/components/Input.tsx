import React, { ReactNode } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";
import { useThemeColors } from "@/lib/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Rendered at the right edge of the field (e.g. a password visibility toggle). */
  rightAccessory?: ReactNode;
}

export function Input({
  label,
  error,
  rightAccessory,
  style,
  ...rest
}: InputProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="label" color="textMuted">
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.shell,
          {
            backgroundColor: colors.surfaceAlt,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, { color: colors.text }, style]}
          {...rest}
        />
        {rightAccessory ? (
          <View style={styles.accessory}>{rightAccessory}</View>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  shell: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    borderCurve: "continuous",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    paddingVertical: 0,
  },
  accessory: { marginLeft: 8 },
});
