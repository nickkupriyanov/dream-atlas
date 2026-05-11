import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { analyzeDreamText } from '../api/analyzeDreamClient'
import { mockDreams } from '../data/mockDreams'
import { normalizeDreamEntry } from '../utils/dreamBackup'
import type { DreamAnalysis, DreamEntry } from '../types/dream'

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

function createDreamEntry(): DreamEntry {
  const now = new Date()
  const id =
    globalThis.crypto?.randomUUID?.() ?? `dream-${now.getTime().toString(36)}`

  return {
    id,
    title: 'Untitled Dream',
    date: now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    time: now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    mood: 'unlabeled',
    text: '',
    analysis: blankAnalysis,
  }
}

type DreamState = {
  analysisError: string | null
  analysisStatus: 'idle' | 'loading' | 'success' | 'error'
  selectedDreamId: string
  dreams: DreamEntry[]
  createDream: () => void
  selectDream: (id: string) => void
  deleteDream: (id: string) => void
  updateDreamDate: (id: string, date: string) => void
  updateDreamMood: (id: string, mood: string) => void
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
            analysisError: 'Write a dream before running analysis.',
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
                : 'Unable to analyze dream.',
            analysisStatus: 'error',
          })
        }
      },
    }),
    {
      name: 'dream-atlas-journal',
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
