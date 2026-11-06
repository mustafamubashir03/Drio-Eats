import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

const FAVORITES = [
  { id: "1", name: "Soul Chinese Platter", meta: "Asian · Open now", rating: "4.8", tag: "Restaurant" },
  { id: "2", name: "Avocado Power Bowl", meta: "Green Bowl Kitchen · $12.50", rating: "4.7", tag: "Dish" },
  { id: "3", name: "Roma Fire Pizza", meta: "Italian · Closes 11:00 PM", rating: "4.5", tag: "Restaurant" },
];

export default function FavoritesScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="heading">Favorites</Text>
        <Text variant="caption" color="textMuted">Saved places and items</Text>
        <View style={{ gap: 10, marginTop: 4 }}>
          {FAVORITES.map((f) => (
            <Card key={f.id} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name={f.tag === "Dish" ? "fast-food-outline" : "heart"} size={20} color={colors.lime} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">{f.name}</Text>
                  <Text variant="caption" color="textMuted">{f.meta}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Badge tone="lime">{`${f.rating} ★`}</Badge>
                  <Text variant="caption" color="textSubtle">{f.tag}</Text>
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
