import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthScaffold, Text, Button } from "@/components";
import { useTheme } from "@/lib/theme";

export default function OwnerRejectedScreen() {
  const { colors } = useTheme();

  return (
    <AuthScaffold
      tagline="Restaurant Owner Application"
      primaryLabel="Reapply"
      primaryIcon="refresh-outline"
      onPrimaryPress={() => router.replace("/(auth)/apply-restaurant-owner")}
      error={null}
      footerText="Continue as customer?"
      footerAction="Go to home"
      onFooterPress={() => router.replace("/")}
    >
      <View style={styles.container}>
        <Ionicons name="close-circle-outline" size={48} color={colors.danger} />
        <Text variant="subheading" style={styles.title}>
          Application Rejected
        </Text>
        <Text variant="body" style={styles.subtitle} color="textMuted">
          Unfortunately, your restaurant owner application was not approved
          at this time. You may reapply after addressing the feedback
          provided.
        </Text>
        <Text variant="caption" color="textMuted" style={styles.statusLabel}>
          Status: Rejected
        </Text>
        <Button
          label="Reapply"
          icon="refresh-outline"
          iconRight
          onPress={() => router.replace("/(auth)/apply-restaurant-owner")}
          style={styles.button}
        />
        <Button
          label="Continue to Customer Features"
          icon="home-outline"
          iconRight
          onPress={() => router.replace("/")}
          style={styles.buttonContinue}
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
  buttonContinue: {
    width: 240,
    alignSelf: "center",
    marginTop: 12,
  },
});
