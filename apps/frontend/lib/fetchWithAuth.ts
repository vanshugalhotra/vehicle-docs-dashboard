export async function fetchWithAuth<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> {
  // Get base URL from environment variable
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(fullUrl, { ...options, headers });

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