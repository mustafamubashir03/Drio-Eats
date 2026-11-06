import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card } from "@/components";
import { useTheme } from "@/lib/theme";

const METRICS = [
  { label: "Revenue (7d)", value: "$3,240", delta: "+12%", icon: "trending-up-outline" as const },
  { label: "Orders (7d)", value: "84", delta: "+8%", icon: "receipt-outline" as const },
  { label: "Avg. prep time", value: "14 min", delta: "-2 min", icon: "time-outline" as const },
  { label: "Rating", value: "4.8", delta: "+0.1", icon: "star-outline" as const },
];

export default function OwnerAnalyticsScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="heading">Analytics</Text>
        <Text variant="caption" color="textMuted">Performance snapshot (mock data)</Text>
        <View style={styles.grid}>
          {METRICS.map((m) => (
            <Card key={m.label} style={styles.metric}>
              <Ionicons name={m.icon} size={18} color={colors.lime} />
              <Text variant="subheading">{m.value}</Text>
              <Text variant="caption" color="textMuted">{m.label}</Text>
              <Text variant="caption" color="lime">{m.delta}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { width: "48%", padding: 12, gap: 2, flexGrow: 1 },
});
