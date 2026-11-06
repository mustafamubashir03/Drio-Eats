import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge, Button } from "@/components";
import { useTheme } from "@/lib/theme";

export default function DriverDashboardScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="subheading" color="textMuted">
            Driver Dashboard
          </Text>
          <Text variant="heading">Welcome, Driver</Text>
          <Badge tone="success" style={styles.badge}>
            Approved
          </Badge>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text variant="caption" color="textMuted">
                Status
              </Text>
              <Text variant="subheading">Online</Text>
            </View>
            <Button
              label="Go Offline"
              icon="power-outline"
              iconRight
              style={styles.toggleButton}
              onPress={() => Alert.alert("Toggle", "Not implemented in demo")}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text variant="caption" color="textMuted">
                Assigned Deliveries
              </Text>
              <Text variant="subheading">0</Text>
            </View>
            <Pressable
              onPress={() => router.push("/(driver)/deliveries")}
              style={styles.cardLink}
              accessibilityRole="button"
            >
              <Text variant="bodySmall" color="primary">
                View Deliveries
              </Text>
              <Ionicons name="chevron-forward-outline" size={16} color="primary" />
            </Pressable>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text variant="caption" color="textMuted">
                Earnings Today
              </Text>
              <Text variant="subheading">$0.00</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text variant="caption" color="textMuted" style={styles.sectionLabel}>
            Quick Actions
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={() => Alert.alert("Accept", "No deliveries available")}
              style={styles.actionButton}
              accessibilityRole="button"
            >
              <Ionicons name="play-outline" size={24} color={colors.text} />
              <Text variant="bodySmall">Accept Delivery</Text>
            </Pressable>
            <Pressable
              onPress={() => Alert.alert("Status", "Coming soon")}
              style={styles.actionButton}
              accessibilityRole="button"
            >
              <Ionicons name="navigate-outline" size={24} color={colors.text} />
              <Text variant="bodySmall">Navigation</Text>
            </Pressable>
            <Pressable
              onPress={() => Alert.alert("Earnings", "Coming soon")}
              style={styles.actionButton}
              accessibilityRole="button"
            >
              <Ionicons name="cash-outline" size={24} color={colors.text} />
              <Text variant="bodySmall">Earnings</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

import { Alert, Pressable } from "react-native";

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3A",
  },
  cardInfo: {
    gap: 4,
  },
  toggleButton: {
    width: 100,
    height: 36,
    paddingHorizontal: 8,
  },
  cardLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#1C1D21",
    borderRadius: 12,
  },
});
