import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Button, Card, Avatar, Divider } from "@/components";
import { useTheme } from "@/lib/theme";

const TIMELINE = [
  { label: "Food ordered", time: "04:46", done: true },
  { label: "Order ready", time: "04:56", done: true },
  { label: "On the way", time: "05:02", done: true },
  { label: "Delivered", time: "05:16", done: false },
];

export default function OrderDetailsScreen() {
  const { colors, isDark } = useTheme();
  const { height } = useWindowDimensions();
  const mapHeight = Math.max(180, Math.min(240, Math.round(height * 0.32)));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text variant="subheading">Order Details</Text>
        <Pressable
          onPress={() => router.push("/live-tracking")}
          style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Open live tracking"
        >
          <Ionicons name="locate-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <MapPlaceholder colors={colors} isDark={isDark} height={mapHeight} />

        <Card style={{ marginTop: 16 }}>
          <View style={styles.driverRow}>
            <Avatar initials="MM" size="lg" />
            <View style={{ flex: 1 }}>
              <Text variant="subheading">Marcus Mane</Text>
              <Text variant="caption" color="textMuted">
                Delivery courier · ID 125320
              </Text>
            </View>
            <Pressable
              onPress={() => Alert.alert("Call", "Calling is not available in this demo.")}
              style={[styles.roundIcon, { backgroundColor: colors.surfaceAlt }]}
              accessibilityRole="button"
              accessibilityLabel="Call courier"
            >
              <Ionicons name="call-outline" size={18} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => Alert.alert("Message", "Messaging is not available in this demo.")}
              style={[styles.roundIcon, { backgroundColor: colors.surfaceAlt }]}
              accessibilityRole="button"
              accessibilityLabel="Message courier"
            >
              <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text variant="label">05:32</Text>
              <Text variant="caption" color="textMuted">
                Estimated
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.lime }]}>
              <Ionicons name="navigate-outline" size={16} color={colors.limeText} />
              <Text variant="label" color="limeText">
                3.8 km
              </Text>
              <Text variant="caption" color="limeText">
                Distance
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text variant="label" style={{ marginBottom: 12 }}>
            Order status
          </Text>
          <View style={{ gap: 14 }}>
            {TIMELINE.map((step) => (
              <View key={step.label} style={styles.timelineRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: step.done ? colors.timelineDone : colors.timelinePending },
                  ]}
                />
                <Text
                  variant="bodySmall"
                  color={step.done ? "text" : "textSubtle"}
                  style={{ flex: 1 }}
                >
                  {step.label}
                </Text>
                <Text variant="caption" color="textSubtle">
                  {step.time}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Button
          label="Continue to Shopping"
          icon="arrow-forward"
          iconRight
          style={{ marginTop: 24 }}
          onPress={() => router.replace("/")}
        />
      </ScrollView>
    </Screen>
  );
}

function MapPlaceholder({
  colors,
  isDark,
  height,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  isDark: boolean;
  height: number;
}) {
  const routeColor = isDark ? `${colors.lime}44` : colors.limeDeep;
  const pinColor = isDark ? colors.lime : colors.limeDeep;

  return (
    <View
      style={[
        styles.map,
        { height, backgroundColor: colors.surfaceAlt, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.routeLine,
          { backgroundColor: routeColor },
        ]}
      />
      <View style={[styles.marker, { backgroundColor: pinColor, left: "24%" }]}>
        <Ionicons name="restaurant-outline" size={16} color={pinColor} />
      </View>
      <View style={[styles.marker, { backgroundColor: colors.mint, right: "24%" }]}>
        <Ionicons name="home-outline" size={16} color={colors.mintText} />
      </View>
      <View style={[styles.etaBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="bicycle-outline" size={16} color={isDark ? colors.lime : colors.limeDeep} />
        <View>
          <Text variant="caption" color="textMuted">
            Courier on the way
          </Text>
          <Text variant="label">Arriving in 24 min</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  map: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  routeLine: {
    position: "absolute",
    left: "30%",
    right: "30%",
    top: "50%",
    height: 2,
  },
  marker: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  etaBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  driverRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  roundIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  pillRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
  },
  timelineRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 9, height: 9, borderRadius: 5 },
});
