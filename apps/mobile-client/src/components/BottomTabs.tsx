import React, { useMemo } from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";

export type RoleTabGroup = "customer" | "owner" | "driver";

type TabItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const TABS: Record<RoleTabGroup, TabItem[]> = {
  customer: [
    { key: "home", label: "Home", icon: "home-outline", activeIcon: "home", route: "/(customer)" },
    { key: "search", label: "Search", icon: "search-outline", activeIcon: "search", route: "/(customer)/search" },
    { key: "favorites", label: "Favorites", icon: "heart-outline", activeIcon: "heart", route: "/(customer)/favorites" },
    { key: "orders", label: "Orders", icon: "receipt-outline", activeIcon: "receipt", route: "/(customer)/orders" },
    { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person", route: "/(customer)/profile" },
  ],
  owner: [
    { key: "home", label: "Home", icon: "grid-outline", activeIcon: "grid", route: "/(owner)" },
    { key: "orders", label: "Orders", icon: "receipt-outline", activeIcon: "receipt", route: "/(owner)/orders" },
    { key: "menu", label: "Menu", icon: "restaurant-outline", activeIcon: "restaurant", route: "/(owner)/menu" },
    { key: "analytics", label: "Analytics", icon: "bar-chart-outline", activeIcon: "bar-chart", route: "/(owner)/analytics" },
    { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person", route: "/(owner)/profile" },
  ],
  driver: [
    { key: "home", label: "Home", icon: "grid-outline", activeIcon: "grid", route: "/(driver)" },
    { key: "active", label: "Active", icon: "bicycle-outline", activeIcon: "bicycle", route: "/(driver)/active" },
    { key: "history", label: "History", icon: "time-outline", activeIcon: "time", route: "/(driver)/history" },
    { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person", route: "/(driver)/profile" },
  ],
};

const ROLE_SEGMENT: Record<RoleTabGroup, string> = {
  customer: "(customer)",
  owner: "(owner)",
  driver: "(driver)",
};

function resolveActiveKey(role: RoleTabGroup, segments: string[]): string {
  const group = ROLE_SEGMENT[role];
  // Find the segment after the role group (e.g. ["(owner)", "orders"] -> "orders").
  const idx = segments.indexOf(group);
  const leaf = idx >= 0 ? segments[idx + 1] : segments[segments.length - 1];
  if (!leaf || leaf === "index") return "home";
  return leaf;
}

export function RoleBottomTabs({ role }: { role: RoleTabGroup }) {
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const tabs = TABS[role];

  const activeKey = useMemo(
    () => resolveActiveKey(role, segments as string[]),
    [role, segments]
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      {tabs.map((tab) => {
        const active = activeKey === tab.key;
        const color = active ? colors.lime : colors.textMuted;
        return (
          <Pressable
            key={tab.key}
            onPress={() => router.replace(tab.route as never)}
            style={({ pressed }) => [styles.tabContainer, pressed && { opacity: 0.7 }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
          >
            <View style={[styles.iconWrap, active && { backgroundColor: colors.lime + "22" }]}>
              <Ionicons name={active ? tab.activeIcon : tab.icon} size={22} color={color} />
            </View>
            <Text style={[styles.tabLabel, { color, fontWeight: active ? "600" : "500" }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Back-compat: older (tabs)/_layout.tsx imported BottomTabs with onTabPress.
export function BottomTabs(_props: { onTabPress?: (key: string) => void }) {
  return <RoleBottomTabs role="customer" />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    gap: 2,
    minHeight: 48,
  },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
});
