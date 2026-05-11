import type { DreamAnalysis, DreamEntry } from '../types/dream'

const emotionPalette: Record<string, string> = {
  calm: '#6eb7b6',
  curiosity: '#9b8cff',
  focus: '#d8c99b',
  loneliness: '#78879d',
  pressure: '#d08b66',
  relief: '#8dbf91',
  unease: '#8f86c7',
  warmth: '#d08b66',
  watchful: '#7aa2c7',
  wonder: '#d8c99b',
}

const fallbackPalette = ['#9b8cff', '#6eb7b6', '#d8c99b']

export function getDreamSignature(analysis?: DreamAnalysis) {
  const colors =
    analysis?.emotions
      .map((emotion) => emotionPalette[emotion.label.toLowerCase()])
      .filter(Boolean) ?? []

  const signature = colors.length > 0 ? colors : fallbackPalette

  return {
    colors: signature,
    gradient: `linear-gradient(180deg, ${signature.join(', ')})`,
    aura: `radial-gradient(circle at 30% 18%, ${signature[0]}2e, transparent 38%), radial-gradient(circle at 76% 78%, ${signature[1] ?? signature[0]}24, transparent 34%)`,
  }
}

export function getDreamTitle(dream: DreamEntry) {
  if (dream.title.trim()) {
    return dream.title
  }

  const firstLine = dream.text.trim().split('\n')[0]

  return firstLine ? firstLine.slice(0, 42) : 'Untitled Dream'
}
