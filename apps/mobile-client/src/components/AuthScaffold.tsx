import React, { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Button } from "./Button";
import { useTheme } from "@/lib/theme";

const HERO_IMAGE = require("../../assets/images/auth-hero.png");

interface AuthScaffoldProps {
  tagline: string;
  children: ReactNode;
  primaryLabel: string;
  primaryIcon?: React.ComponentProps<typeof Ionicons>["name"];
  primaryLoading?: boolean;
  onPrimaryPress: () => void;
  error?: string | null;
  /** Pin the CTA to the bottom when the form is taller than the viewport. */
  pinPrimary?: boolean;
  footerText: string;
  footerAction: string;
  onFooterPress: () => void;
}

/**
 * Auth presentation scaffold.
 */
export function AuthScaffold({
  tagline,
  children,
  primaryLabel,
  primaryIcon,
  primaryLoading,
  onPrimaryPress,
  error,
  pinPrimary = false,
  footerText,
  footerAction,
  onFooterPress,
}: AuthScaffoldProps) {
  const { colors, isDark, toggle } = useTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroRatio = height < 600 ? 0.36 : 0.4;
  const heroHeight = Math.round(
    Math.min(390, Math.max(200, height * heroRatio))
  );
  const compact = height < 700;
  const shouldPin = pinPrimary;

  const errorBlock = error ? (
    <Text variant="caption" color="danger" style={styles.error}>
      {error}
    </Text>
  ) : null;

  const primaryButton = (
    <Button
      label={primaryLabel}
      icon={primaryIcon}
      size="lg"
      loading={primaryLoading}
      onPress={onPrimaryPress}
      testID="auth-primary-cta"
    />
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["left", "right"]} style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.heroContainer, { height: heroHeight }]}>
              <Image
                source={HERO_IMAGE}
                style={styles.heroBackground}
                resizeMode="cover"
              />
              <View style={styles.heroForeground}>
                <View pointerEvents="none" style={styles.heroIcon}>
                  <Ionicons
                    name="restaurant-outline"
                    size={160}
                    color="rgba(212,255,0,0.10)"
                  />
                </View>

                <Pressable
                  onPress={toggle}
                  hitSlop={8}
                  style={[styles.themeToggle, { top: insets.top + 10 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle color theme"
                  testID="theme-toggle"
                >
                  <Ionicons
                    name={isDark ? "sunny-outline" : "moon-outline"}
                    size={20}
                    color="#FFFFFF"
                  />
                </Pressable>

                <View style={styles.heroCopy}>
                  <Text style={styles.heroKicker}>FRESH · FAST · LOCAL</Text>
                  <Text style={styles.heroTitle}>
                    DRIO <Text style={styles.heroAccent} color="lime">EATS</Text>
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.body,
                compact && styles.bodyCompact,
                {
                  paddingBottom: shouldPin
                    ? Math.max(insets.bottom, 24) + 88
                    : Math.max(insets.bottom, 24),
                },
              ]}
            >
              <Text style={[styles.tagline, { color: colors.text }]}>
                {tagline}
              </Text>

              {children}

              {!shouldPin ? (
                <>
                  {errorBlock}
                  <View style={styles.inlineCta}>{primaryButton}</View>
                </>
              ) : (
                errorBlock
              )}

              <View style={styles.footerLinkRow}>
                <Text variant="bodySmall" color="textMuted">
                  {footerText}{" "}
                </Text>
                <Pressable
                  onPress={onFooterPress}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={footerAction}
                >
                  <Text variant="label" color="lime" weight="700">
                    {footerAction}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {shouldPin ? (
            <View
              style={[
                styles.pinnedCta,
                { paddingBottom: Math.max(insets.bottom, 12) },
              ]}
            >
              {primaryButton}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  heroContainer: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: "#0A0A0A",
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
  },
  heroForeground: {
    position: "relative",
    height: "100%",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 44,
  },
  themeToggle: {
    position: "absolute",
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderCurve: "continuous",
  },
  heroCopy: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 22,
  },
  heroKicker: {
    color: "rgba(255,255,255,0.62)",
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: 400,
    letterSpacing: 2,
    marginBottom: 5,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontFamily: "Poppins_500Medium",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 500,
    letterSpacing: -0.6,
  },
  heroAccent: {},
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  bodyCompact: { paddingTop: 12 },
  tagline: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "600",
    marginBottom: 16,
  },
  inlineCta: { marginTop: 16 },
  error: { marginTop: 10, marginBottom: -2 },
  footerLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  pinnedCta: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "transparent",
  },
});