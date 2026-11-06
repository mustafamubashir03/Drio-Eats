import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { AuthScaffold, Input } from "@/components";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/axios";
import { apiErrorMessage } from "@/lib/errors";

export default function SignupScreen() {
  const { colors } = useTheme();
  const { setSession, refreshAuthorization } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useMutation({
    mutationFn: async (vars: {
      name: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const res = await api.post("/auth/sign-up/email", vars);
      return res.data;
    },
  });

  const onSubmit = async () => {
    const fullName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (fullName.length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!cleanEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);

    const parts = fullName.split(/\s+/);
    const firstName = parts[0] ?? fullName;
    const lastName = parts.slice(1).join(" ") || firstName;

    try {
      const data = await signup.mutateAsync({
        name: fullName,
        email: cleanEmail,
        password,
        firstName,
        lastName,
      });
      await setSession(data);
      await refreshAuthorization();
      router.replace("/");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to create your account."));
    }
  };

  return (
    <AuthScaffold
      tagline="Fresh food, delivered fast. Create your account."
      primaryLabel="Create Account"
      primaryIcon="person-add-outline"
      primaryLoading={signup.isPending}
      onPrimaryPress={onSubmit}
      error={error}
      pinPrimary
      footerText="Already have an account?"
      footerAction="Sign in"
      onFooterPress={() => router.replace("/(auth)/login")}
    >
      <View style={styles.form}>
        <Input
          label="Full name"
          placeholder="Your full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          editable={!signup.isPending}
        />
        <Input
          label="Email"
          placeholder="name@domain.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          editable={!signup.isPending}
        />
        <Input
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          editable={!signup.isPending}
          rightAccessory={
            <Pressable
              onPress={() => setShowPassword((current) => !current)}
              hitSlop={10}
              style={styles.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          }
        />
        <Input
          label="Confirm password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={onSubmit}
          editable={!signup.isPending}
          rightAccessory={
            <Pressable
              onPress={() => setShowConfirm((current) => !current)}
              hitSlop={10}
              style={styles.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={
                showConfirm ? "Hide confirm password" : "Show confirm password"
              }
            >
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          }
        />
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  eyeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
