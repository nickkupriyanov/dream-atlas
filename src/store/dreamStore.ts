import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { analyzeDreamText } from '../api/analyzeDreamClient'
import { mockDreams } from '../data/mockDreams'
import { normalizeDreamEntry } from '../utils/dreamBackup'
import type {
  DreamAnalysis,
  DreamEntry,
  SymbolFeedbackStatus,
} from '../types/dream'

const blankAnalysis: DreamAnalysis = {
  symbols: [],
  places: [],
  characters: [],
  summary: 'Add the dream, then run analysis to surface its first patterns.',
  tone: 'unread',
  emotions: [
    { label: 'quiet', intensity: 24 },
    { label: 'unclear', intensity: 18 },
  ],
  recurringThemes: [],
}

function isRussianLocale() {
  return (
    globalThis.localStorage?.getItem('dream-atlas-locale') === 'ru' ||
    globalThis.navigator?.language?.toLowerCase().startsWith('ru') === true
  )
}

function createBlankAnalysis(): DreamAnalysis {
  if (!isRussianLocale()) {
    return blankAnalysis
  }

  return {
    symbols: [],
    places: [],
    characters: [],
    summary:
      'Добавьте сон, затем запустите анализ, чтобы увидеть первые паттерны.',
    tone: 'без анализа',
    emotions: [
      { label: 'тихо', intensity: 24 },
      { label: 'неясно', intensity: 18 },
    ],
    recurringThemes: [],
  }
}

function createDreamEntry(): DreamEntry {
  const now = new Date()
  const russianLocale = isRussianLocale()
  const id =
    globalThis.crypto?.randomUUID?.() ?? `dream-${now.getTime().toString(36)}`

  return {
    id,
    title: russianLocale ? 'Сон без названия' : 'Untitled Dream',
    date: now.toLocaleDateString(russianLocale ? 'ru-RU' : 'en-US', {
      month: 'short',
      day: 'numeric',
    }),
    time: now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    mood: russianLocale ? 'без метки' : 'unlabeled',
    reflectionNotes: '',
    symbolFeedback: {},
    text: '',
    analysis: createBlankAnalysis(),
  }
}

type DreamState = {
  analysisError: string | null
  analysisStatus: 'idle' | 'loading' | 'success' | 'error'
  selectedDreamId: string
  dreams: DreamEntry[]
  clearDreams: () => void
  createDream: () => void
  selectDream: (id: string) => void
  deleteDream: (id: string) => void
  updateDreamDate: (id: string, date: string) => void
  updateDreamMood: (id: string, mood: string) => void
  updateDreamReflectionNotes: (id: string, notes: string) => void
  updateDreamSymbolFeedback: (
    id: string,
    symbolLabel: string,
    status: SymbolFeedbackStatus | null,
  ) => void
  updateDreamTitle: (id: string, title: string) => void
  updateDreamText: (id: string, text: string) => void
  importDreams: (dreams: DreamEntry[]) => void
  analyzeSelectedDream: () => Promise<void>
}

export const useDreamStore = create<DreamState>()(
  persist(
    (set, get) => ({
      analysisError: null,
      analysisStatus: 'idle',
      dreams: mockDreams,
      selectedDreamId: mockDreams[0].id,
      clearDreams: () =>
        set({
          analysisError: null,
          analysisStatus: 'idle',
          dreams: [],
          selectedDreamId: '',
        }),
      createDream: () => {
        const dream = createDreamEntry()

        set((state) => ({
          analysisError: null,
          analysisStatus: 'idle',
          dreams: [dream, ...state.dreams],
          selectedDreamId: dream.id,
        }))
      },
      selectDream: (id) =>
        set({ analysisError: null, analysisStatus: 'idle', selectedDreamId: id }),
      deleteDream: (id) =>
        set((state) => {
          const nextDreams = state.dreams.filter((dream) => dream.id !== id)
          const deletedSelectedDream = state.selectedDreamId === id

          return {
            analysisError: null,
            analysisStatus: 'idle',
            dreams: nextDreams,
            selectedDreamId: deletedSelectedDream
              ? nextDreams[0]?.id ?? ''
              : state.selectedDreamId,
          }
        }),
      updateDreamDate: (id, date) =>
        set((state) => ({
          dreams: state.dreams.map((dream) =>
            dream.id === id ? { ...dream, date } : dream,
          ),
        })),
      updateDreamMood: (id, mood) =>
        set((state) => ({
          dreams: state.dreams.map((dream) =>
            dream.id === id ? { ...dream, mood } : dream,
          ),
        })),
      updateDreamReflectionNotes: (id, notes) =>
        set((state) => ({
          dreams: state.dreams.map((dream) =>
            dream.id === id ? { ...dream, reflectionNotes: notes } : dream,
          ),
        })),
      updateDreamSymbolFeedback: (id, symbolLabel, status) =>
        set((state) => ({
          dreams: state.dreams.map((dream) => {
            if (dream.id !== id) {
              return dream
            }

            const normalizedLabel = symbolLabel.trim().toLowerCase()

            if (!normalizedLabel) {
              return dream
            }

            const symbolFeedback = { ...(dream.symbolFeedback ?? {}) }

            if (status) {
              symbolFeedback[normalizedLabel] = status
            } else {
              delete symbolFeedback[normalizedLabel]
            }

            return { ...dream, symbolFeedback }
          }),
        })),
      updateDreamTitle: (id, title) =>
        set((state) => ({
          dreams: state.dreams.map((dream) =>
            dream.id === id ? { ...dream, title } : dream,
          ),
        })),
      updateDreamText: (id, text) =>
        set((state) => ({
          analysisError: null,
          analysisStatus:
            state.selectedDreamId === id ? 'idle' : state.analysisStatus,
          dreams: state.dreams.map((dream) =>
            dream.id === id ? { ...dream, text } : dream,
          ),
        })),
      importDreams: (dreams) =>
        set({
          analysisError: null,
          analysisStatus: 'idle',
          dreams,
          selectedDreamId: dreams[0]?.id ?? '',
        }),
      analyzeSelectedDream: async () => {
        const { dreams, selectedDreamId } = get()
        const selectedDream = dreams.find((dream) => dream.id === selectedDreamId)

        if (!selectedDream?.text.trim()) {
          set({
            analysisError: isRussianLocale()
              ? 'Запишите сон перед анализом.'
              : 'Write a dream before running analysis.',
            analysisStatus: 'error',
          })
          return
        }

        set({ analysisError: null, analysisStatus: 'loading' })

        try {
          const analysis = await analyzeDreamText(selectedDream.text)

          set((state) => ({
            analysisError: null,
            analysisStatus: 'success',
            dreams: state.dreams.map((dream) =>
              dream.id === selectedDreamId ? { ...dream, analysis } : dream,
            ),
          }))
        } catch (error) {
          set({
            analysisError:
              error instanceof Error
                ? error.message
                : isRussianLocale()
                  ? 'Не удалось проанализировать сон.'
                  : 'Unable to analyze dream.',
            analysisStatus: 'error',
          })
        }
      },
    }),
    {
      name: 'dream-atlas-journal',
      storage: createJSONStorage(() => globalThis.localStorage),
      version: 3,
      migrate: (persisted) => {
        const state = persisted as {
          dreams?: unknown[]
          selectedDreamId?: string
        }

        return {
          dreams: Array.isArray(state.dreams)
            ? state.dreams.map((dream, index) =>
                normalizeDreamEntry(dream, index),
              )
            : mockDreams,
          selectedDreamId: state.selectedDreamId ?? mockDreams[0].id,
        }
      },
      partialize: (state) => ({
        dreams: state.dreams,
        selectedDreamId: state.selectedDreamId,
      }),
    },
  ),
)
