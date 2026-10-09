/**
 * Centralized API Client with mock-data fallback for Smart Campus Intelligence.
 * Seamlessly connects to FastAPI when NEXT_PUBLIC_API_BASE_URL is reachable,
 * and falls back cleanly to typed deterministic mock datasets during offline or hackathon demos.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const FORCE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export interface ApiResponse<T> {
  data: T;
  source: "live_api" | "mock_fallback";
  status: number;
  message?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData: T
): Promise<ApiResponse<T>> {
  // If explicitly configured to use mock data or running in mock mode:
  if (FORCE_MOCK) {
    return {
      data: fallbackData,
      source: "mock_fallback",
      status: 200,
      message: "Serving deterministic local dataset (demo mode)",
    };
  }

  try {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[API] Endpoint ${endpoint} returned ${res.status}. Falling back to mock data.`);
      return {
        data: fallbackData,
        source: "mock_fallback",
        status: res.status,
      };
    }

    const json = await res.json();
    return {
      data: json,
      source: "live_api",
      status: 200,
    };
  } catch (error) {
    console.warn(`[API] Could not connect to FastAPI at ${API_BASE_URL}${endpoint}. Serving mock fallback.`, error);
    return {
      data: fallbackData,
      source: "mock_fallback",
      status: 200,
      message: "FastAPI server unreachable. Fallback dataset active.",
    };
  }
}
