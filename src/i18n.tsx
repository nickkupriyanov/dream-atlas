/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Locale = 'en' | 'ru'

const localeStorageKey = 'dream-atlas-locale'

function pluralRu(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few
  }

  return many
}

const translations = {
  en: {
    aiDreamJournal: 'AI dream journal',
    aiInsights: 'AI Insights',
    all: 'All',
    allMoods: 'All moods',
    allNotes: 'All notes',
    analysisUpdated: 'Analysis updated and saved.',
    analyzeDream: 'Analyze Dream',
    analyzed: 'Analyzed',
    analyzing: 'Analyzing...',
    atlas: 'Atlas',
    awaitingDream: 'Awaiting a dream',
    awaitingDreamDescription:
      'Insights will appear here once a journal entry exists.',
    backup: 'Backup',
    backupImportError: 'Unable to import this backup.',
    backupInvalid: 'Backup must be a Dream Atlas export or an array of dreams.',
    backupNoDreams: 'Backup does not contain any dreams.',
    blankDreamText: 'A blank page for the dream you just woke from.',
    captureModeEnter: 'Enter capture mode',
    captureModeLeave: 'Leave capture mode',
    characters: 'Characters',
    clearFilters: 'Clear filters',
    date: 'Date',
    deleteDream: 'Delete dream',
    deleteLocalConfirm:
      'Delete every local dream note from this browser? Export a JSON backup first if you may want them later.',
    deleteLocalJournal: 'Delete local journal',
    dreamDate: 'Dream date',
    dreamMood: 'Dream mood',
    dreamText: 'Dream text',
    dreamTitle: 'Dream title',
    dreams: 'dreams',
    dreamsCount: (count: number) => `${count} dreams`,
    emotion: 'Emotion',
    emotionTimeline: 'Emotion Timeline',
    emotionalWeather: 'Emotional Weather',
    emotions: 'Emotions',
    exportJsonBackup: 'Export JSON backup',
    exportJsonSuccess: (count: number) => `Exported ${count} dreams as JSON.`,
    exportMarkdownBackup: 'Export Markdown backup',
    exportMarkdownSuccess: (count: number) =>
      `Exported ${count} dreams as Markdown.`,
    filters: 'Filters',
    importJsonBackup: 'Import JSON backup',
    importSuccess: (count: number) =>
      `Imported ${count} dreams from backup.`,
    intensity: 'intensity',
    averageIntensity: 'average intensity',
    insights: 'Insights',
    language: 'Language',
    lastSeenIn: 'Last seen in',
    list: 'List',
    localAnalysisRequired: 'Write a dream before running analysis.',
    localAnalysisUnavailable: 'Unable to analyze dream.',
    localJournalDeleted: 'Local journal data deleted from this browser.',
    lucidNote: 'Lucid note',
    mood: 'Mood',
    newDream: 'New dream',
    noAtlas: 'No atlas yet',
    noAtlasDescription:
      'Analyze dreams to reveal recurring symbols, places, characters, themes, and emotions.',
    noCloseEchoes: 'No close echoes yet',
    noDreamsYet: 'No dreams yet',
    noDreamsYetDescription:
      'Start with a blank note and let the pattern emerge after writing.',
    noMatchingDreams: 'No matching dreams',
    noMatchingDreamsDescription:
      'Search looks through notes, moods, symbols, places, characters, and themes.',
    notDetectedYet: 'Not detected yet',
    notes: 'notes',
    notesCount: (count: number) => `${count} notes`,
    openDream: 'Open dream',
    openDreamFrom: 'Open dream from',
    openLatestDreamFor: 'Open latest dream for',
    openRelatedDream: 'Open related dream',
    openSimilarDream: 'Open similar dream',
    patternReading: 'Pattern reading',
    people: 'People',
    personal: 'Personal',
    personalLower: 'personal',
    places: 'Places',
    privacy: 'Privacy',
    privacyAi:
      'AI analysis sends only the selected dream text to the configured backend.',
    privacyLocal:
      'Notes are stored in this browser. Export before switching devices or clearing site data.',
    questionable: 'Questionable',
    reflectionNotes: 'Reflection Notes',
    reflectionNotesAria: 'Reflection notes',
    reflectionNotesPlaceholder: 'Add what feels personal, useful, or off-base.',
    recurringThemes: 'Recurring Themes',
    relatedDreamsFor: 'related dreams for',
    readingBackend: 'Reading the dream through the backend...',
    saved: 'Saved',
    saving: 'Saving',
    searchDreams: 'Search dreams',
    shared: 'shared',
    hide: 'Hide',
    show: 'Show',
    signals: 'signals',
    similarDreams: 'Similar Dreams',
    startDreamNote: 'Start a dream note',
    startDreamNoteDescription:
      'The journal is empty. Create a record and keep the first details close to the moment you woke.',
    symbols: 'Symbols',
    symbolSingular: 'symbol',
    summary: 'Summary',
    theme: 'Theme',
    themes: 'Themes',
    tone: 'Tone',
    unread: 'Unread',
    unsureLower: 'unsure',
    untitledDream: 'Untitled Dream',
    weeklyDigest: 'Weekly Digest',
    write: 'Write',
    writePlaceholder:
      'Write what stayed with you: places, fragments, voices, colors...',
    wrong: 'Wrong',
    wrongLower: 'wrong',
  },
  ru: {
    aiDreamJournal: 'AI-дневник снов',
    aiInsights: 'AI-инсайты',
    all: 'Все',
    allMoods: 'Все настроения',
    allNotes: 'Все записи',
    analysisUpdated: 'Анализ обновлен и сохранен.',
    analyzeDream: 'Анализировать сон',
    analyzed: 'С анализом',
    analyzing: 'Анализ...',
    atlas: 'Атлас',
    awaitingDream: 'Жду сон',
    awaitingDreamDescription:
      'Инсайты появятся здесь, когда появится запись в дневнике.',
    backup: 'Резерв',
    backupImportError: 'Не удалось импортировать эту резервную копию.',
    backupInvalid:
      'Резервная копия должна быть экспортом Dream Atlas или массивом снов.',
    backupNoDreams: 'В резервной копии нет снов.',
    blankDreamText: 'Пустая страница для сна, с которым вы только проснулись.',
    captureModeEnter: 'Включить режим записи',
    captureModeLeave: 'Выйти из режима записи',
    characters: 'Персонажи',
    clearFilters: 'Сбросить фильтры',
    date: 'Дата',
    deleteDream: 'Удалить сон',
    deleteLocalConfirm:
      'Удалить все локальные записи снов из этого браузера? Сначала экспортируйте JSON, если они могут понадобиться позже.',
    deleteLocalJournal: 'Удалить локальный дневник',
    dreamDate: 'Дата сна',
    dreamMood: 'Настроение сна',
    dreamText: 'Текст сна',
    dreamTitle: 'Название сна',
    dreams: 'снов',
    dreamsCount: (count: number) =>
      `${count} ${pluralRu(count, 'сон', 'сна', 'снов')}`,
    emotion: 'Эмоция',
    emotionTimeline: 'Линия эмоций',
    emotionalWeather: 'Эмоциональная погода',
    emotions: 'Эмоции',
    exportJsonBackup: 'Экспорт JSON',
    exportJsonSuccess: (count: number) =>
      `Экспортировано снов в JSON: ${count}.`,
    exportMarkdownBackup: 'Экспорт Markdown',
    exportMarkdownSuccess: (count: number) =>
      `Экспортировано снов в Markdown: ${count}.`,
    filters: 'Фильтры',
    importJsonBackup: 'Импорт JSON',
    importSuccess: (count: number) =>
      `Импортировано снов из резервной копии: ${count}.`,
    intensity: 'интенсивность',
    averageIntensity: 'средняя интенсивность',
    insights: 'Инсайты',
    language: 'Язык',
    lastSeenIn: 'Последний раз в',
    list: 'Список',
    localAnalysisRequired: 'Запишите сон перед анализом.',
    localAnalysisUnavailable: 'Не удалось проанализировать сон.',
    localJournalDeleted: 'Локальные данные дневника удалены из этого браузера.',
    lucidNote: 'Осознанная запись',
    mood: 'Настроение',
    newDream: 'Новый сон',
    noAtlas: 'Атласа пока нет',
    noAtlasDescription:
      'Проанализируйте сны, чтобы увидеть повторяющиеся символы, места, персонажей, темы и эмоции.',
    noCloseEchoes: 'Близких перекличек пока нет',
    noDreamsYet: 'Снов пока нет',
    noDreamsYetDescription:
      'Начните с пустой записи, и после письма начнет проявляться узор.',
    noMatchingDreams: 'Подходящих снов нет',
    noMatchingDreamsDescription:
      'Поиск смотрит по записям, настроениям, символам, местам, персонажам и темам.',
    notDetectedYet: 'Пока не обнаружено',
    notes: 'записей',
    notesCount: (count: number) =>
      `${count} ${pluralRu(count, 'запись', 'записи', 'записей')}`,
    openDream: 'Открыть сон',
    openDreamFrom: 'Открыть сон от',
    openLatestDreamFor: 'Открыть последний сон для',
    openRelatedDream: 'Открыть связанный сон',
    openSimilarDream: 'Открыть похожий сон',
    patternReading: 'Чтение паттернов',
    people: 'Люди',
    personal: 'Личное',
    personalLower: 'личное',
    places: 'Места',
    privacy: 'Приватность',
    privacyAi:
      'AI-анализ отправляет настроенному backend только текст выбранного сна.',
    privacyLocal:
      'Записи хранятся в этом браузере. Экспортируйте их перед сменой устройства или очисткой данных сайта.',
    questionable: 'Сомнительно',
    reflectionNotes: 'Заметки рефлексии',
    reflectionNotesAria: 'Заметки рефлексии',
    reflectionNotesPlaceholder:
      'Добавьте то, что кажется личным, полезным или неточным.',
    recurringThemes: 'Повторяющиеся темы',
    relatedDreamsFor: 'связанные сны для',
    readingBackend: 'Читаю сон через backend...',
    saved: 'Сохранено',
    saving: 'Сохранение',
    searchDreams: 'Искать сны',
    shared: 'общих',
    hide: 'Скрыть',
    show: 'Показать',
    signals: 'сигналов',
    similarDreams: 'Похожие сны',
    startDreamNote: 'Начните запись сна',
    startDreamNoteDescription:
      'Дневник пуст. Создайте запись и сохраните первые детали рядом с моментом пробуждения.',
    symbols: 'Символы',
    symbolSingular: 'символ',
    summary: 'Кратко',
    theme: 'Тема',
    themes: 'Темы',
    tone: 'Тон',
    unread: 'Без анализа',
    unsureLower: 'сомнительно',
    untitledDream: 'Сон без названия',
    weeklyDigest: 'Недельный дайджест',
    write: 'Запись',
    writePlaceholder:
      'Запишите, что осталось с вами: места, фрагменты, голоса, цвета...',
    wrong: 'Неверно',
    wrongLower: 'неверно',
  },
} as const

type EnglishTranslations = typeof translations.en
type TranslationMap = {
  [Key in keyof EnglishTranslations]: EnglishTranslations[Key] extends (
    ...args: infer Args
  ) => string
    ? (...args: Args) => string
    : string
}

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationMap
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLocale(): Locale {
  const storedLocale = globalThis.localStorage?.getItem(localeStorageKey)

  if (storedLocale === 'en' || storedLocale === 'ru') {
    return storedLocale
  }

  return globalThis.navigator?.language?.toLowerCase().startsWith('ru')
    ? 'ru'
    : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => {
        globalThis.localStorage?.setItem(localeStorageKey, nextLocale)
        setLocaleState(nextLocale)
      },
      t: translations[locale],
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider.')
  }

  return context
}
