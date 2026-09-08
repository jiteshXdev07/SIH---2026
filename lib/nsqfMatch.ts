import coursesData from "@/data/nsqf_courses.json";

export interface NsqfCourse {
  id: string;
  sector: string;
  courseName: string;
  nsqfLevel: number;
  durationHours: number;
  keywords: string[];
  description: string;
}

export interface MatchResult extends NsqfCourse {
  score: number;
}

const COURSES = coursesData as NsqfCourse[];

/**
 * Rule-based first pass: scores every course by keyword overlap against the
 * extracted livelihood context (current work + stated interest, if any).
 * This is intentionally simple and fast — the LLM re-ranking step (see
 * app/api/match/route.ts) can reorder the top candidates using richer
 * context than keyword overlap alone.
 */
export function scoreCourses(livelihoodText: string, interestText = ""): MatchResult[] {
  const haystack = `${livelihoodText} ${interestText}`.toLowerCase();

  const scored = COURSES.map((course) => {
    let score = 0;
    for (const keyword of course.keywords) {
      if (haystack.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    // Small bonus for sector name appearing directly.
    if (haystack.includes(course.sector.toLowerCase())) {
      score += 0.5;
    }
    return { ...course, score };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export function topMatches(livelihoodText: string, interestText = "", limit = 3): MatchResult[] {
  return scoreCourses(livelihoodText, interestText)
    .filter((c) => c.score > 0)
    .slice(0, limit);
}

export function allCourses(): NsqfCourse[] {
  return COURSES;
}
