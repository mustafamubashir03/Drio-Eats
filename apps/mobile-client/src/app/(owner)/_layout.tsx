import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot, router, usePathname } from "expo-router";
import { useAuth } from "@/lib/auth";
import { RoleBottomTabs } from "@/components/BottomTabs";
import { useTheme } from "@/lib/theme";

const STATUS_ROUTES = new Set(["/pending","/rejected","/suspended","/(owner)/pending","/(owner)/rejected","/(owner)/suspended"]);

export default function OwnerLayout() {
  const { ready, isAuthenticated, authorization, authorizationReady } = useAuth();
  const { colors } = useTheme();
  const pathname = usePathname();
  const isStatusRoute = Array.from(STATUS_ROUTES).some(s => pathname.includes(s.replace("/(owner)","")));

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) { router.replace("/(auth)/login"); return; }
    if (!authorizationReady) return;
    const roles = authorization?.roles ?? [];
    const ownerOk = roles.includes("RESTAURANT_OWNER");
    if (!ownerOk) { router.replace("/(customer)" as never); return; }
    const status = authorization?.restaurantOwnerApplicationStatus;
    if (status === "PENDING" && !pathname.includes("pending")) router.replace("/(owner)/pending");
    else if (status === "REJECTED" && !pathname.includes("rejected")) router.replace("/(owner)/rejected");
    else if (status === "SUSPENDED" && !pathname.includes("suspended")) router.replace("/(owner)/suspended");
    else if (status !== "APPROVED" && !isStatusRoute) router.replace("/(auth)/apply-restaurant-owner");
  }, [ready, isAuthenticated, authorizationReady, authorization, pathname]);

  if (!ready || !authorizationReady) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.lime} /></View>;
  }

  const status = authorization?.restaurantOwnerApplicationStatus;
  const showTabs = status === "APPROVED" && !pathname.includes("pending") && !pathname.includes("rejected") && !pathname.includes("suspended");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}><Slot /></View>
      {showTabs ? <RoleBottomTabs role="owner" /> : null}
    </View>
  );
}
const styles = StyleSheet.create({ center: { flex: 1, alignItems: "center", justifyContent: "center" } });
