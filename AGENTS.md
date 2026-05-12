# AGENTS.md

## Project

Dream Atlas is an AI Dream Journal. The product turns dream notes into a personal atlas of images, emotions, recurring motifs, places, characters and symbols.

The intended feeling is quiet, intimate and reflective. It should not feel like a generic notes app or a loud AI dashboard. The app should help the user notice patterns in their own dream language over time.

## Current State

This is a React + TypeScript + Vite app with:

- Tailwind CSS styling.
- Zustand persistence.
- Local mock dreams.
- A dream list.
- A dream editor.
- An insights panel for one selected dream.
- A production-compatible API route for `/api/analyze-dream` in `api/analyze-dream.ts`.
- Vite dev middleware that reuses the same server analysis handler.
- A local fallback analyzer when `OPENAI_API_KEY` is missing.
- Functional search across notes and analysis fields.
- Basic title, date, mood and delete controls.
- First Atlas panel aggregating symbols, emotions, places, characters and recurring themes.
- Emotion timeline, atlas signal filters and expandable related dream lists.
- Mobile List / Write / Insights / Atlas modes.
- Local autosave status, fast capture mode, and list filters.
- JSON/Markdown export and validated local JSON backup import.
- Weekly digest, similar past dreams, and user reflection notes.
- AI symbol feedback statuses: personal, questionable, wrong.
- Privacy-first local storage copy and local journal deletion settings.
- Focused Vitest coverage for store, analysis validation, import/export validation, atlas aggregation and critical App flows.
- Accessibility pass started with pressed states, text-area labels, progress semantics and clearer button labels.
- Private beta release checklist in `docs/private-beta-release.md`.
- Beta feedback template in `docs/beta-feedback-template.md`.

Deployment note: `/api/analyze-dream` is currently shaped as a Vercel serverless route, with Vite middleware kept as the local development wrapper.

## Product Direction

Prioritize work in this order:

1. Build the Atlas view that aggregates patterns across all dreams.
2. Move `/api/analyze-dream` to a production-ready backend or deployment target.
3. Improve daily journal ergonomics.
4. Add reflective memory features.
5. Harden privacy, tests, accessibility and deployment.

## MVP Loop

The core loop is:

1. User records a dream.
2. AI returns structured analysis.
3. The analysis is saved with the dream.
4. The app aggregates patterns across dreams.
5. The user can explore recurring symbols, emotional tone and motifs over time.

Do not overbuild before this loop is real.

## Domain Model

The current `DreamAnalysis` shape is:

- `summary`
- `tone`
- `emotions`: label + intensity
- `symbols`: label + meaning
- `places`
- `characters`
- `recurringThemes`

Keep AI output compatible with `src/types/dream.ts` unless there is a deliberate migration.

## UX Principles

- The first screen should be the usable journal, not a marketing page.
- Keep the interface calm, legible and emotionally precise.
- Do not make the app feel like therapy, diagnosis or fortune telling.
- Treat AI interpretation as suggestive pattern reading, not truth.
- Prefer user agency: allow editing, rejecting or revising AI insights later.
- Dreams are sensitive data. Privacy and local-first behavior matter.

## Visual Direction

Existing direction:

- Dark night-like base.
- Mist, moon, iris, ember and tide colors.
- Serif typography for dream writing.
- Small symbolic icons from `lucide-react`.
- Compact panels and 8px-or-less radius.

Avoid:

- Generic SaaS hero pages.
- Decorative bloat.
- Loud gradients that overpower the writing.
- UI text that explains obvious controls.

## Engineering Notes

- Use existing local patterns before adding new abstractions.
- Keep changes scoped.
- Prefer typed data transformations over ad hoc string parsing.
- Keep the store migration path in mind because dreams are persisted in localStorage.
- Do not break existing persisted data without a migration.
- Add focused tests when adding aggregation, schema normalization or analysis parsing.

## Important Files

- `src/App.tsx` - app layout.
- `src/store/dreamStore.ts` - Zustand store and persistence.
- `src/types/dream.ts` - core domain types.
- `src/api/analyzeDreamClient.ts` - frontend analysis client.
- `src/server/dreamAnalysis.ts` - shared server analysis logic.
- `api/analyze-dream.ts` - production-compatible API route.
- `src/components/DreamList.tsx` - dream list.
- `src/components/DreamEditor.tsx` - editor.
- `src/components/InsightsPanel.tsx` - selected dream insights.
- `src/components/AtlasPanel.tsx` - aggregate atlas panel.
- `src/utils/dreamSignature.ts` - emotion-based visual signature.
- `src/utils/dreamAtlas.ts` - cross-dream aggregation utilities.

## Roadmap

### Phase 1: Working AI Journal

- Implement `/api/analyze-dream`. Done for dev middleware.
- Enforce structured JSON output. Done.
- Save analysis to the selected dream. Done.
- Add local fallback when no API key is configured. Done.
- Add delete, date, mood and title editing. Done.
- Make search functional. Done.
- Add production-ready API deployment path. Done with a Vercel-compatible route.
- Continue polishing error, retry and empty states. Pending.

### Phase 2: Atlas View

- Aggregate symbols, themes, places, characters and emotions across all dreams. Done.
- Show frequency, recency and related dreams. Done.
- Add navigation from atlas items back to dream entries. Done.
- Add emotion timeline. Done.
- Add expandable related dream lists per atlas item. Done.
- Add atlas signal filters. Done.

### Phase 3: Daily UX

- Improve mobile flow. Done.
- Add autosave status. Done.
- Add fast capture mode. Done.
- Add filters. Done.
- Add export and import. Done.

### Phase 4: Reflection

- Add weekly summaries. Done.
- Compare a new dream with similar old dreams. Done.
- Let users annotate AI insights. Done.
- Let users mark AI symbols as useful, wrong or personal. Done.

### Phase 5: Trust and Release

- Add privacy settings and copy. Done.
- Add tests. Done for store, analysis, import/export, atlas aggregation and critical App flows.
- Improve accessibility. Started.
- Define deployment. Done with Vercel route and private beta checklist.
- Prepare for private beta. Started.

## Current Best Next Task

Run the first private beta QA pass:

1. Walk through the core loop with keyboard navigation and a mobile viewport.
2. Give the app to a first user with the beta feedback template.
3. Triage resulting accessibility, copy and trust gaps.
