import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { router, useRoute } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge, Button, Input } from "@/components";
import { useTheme } from "@/lib/theme";

export default function OwnerRestaurantDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const { restaurantId } = route.params as { restaurantId: string };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back-outline" size={20} color={colors.text} />
          </Pressable>
          <Text variant="heading">Restaurant Details</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.formGroup}>
            <Input
              label="Restaurant Name"
              placeholder="Enter restaurant name"
              value="Soul Chinese Platter"
              editable={false}
            />
          </View>
          <View style={styles.formGroup}>
            <Input
              label="Cuisine Type"
              placeholder="e.g. Italian, Indian, Chinese"
              value="Chinese"
              editable={false}
            />
          </View>
          <View style={styles.formGroup}>
            <Input
              label="Address"
              placeholder="Enter restaurant address"
              value="123 Goodfoods, Goa"
              editable={false}
            />
          </View>
          <View style={styles.formGroup}>
            <Input
              label="Phone Number"
              placeholder="Enter phone number"
              value="+91 98765 43210"
              editable={false}
            />
          </View>
          <View style={styles.formGroup}>
            <Input
              label="Email"
              placeholder="Enter email address"
              value="owner@soulchinese.com"
              editable={false}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text variant="subheading">Restaurant Status</Text>
            <Badge tone="success">Approved</Badge>
          </View>
          <View style={styles.toggleRow}>
            <Text variant="bodySmall">Accept Orders</Text>
            <Pressable style={styles.toggleSwitch} accessibilityRole="button">
              <Ionicons name="toggle-outline" size={20} color={colors.lime} />
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  card: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3A",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
  },
  toggleSwitch: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1C1D21",
    alignItems: "center",
    justifyContent: "center",
  },
});
