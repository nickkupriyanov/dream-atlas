import { describe, expect, it } from 'vitest'
import type { DreamEntry } from '../types/dream'
import { createDreamAtlas } from './dreamAtlas'

function createDream(overrides: Partial<DreamEntry>): DreamEntry {
  return {
    analysis: {
      characters: [],
      emotions: [],
      places: [],
      recurringThemes: [],
      summary: '',
      symbols: [],
      tone: '',
    },
    date: '',
    id: '',
    mood: '',
    reflectionNotes: '',
    symbolFeedback: {},
    text: '',
    time: '',
    title: '',
    ...overrides,
  }
}

describe('createDreamAtlas', () => {
  it('aggregates repeated atlas signals with related dreams and feedback', () => {
    const dreams = [
      createDream({
        id: 'first',
        date: 'May 1',
        mood: 'curious',
        title: 'Library water',
        analysis: {
          characters: ['Guide'],
          emotions: [{ label: 'Wonder', intensity: 70 }],
          places: ['Library'],
          recurringThemes: ['Searching'],
          summary: 'A dream about a flooded library.',
          symbols: [{ label: 'Water', meaning: 'Mutable feeling.' }],
          tone: 'fluid',
        },
        symbolFeedback: { water: 'personal' },
      }),
      createDream({
        id: 'second',
        date: 'May 2',
        mood: 'uneasy',
        title: 'Bridge rain',
        analysis: {
          characters: [],
          emotions: [{ label: 'Wonder', intensity: 50 }],
          places: ['Bridge'],
          recurringThemes: ['Searching'],
          summary: 'A dream about crossing in rain.',
          symbols: [{ label: 'water', meaning: 'Unsettled transition.' }],
          tone: 'unsettled',
        },
        symbolFeedback: { water: 'questionable' },
      }),
    ]

    const atlas = createDreamAtlas(dreams)

    expect(atlas.symbols[0]).toMatchObject({
      count: 2,
      dreamIds: ['first', 'second'],
      feedbackCounts: { personal: 1, questionable: 1 },
      label: 'Water',
    })
    expect(atlas.themes[0]).toMatchObject({
      count: 2,
      label: 'Searching',
    })
    expect(atlas.emotions[0]).toMatchObject({
      averageIntensity: 60,
      count: 2,
      label: 'Wonder',
    })
    expect(atlas.emotionTimeline.map((item) => item.dreamId)).toEqual([
      'second',
      'first',
    ])
  })
})
