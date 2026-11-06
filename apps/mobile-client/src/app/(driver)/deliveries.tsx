import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

const DELIVERIES = [
  {
    id: "1",
    orderNumber: "#182503",
    restaurant: "Soul Chinese Platter",
    customer: "Krishna Nagar",
    status: "PICKED_UP",
    distance: "2.4 km",
    earnings: "$4.50",
  },
  {
    id: "2",
    orderNumber: "#182504",
    restaurant: "Spice Garden",
    customer: "Lake View",
    status: "ASSIGNED",
    distance: "3.1 km",
    earnings: "$5.20",
  },
];

export default function DriverDeliveriesScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="subheading" color="textMuted">
          My Deliveries
        </Text>
        <Text variant="heading">Assigned Deliveries</Text>
      </View>

      <FlatList
        data={DELIVERIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.deliveryCard}>
            <View style={styles.deliveryRow}>
              <View style={styles.deliveryInfo}>
                <Text variant="subheading">{item.orderNumber}</Text>
                <Text variant="caption" color="textMuted">
                  {item.restaurant}
                </Text>
                <Text variant="caption" color="textMuted">
                  {item.customer}
                </Text>
              </View>
              <View style={styles.deliveryMeta}>
                <Text variant="caption" color="textMuted">
                  {item.distance}
                </Text>
                <Text variant="caption" color="textMuted">
                  {item.earnings}
                </Text>
                <Badge
                  tone={
                    item.status === "PICKED_UP" ? "success" : "warning"
                  }
                  style={styles.statusBadge}
                >
                  {item.status}
                </Badge>
              </View>
            </View>
          </Card>
        )}
      />

      <View style={styles.empty} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  deliveryCard: {
    marginBottom: 12,
  },
  deliveryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  deliveryInfo: {
    flex: 1,
    gap: 4,
  },
  deliveryMeta: {
    gap: 4,
    alignItems: "flex-end",
  },
  statusBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },
});
