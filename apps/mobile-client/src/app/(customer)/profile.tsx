import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Screen, Text, Button, Card, Avatar } from "@/components";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export default function ProfileScreen() {
  const { clearSession, session } = useAuth();
  const { colors } = useTheme();
  const email = session?.user?.email ? String(session.user.email) : "—";
  const name = [session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(" ") || session?.user?.name || "Customer";
  const initials = name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "CU";
  const rows = [
    { icon: "location-outline" as const, label: "Addresses", value: "2 saved" },
    { icon: "card-outline" as const, label: "Payment methods", value: "1 card" },
    { icon: "notifications-outline" as const, label: "Notifications", value: "On" },
  ];

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="heading">Profile</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <Avatar initials={initials} size="md" />
            <View style={{ flex: 1 }}>
              <Text variant="label">{name}</Text>
              <Text variant="caption" color="textMuted">{email}</Text>
            </View>
          </View>
        </Card>
        <Card style={styles.card}>
          {rows.map((r, i) => (
            <View key={r.label} style={[styles.settingRow, i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <Ionicons name={r.icon} size={18} color={colors.lime} />
              <Text variant="bodySmall" style={{ flex: 1 }}>{r.label}</Text>
              <Text variant="caption" color="textMuted">{r.value}</Text>
            </View>
          ))}
        </Card>
        <Button label="Log out" variant="outline" onPress={async () => { try { await clearSession(); router.replace("/(auth)/login"); } catch { Alert.alert("Logout failed", "Could not sign out. Please try again."); } }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 12 },
  card: { padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
});
