import React from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

const CATEGORIES = ["Burgers", "Pizza", "Sushi", "Healthy", "Dessert"];
const RESULTS = [
  { id: "1", name: "Soul Chinese Platter", meta: "Asian · 25–35 min", rating: "4.8" },
  { id: "2", name: "Spice Garden", meta: "Indian · 30–40 min", rating: "4.6" },
  { id: "3", name: "Green Bowl Kitchen", meta: "Healthy · 20–30 min", rating: "4.7" },
  { id: "4", name: "Roma Fire Pizza", meta: "Italian · 25–35 min", rating: "4.5" },
];

export default function SearchScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="heading">Search</Text>
        <Pressable style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="search">
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <Text variant="bodySmall" color="textMuted">Search restaurants or dishes</Text>
        </Pressable>

        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <View key={c} style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}>
              <Text variant="caption" color="text">{c}</Text>
            </View>
          ))}
        </View>

        <Text variant="label" color="textMuted">Popular nearby</Text>
        <View style={{ gap: 10 }}>
          {RESULTS.map((r) => (
            <Card key={r.id} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="restaurant-outline" size={20} color={colors.lime} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">{r.name}</Text>
                  <Text variant="caption" color="textMuted">{r.meta}</Text>
                </View>
                <Badge tone="lime">{`${r.rating} ★`}</Badge>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  card: { padding: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  thumb: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
