import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge, Button } from "@/components";
import { useTheme } from "@/lib/theme";

export default function OwnerDashboardScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="subheading" color="textMuted">
            Restaurant Owner Dashboard
          </Text>
          <Text variant="heading">Welcome, Owner</Text>
          <Badge tone="success" style={styles.badge}>
            Approved
          </Badge>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text variant="caption" color="textMuted">
                Restaurants Owned
              </Text>
              <Text variant="subheading">0</Text>
            </View>
            <Pressable
              onPress={() => router.push("/(owner)/restaurants")}
              style={styles.cardLink}
              accessibilityRole="button"
            >
              <Text variant="bodySmall" color="primary">
                Manage Restaurants
              </Text>
              <Ionicons name="chevron-forward-outline" size={16} color="primary" />
            </Pressable>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text variant="caption" color="textMuted">
                Pending Orders
              </Text>
              <Text variant="subheading">0</Text>
            </View>
            <Pressable
              onPress={() => Alert.alert("Orders", "No pending orders")}
              style={styles.cardLink}
              accessibilityRole="button"
            >
              <Text variant="bodySmall" color="primary">
                View Orders
              </Text>
              <Ionicons name="chevron-forward-outline" size={16} color="primary" />
            </Pressable>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text variant="caption" color="textMuted">
                Menu Items
              </Text>
              <Text variant="subheading">0</Text>
            </View>
            <Pressable
              onPress={() => router.push("/(owner)/menu")}
              style={styles.cardLink}
              accessibilityRole="button"
            >
              <Text variant="bodySmall" color="primary">
                Manage Menu
              </Text>
              <Ionicons name="chevron-forward-outline" size={16} color="primary" />
            </Pressable>
          </View>
        </Card>
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
  cardLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
