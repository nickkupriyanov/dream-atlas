import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDreams } from '../data/mockDreams'

beforeEach(() => {
  const storage = new Map<string, string>()

  vi.resetModules()
  vi.stubGlobal('localStorage', {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    key: (index: number) => [...storage.keys()][index] ?? null,
    get length() {
      return storage.size
    },
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => storage.set(key, value),
  })
})

describe('useDreamStore', () => {
  it('clears local journal state for privacy deletion', async () => {
    const { useDreamStore } = await import('./dreamStore')

    useDreamStore.getState().clearDreams()

    expect(useDreamStore.getState().dreams).toEqual([])
    expect(useDreamStore.getState().selectedDreamId).toBe('')
    expect(useDreamStore.getState().analysisStatus).toBe('idle')
  })

  it('selects the first imported dream', async () => {
    const { useDreamStore } = await import('./dreamStore')
    const importedDream = {
      ...mockDreams[0],
      id: 'imported-dream',
      title: 'Imported dream',
    }

    useDreamStore.getState().importDreams([importedDream])

    expect(useDreamStore.getState().dreams).toEqual([importedDream])
    expect(useDreamStore.getState().selectedDreamId).toBe('imported-dream')
  })
})
