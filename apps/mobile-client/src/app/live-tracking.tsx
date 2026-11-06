import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Button, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";

export default function LiveTrackingScreen() {
  const { colors, isDark } = useTheme();
  const { height } = useWindowDimensions();
  // Keep the map useful on tall phones without crowding out the CTA on short
  // ones (e.g. 320x568): 42% of the viewport, clamped to 220–380 px.
  const mapHeight = Math.max(220, Math.min(380, Math.round(height * 0.42)));

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
        <Text variant="subheading">Live Tracking</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.map,
            {
              height: mapHeight,
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.routeLine,
              { backgroundColor: isDark ? `${colors.lime}55` : colors.limeDeep },
            ]}
          />

          <View style={[styles.marker, { backgroundColor: colors.mint, top: "14%", left: "18%" }]}>
            <Ionicons name="person-outline" size={16} color={colors.mintText} />
          </View>
          <View style={[styles.marker, { backgroundColor: isDark ? colors.lime : colors.limeDeep, top: "46%", right: "18%" }]}>
            <Ionicons name="bicycle-outline" size={16} color={isDark ? colors.limeText : colors.limeDeep} />
          </View>
          <View style={[styles.marker, { backgroundColor: colors.surface, bottom: "14%", left: "34%", borderWidth: 1, borderColor: colors.border }]}>
            <Ionicons name="home-outline" size={16} color={colors.text} />
          </View>

          <View style={[styles.orderBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="fast-food-outline" size={16} color={colors.lime} />
            <View>
              <Text variant="label">Your order</Text>
              <Text variant="caption" color="textMuted">
                1.1 km away
              </Text>
            </View>
          </View>
        </View>

        <Card style={{ marginTop: 16 }}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={[styles.roundIcon, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="bicycle-outline" size={20} color={colors.lime} />
              </View>
              <View>
                <Text variant="subheading">Your order</Text>
                <Text variant="caption" color="textMuted">
                  Courier en route
                </Text>
              </View>
            </View>
            <Badge tone="mint">1.1 km away</Badge>
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
    position: "relative",
  },
  routeLine: {
    position: "absolute",
    top: "22%",
    bottom: "22%",
    left: "50%",
    width: 2,
  },
  marker: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  orderBubble: {
    position: "absolute",
    top: "40%",
    left: "18%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  roundIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
