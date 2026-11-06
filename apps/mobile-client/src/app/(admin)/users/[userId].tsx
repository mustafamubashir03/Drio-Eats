import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { router, useRoute } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge, Button, Input } from "@/components";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/axios";

export default function AdminUserDetailScreen() {
  const { colors } = useTheme();
  const { authorization } = useAuth();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = authorization?.isSuperAdmin ?? false;

  const loadUser = async () => {
    try {
      const res = await api.get(`/rbac/users/${userId}`);
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/");
      return;
    }
    (async () => {
      await loadUser();
    })();
  }, [isSuperAdmin, userId]);

  const assignRole = async (role: string) => {
    try {
      await api.post(`/rbac/users/${userId}/roles`, { role });
      await loadUser();
    } catch {
      Alert.alert("Error", "Failed to assign role");
    }
  };

  const revokeRole = async (role: string) => {
    try {
      await api.delete(`/rbac/users/${userId}/roles/${role}`);
      await loadUser();
    } catch {
      Alert.alert("Error", "Failed to revoke role");
    }
  };

  if (!isSuperAdmin || loading || !user) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Ionicons name="reload-circle-outline" size={32} color={colors.textMuted} />
        </View>
      </Screen>
    );
  }

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
          <Text variant="heading">User Details</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.formGroup}>
            <Text variant="caption" color="textMuted">Email</Text>
            <Text variant="subheading">{user.user?.email}</Text>
          </View>
          <View style={styles.formGroup}>
            <Text variant="caption" color="textMuted">Name</Text>
            <Text variant="subheading">
              {user.user?.name || user.user?.firstName || ""}
            </Text>
          </View>
          <View style={styles.formGroup}>
            <Text variant="caption" color="textMuted">Status</Text>
            <Text variant="subheading">{user.user?.status || "ACTIVE"}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text variant="subheading">Roles</Text>
          </View>
          {(user.roles || []).map((role: string) => (
            <View key={role} style={styles.roleRow}>
              <Badge
                tone={role === "SUPERADMIN" ? "danger" : "lime"}
                style={styles.roleBadge}
              >
                {role}
              </Badge>
              {role !== "SUPERADMIN" ? (
                <Pressable
                  onPress={() => revokeRole(role)}
                  style={styles.revokeButton}
                  accessibilityRole="button"
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              ) : null}
            </View>
          ))}
          <View style={styles.assignSection}>
            <Text variant="caption" color="textMuted">Assign Role</Text>
            <View style={styles.roleButtons}>
              <Pressable
                onPress={() => assignRole("CUSTOMER")}
                style={[styles.roleButton, styles.roleButtonCustomer]}
                accessibilityRole="button"
              >
                <Text variant="bodySmall">Customer</Text>
              </Pressable>
              <Pressable
                onPress={() => assignRole("DRIVER")}
                style={[styles.roleButton, styles.roleButtonDriver]}
                accessibilityRole="button"
              >
                <Text variant="bodySmall">Driver</Text>
              </Pressable>
              <Pressable
                onPress={() => assignRole("RESTAURANT_OWNER")}
                style={[styles.roleButton, styles.roleButtonOwner]}
                accessibilityRole="button"
              >
                <Text variant="bodySmall">Owner</Text>
              </Pressable>
              <Pressable
                onPress={() => assignRole("SUPERADMIN")}
                style={[styles.roleButton, styles.roleButtonSuperAdmin]}
                accessibilityRole="button"
              >
                <Text variant="bodySmall">Superadmin</Text>
              </Pressable>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text variant="caption" color="textMuted" style={styles.sectionLabel}>
            Application Status
          </Text>
          <View style={styles.statusRow}>
            <Text variant="bodySmall">Driver:</Text>
            <Badge tone="lime" style={styles.statusBadge}>
              {user.driverApplicationStatus || "NOT_APPLIED"}
            </Badge>
          </View>
          <View style={styles.statusRow}>
            <Text variant="bodySmall">Restaurant Owner:</Text>
            <Badge tone="lime" style={styles.statusBadge}>
              {user.restaurantOwnerApplicationStatus || "NOT_APPLIED"}
            </Badge>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

import { Alert } from "react-native";

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
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 16,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3A",
  },
  roleBadge: {
    alignSelf: "flex-start",
  },
  revokeButton: {
    padding: 4,
  },
  assignSection: {
    marginTop: 16,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
  roleButtonCustomer: {
    borderColor: "#ECFF7F",
    backgroundColor: "rgba(236, 255, 127, 0.1)",
  },
  roleButtonDriver: {
    borderColor: "#ECFF7F",
    backgroundColor: "rgba(236, 255, 127, 0.1)",
  },
  roleButtonOwner: {
    borderColor: "#ECFF7F",
    backgroundColor: "rgba(236, 255, 127, 0.1)",
  },
  roleButtonSuperAdmin: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
});
