import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

const STATS = [
  { label: "Today's orders", value: "12", icon: "receipt-outline" as const, route: "/(owner)/orders" },
  { label: "Menu items", value: "18", icon: "restaurant-outline" as const, route: "/(owner)/menu" },
  { label: "Revenue", value: "$486", icon: "cash-outline" as const, route: "/(owner)/analytics" },
];

export default function OwnerDashboardScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="caption" color="textMuted">Restaurant Owner</Text>
            <Text variant="heading">Dashboard</Text>
          </View>
          <Badge tone="success">Approved</Badge>
        </View>

        <View style={styles.grid}>
          {STATS.map((s) => (
            <Pressable key={s.label} style={{ flex: 1 }} onPress={() => router.replace(s.route as never)} accessibilityRole="button">
              <Card style={styles.statCard}>
                <Ionicons name={s.icon} size={18} color={colors.lime} />
                <Text variant="subheading">{s.value}</Text>
                <Text variant="caption" color="textMuted">{s.label}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <Text variant="label" color="textMuted">Needs attention</Text>
        <Card style={styles.card}>
          {[
            { title: "2 orders ready for pickup", sub: "#182503, #182504", icon: "time-outline" as const },
            { title: "1 item low in stock", sub: "Chicken Wings (3 left)", icon: "alert-circle-outline" as const },
          ].map((item, i, arr) => (
            <Pressable key={item.title} onPress={() => Alert.alert(item.title, item.sub)} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]} accessibilityRole="button">
              <Ionicons name={item.icon} size={18} color={colors.lime} />
              <View style={{ flex: 1 }}>
                <Text variant="bodySmall">{item.title}</Text>
                <Text variant="caption" color="textMuted">{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  grid: { flexDirection: "row", gap: 10 },
  statCard: { padding: 12, gap: 4, alignItems: "flex-start" },
  card: { paddingHorizontal: 12, paddingVertical: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
});
