import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

function roleHome(authorization: { roles?: string[]; isSuperAdmin?: boolean; driverApplicationStatus?: string | null; restaurantOwnerApplicationStatus?: string | null } | null) {
  if (!authorization) return "/(customer)";
  if (authorization.isSuperAdmin) return "/(admin)/users";
  const roles = authorization.roles ?? [];
  if (roles.includes("RESTAURANT_OWNER") && authorization.restaurantOwnerApplicationStatus === "APPROVED") return "/(owner)";
  if (roles.includes("DRIVER") && authorization.driverApplicationStatus === "APPROVED") return "/(driver)";
  return "/(customer)";
}

export default function Index() {
  const { ready, isAuthenticated, authorization, authorizationReady } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) { router.replace("/(auth)/login" as never); return; }
    if (!authorizationReady) return;
    router.replace(roleHome(authorization) as never);
  }, [ready, isAuthenticated, authorizationReady, authorization]);

  return (
    <View style={[styles.loader, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.lime} />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
});
