import { NextRequest, NextResponse } from "next/server";
import { topMatches } from "@/lib/nsqfMatch";

export const runtime = "nodejs";

/**
 * Matching layer.
 * Takes the extracted livelihood context and returns ranked NSQF course
 * suggestions from the rule-based keyword scorer in lib/nsqfMatch.ts.
 *
 * To add LLM re-ranking (as described in the architecture slide), fetch the
 * top N candidates here, then send them + the raw transcript to a Groq
 * chat completion asking it to reorder/justify — keeping the rule engine as
 * a fast, deterministic first pass and fallback if the LLM call fails.
 */
export async function POST(req: NextRequest) {
  try {
    const { currentLivelihood, interest } = await req.json();

    if (!currentLivelihood && !interest) {
      return NextResponse.json(
        { error: "Provide at least one of 'currentLivelihood' or 'interest'." },
        { status: 400 }
      );
    }

    const matches = topMatches(currentLivelihood ?? "", interest ?? "", 3);

    return NextResponse.json({ matches });
  } catch (err: any) {
    console.error("match error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Matching failed." },
      { status: 500 }
    );
  }
}
