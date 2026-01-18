const DEFAULT_TIMEOUT = 15000; // 15s timeout

function buildUrl(url: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl && !url.startsWith("http")) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set!");
  }
  return url.startsWith("http") ? url : `${baseUrl}${url}`;
}

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit,
  timeout = DEFAULT_TIMEOUT,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithAuth<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T | null> {
  const fullUrl = buildUrl(url);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetchWithTimeout(fullUrl, {
      ...options,
      headers,
      credentials: "include", // send cookies
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError")
      throw new Error("Request timed out");
    throw err;
  }

  if (!res.ok) {
    let message: string;
    try {
      const text = await res.text();
      const json = JSON.parse(text);
      message = json?.message
        ? Array.isArray(json.message)
          ? json.message.join(", ")
          : json.message
        : text || `Request failed: ${res.status}`;
    } catch {
      message = `Request failed: ${res.status}`;
    }
    throw new Error(message);
  }

  if (res.status === 204) return null; // No Content
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Fetch a file (binary) with authentication.
 * Returns the raw Response object for blob() or arrayBuffer() handling.
 */
export async function fetchFile(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const fullUrl = buildUrl(url);

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetchWithTimeout(fullUrl, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError")
      throw new Error("Request timed out");
    throw err;
  }

  if (!res.ok) {
    let message: string;
    try {
      const text = await res.text();
      const json = JSON.parse(text);
      message = json?.message
        ? Array.isArray(json.message)
          ? json.message.join(", ")
          : json.message
        : text || `Request failed: ${res.status}`;
    } catch {
      message = `Request failed: ${res.status}`;
    }
    throw new Error(message);
  }

  return res; // raw response for blob/arrayBuffer
}
