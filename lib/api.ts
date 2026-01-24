export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchAPI(endpoint: string, { params, ...options }: RequestInit & { params?: Record<string, string> } = {}) {
  const url = API_URL ? new URL(endpoint, API_URL).toString() : endpoint;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    const separator = url.includes("?") ? "&" : "?";
    return fetch(`${url}${separator}${searchParams}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    }).then(res => res.ok ? res.json() : Promise.reject(res.status));
  }

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}