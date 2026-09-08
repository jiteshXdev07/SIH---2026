import type { MatchResult } from "@/lib/nsqfMatch";

interface TranscriptViewProps {
  status: string;
  transcript: string;
  matches: MatchResult[];
}

export default function TranscriptView({ status, transcript, matches }: TranscriptViewProps) {
  return (
    <div className="w-full max-w-xl space-y-4">
      <p className="text-center text-sm uppercase tracking-wide text-saathi-accent">
        {status}
      </p>

      {transcript && (
        <div className="rounded-xl bg-white/5 p-4 text-gray-100">
          <p className="text-xs uppercase text-gray-400 mb-1">You said</p>
          <p>{transcript}</p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase text-gray-400">Suggested courses</p>
          {matches.map((course) => (
            <div key={course.id} className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold text-white">
                NSQF Level {course.nsqfLevel} — {course.courseName}
              </p>
              <p className="text-sm text-gray-400">{course.sector}</p>
              <p className="mt-1 text-sm text-gray-300">{course.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
