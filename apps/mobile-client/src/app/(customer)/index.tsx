import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Button, Card, Badge, Avatar, Divider } from "@/components";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const TIMELINE = [
  { label: "Ordered", time: "04:46", done: true },
  { label: "Preparing", time: "04:56", done: true },
  { label: "On the way", time: "05:02", done: true },
  { label: "Delivered", time: "05:16", done: false },
];

export default function HomeScreen() {
  const { colors, isDark, toggle } = useTheme();
  const { session, clearSession } = useAuth();

  const displayName =
    [session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(" ") ||
    session?.user?.name ||
    "Customer";
  const initials =
    displayName.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "CU";

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar initials={initials} size="md" />
            <View style={{ flex: 1 }}>
              <Text variant="caption" color="textMuted">Good to see you</Text>
              <Text variant="subheading" numberOfLines={1}>{displayName}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={toggle} style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Toggle theme">
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={colors.text} />
            </Pressable>
            <Pressable onPress={async () => { try { await clearSession(); router.replace("/(auth)/login"); } catch { Alert.alert("Logout failed", "Could not sign out. Please try again."); } }} style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Log out">
              <Ionicons name="log-out-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <Text variant="heading" style={styles.hero}>Track your <Text variant="heading" color="lime">active order</Text></Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="fast-food-outline" size={24} color={colors.lime} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="label">Soul Chinese Platter</Text>
              <Text variant="caption" color="textMuted">Order #182503 · In transit</Text>
            </View>
            <Badge tone="lime">4.8 ★</Badge>
          </View>
          <Divider style={{ marginVertical: 12 }} />
          <View style={styles.timeline}>
            {TIMELINE.map((s) => (
              <View key={s.label} style={styles.step}>
                <View style={[styles.dot, { backgroundColor: s.done ? colors.timelineDone : colors.timelinePending }]} />
                <Text variant="caption" color={s.done ? "text" : "textSubtle"} style={{ flex: 1 }}>{s.label}</Text>
                <Text variant="caption" color="textSubtle">{s.time}</Text>
              </View>
            ))}
          </View>
          <Button label="View details" variant="outline" size="sm" style={{ marginTop: 12 }} onPress={() => router.push("/order-details")} />
        </Card>

        <Card style={styles.card}>
          <View style={styles.row}>
            <Avatar initials="MM" size="sm" />
            <View style={{ flex: 1 }}>
              <Text variant="label">Marcus Mane</Text>
              <Text variant="caption" color="textMuted">Courier · 8 min away</Text>
            </View>
            <Pressable onPress={() => Alert.alert("Call", "Calling is not available in this demo.")} style={[styles.round, { backgroundColor: colors.surfaceAlt }]} accessibilityRole="button" accessibilityLabel="Call courier">
              <Ionicons name="call-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
        </Card>

        <Button label="Browse restaurants" icon="arrow-forward" iconRight onPress={() => router.replace("/(customer)/search")} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  hero: { marginTop: 2 },
  card: { padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  thumb: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  timeline: { gap: 8 },
  step: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  round: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
