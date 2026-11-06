// RBAC Diagnostics screen - simplified version
import React from "react";
import { View, StyleSheet, Text } from "react-native";

export default function RbacDiagnosticsScreen() {
  return (
    <View style={styles.container}>
      <Text>RBAC Diagnostics</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});