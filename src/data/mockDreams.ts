import type { DreamAnalysis, DreamEntry } from '../types/dream'

export const analysisVariants: DreamAnalysis[] = [
  {
    summary:
      'The dream circles around movement without a clear destination. Its softer ending suggests the fear is becoming easier to name.',
    tone: 'liminal and gently unsettled',
    emotions: [
      { label: 'wonder', intensity: 72 },
      { label: 'unease', intensity: 64 },
      { label: 'relief', intensity: 48 },
    ],
    symbols: [
      {
        label: 'glass elevator',
        meaning: 'Transparent movement, progress that still feels exposed.',
      },
      {
        label: 'salt air',
        meaning: 'A sensory trace of distance, cleansing, or departure.',
      },
      {
        label: 'blue scarf',
        meaning: 'A borrowed attachment or message waiting to be returned.',
      },
    ],
    places: ['empty station', 'rooftop garden'],
    characters: ['younger sister', 'quiet conductor'],
    recurringThemes: ['thresholds', 'delayed departure', 'borrowed objects'],
  },
  {
    summary:
      'A familiar place is changed by water and low light, pointing to memory that feels close but no longer fixed.',
    tone: 'tender, domestic, and slightly pressurized',
    emotions: [
      { label: 'curiosity', intensity: 69 },
      { label: 'pressure', intensity: 57 },
      { label: 'warmth', intensity: 61 },
    ],
    symbols: [
      {
        label: 'paper moon',
        meaning: 'A handmade version of comfort, fragile but deliberate.',
      },
      {
        label: 'flooded hallway',
        meaning: 'Memory spilling past its usual boundaries.',
      },
      {
        label: 'small key',
        meaning: 'Access to a private detail that is not fully understood yet.',
      },
    ],
    places: ['childhood apartment', 'late train platform'],
    characters: ['old friend', 'unknown child'],
    recurringThemes: ['altered home', 'stored memory', 'gentle access'],
  },
  {
    summary:
      'The strongest pattern is observation. You are present in the scene, but also watching yourself decide what to keep.',
    tone: 'observant, solitary, and composed',
    emotions: [
      { label: 'focus', intensity: 76 },
      { label: 'loneliness', intensity: 52 },
      { label: 'calm', intensity: 58 },
    ],
    symbols: [
      {
        label: 'black notebook',
        meaning: 'A contained record of things not yet spoken aloud.',
      },
      {
        label: 'red lamp',
        meaning: 'Attention drawn to a single warm point in a busy scene.',
      },
      {
        label: 'open window',
        meaning: 'A possible exit, invitation, or shift in perspective.',
      },
    ],
    places: ['hotel room', 'night market'],
    characters: ['desk clerk', 'silent crowd'],
    recurringThemes: ['witnessing', 'choice', 'private record'],
  },
]

export const mockDreams: DreamEntry[] = [
  {
    id: 'drift-station',
    title: 'The Station That Drifted',
    date: 'May 11',
    time: '06:42',
    mood: 'uneasy calm',
    text:
      'I was waiting for a train inside a station that kept moving through the city like a slow ship. Every platform opened onto a different street. I had a blue scarf in my hand and knew it belonged to someone, but not who. A conductor kept checking a watch with no hands. When the train finally arrived, it was full of warm yellow light and smelled like rain on stone.',
    analysis: analysisVariants[0],
  },
  {
    id: 'paper-moon',
    title: 'Paper Moon Over the Kitchen',
    date: 'May 8',
    time: '05:18',
    mood: 'tender strange',
    text:
      'The kitchen from my childhood apartment had a paper moon hanging over the table. Water was running down the hallway, but nobody seemed worried. An old friend was making tea and telling me the cups were maps. I opened a drawer and found a small brass key wrapped in a grocery receipt.',
    analysis: analysisVariants[1],
  },
  {
    id: 'market-after-midnight',
    title: 'Market After Midnight',
    date: 'May 4',
    time: '04:57',
    mood: 'watchful',
    text:
      'I checked into a hotel where the lobby opened straight into a night market. Every stall sold notebooks, lamps, or windows. I kept choosing the same black notebook, then putting it back. A clerk smiled like he already knew what I would write.',
    analysis: analysisVariants[2],
  },
]
