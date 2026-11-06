import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

const HISTORY = [
  { id: "182490", restaurant: "Green Bowl Kitchen", when: "Today, 1:20 PM", pay: "$5.10", status: "Completed" },
  { id: "182481", restaurant: "Roma Fire Pizza", when: "Today, 11:05 AM", pay: "$6.30", status: "Completed" },
  { id: "182470", restaurant: "Soul Chinese Platter", when: "Yesterday", pay: "$4.50", status: "Completed" },
];

export default function DriverHistoryScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="heading">History</Text>
        <Text variant="caption" color="textMuted">Completed deliveries</Text>
        <View style={{ gap: 10, marginTop: 4 }}>
          {HISTORY.map((h) => (
            <Card key={h.id} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">Order #{h.id}</Text>
                  <Text variant="caption" color="textMuted">{h.restaurant} · {h.when}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text variant="label" color="lime">{h.pay}</Text>
                  <Badge tone="success">{h.status}</Badge>
                </View>
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
