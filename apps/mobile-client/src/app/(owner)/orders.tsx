import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

const ORDERS = [
  { id: "182503", items: "2 items", total: "$24.90", status: "Ready", tone: "success" as const, time: "2 min ago" },
  { id: "182504", items: "1 item", total: "$12.50", status: "Preparing", tone: "warning" as const, time: "8 min ago" },
  { id: "182505", items: "4 items", total: "$41.20", status: "New", tone: "lime" as const, time: "12 min ago" },
];

export default function OwnerOrdersScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="heading">Orders</Text>
        <Text variant="caption" color="textMuted">Incoming and active orders</Text>
        <View style={{ gap: 10, marginTop: 4 }}>
          {ORDERS.map((o) => (
            <Card key={o.id} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="receipt-outline" size={20} color={colors.lime} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">Order #{o.id}</Text>
                  <Text variant="caption" color="textMuted">{o.items} · {o.total} · {o.time}</Text>
                </View>
                <Badge tone={o.tone}>{o.status}</Badge>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 4 },
  card: { padding: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  thumb: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
