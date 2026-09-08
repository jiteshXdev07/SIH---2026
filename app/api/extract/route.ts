import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, MODELS } from "@/lib/groq";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the intelligence layer of a government voice assistant that helps
SC (Scheduled Caste) beneficiaries under PM-AJAY describe their current livelihood in their
own informal, spoken words, so it can be matched to an NSQF-aligned skilling course.

Given a transcript of what someone said (often informal, sometimes in mixed language),
extract:
- "currentLivelihood": a short, plain-English phrase describing what work they currently do,
  or empty string if unclear/none stated.
- "interest": what new skill or direction they said they want to learn, or empty string
  if not stated.
- "languageHint": the language or mix of languages the person appears to be speaking in
  (e.g. "Hindi", "English", "Hindi-English mix"), best guess only.

Respond with ONLY a JSON object with exactly these three keys. No extra commentary.`;

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Missing 'transcript' string in request body." },
        { status: 400 }
      );
    }

    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: MODELS.LLM,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: transcript },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      currentLivelihood: parsed.currentLivelihood ?? "",
      interest: parsed.interest ?? "",
      languageHint: parsed.languageHint ?? "",
    });
  } catch (err: any) {
    console.error("extract error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Extraction failed." },
      { status: 500 }
    );
  }
}
