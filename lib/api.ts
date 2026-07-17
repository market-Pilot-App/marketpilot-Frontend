const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(method: string, path: string, body?: any) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  get: (path: string) => request("GET", path),
  post: (path: string, body?: any) => request("POST", path, body),
  patch: (path: string, body?: any) => request("PATCH", path, body),
  delete: (path: string) => request("DELETE", path),
};
