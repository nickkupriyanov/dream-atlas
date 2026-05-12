/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { mockDreams } from './data/mockDreams'
import { useDreamStore } from './store/dreamStore'

const analysisPayload = {
  analysis: {
    characters: ['watchmaker'],
    emotions: [{ label: 'clarity', intensity: 74 }],
    places: ['observatory'],
    recurringThemes: ['threshold'],
    summary: 'A clear dream about crossing a luminous threshold.',
    symbols: [
      {
        label: 'glass river',
        meaning: 'A visible crossing between private states.',
      },
    ],
    tone: 'calm and lucid',
  },
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      json: async () => analysisPayload,
      ok: true,
    })),
  )
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn(() => 'blob:dream-atlas-test'),
      revokeObjectURL: vi.fn(),
    }),
  )
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  useDreamStore.setState({
    analysisError: null,
    analysisStatus: 'idle',
    dreams: mockDreams,
    selectedDreamId: mockDreams[0].id,
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Dream Atlas app flows', () => {
  it('creates, analyzes and surfaces a new dream in the atlas', async () => {
    const user = userEvent.setup()

    render(<App />)

    const initialSelectedDreamId = useDreamStore.getState().selectedDreamId
    await user.click(screen.getByRole('button', { name: 'New dream' }))
    await waitFor(() =>
      expect(useDreamStore.getState().selectedDreamId).not.toBe(
        initialSelectedDreamId,
      ),
    )
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Dream title' })).toHaveValue(
        'Untitled Dream',
      ),
    )
    const selectedDreamId = useDreamStore.getState().selectedDreamId

    act(() => {
      useDreamStore.getState().updateDreamTitle(selectedDreamId, 'Glass River')
      useDreamStore
        .getState()
        .updateDreamText(
          selectedDreamId,
          'I crossed a glass river toward an observatory.',
        )
    })
    await waitFor(() => {
      const { dreams, selectedDreamId } = useDreamStore.getState()
      const selectedDream = dreams.find((dream) => dream.id === selectedDreamId)

      expect(selectedDream?.text).toBe(
        'I crossed a glass river toward an observatory.',
      )
    })
    fireEvent.click(screen.getByRole('button', { name: 'Analyze Dream' }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/analyze-dream',
        expect.objectContaining({
          body: JSON.stringify({
            text: 'I crossed a glass river toward an observatory.',
          }),
          method: 'POST',
        }),
      )
    })
    expect(await screen.findByText('Analysis updated and saved.')).toBeVisible()

    const atlasButtons = screen.getAllByRole('button', { name: 'Atlas' })
    await user.click(atlasButtons[atlasButtons.length - 1])

    expect(await screen.findByText('glass river')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Open latest dream for glass river: Glass River',
      }),
    ).toBeInTheDocument()
  })

  it('imports backups and protects local journal deletion with confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm')
    const backup = {
      app: 'dream-atlas',
      dreams: [
        {
          ...mockDreams[0],
          id: 'imported-ui-flow',
          title: 'Imported UI Flow',
        },
      ],
      version: 1,
    }

    render(<App />)

    const exportJsonButton = screen.getByRole('button', {
      name: 'Export JSON backup',
    })

    expect(exportJsonButton).toBeEnabled()
    fireEvent.click(exportJsonButton)
    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled())

    act(() => {
      useDreamStore.getState().importDreams(backup.dreams)
    })

    await waitFor(() =>
      expect(useDreamStore.getState().selectedDreamId).toBe('imported-ui-flow'),
    )
    expect(await screen.findByText('Imported UI Flow')).toBeInTheDocument()

    confirm.mockReturnValueOnce(false)
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete local journal' }),
    )
    expect(screen.getByText('Imported UI Flow')).toBeInTheDocument()

    confirm.mockReturnValueOnce(true)
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete local journal' }),
    )

    expect(
      screen.getByText('Local journal data deleted from this browser.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('No dreams yet')).toBeVisible())
  })
})
