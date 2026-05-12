import type { DreamEntry, SymbolFeedbackStatus } from '../types/dream'
import { getDreamTitle } from './dreamSignature'

export type AtlasItem = {
  label: string
  count: number
  latestDreamId: string
  latestDreamTitle: string
  latestDreamDate: string
  dreamIds: string[]
  relatedDreams: AtlasRelatedDream[]
  feedbackCounts?: Partial<Record<SymbolFeedbackStatus, number>>
}

export type EmotionAtlasItem = AtlasItem & {
  averageIntensity: number
}

export type AtlasRelatedDream = {
  id: string
  title: string
  date: string
  mood: string
}

export type EmotionTimelineItem = {
  dreamId: string
  dreamTitle: string
  date: string
  dominantEmotion: string
  averageIntensity: number
}

export type DreamAtlas = {
  symbols: AtlasItem[]
  places: AtlasItem[]
  characters: AtlasItem[]
  themes: AtlasItem[]
  emotions: EmotionAtlasItem[]
  emotionTimeline: EmotionTimelineItem[]
}

type MutableAtlasItem = AtlasItem & {
  normalizedLabel: string
}

type MutableEmotionAtlasItem = EmotionAtlasItem & {
  intensityTotal: number
  normalizedLabel: string
}

function normalizeLabel(label: string) {
  return label.trim().toLowerCase()
}

function getSymbolFeedback(dream: DreamEntry, label: string) {
  return dream.symbolFeedback?.[normalizeLabel(label)]
}

function sortAtlasItems<T extends AtlasItem>(items: T[]) {
  return [...items].sort((first, second) => {
    if (second.count !== first.count) {
      return second.count - first.count
    }

    return first.label.localeCompare(second.label)
  })
}

function toRelatedDream(dream: DreamEntry): AtlasRelatedDream {
  return {
    date: dream.date,
    id: dream.id,
    mood: dream.mood,
    title: getDreamTitle(dream),
  }
}

function addAtlasItem(
  items: Map<string, MutableAtlasItem>,
  label: string,
  dream: DreamEntry,
) {
  const normalizedLabel = normalizeLabel(label)

  if (!normalizedLabel) {
    return
  }

  const existing = items.get(normalizedLabel)

  if (existing) {
    existing.count += 1
    existing.dreamIds.push(dream.id)
    existing.relatedDreams.push(toRelatedDream(dream))
    const feedback = getSymbolFeedback(dream, label)

    if (feedback) {
      existing.feedbackCounts = {
        ...existing.feedbackCounts,
        [feedback]: (existing.feedbackCounts?.[feedback] ?? 0) + 1,
      }
    }
    return
  }

  const feedback = getSymbolFeedback(dream, label)

  items.set(normalizedLabel, {
    count: 1,
    dreamIds: [dream.id],
    feedbackCounts: feedback ? { [feedback]: 1 } : undefined,
    label: label.trim(),
    latestDreamDate: dream.date,
    latestDreamId: dream.id,
    latestDreamTitle: getDreamTitle(dream),
    normalizedLabel,
    relatedDreams: [toRelatedDream(dream)],
  })
}

function addEmotionItem(
  items: Map<string, MutableEmotionAtlasItem>,
  label: string,
  intensity: number,
  dream: DreamEntry,
) {
  const normalizedLabel = normalizeLabel(label)

  if (!normalizedLabel) {
    return
  }

  const boundedIntensity = Math.max(0, Math.min(100, intensity))
  const existing = items.get(normalizedLabel)

  if (existing) {
    existing.count += 1
    existing.dreamIds.push(dream.id)
    existing.relatedDreams.push(toRelatedDream(dream))
    existing.intensityTotal += boundedIntensity
    existing.averageIntensity = Math.round(existing.intensityTotal / existing.count)
    return
  }

  items.set(normalizedLabel, {
    averageIntensity: boundedIntensity,
    count: 1,
    dreamIds: [dream.id],
    intensityTotal: boundedIntensity,
    label: label.trim(),
    latestDreamDate: dream.date,
    latestDreamId: dream.id,
    latestDreamTitle: getDreamTitle(dream),
    normalizedLabel,
    relatedDreams: [toRelatedDream(dream)],
  })
}

function createEmotionTimeline(dreams: DreamEntry[]): EmotionTimelineItem[] {
  return dreams
    .filter((dream) => dream.analysis.emotions.length > 0)
    .map((dream) => {
      const dominantEmotion = dream.analysis.emotions.reduce(
        (strongest, emotion) =>
          emotion.intensity > strongest.intensity ? emotion : strongest,
        dream.analysis.emotions[0],
      )
      const averageIntensity = Math.round(
        dream.analysis.emotions.reduce(
          (total, emotion) => total + emotion.intensity,
          0,
        ) / dream.analysis.emotions.length,
      )

      return {
        averageIntensity,
        date: dream.date,
        dominantEmotion: dominantEmotion.label,
        dreamId: dream.id,
        dreamTitle: getDreamTitle(dream),
      }
    })
    .reverse()
}

export function createDreamAtlas(dreams: DreamEntry[]): DreamAtlas {
  const symbols = new Map<string, MutableAtlasItem>()
  const places = new Map<string, MutableAtlasItem>()
  const characters = new Map<string, MutableAtlasItem>()
  const themes = new Map<string, MutableAtlasItem>()
  const emotions = new Map<string, MutableEmotionAtlasItem>()

  dreams.forEach((dream) => {
    dream.analysis.symbols.forEach((symbol) =>
      addAtlasItem(symbols, symbol.label, dream),
    )
    dream.analysis.places.forEach((place) => addAtlasItem(places, place, dream))
    dream.analysis.characters.forEach((character) =>
      addAtlasItem(characters, character, dream),
    )
    dream.analysis.recurringThemes.forEach((theme) =>
      addAtlasItem(themes, theme, dream),
    )
    dream.analysis.emotions.forEach((emotion) =>
      addEmotionItem(emotions, emotion.label, emotion.intensity, dream),
    )
  })

  return {
    characters: sortAtlasItems([...characters.values()]),
    emotions: sortAtlasItems([...emotions.values()]),
    emotionTimeline: createEmotionTimeline(dreams),
    places: sortAtlasItems([...places.values()]),
    symbols: sortAtlasItems([...symbols.values()]),
    themes: sortAtlasItems([...themes.values()]),
  }
}
