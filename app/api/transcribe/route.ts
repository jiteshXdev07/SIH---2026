import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, MODELS } from "@/lib/groq";

export const runtime = "nodejs";

/**
 * Input layer -> Speech layer.
 * Accepts a multipart/form-data POST with a single "audio" field
 * (recorded in the browser via the Web Audio / MediaRecorder API) and
 * returns the transcribed text using Groq's whisper-large-v3-turbo.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing 'audio' field in form data." },
        { status: 400 }
      );
    }

    const groq = getGroqClient();

    // groq-sdk expects a File-like object; the Blob from formData works
    // directly when given a filename via the File constructor.
    const file = new File([audioFile], "speech.webm", {
      type: audioFile.type || "audio/webm",
    });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: MODELS.STT,
      response_format: "json",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err: any) {
    console.error("transcribe error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Transcription failed." },
      { status: 500 }
    );
  }
}
