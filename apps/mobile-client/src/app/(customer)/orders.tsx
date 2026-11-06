import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

const ORDERS = [
  { id: "182503", name: "Soul Chinese Platter", status: "In transit", tone: "lime" as const, date: "Today · $24.90" },
  { id: "182488", name: "Green Bowl Kitchen", status: "Delivered", tone: "success" as const, date: "Yesterday · $18.40" },
  { id: "182471", name: "Roma Fire Pizza", status: "Delivered", tone: "success" as const, date: "Apr 28 · $31.20" },
];

export default function OrdersScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="heading">Orders</Text>
        <Text variant="caption" color="textMuted">Recent orders</Text>
        <View style={{ gap: 10, marginTop: 4 }}>
          {ORDERS.map((o) => (
            <Card key={o.id} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="receipt-outline" size={20} color={colors.lime} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">{o.name}</Text>
                  <Text variant="caption" color="textMuted">#{o.id} · {o.date}</Text>
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
