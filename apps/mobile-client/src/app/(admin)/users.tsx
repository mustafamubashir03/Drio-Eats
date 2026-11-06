import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge, Button, Input } from "@/components";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/axios";

export default function AdminUsersScreen() {
  const { colors } = useTheme();
  const { authorization, clearSession } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isSuperAdmin = authorization?.isSuperAdmin ?? false;

  const loadUsers = async () => {
    try {
      const res = await api.get("/rbac/users");
      setUsers(res.data.users || []);
    } catch {
      setUsers([]);
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
      await loadUsers();
    })();
  }, [isSuperAdmin]);

  const filteredUsers = users.filter((u: any) => {
    if (!search) return true;
    const email = (u.email || "").toLowerCase();
    const name = ((u.firstName || "") + " " + (u.lastName || "")).toLowerCase();
    return email.includes(search.toLowerCase()) || name.includes(search.toLowerCase());
  });

  return (
    <Screen>
      <FlatList
        data={loading ? [] : filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text variant="subheading" color="textMuted">
                  User Management
                </Text>
                <Text variant="heading">All Users</Text>
              </View>
              <Pressable
                onPress={async () => {
                  try {
                    await clearSession();
                    router.replace("/(auth)/login");
                  } catch {
                    Alert.alert("Logout failed", "Could not sign out. Please try again.");
                  }
                }}
                style={[styles.logoutButton, { borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Log out"
              >
                <Ionicons name="log-out-outline" size={18} color={colors.text} />
                <Text variant="label" color="text">Log out</Text>
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <Input
                label="Search users"
                placeholder="Search by email or name"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {loading ? (
              <View style={styles.loading}>
                <Ionicons name="reload-circle-outline" size={32} color={colors.textMuted} />
              </View>
            ) : undefined}
          </View>
        }
        ListEmptyComponent={
          !loading && filteredUsers.length === 0 ? (
            <View style={styles.empty}>
              <Text variant="body">No users found</Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }: any) => (
          <Card style={styles.userCard}>
            <View style={styles.userRow}>
              <View style={styles.userInfo}>
                <Text variant="subheading">
                  {item.email}
                </Text>
                <Text variant="caption" color="textMuted">
                  {item.name || item.firstName || ""}
                </Text>
              </View>
              <View style={styles.userRoles}>
                {(item.roles || []).map((role: string) => (
                  <Badge
                    key={role}
                    tone={role === "SUPERADMIN" ? "danger" : "lime"}
                    style={styles.roleBadge}
                  >
                    {role}
                  </Badge>
                ))}
              </View>
            </View>
            <Pressable
              onPress={() => {
                router.push(`/(admin)/users/${item.id}` as any);
              }}
              style={styles.cardLink}
              accessibilityRole="button"
            >
              <Text variant="bodySmall" color="primary">
                View Details
              </Text>
              <Ionicons name="chevron-forward-outline" size={16} color="primary" />
            </Pressable>
          </Card>
        )}
      />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchContainer: {
    marginBottom: 20,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  userCard: {
    marginBottom: 12,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userRoles: {
    flexDirection: "row",
    gap: 8,
  },
  roleBadge: {
    marginTop: 2,
  },
  cardLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

