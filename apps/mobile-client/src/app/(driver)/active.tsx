import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

const DELIVERIES = [
  { id: "1", order: "#182503", restaurant: "Soul Chinese Platter", dropoff: "Krishna Nagar", status: "Picked up", tone: "success" as const, distance: "2.4 km", pay: "$4.50" },
  { id: "2", order: "#182504", restaurant: "Spice Garden", dropoff: "Lake View", status: "Assigned", tone: "warning" as const, distance: "3.1 km", pay: "$5.20" },
];

export default function DriverActiveScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="heading">Active</Text>
        <Text variant="caption" color="textMuted">Assigned deliveries</Text>
        <View style={{ gap: 10, marginTop: 4 }}>
          {DELIVERIES.map((d) => (
            <Card key={d.id} style={styles.card}>
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="label">Order {d.order}</Text>
                  <Text variant="caption" color="textMuted">{d.restaurant}</Text>
                </View>
                <Badge tone={d.tone}>{d.status}</Badge>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text variant="caption" color="textMuted" style={{ flex: 1 }}>{d.dropoff}</Text>
                <Text variant="caption" color="textMuted">{d.distance}</Text>
                <Text variant="caption" color="lime">{d.pay}</Text>
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
  card: { padding: 12, gap: 8 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
});
