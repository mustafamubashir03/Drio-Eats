import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthScaffold, Text, Input, Button } from "@/components";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/axios";
import { apiErrorMessage } from "@/lib/errors";

export default function ApplyDriverScreen() {
  const { colors } = useTheme();
  const { authorization } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const isAlreadyApplied =
    authorization?.driverApplicationStatus &&
    authorization.driverApplicationStatus !== "NOT_APPLIED";

  const apply = useMutation({
    mutationFn: async (vars: {
      vehicleType: string;
      vehiclePlateNumber: string;
      licenseNumber: string;
    }) => {
      const res = await api.post("/rbac/driver/apply", vars);
      return res.data;
    },
  });

  const onSubmit = async () => {
    setError(null);
    try {
      await apply.mutateAsync({
        vehicleType: "BIKE",
        vehiclePlateNumber: "",
        licenseNumber: "",
      });
      router.replace("/(driver)/pending");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to submit driver application."));
    }
  };

  if (isAlreadyApplied) {
    return (
      <AuthScaffold
        tagline="Driver Application"
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
            Your driver application is under review. You will be notified
            once a decision is made. You can continue using customer
            features in the meantime.
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
      tagline="Apply to become a DRIO driver"
      primaryLabel="Submit Application"
      primaryIcon="person-add-outline"
      primaryLoading={apply.isPending}
      onPrimaryPress={onSubmit}
      error={error}
      footerText="Already have an account?"
      footerAction="Sign in"
      onFooterPress={() => router.replace("/(auth)/login")}
    >
      <View style={styles.form}>
        <Text variant="caption" color="textMuted">
          Driver Application
        </Text>
        <View style={styles.section}>
          <Text variant="label" color="textMuted" style={styles.label}>
            Vehicle Type
          </Text>
          <View style={styles.vehicleSelector}>
            <Pressable
              style={[styles.vehicleOption, styles.selectedVehicle]}
              accessibilityRole="button"
              accessibilityLabel="Bike"
            >
              <Ionicons name="bicycle-outline" size={24} color={colors.lime} />
              <Text variant="bodySmall" color={colors.text}>
                Bike
              </Text>
            </Pressable>
            <Pressable
              style={[styles.vehicleOption]}
              accessibilityRole="button"
              accessibilityLabel="Motorcycle"
            >
              <Ionicons name="car-outline" size={24} color={colors.textMuted} />
              <Text variant="bodySmall" color={colors.textMuted}>
                Motorcycle
              </Text>
            </Pressable>
            <Pressable
              style={[styles.vehicleOption]}
              accessibilityRole="button"
              accessibilityLabel="Car"
            >
              <Ionicons name="car-outline" size={24} color={colors.textMuted} />
              <Text variant="bodySmall" color={colors.textMuted}>
                Car
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.section}>
          <Text variant="label" color="textMuted">
            Vehicle Plate Number
          </Text>
          <Input
            label="Plate Number"
            placeholder="ABC-1234"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!apply.isPending}
          />
        </View>
        <View style={styles.section}>
          <Text variant="label" color="textMuted">
            License Number
          </Text>
          <Input
            label="License Number"
            placeholder="Enter your license number"
            autoCapitalize="characters"
            autoCorrect={false}
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
  vehicleSelector: {
    flexDirection: "row",
    gap: 10,
  },
  vehicleOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  selectedVehicle: {
    borderColor: "#ECFF7F",
    backgroundColor: "#1C1D21",
  },
  note: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
