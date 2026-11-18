const API_URL = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "marka_token";

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

type ApiOptions = RequestInit & { skipAuth?: boolean; tenant?: string };

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, tenant, ...init } = options;
  const headers = new Headers(init.headers);
  
  // CORREÇÃO AQUI: Só define JSON se NÃO for um upload de ficheiro (FormData)
  if (init.body && !headers.has("Content-Type")) {
    if (!(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
  }
  
  if (tenant) {
    headers.set("x-business-slug", tenant);
  }

  const token = getAccessToken();
  if (!skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorBody: { error?: { code: string; message: string; details?: unknown } } = {};
    try {
      errorBody = await response.json();
    } catch {}
    
    const err = new Error(errorBody.error?.message ?? `HTTP ${response.status}`) as Error & {
      code?: string; status?: number; details?: unknown;
    };
    err.code = errorBody.error?.code;
    err.status = response.status;
    err.details = errorBody.error?.details;
    throw err;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}