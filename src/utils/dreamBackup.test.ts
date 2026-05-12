import { describe, expect, it } from 'vitest'
import { mockDreams } from '../data/mockDreams'
import {
  createDreamJsonBackup,
  createDreamMarkdownBackup,
  parseDreamBackup,
} from './dreamBackup'

describe('dream backup utilities', () => {
  it('round-trips JSON exports through backup parsing', () => {
    const backup = createDreamJsonBackup([mockDreams[0]])
    const parsed = parseDreamBackup(JSON.parse(backup))

    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      id: mockDreams[0].id,
      title: mockDreams[0].title,
    })
  })

  it('normalizes legacy or partial dream data on import', () => {
    const parsed = parseDreamBackup([
      {
        id: 'legacy-dream',
        insights: {
          emotions: ['awe'],
          symbols: ['door'],
        },
        text: 'A door opened into a bright station.',
      },
    ])

    expect(parsed[0]).toMatchObject({
      id: 'legacy-dream',
      mood: 'unlabeled',
      title: 'Untitled Dream',
    })
    expect(parsed[0].analysis.emotions).toEqual([
      { label: 'awe', intensity: 50 },
    ])
    expect(parsed[0].analysis.symbols).toEqual([
      { label: 'door', meaning: 'Meaning not assigned yet.' },
    ])
  })

  it('rejects empty and malformed backups', () => {
    expect(() => parseDreamBackup({ dreams: [] })).toThrow(
      'Backup does not contain any dreams.',
    )
    expect(() => parseDreamBackup({ notes: [] })).toThrow(
      'Backup must be a Dream Atlas export or an array of dreams.',
    )
  })

  it('includes analysis and reflection notes in Markdown exports', () => {
    const markdown = createDreamMarkdownBackup([
      {
        ...mockDreams[0],
        reflectionNotes: 'This symbol felt personal.',
      },
    ])

    expect(markdown).toContain('# Dream Atlas Export')
    expect(markdown).toContain(`## ${mockDreams[0].title}`)
    expect(markdown).toContain('Reflection notes: This symbol felt personal.')
    expect(markdown).toContain('### Analysis')
  })
})
