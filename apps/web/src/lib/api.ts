const API_URL = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "marka_token";
const TENANT_KEY = "marka_tenant";

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

export function setTenantSlug(slug: string | null) {
  if (slug) {
    localStorage.setItem(TENANT_KEY, slug);
  } else {
    localStorage.removeItem(TENANT_KEY);
  }
}

export function getTenantSlug() {
  return localStorage.getItem(TENANT_KEY);
}

type ApiOptions = RequestInit & { skipAuth?: boolean; tenant?: string };

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, tenant, ...init } = options;
  const headers = new Headers(init.headers);

  // Só define JSON se NÃO for upload de ficheiro (FormData)
  if (init.body && !headers.has("Content-Type")) {
    if (!(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
  }

  const slug = tenant || getTenantSlug();
  if (slug) {
    headers.set("x-business-slug", slug);
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

// Envia uma foto e devolve o URL permanente (Cloudinary)
export async function uploadImage(file: File, tenant?: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const data = await apiFetch<{ url: string }>("/api/v1/upload", {
    method: "POST",
    body: form,
    tenant,
  });
  return data.url;
}