import type { DreamAnalysis } from '../types/dream'

type AnalyzeDreamPayload =
  | { analysis: DreamAnalysis }
  | { error: string }

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isDreamAnalysis(value: unknown): value is DreamAnalysis {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<DreamAnalysis>

  return (
    typeof candidate.summary === 'string' &&
    typeof candidate.tone === 'string' &&
    Array.isArray(candidate.emotions) &&
    candidate.emotions.every(
      (emotion) =>
        typeof emotion.label === 'string' &&
        typeof emotion.intensity === 'number' &&
        emotion.intensity >= 0 &&
        emotion.intensity <= 100,
    ) &&
    Array.isArray(candidate.symbols) &&
    candidate.symbols.every(
      (symbol) =>
        typeof symbol.label === 'string' && typeof symbol.meaning === 'string',
    ) &&
    isStringArray(candidate.places) &&
    isStringArray(candidate.characters) &&
    isStringArray(candidate.recurringThemes)
  )
}

export async function analyzeDreamText(text: string): Promise<DreamAnalysis> {
  const response = await fetch('/api/analyze-dream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  const payload = (await response.json()) as AnalyzeDreamPayload

  if (!response.ok || !('analysis' in payload)) {
    throw new Error(
      'error' in payload ? payload.error : 'Dream analysis failed.',
    )
  }

  if (!isDreamAnalysis(payload.analysis)) {
    throw new Error('Dream analysis response had an unexpected shape.')
  }

  return payload.analysis
}
