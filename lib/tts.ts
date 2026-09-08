/**
 * Thin wrapper over the browser's built-in Web Speech API (SpeechSynthesis).
 * This is the MVP text-to-speech layer described in the architecture slide —
 * no external TTS API key required. Swap this out for a hosted TTS provider
 * later if you need voices the OS doesn't ship, or offline consistency
 * across devices.
 */
export function speak(text: string, lang = "en-IN"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis is not available in this environment.");
    return;
  }

  // Cancel anything mid-utterance before starting the next reply.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
