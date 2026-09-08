"use client";

import { useState } from "react";
import MicButton from "@/components/MicButton";
import TranscriptView from "@/components/TranscriptView";
import { speak } from "@/lib/tts";
import type { MatchResult } from "@/lib/nsqfMatch";

type Status =
  | "Tap the mic and describe your work"
  | "Listening…"
  | "Transcribing…"
  | "Understanding…"
  | "Finding matching courses…"
  | "Done — tap to try again"
  | "Something went wrong — please try again";

export default function Home() {
  const [status, setStatus] = useState<Status>("Tap the mic and describe your work");
  const [transcript, setTranscript] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleRecording(blob: Blob) {
    setBusy(true);
    setMatches([]);
    setTranscript("");

    try {
      // 1. Speech layer: audio -> text
      setStatus("Transcribing…");
      const form = new FormData();
      form.append("audio", blob, "speech.webm");
      const sttRes = await fetch("/api/transcribe", { method: "POST", body: form });
      const sttData = await sttRes.json();
      if (!sttRes.ok) throw new Error(sttData.error);
      setTranscript(sttData.text);

      // 2. Intelligence layer: text -> livelihood + interest
      setStatus("Understanding…");
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: sttData.text }),
      });
      const extractData = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractData.error);

      // 3. Matching layer: livelihood context -> NSQF courses
      setStatus("Finding matching courses…");
      const matchRes = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentLivelihood: extractData.currentLivelihood,
          interest: extractData.interest,
        }),
      });
      const matchData = await matchRes.json();
      if (!matchRes.ok) throw new Error(matchData.error);

      setMatches(matchData.matches);
      setStatus("Done — tap to try again");

      // 4. Output layer: spoken reply
      if (matchData.matches.length > 0) {
        const top = matchData.matches[0];
        speak(
          `Based on what you said, I suggest NSQF Level ${top.nsqfLevel}, ${top.courseName}.`
        );
      } else {
        speak("I couldn't find a close match yet. Could you describe your work a bit more?");
      }
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          PM-AJAY Saathi
        </h1>
        <p className="mt-2 max-w-md text-sm text-gray-400">
          Tap the mic and describe your work in your own words. We&apos;ll suggest a
          matching NSQF-aligned skilling course — no app install needed.
        </p>
      </div>

      <MicButton onRecordingComplete={handleRecording} disabled={busy} />

      <TranscriptView status={status} transcript={transcript} matches={matches} />
    </main>
  );
}
