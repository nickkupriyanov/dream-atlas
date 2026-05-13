# Private Beta Release Checklist

Dream Atlas stores sensitive personal writing, so the first beta should be
treated as a trust test, not only a feature test.

## Runtime

- Use Node.js 18.18+ for local checks. Node 20 LTS is preferred for deploys.
- Install dependencies with `npm install`.
- Keep `.env` local and out of git.

## Environment

Required for hosted AI analysis:

```bash
TIMEWEB_AGENT_TOKEN=...
TIMEWEB_OPENAI_BASE_URL=https://agent.timeweb.cloud/api/v1/cloud-ai/agents/.../v1
```

If `TIMEWEB_OPENAI_BASE_URL` or `TIMEWEB_AGENT_TOKEN` is missing,
`/api/analyze-dream` returns the local fallback analysis. That is useful for
development, but should be called out clearly when sharing a beta build.

## Verification

Run these before sharing a build:

```bash
npm run lint
npm run test
npm run build
```

Manual QA:

- Create a new dream and confirm it autosaves after reload.
- Run analysis with and without Timeweb agent credentials.
- Export JSON before testing destructive actions.
- Import the exported JSON and confirm the selected dream opens.
- Use the Privacy panel to delete local journal data after confirming export.
- Tab through List, Write, Insights and Atlas controls.
- Check mobile List / Write / Insights / Atlas modes.

## Deployment

The production API path is `api/analyze-dream.ts`, shaped for Vercel serverless
functions. The local Vite middleware in `vite.config.ts` reuses the same shared
handler from `src/server/dreamAnalysis.ts`.

Vercel setup:

1. Import the repo as a Vite project.
2. Set build command to `npm run build`.
3. Set output directory to `dist`.
4. Add `TIMEWEB_OPENAI_BASE_URL` and `TIMEWEB_AGENT_TOKEN` environment variables.
5. Redeploy after saving env variables.
6. Test `POST /api/analyze-dream` from the hosted app.

## Privacy Notes

- Dream entries persist in the current browser through localStorage.
- Export is local file download only.
- Import reads a user-selected JSON file locally in the browser.
- AI analysis sends only the selected dream text to `/api/analyze-dream`.
- The Privacy panel deletes the local journal from the current browser after a
  confirmation prompt.

## Beta Framing

Tell early users:

- Dreams are private and sensitive; they should export before clearing browser
  data or changing devices.
- AI interpretation is suggestive pattern reading, not therapy, diagnosis or
  prediction.
- They can mark AI symbols as personal, questionable or wrong.
- They should report confusing privacy wording, inaccessible controls and any
  moment where deletion/export feels unclear.
