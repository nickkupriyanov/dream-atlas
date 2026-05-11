import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  Brain,
  CircleDashed,
  MapPinned,
  MessageCircle,
  Shapes,
  SmilePlus,
  Sparkles,
  UserRound,
} from 'lucide-react'
import type { DreamEntry } from '../types/dream'
import { getDreamSignature } from '../utils/dreamSignature'

type InsightsPanelProps = {
  dream?: DreamEntry
}

export function InsightsPanel({ dream }: InsightsPanelProps) {
  const analysis = dream?.analysis
  const signature = getDreamSignature(analysis)

  return (
    <aside className="flex h-full min-h-0 w-full flex-col">
      <div className="border-b border-white/[0.08] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md border border-iris/[0.22] bg-iris/10 text-iris">
            <Brain size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-mist-100">
              AI Insights
            </h2>
            <p className="text-xs text-mist-400">Pattern reading</p>
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
              Awaiting a dream
            </h3>
            <p className="mt-2 max-w-[220px] text-xs leading-5 text-mist-400">
              Insights will appear here once a journal entry exists.
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
                  Summary
                </div>
                <p className="relative text-sm leading-6 text-mist-300">
                  {analysis.summary}
                </p>
                <div className="relative mt-4 rounded border border-white/[0.08] bg-night-950/[0.34] px-3 py-2">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-moon">
                    <Sparkles size={13} />
                    Tone
                  </div>
                  <p className="text-xs leading-5 text-mist-300">
                    {analysis.tone}
                  </p>
                </div>
              </section>

              <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-white/[0.13]">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-mist-100">
                  <SmilePlus size={16} className="text-ember" />
                  Emotions
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
                            className="h-full rounded-full bg-gradient-to-r from-ember via-moon to-tide"
                            style={{
                              width: `${Math.max(0, Math.min(100, emotion.intensity))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-mist-400">
                      Not detected yet
                    </span>
                  )}
                </div>
              </section>

              <section className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-white/[0.13]">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-mist-100">
                  <Shapes size={16} className="text-iris" />
                  Symbols
                </div>
                <div className="space-y-2.5">
                  {analysis.symbols.length > 0 ? (
                    analysis.symbols.map((symbol) => (
                      <div
                        className="rounded border border-white/[0.08] bg-night-950/[0.38] px-3 py-2"
                        key={symbol.label}
                      >
                        <div className="text-xs font-medium text-mist-100">
                          {symbol.label}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-mist-400">
                          {symbol.meaning}
                        </p>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-mist-400">
                      Not detected yet
                    </span>
                  )}
                </div>
              </section>

              <ChipSection
                icon={<MapPinned size={16} className="text-tide" />}
                items={analysis.places}
                title="Places"
              />
              <ChipSection
                icon={<UserRound size={16} className="text-moon" />}
                items={analysis.characters}
                title="Characters"
              />
              <ChipSection
                icon={<Sparkles size={16} className="text-iris" />}
                items={analysis.recurringThemes}
                title="Recurring Themes"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </aside>
  )
}

type ChipSectionProps = {
  icon: ReactNode
  items: string[]
  title: string
}

function ChipSection({ icon, items, title }: ChipSectionProps) {
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
          <span className="text-xs text-mist-400">Not detected yet</span>
        )}
      </div>
    </section>
  )
}
