import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Text, Card, Badge } from "@/components";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/axios";
import { Alert } from "react-native";

export default function AdminDriverApplicationsScreen() {
  const { colors } = useTheme();
  const { authorization } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = authorization?.isSuperAdmin ?? false;

  const loadApplications = async () => {
    try {
      const res = await api.get("/rbac/driver/applications");
      setApplications(res.data.applications || []);
    } catch {
      setApplications([]);
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
      await loadApplications();
    })();
  }, [isSuperAdmin]);

  const approve = async (userId: string) => {
    try {
      await api.post(`/rbac/driver/applications/${userId}/approve`);
      await loadApplications();
    } catch {
      Alert.alert("Error", "Failed to approve application");
    }
  };

  const reject = async (userId: string) => {
    try {
      await api.post(`/rbac/driver/applications/${userId}/reject`);
      await loadApplications();
    } catch {
      Alert.alert("Error", "Failed to reject application");
    }
  };

  if (!isSuperAdmin) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text variant="body" color="textMuted">Access denied</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={loading ? [] : applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="subheading" color="textMuted">
              Driver Applications
            </Text>
            <Text variant="heading">Driver Applications</Text>
          </View>
        }
        ListEmptyComponent={
          !loading && applications.length === 0 ? (
            <View style={styles.empty}>
              <Text variant="body">No driver applications</Text>
            </View>
          ) : loading ? (
            <View style={styles.loading}>
              <Ionicons name="reload-circle-outline" size={32} color={colors.textMuted} />
            </View>
          ) : undefined
        }
        renderItem={({ item }: any) => (
          <Card style={styles.appCard}>
            <View style={styles.appRow}>
              <View style={styles.appInfo}>
                <Text variant="subheading">{item.email}</Text>
                <Text variant="caption" color="textMuted">
                  {item.name || ""}
                </Text>
              </View>
              <Badge
                tone={
                  item.status === "APPROVED"
                    ? "success"
                    : item.status === "REJECTED"
                      ? "danger"
                      : "warning"
                }
                style={styles.statusBadge}
              >
                {item.status}
              </Badge>
            </View>
            <View style={styles.actions}>
              {item.status === "PENDING" ? (
                <>
                  <Pressable
                    onPress={() => approve(item.userId)}
                    style={styles.approveButton}
                    accessibilityRole="button"
                  >
                    <Ionicons name="checkmark-outline" size={20} color={colors.success} />
                  </Pressable>
                  <Pressable
                    onPress={() => reject(item.userId)}
                    style={styles.rejectButton}
                    accessibilityRole="button"
                  >
                    <Ionicons name="close-outline" size={20} color={colors.danger} />
                  </Pressable>
                </>
              ) : (
                <Text variant="caption" color="textMuted">
                  Already processed
                </Text>
              )}
            </View>
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
  appCard: {
    marginBottom: 12,
  },
  appRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  appInfo: {
    flex: 1,
    gap: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  approveButton: {
    padding: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 8,
  },
  rejectButton: {
    padding: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
});

