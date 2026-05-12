export type DreamAnalysis = {
  summary: string
  tone: string
  emotions: {
    label: string
    intensity: number
  }[]
  symbols: {
    label: string
    meaning: string
  }[]
  places: string[]
  characters: string[]
  recurringThemes: string[]
}

export type SymbolFeedbackStatus = 'personal' | 'questionable' | 'wrong'

export type DreamEntry = {
  id: string
  title: string
  date: string
  time: string
  mood: string
  text: string
  analysis: DreamAnalysis
  reflectionNotes?: string
  symbolFeedback?: Record<string, SymbolFeedbackStatus>
}
