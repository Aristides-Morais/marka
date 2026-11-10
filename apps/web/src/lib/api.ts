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

type ApiOptions = RequestInit & { skipAuth?: boolean };

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, ...init } = options;

  const headers = new Headers(init.headers);
  
  // Se houver dados a enviar, define o Content-Type
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  // Se não for uma rota pública (login), adiciona o Token
  const token = getAccessToken();
  if (!skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Usa o API_URL (que vem da Vercel) em vez de localhost
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    // Tenta ler o erro do backend, se não conseguir, usa o status HTTP
    let errorBody: { error?: { code: string; message: string; details?: unknown } } = {};
    try {
      errorBody = await response.json();
    } catch {
      // resposta sem JSON
    }
    
    const err = new Error(
      errorBody.error?.message ?? `HTTP ${response.status}`
    ) as Error & {
      code?: string;
      status?: number;
      details?: unknown;
    };
    err.code = errorBody.error?.code;
    err.status = response.status;
    err.details = errorBody.error?.details;
    throw err;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}