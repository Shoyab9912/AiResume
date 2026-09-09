const AI_ERROR_MESSAGES: Record<string, string> = {
  "AI returned empty response": "We couldn't generate a response. Please try again.",
  "AI returned invalid JSON": "Something went wrong generating your result. Please try again.",
  "AI response failed validation": "Something went wrong generating your result. Please try again.",
};

export function extractErrorMessage(err: unknown): string {
  const data = (err as any)?.response?.data;
  if (!data) return "Something went wrong.";

  if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    const messages = Object.values(data.errors as Record<string, string[]>).flat();
    if (messages.length) return messages.join(" ");
  }

  const rawMessage: string = data.message || "Something went wrong.";
  return AI_ERROR_MESSAGES[rawMessage] ?? rawMessage;
}