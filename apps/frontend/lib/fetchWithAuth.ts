export async function fetchWithAuth<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    // Add bearer later like:
    // Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
