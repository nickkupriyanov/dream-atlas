import { describe, expect, it } from 'vitest'
import {
  analyzeDreamRequestBody,
  createLocalAnalysis,
  extractJsonObject,
  isDreamAnalysis,
} from './dreamAnalysis'

describe('dream analysis validation', () => {
  it('accepts local fallback analysis as a valid DreamAnalysis shape', () => {
    const analysis = createLocalAnalysis('I was lost in dark water.')

    expect(isDreamAnalysis(analysis)).toBe(true)
    expect(analysis.emotions.every((emotion) => emotion.intensity <= 100)).toBe(
      true,
    )
  })

  it('rejects invalid request bodies before analysis', async () => {
    await expect(analyzeDreamRequestBody({ text: '   ' })).resolves.toEqual({
      payload: { error: 'Dream text is required.' },
      statusCode: 400,
    })
  })

  it('rejects malformed analysis payloads', () => {
    expect(
      isDreamAnalysis({
        characters: [],
        emotions: [{ label: 'too much', intensity: 140 }],
        places: [],
        recurringThemes: [],
        summary: 'Invalid intensity.',
        symbols: [],
        tone: 'invalid',
      }),
    ).toBe(false)
  })

  it('extracts a JSON object from a wrapped agent response', () => {
    const wrapped =
      'Вот результат анализа:\n{"summary":"x","tone":"y","emotions":[],"symbols":[],"places":[],"characters":[],"recurringThemes":[]}'

    expect(extractJsonObject(wrapped)).toBe(
      '{"summary":"x","tone":"y","emotions":[],"symbols":[],"places":[],"characters":[],"recurringThemes":[]}',
    )
  })
})
