import React from "react";
import { Screen, Text } from "@/components";
import { View, StyleSheet } from "react-native";

export default function HistoryScreen() {
  return (
    <Screen>
      <View style={styles.center}>
        <Text variant="heading" color="lime">History</Text>
        <Text style={styles.sub}>Delivery history</Text>
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