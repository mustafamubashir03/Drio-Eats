import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { AuthScaffold, Text, Input } from "@/components";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/axios";
import { apiErrorMessage } from "@/lib/errors";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { setSession, refreshAuthorization } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useMutation({
    mutationFn: async (vars: { email: string; password: string }) => {
      const res = await api.post("/auth/sign-in/email", vars);
      return res.data;
    },
  });

  const onSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length === 0) {
      setError("Enter your password.");
      return;
    }

    setError(null);

    try {
      const data = await signIn.mutateAsync({ email: cleanEmail, password });
      await setSession(data);
      await refreshAuthorization();
      router.replace("/");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to sign in. Check your details."));
    }
  };

  return (
    <AuthScaffold
      tagline="Good food, delivered fast. Sign in to continue."
      primaryLabel="Sign In"
      primaryIcon="log-in-outline"
      primaryLoading={signIn.isPending}
      onPrimaryPress={onSubmit}
      error={error}
      footerText="New to DRIO Eats?"
      footerAction="Create account"
      onFooterPress={() => router.replace("/(auth)/signup")}
    >
      <View style={styles.form}>
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
          editable={!signIn.isPending}
        />
        <Input
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={onSubmit}
          editable={!signIn.isPending}
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

        <Pressable
          onPress={() =>
            Alert.alert(
              "Reset password",
              "Password reset is not enabled in this demo yet."
            )
          }
          hitSlop={8}
          style={styles.forgot}
          accessibilityRole="button"
        >
          <Text variant="label" color="textMuted">
            Forgot password?
          </Text>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  forgot: { alignSelf: "flex-end", marginTop: -2 },
  eyeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
