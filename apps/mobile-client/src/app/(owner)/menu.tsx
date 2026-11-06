import React from "react";
import { Alert, ScrollView, StyleSheet, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

const ITEMS = [
  { id: "1", name: "Chicken Platter", price: "$12.90", status: "Available" },
  { id: "2", name: "Veggie Bowl", price: "$9.50", status: "Available" },
  { id: "3", name: "Spicy Wings", price: "$10.40", status: "Low stock" },
];

export default function OwnerMenuScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="heading">Menu</Text>
            <Text variant="caption" color="textMuted">{ITEMS.length} items</Text>
          </View>
          <Pressable onPress={() => Alert.alert("Add item", "Menu editing is not part of this demo.")} style={[styles.addBtn, { backgroundColor: colors.lime }]} accessibilityRole="button" accessibilityLabel="Add item">
            <Ionicons name="add" size={20} color={colors.limeText} />
          </Pressable>
        </View>
        <View style={{ gap: 10 }}>
          {ITEMS.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="fast-food-outline" size={20} color={colors.lime} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">{item.name}</Text>
                  <Text variant="caption" color="textMuted">{item.price}</Text>
                </View>
                <Badge tone={item.status === "Available" ? "success" : "warning"}>{item.status}</Badge>
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
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  card: { padding: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  thumb: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
