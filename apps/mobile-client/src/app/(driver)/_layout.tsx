import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot, router, usePathname } from "expo-router";
import { useAuth } from "@/lib/auth";
import { RoleBottomTabs } from "@/components/BottomTabs";
import { useTheme } from "@/lib/theme";

export default function DriverLayout() {
  const { ready, isAuthenticated, authorization, authorizationReady } = useAuth();
  const { colors } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) { router.replace("/(auth)/login"); return; }
    if (!authorizationReady) return;
    const roles = authorization?.roles ?? [];
    const driverOk = roles.includes("DRIVER");
    if (!driverOk) { router.replace("/(customer)" as never); return; }
    const status = authorization?.driverApplicationStatus;
    if (status === "PENDING" && !pathname.includes("pending")) router.replace("/(driver)/pending");
    else if (status === "REJECTED" && !pathname.includes("rejected")) router.replace("/(driver)/rejected");
    else if (status === "SUSPENDED" && !pathname.includes("suspended")) router.replace("/(driver)/suspended");
    else if (status !== "APPROVED" && !pathname.includes("apply")) router.replace("/(auth)/apply-driver");
  }, [ready, isAuthenticated, authorizationReady, authorization, pathname]);

  if (!ready || !authorizationReady) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.lime} /></View>;
  }

  const status = authorization?.driverApplicationStatus;
  const showTabs = status === "APPROVED" && !pathname.includes("pending") && !pathname.includes("rejected") && !pathname.includes("suspended");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}><Slot /></View>
      {showTabs ? <RoleBottomTabs role="driver" /> : null}
    </View>
  );
}
const styles = StyleSheet.create({ center: { flex: 1, alignItems: "center", justifyContent: "center" } });
