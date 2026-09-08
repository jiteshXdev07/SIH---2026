# PM-AJAY Saathi

**AI Voice Assistant for Livelihood Mapping & NSQF-Aligned Skilling Recommendations**
Smart India Hackathon 2026 — Problem Statement **SIH26097** (Ministry of Social Justice & Empowerment)

A browser-based, voice-first website for SC communities under the GIA component of PM-AJAY.
Open the link, tap the mic, talk about your current work — the app listens, understands your
livelihood, and recommends a matching NSQF-aligned skilling course, out loud, in your own
language. No app install required.

> Live demo (once deployed): `pmajay-saathi.vercel.app`

## How it works

```
Mic capture  →  Speech-to-text   →  Livelihood extraction  →  NSQF matching  →  Spoken reply
(browser)       (Groq Whisper)      (Groq gpt-oss-120b)        (rule engine)     (Web Speech API)
```

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Speech-to-text | Groq API — `whisper-large-v3-turbo` |
| LLM / reasoning | Groq API — `openai/gpt-oss-120b` |
| Text-to-speech | Browser Web Speech API (MVP) |
| Course data | Sample NSQF course catalogue (`data/nsqf_courses.json`) |
| Hosting / CI-CD | GitHub → Vercel, auto-deploy on push |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set your Groq API key

Copy the example env file and add your key (free tier at [console.groq.com](https://console.groq.com/keys)):

```bash
cp .env.example .env.local
```

```
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), allow microphone access, and tap the mic.

## Project structure

```
app/
  page.tsx                 Main voice UI (mic → transcript → recommendations)
  layout.tsx                Root layout + metadata
  api/
    transcribe/route.ts     POST audio → text (Groq Whisper)
    extract/route.ts        POST transcript → { currentLivelihood, interest } (Groq LLM)
    match/route.ts          POST livelihood context → ranked NSQF courses
components/
  MicButton.tsx              Browser mic capture (MediaRecorder / Web Audio API)
  TranscriptView.tsx         Displays transcript + recommended courses
lib/
  groq.ts                    Shared Groq client + model constants
  nsqfMatch.ts                Rule-based keyword scoring against the course catalogue
  tts.ts                      Web Speech API wrapper for spoken replies
data/
  nsqf_courses.json           Sample NSQF course catalogue (swap in the full open dataset)
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add the `GROQ_API_KEY` environment variable in the project's Vercel settings.
4. Every push to `main` auto-deploys.

## Extending beyond the MVP

- **NSQF matching:** replace/extend `lib/nsqfMatch.ts`'s keyword scorer with the full NSQF
  catalogue and add an LLM re-ranking pass in `app/api/match/route.ts` for nuanced cases.
- **Text-to-speech:** swap the browser `SpeechSynthesis` call in `lib/tts.ts` for a hosted
  multilingual TTS provider if you need voices or consistency the OS doesn't provide.
- **Persistence:** add a database (e.g. Postgres via Vercel Postgres) to log sessions and
  hand off pre-qualified leads to field counsellors, as described in the impact slide.

## References

- SIH26097 — [sih.gov.in](https://sih.gov.in) (official problem statement)
- PM-AJAY scheme guidelines — Ministry of Social Justice & Empowerment
- National Skills Qualification Framework (NSQF) — NSDC
- [Groq API docs](https://console.groq.com/docs) — `whisper-large-v3-turbo` & `gpt-oss-120b`
- [Vercel + Next.js deployment documentation](https://vercel.com/docs)

## License

MIT — see [LICENSE](./LICENSE).
