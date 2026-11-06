import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge, Button } from "@/components";
import { useTheme } from "@/lib/theme";

export default function DriverDashboardScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="caption" color="textMuted">Driver</Text>
            <Text variant="heading">Dashboard</Text>
          </View>
          <Badge tone="success">Approved</Badge>
        </View>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <View style={{ flex: 1 }}>
              <Text variant="label">You are online</Text>
              <Text variant="caption" color="textMuted">Ready to accept deliveries</Text>
            </View>
            <Button label="Go offline" variant="outline" size="sm" fullWidth={false} onPress={() => Alert.alert("Status", "Status toggle is not part of this demo.")} />
          </View>
        </Card>

        <View style={styles.grid}>
          <Card style={styles.statCard}><Text variant="caption" color="textMuted">Active</Text><Text variant="subheading">2</Text></Card>
          <Card style={styles.statCard}><Text variant="caption" color="textMuted">Today</Text><Text variant="subheading">$38.40</Text></Card>
          <Card style={styles.statCard}><Text variant="caption" color="textMuted">Rating</Text><Text variant="subheading">4.9 ★</Text></Card>
        </View>

        <Text variant="label" color="textMuted">Current delivery</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="bicycle-outline" size={20} color={colors.lime} />
            <View style={{ flex: 1 }}>
              <Text variant="label">Order #182503</Text>
              <Text variant="caption" color="textMuted">Soul Chinese Platter → Krishna Nagar · 2.4 km</Text>
            </View>
            <Badge tone="lime">Picked up</Badge>
          </View>
          <Pressable onPress={() => router.replace("/(driver)/active")} style={styles.link} accessibilityRole="button">
            <Text variant="bodySmall" color="lime">View active deliveries</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.lime} />
          </Pressable>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  card: { padding: 14, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  grid: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, padding: 12, gap: 2 },
  link: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" },
});
