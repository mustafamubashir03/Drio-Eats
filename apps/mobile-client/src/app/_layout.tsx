import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, usePathname, router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function roleHome(authorization: { roles?: string[]; isSuperAdmin?: boolean; driverApplicationStatus?: string | null; restaurantOwnerApplicationStatus?: string | null } | null) {
  if (!authorization) return "/(customer)";
  if (authorization.isSuperAdmin) return "/(admin)/users";
  const roles = authorization.roles ?? [];
  if (roles.includes("RESTAURANT_OWNER") && authorization.restaurantOwnerApplicationStatus === "APPROVED") return "/(owner)";
  if (roles.includes("DRIVER") && authorization.driverApplicationStatus === "APPROVED") return "/(driver)";
  return "/(customer)";
}

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { colors, isDark } = useTheme();
  const { ready, isAuthenticated, authorization, authorizationReady, refreshAuthorization } = useAuth();
  const pathname = usePathname();

  const inAuth = pathname.includes("/login") || pathname.includes("/signup") || pathname.includes("/apply-");

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated && !inAuth) {
      router.replace("/(auth)/login");
    }
  }, [ready, isAuthenticated, inAuth]);

  useEffect(() => {
    if (isAuthenticated && !inAuth && (pathname === "/" || pathname === "/index")) {
      if (authorizationReady) router.replace(roleHome(authorization) as never);
    }
  }, [isAuthenticated, inAuth, pathname, authorizationReady, authorization]);

  useEffect(() => {
    if (isAuthenticated && inAuth && !pathname.includes("/apply-") && authorizationReady) {
      router.replace(roleHome(authorization) as never);
    }
  }, [isAuthenticated, inAuth, pathname, authorizationReady, authorization]);

  useEffect(() => {
    if (isAuthenticated && authorizationReady) {
      void refreshAuthorization();
    }
  }, [isAuthenticated, authorizationReady, refreshAuthorization]);

  if (!ready || !fontsLoaded || (isAuthenticated && !authorizationReady)) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.lime} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={inAuth || isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="(auth)/apply-driver" />
        <Stack.Screen name="(auth)/apply-restaurant-owner" />
        <Stack.Screen name="(customer)" />
        <Stack.Screen name="(owner)" />
        <Stack.Screen name="(driver)" />
        <Stack.Screen name="(admin)/users" />
        <Stack.Screen name="(admin)/users/[userId]" />
        <Stack.Screen name="(admin)/driver-applications" />
        <Stack.Screen name="(admin)/restaurant-owner-applications" />
        <Stack.Screen name="(admin)/rbac-diagnostics" />
        <Stack.Screen name="order-details" />
        <Stack.Screen name="live-tracking" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    void SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <SafeAreaProvider>
      <ThemeProvider initialMode="dark">
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RootNavigator fontsLoaded={fontsLoaded} />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
});
