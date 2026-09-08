import Groq from "groq-sdk";

let client: Groq | null = null;

/**
 * Lazily-initialised Groq client, shared across API routes.
 * Reads GROQ_API_KEY from the environment (set it in .env.local or
 * in your Vercel project's Environment Variables).
 */
export function getGroqClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not set. Add it to .env.local (dev) or your Vercel project settings (prod)."
      );
    }
    client = new Groq({ apiKey });
  }
  return client;
}

export const MODELS = {
  // Speech-to-text — multilingual, tuned for low-latency transcription.
  STT: "whisper-large-v3-turbo",
  // Reasoning / extraction model used to pull livelihood context out of
  // free-form, informally spoken descriptions of work.
  LLM: "openai/gpt-oss-120b",
} as const;
