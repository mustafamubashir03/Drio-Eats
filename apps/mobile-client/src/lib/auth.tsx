import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { getStoredItem, removeStoredItem, setStoredItem, SESSION_KEY as STORAGE_SESSION_KEY } from "./storage";
import { api } from "./axios";

export const SESSION_KEY = STORAGE_SESSION_KEY;
export const ROLES_KEY = "drio-auth-roles";
export const PERMISSIONS_KEY = "drio-auth-permissions";

export interface AuthSession {
  token?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface UserAuthorization {
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
  driverApplicationStatus: string | null;
  restaurantOwnerApplicationStatus: string | null;
}

interface AuthContextValue {
  /** True once the persisted session has been read. */
  ready: boolean;
  session: AuthSession | null;
  isAuthenticated: boolean;
  /** Authorization data from the server (roles, permissions, etc.) */
  authorization: UserAuthorization | null;
  /** True once authorization data has been loaded from the server */
  authorizationReady: boolean;
  setSession: (session: AuthSession) => Promise<void>;
  clearSession: () => Promise<void>;
  /** Refresh authorization data from the server */
  refreshAuthorization: () => Promise<void>;
  /** Check if user has a specific role */
  hasRole: (role: string) => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roles: string[]) => boolean;
  /** Check if user has a specific permission */
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as AuthSession;
  } catch {
    return null;
  }
}

function parseAuthorization(raw: string | null): UserAuthorization | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as UserAuthorization;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [authorization, setAuthorization] = useState<UserAuthorization | null>(null);
  const [authorizationReady, setAuthorizationReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const raw = await getStoredItem(SESSION_KEY);
      const session = parseSession(raw);
      if (!mounted) return;
      setSessionState(session);

      // No session: nothing to authorize; mark ready immediately.
      if (!session?.user?.id) {
        setAuthorization(null);
        setAuthorizationReady(true);
        setReady(true);
        return;
      }

      // Hydrate authorization from the server BEFORE marking ready, so
      // role/approval status is available for the first routing decision.
      // This prevents briefly rendering a role's screen (e.g. customer
      // "Track your active order") before RBAC resolution completes.
      try {
        const res = await api.get("/rbac/me/roles");
        if (!mounted) return;
        const data = res.data as UserAuthorization;
        setAuthorization(data);
        await setStoredItem(ROLES_KEY, JSON.stringify(data.roles ?? []));
        await setStoredItem(PERMISSIONS_KEY, JSON.stringify(data.permissions ?? []));
      } catch {
        // Fall back to persisted (incomplete) data only if server unreachable.
        if (mounted) {
          try {
            const r = await getStoredItem(ROLES_KEY);
            const p = await getStoredItem(PERMISSIONS_KEY);
            const roles = r ? JSON.parse(r) : [];
            const permissions = p ? JSON.parse(p) : [];
            setAuthorization({
              roles,
              permissions,
              isSuperAdmin: roles.includes("SUPERADMIN"),
              driverApplicationStatus: null,
              restaurantOwnerApplicationStatus: null,
            });
          } catch {
            setAuthorization({ roles: [], permissions: [], isSuperAdmin: false, driverApplicationStatus: null, restaurantOwnerApplicationStatus: null });
          }
        }
      } finally {
        if (mounted) {
          setAuthorizationReady(true);
          setReady(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setSession = useCallback(async (next: AuthSession) => {
    await setStoredItem(SESSION_KEY, JSON.stringify(next));
    setSessionState(next);
  }, []);

  const clearSession = useCallback(async () => {
    // Attempt server-side sign-out using the current session token first.
    // The interceptor reads the token from SecureStore, so we do this
    // before removing the stored session below.
    let serverError: any = null;
    try {
      await api.post("/auth/sign-out");
    } catch (err: any) {
      serverError = err;
    }

    const status = serverError?.response?.status;
    const hasResponse = Boolean(serverError?.response);
    const isConfirmedInvalid = status === 401 || status === 403;
    // Network/transport failure or no response: do not claim success.
    const isNetworkFailure = serverError && !hasResponse;

    if (serverError && !isConfirmedInvalid) {
      // Unexpected server error or network failure: keep local state.
      if (__DEV__) {
        console.warn("[auth] sign-out failed", {
          category: isNetworkFailure ? "network" : "server",
          status: status ?? null,
          message: serverError?.response?.data?.message ?? serverError?.message ?? "unknown",
        });
      }
      throw serverError;
    }

    if (isConfirmedInvalid && __DEV__) {
      console.warn("[auth] sign-out: session already invalid/expired; clearing local state", {
        status,
        message: serverError?.response?.data?.message ?? "unknown",
      });
    }

    await removeStoredItem(SESSION_KEY);
    await removeStoredItem(ROLES_KEY);
    await removeStoredItem(PERMISSIONS_KEY);
    setSessionState(null);
    setAuthorization(null);
    setAuthorizationReady(false);
  }, []);

  const refreshAuthorization = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await api.get("/rbac/me/roles");
      const data = res.data as UserAuthorization;
      await setStoredItem(ROLES_KEY, JSON.stringify(data.roles));
      await setStoredItem(PERMISSIONS_KEY, JSON.stringify(data.permissions));
      setAuthorization(data);
    } catch {
      // Authorization refresh failed - keep existing data
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      isAuthenticated: session !== null,
      authorization,
      authorizationReady,
      setSession,
      clearSession,
      refreshAuthorization,
      hasRole: (role: string) => authorization?.roles.includes(role) ?? false,
      hasAnyRole: (roles: string[]) =>
        roles.some((r) => authorization?.roles.includes(r)) ?? false,
      hasPermission: (permission: string) =>
        authorization?.permissions.includes(permission) ?? false,
    }),
    [ready, session, setSession, clearSession, authorization, authorizationReady, refreshAuthorization]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
