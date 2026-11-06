import { create } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getStoredItem, removeStoredItem, SESSION_KEY } from "./storage";

const API_PORT = 3000;
const API_PATH = "api";

/**
 * Resolve the API base URL.
 *
 * In development we prefer the host that is already serving the Metro bundle,
 * so a phone on the same Wi-Fi reaches the backend even if the machine's LAN
 * IP changes (DHCP). On web the browser runs on the dev machine, so use
 * localhost for reliability. In production the explicitly configured URL wins.
 */
function resolveBaseURL(): string | undefined {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri;
  const devHost = hostUri?.split(":")[0];

  if (__DEV__) {
    if (Platform.OS === "web") {
      return `http://localhost:${API_PORT}/${API_PATH}`;
    }
    if (devHost) {
      return `http://${devHost}:${API_PORT}/${API_PATH}`;
    }
  }

  return configured;
}

/**
 * Attach the Better Auth session token to authenticated requests.
 *
 * Reads the stored session from SecureStore and, if a valid token exists,
 * adds an Authorization: Bearer <token> header. Public auth endpoints
 * (sign‑in / sign‑up) are skipped so the sign‑up flow is not broken.
 */
async function authInterceptor(request: any) {
  const pathsToSkip = ["/auth/sign-in/email", "/auth/sign-up/email"];
  if (pathsToSkip.some((p) => request.url?.includes(p))) return request;

  const raw = await getStoredItem(SESSION_KEY);
  let session: { token?: string } | null = null;
  if (raw) {
    try {
      session = JSON.parse(raw);
    } catch {
      await removeStoredItem(SESSION_KEY);
      return request;
    }
  }
  if (session?.token) {
    request.headers.Authorization = `Bearer ${session.token}`;
  }
  return request;
}

// Create the Axios instance with a request interceptor that propagates
// the Better Auth session token from Expo SecureStore.
export const api = create({
  baseURL: resolveBaseURL(),
  headers: {},
});

api.interceptors.request.use(async (request) => await authInterceptor(request), (error) => Promise.reject(error));

export default api;
