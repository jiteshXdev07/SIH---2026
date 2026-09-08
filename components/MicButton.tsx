"use client";

import { useRef, useState } from "react";

interface MicButtonProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

/**
 * Input layer: captures mic audio in the browser via MediaRecorder
 * (built on the Web Audio API) — no native app required.
 */
export default function MicButton({ onRecordingComplete, disabled }: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or unavailable:", err);
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function handleClick() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`relative flex h-24 w-24 items-center justify-center rounded-full text-white transition-colors disabled:opacity-40 ${
        isRecording ? "bg-red-500" : "bg-saathi-accent2 hover:bg-saathi-accent2/90"
      }`}
      aria-pressed={isRecording}
      aria-label={isRecording ? "Stop recording" : "Tap to speak"}
    >
      {isRecording && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 animate-pulseRing" />
      )}
      <svg
        className="relative h-9 w-9"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3.75 3.75 0 01-3.75-3.75V4.5a3.75 3.75 0 117.5 0v7.5A3.75 3.75 0 0112 15.75z"
        />
      </svg>
    </button>
  );
}
