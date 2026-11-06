import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot, router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { RoleBottomTabs } from "@/components/BottomTabs";
import { useTheme } from "@/lib/theme";

export default function CustomerLayout() {
  const { ready, isAuthenticated, authorization, authorizationReady } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) { router.replace("/(auth)/login"); return; }
    if (!authorizationReady) return;
    const roles = authorization?.roles ?? [];
    const isOwner = roles.includes("RESTAURANT_OWNER") && authorization?.restaurantOwnerApplicationStatus === "APPROVED";
    const isDriver = roles.includes("DRIVER") && authorization?.driverApplicationStatus === "APPROVED";
    if (isOwner) router.replace("/(owner)" as never);
    else if (isDriver) router.replace("/(driver)" as never);
  }, [ready, isAuthenticated, authorizationReady, authorization]);

  if (!ready || !authorizationReady) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.lime} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <RoleBottomTabs role="customer" />
    </View>
  );
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: "center", justifyContent: "center" } });
