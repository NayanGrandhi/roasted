export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function postJSON<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError("Couldn't reach the server. Check your connection.", 0);
  }
  if (res.status === 413) throw new ApiError("That upload is too big. Try a smaller file or a screenshot.", 413);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Something went wrong. Try again.", res.status);
  return data as T;
}
