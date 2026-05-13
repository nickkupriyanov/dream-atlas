import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  Brain,
  BookOpenCheck,
  CheckCircle2,
  CircleDashed,
  GitCompare,
  HelpCircle,
  MapPinned,
  MessageCircle,
  PenLine,
  Shapes,
  SmilePlus,
  Sparkles,
  UserRound,
  XCircle,
} from 'lucide-react'
import type { DreamEntry, SymbolFeedbackStatus } from '../types/dream'
import {
  createWeeklyDigest,
  findSimilarDreams,
  type SimilarDream,
} from '../utils/dreamReflection'
import { useI18n } from '../i18n'
import { getDreamSignature } from '../utils/dreamSignature'

type InsightsPanelProps = {
  dream?: DreamEntry
  dreams: DreamEntry[]
  onReflectionNotesChange: (notes: string) => void
  onSelectDream: (id: string) => void
  onSymbolFeedbackChange: (
    symbolLabel: string,
    status: SymbolFeedbackStatus | null,
  ) => void
}

export function InsightsPanel({
  dream,
  dreams,
  onReflectionNotesChange,
  onSelectDream,
  onSymbolFeedbackChange,
}: InsightsPanelProps) {
  const { locale, t } = useI18n()
  const analysis = dream?.analysis
  const signature = getDreamSignature(analysis)
  const weeklyDigest = createWeeklyDigest(dreams, locale)
  const similarDreams = findSimilarDreams(dream, dreams)

  return (
    <aside className="flex h-full min-h-0 w-full flex-col">
      <div className="border-b border-white/[0.08] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md border border-iris/[0.22] bg-iris/10 text-iris">
            <Brain size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-mist-100">
              {t.aiInsights}
            </h2>
            <p className="text-xs text-mist-400">{t.patternReading}</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {!analysis ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-10 w-10 place-items-center rounded-md border border-white/[0.08] bg-white/[0.035] text-mist-400">
              <CircleDashed size={18} />
            </div>
            <h3 className="mt-4 text-sm font-medium text-mist-100">
              {t.awaitingDream}
            </h3>
            <p className="mt-2 max-w-[220px] text-xs leading-5 text-mist-400">
              {t.awaitingDreamDescription}
            </p>
          </div>
        ) : null}

        <AnimatePresence mode="popLayout">
          {analysis ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
              initial={{ opacity: 0, y: 8 }}
              key={`${dream?.id}-${analysis.summary}`}
              transition={{ duration: 0.24 }}
            >
              <WeeklyDigestCard digest={weeklyDigest} />

              <section className="relative overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.035] p-4">
                <div
                  className="pointer-events-none absolute inset-0 opacity-80"
                  style={{ background: signature.aura }}
                />
                <div
                  className="pointer-events-none absolute inset-y-4 left-0 w-1 rounded-r-full"
                  style={{ background: signature.gradient }}
                />
                <div className="relative mb-3 flex items-center gap-2 text-sm font-medium text-mist-100">
                  <MessageCircle size={16} className="text-moon" />
                  {t.summary}
                </div>
                <p className="relative text-sm leading-6 text-mist-300">
                  {analysis.summary}
                </p>
                <div className="relative mt-4 rounded border border-white/[0.08] bg-night-950/[0.34] px-3 py-2">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-moon">
                    <Sparkles size={13} />
                    {t.tone}
                  </div>
                  <p className="text-xs leading-5 text-mist-300">
                    {analysis.tone}
                  </p>
                </div>
              </section>

              <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-white/[0.13]">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-mist-100">
                  <SmilePlus size={16} className="text-ember" />
                  {t.emotions}
                </div>
                <div className="space-y-3">
                  {analysis.emotions.length > 0 ? (
                    analysis.emotions.map((emotion) => (
                      <div key={emotion.label}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span className="text-mist-300">
                            {emotion.label}
                          </span>
                          <span className="text-mist-400">
                            {emotion.intensity}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-night-950/[0.55]">
                          <div
                            aria-label={`${emotion.label} ${t.intensity} ${emotion.intensity}%`}
                            className="h-full rounded-full bg-gradient-to-r from-ember via-moon to-tide"
                            role="progressbar"
                            aria-valuemax={100}
                            aria-valuemin={0}
                            aria-valuenow={Math.max(
                              0,
                              Math.min(100, emotion.intensity),
                            )}
                            style={{
                              width: `${Math.max(0, Math.min(100, emotion.intensity))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-mist-400">
                      {t.notDetectedYet}
                    </span>
                  )}
                </div>
              </section>

              <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-white/[0.13]">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-mist-100">
                  <Shapes size={16} className="text-iris" />
                  {t.symbols}
                </div>
                <div className="space-y-2.5">
                  {analysis.symbols.length > 0 ? (
                    analysis.symbols.map((symbol) => (
                      <div
                        className="rounded border border-white/[0.08] bg-night-950/[0.38] px-3 py-2"
                        key={symbol.label}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-medium text-mist-100">
                            {symbol.label}
                          </div>
                          <SymbolFeedbackControls
                            label={symbol.label}
                            onChange={onSymbolFeedbackChange}
                            value={
                              dream?.symbolFeedback?.[
                                symbol.label.trim().toLowerCase()
                              ]
                            }
                          />
                        </div>
                        <p className="mt-1 text-xs leading-5 text-mist-400">
                          {symbol.meaning}
                        </p>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-mist-400">
                      {t.notDetectedYet}
                    </span>
                  )}
                </div>
              </section>

              <ChipSection
                icon={<MapPinned size={16} className="text-tide" />}
                items={analysis.places}
                title={t.places}
              />
              <ChipSection
                icon={<UserRound size={16} className="text-moon" />}
                items={analysis.characters}
                title={t.characters}
              />
              <ChipSection
                icon={<Sparkles size={16} className="text-iris" />}
                items={analysis.recurringThemes}
                title={t.recurringThemes}
              />
              <SimilarDreamsSection
                dreams={similarDreams}
                onSelectDream={onSelectDream}
              />
              <ReflectionNotesSection
                notes={dream?.reflectionNotes ?? ''}
                onChange={onReflectionNotesChange}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </aside>
  )
}

type SymbolFeedbackControlsProps = {
  label: string
  onChange: (label: string, status: SymbolFeedbackStatus | null) => void
  value?: SymbolFeedbackStatus
}

function SymbolFeedbackControls({
  label,
  onChange,
  value,
}: SymbolFeedbackControlsProps) {
  const { t } = useI18n()
  const symbolFeedbackOptions: {
    icon: ReactNode
    label: string
    value: SymbolFeedbackStatus
  }[] = [
    {
      icon: <CheckCircle2 size={12} />,
      label: t.personal,
      value: 'personal',
    },
    {
      icon: <HelpCircle size={12} />,
      label: t.questionable,
      value: 'questionable',
    },
    {
      icon: <XCircle size={12} />,
      label: t.wrong,
      value: 'wrong',
    },
  ]

  return (
    <div className="flex shrink-0 gap-1">
      {symbolFeedbackOptions.map((option) => (
        <button
          aria-label={`${option.label} ${t.symbolSingular}: ${label}`}
          className={`grid h-6 w-6 place-items-center rounded border outline-none transition focus-visible:ring-2 focus-visible:ring-moon/20 ${
            value === option.value
              ? 'border-moon/30 bg-moon/[0.12] text-moon'
              : 'border-white/[0.08] bg-white/[0.035] text-mist-400 hover:text-mist-100'
          }`}
          key={option.value}
          onClick={() =>
            onChange(label, value === option.value ? null : option.value)
          }
          title={option.label}
          type="button"
        >
          {option.icon}
        </button>
      ))}
    </div>
  )
}

type WeeklyDigestCardProps = {
  digest: ReturnType<typeof createWeeklyDigest>
}

function WeeklyDigestCard({ digest }: WeeklyDigestCardProps) {
  const { t } = useI18n()

  return (
    <section className="rounded-md border border-tide/[0.14] bg-tide/[0.045] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-mist-100">
          <BookOpenCheck size={16} className="text-tide" />
          {t.weeklyDigest}
        </div>
        <span className="text-xs text-mist-400">{digest.dreamCount}</span>
      </div>
      <p className="text-xs leading-5 text-mist-300">{digest.note}</p>
      <div className="mt-3 grid gap-2 text-[11px] text-mist-400">
        <span>
          {t.emotion}: {digest.dominantEmotion}
        </span>
        <span>
          {t.themes}:{' '}
          {digest.topThemes.length > 0
            ? digest.topThemes.join(', ')
            : t.notDetectedYet}
        </span>
        <span>
          {t.symbols}:{' '}
          {digest.topSymbols.length > 0
            ? digest.topSymbols.join(', ')
            : t.notDetectedYet}
        </span>
      </div>
    </section>
  )
}

type SimilarDreamsSectionProps = {
  dreams: SimilarDream[]
  onSelectDream: (id: string) => void
}

function SimilarDreamsSection({
  dreams,
  onSelectDream,
}: SimilarDreamsSectionProps) {
  const { t } = useI18n()

  return (
    <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-white/[0.13]">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-mist-100">
        <GitCompare size={16} className="text-moon" />
        {t.similarDreams}
      </div>
      <div className="space-y-2">
        {dreams.length > 0 ? (
          dreams.map((dream) => (
            <button
              aria-label={`${t.openSimilarDream}: ${dream.title}`}
              className="w-full rounded border border-white/[0.08] bg-night-950/[0.38] px-3 py-2 text-left outline-none transition hover:border-moon/25 hover:bg-moon/[0.055] focus-visible:ring-2 focus-visible:ring-moon/20"
              key={dream.id}
              onClick={() => onSelectDream(dream.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-mist-100">
                  {dream.title}
                </span>
                <span className="shrink-0 text-[10px] text-mist-400">
                  {dream.score} {t.shared}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-mist-400">
                {dream.date} · {dream.mood}
              </p>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-mist-300">
                {dream.sharedSignals.join(', ')}
              </p>
            </button>
          ))
        ) : (
          <span className="text-xs text-mist-400">{t.noCloseEchoes}</span>
        )}
      </div>
    </section>
  )
}

type ReflectionNotesSectionProps = {
  notes: string
  onChange: (notes: string) => void
}

function ReflectionNotesSection({
  notes,
  onChange,
}: ReflectionNotesSectionProps) {
  const { t } = useI18n()

  return (
    <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition focus-within:border-iris/25 hover:border-white/[0.13]">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-mist-100">
        <PenLine size={16} className="text-iris" />
        {t.reflectionNotes}
      </div>
      <textarea
        aria-label={t.reflectionNotesAria}
        className="h-24 w-full resize-none rounded border border-white/[0.08] bg-night-950/[0.42] px-3 py-2 text-xs leading-5 text-mist-200 outline-none placeholder:text-mist-400 focus:border-iris/25 focus:ring-2 focus:ring-iris/10"
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.reflectionNotesPlaceholder}
        value={notes}
      />
    </section>
  )
}

type ChipSectionProps = {
  icon: ReactNode
  items: string[]
  title: string
}

function ChipSection({ icon, items, title }: ChipSectionProps) {
  const { t } = useI18n()

  return (
    <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-white/[0.13]">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-mist-100">
        {icon}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              className="rounded border border-white/[0.08] bg-night-950/[0.45] px-2.5 py-1 text-xs text-mist-300 transition hover:border-moon/[0.22] hover:text-mist-100"
              key={item}
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-xs text-mist-400">{t.notDetectedYet}</span>
        )}
      </div>
    </section>
  )
}
