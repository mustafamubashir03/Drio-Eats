import React from "react";
import { Screen, Text } from "@/components";
import { View, StyleSheet } from "react-native";

export default function FavoritesScreen() {
  return (
    <Screen>
      <View style={styles.center}>
        <Text variant="heading" color="lime">Favorites</Text>
        <Text style={styles.sub}>Favorite restaurants</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sub: {
    color: "textMuted",
    marginTop: 8,
    fontSize: 14,
  },
});