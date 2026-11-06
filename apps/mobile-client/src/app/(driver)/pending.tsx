import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthScaffold, Text, Button } from "@/components";
import { useTheme } from "@/lib/theme";

export default function DriverPendingScreen() {
  const { colors } = useTheme();

  return (
    <AuthScaffold
      tagline="Driver Application"
      primaryLabel="Continue to Customer"
      primaryIcon="arrow-forward-outline"
      onPrimaryPress={() => router.replace("/")}
      error={null}
      footerText="Already applied?"
      footerAction="Check status"
      onFooterPress={() => router.replace("/(driver)/pending")}
    >
      <View style={styles.container}>
        <Ionicons name="reload-circle-outline" size={48} color={colors.warning} />
        <Text variant="subheading" style={styles.title}>
          Application Pending
        </Text>
        <Text variant="body" style={styles.subtitle} color="textMuted">
          Your driver application has been submitted and is under review.
          You will be notified once a decision is made.
        </Text>
        <Text variant="caption" color="textMuted" style={styles.statusLabel}>
          Status: Pending Review
        </Text>
        <Button
          label="Continue to Customer Features"
          icon="home-outline"
          iconRight
          onPress={() => router.replace("/")}
          style={styles.button}
        />
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  statusLabel: {
    marginTop: 12,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    width: 240,
    alignSelf: "center",
  },
});
