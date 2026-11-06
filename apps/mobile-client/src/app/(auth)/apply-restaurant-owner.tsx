import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthScaffold, Text, Input, Button } from "@/components";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/axios";
import { apiErrorMessage } from "@/lib/errors";

export default function ApplyRestaurantOwnerScreen() {
  const { colors } = useTheme();
  const { authorization } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const isAlreadyApplied =
    authorization?.restaurantOwnerApplicationStatus &&
    authorization.restaurantOwnerApplicationStatus !== "NOT_APPLIED";

  const apply = useMutation({
    mutationFn: async (vars: {
      restaurantName: string;
      cuisineType: string;
      address: string;
    }) => {
      const res = await api.post("/rbac/restaurant-owner/apply", vars);
      return res.data;
    },
  });

  const onSubmit = async () => {
    setError(null);
    try {
      await apply.mutateAsync({
        restaurantName: "",
        cuisineType: "",
        address: "",
      });
      router.replace("/(owner)/pending");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to submit restaurant owner application."));
    }
  };

  if (isAlreadyApplied) {
    return (
      <AuthScaffold
        tagline="Restaurant Owner Application"
        primaryLabel="Application Submitted"
        primaryIcon="checkmark-circle-outline"
        onPrimaryPress={() => router.replace("/")}
        error={error}
        footerText=""
        footerAction=""
        onFooterPress={() => {}}
      >
        <View style={styles.container}>
          <Ionicons name="reload-circle-outline" size={48} color={colors.textMuted} />
          <Text variant="subheading" style={styles.title}>
            Application Submitted
          </Text>
          <Text variant="body" style={styles.subtitle} color="textMuted">
            Your restaurant owner application is under review. You will be
            notified once a decision is made. You can continue using
            customer features in the meantime.
          </Text>
          <Button
            label="Continue Shopping"
            icon="arrow-forward"
            iconRight
            onPress={() => router.replace("/")}
            style={styles.button}
          />
        </View>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      tagline="Apply to become a DRIO restaurant owner"
      primaryLabel="Submit Application"
      primaryIcon="storefront-outline"
      primaryLoading={apply.isPending}
      onPrimaryPress={onSubmit}
      error={error}
      footerText="Already have an account?"
      footerAction="Sign in"
      onFooterPress={() => router.replace("/(auth)/login")}
    >
      <View style={styles.form}>
        <Text variant="caption" color="textMuted">
          Restaurant Owner Application
        </Text>
        <View style={styles.section}>
          <Text variant="label" color="textMuted" style={styles.label}>
            Restaurant Name
          </Text>
          <Input
            label="Restaurant Name"
            placeholder="Enter restaurant name"
            editable={!apply.isPending}
          />
        </View>
        <View style={styles.section}>
          <Text variant="label" color="textMuted" style={styles.label}>
            Cuisine Type
          </Text>
          <Input
            label="Cuisine Type"
            placeholder="e.g. Italian, Indian, Chinese"
            editable={!apply.isPending}
          />
        </View>
        <View style={styles.section}>
          <Text variant="label" color="textMuted" style={styles.label}>
            Address
          </Text>
          <Input
            label="Address"
            placeholder="Enter restaurant address"
            editable={!apply.isPending}
          />
        </View>
        <Text variant="bodySmall" color="textMuted" style={styles.note}>
          Your application will be reviewed by a superadmin. You will
          receive a notification once a decision is made.
        </Text>
      </View>
    </AuthScaffold>
  );
}

import { useMutation } from "@tanstack/react-query";

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
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
    width: 200,
    alignSelf: "center",
  },
  form: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  label: {
    marginBottom: 4,
  },
  note: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
