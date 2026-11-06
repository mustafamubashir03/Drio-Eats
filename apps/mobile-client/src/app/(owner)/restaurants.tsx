import React from "react";
import { Alert, StyleSheet, View, ScrollView, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge, Button } from "@/components";
import { useTheme } from "@/lib/theme";

const RESTAURANTS: any[] = [];

export default function OwnerRestaurantsScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="subheading" color="textMuted">
          My Restaurants
        </Text>
        <Text variant="heading">Restaurant Management</Text>
        <Button
          label="Add Restaurant"
          icon="add-outline"
          iconRight
          style={styles.addButton}
          onPress={() =>
            Alert.alert("Create", "Restaurant creation coming soon.")
          }
        />
      </View>

      {RESTAURANTS.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="star-outline" size={48} color={colors.textMuted} />
          <Text variant="subheading">No restaurants yet</Text>
          <Text variant="body" color="textMuted" style={styles.emptySubtitle}>
            Create your first restaurant to start accepting orders.
          </Text>
        </View>
      ) : (
        <FlatList
          data={RESTAURANTS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: any) => (
            <Card style={styles.restaurantCard}>
              <View style={styles.restaurantRow}>
                <View style={styles.restaurantInfo}>
                  <Text variant="subheading">{item.name}</Text>
                  <Text variant="caption" color="textMuted">
                    {item.cuisineType} · {item.city}
                  </Text>
                </View>
                <Badge
                  tone={item.status === "APPROVED" ? "success" : "warning"}
                  style={styles.statusBadge}
                >
                  {item.status}
                </Badge>
              </View>
              <Pressable
                onPress={() => {
                  router.push(`/(owner)/restaurants/${item.id}` as any);
                }}
                style={styles.cardLink}
                accessibilityRole="button"
              >
                <Text variant="bodySmall" color="primary">
                  Manage
                </Text>
                <Ionicons name="chevron-forward-outline" size={16} color="primary" />
              </Pressable>
            </Card>
          )}
        />
      )}
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
    marginBottom: 20,
  },
  addButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptySubtitle: {
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  restaurantCard: {
    marginBottom: 12,
  },
  restaurantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  restaurantInfo: {
    flex: 1,
    gap: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 2,
  },
  cardLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
