export async function fetchWithAuth<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(fullUrl, { ...options, headers });

  if (!res.ok) {
    let message: string;

    try {
      const text = await res.text();
      const json = JSON.parse(text);
      if (json?.message) {
        message = Array.isArray(json.message) ? json.message.join(", ") : json.message;
      } else {
        message = text || `Request failed: ${res.status}`;
      }
    } catch {
      message = `Request failed: ${res.status}`;
    }

    throw new Error(message);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
