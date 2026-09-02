export function extractErrorMessage(err: unknown): string {
  const data = (err as any)?.response?.data;
  if (!data) return "Something went wrong.";

  if (data.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors as Record<string, string[]>).flat();
    if (messages.length) return messages.join(" ");
  }

  return data.message || "Something went wrong.";
}