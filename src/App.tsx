import { useEffect, useState } from 'react'
import { Brain, Feather, Layers, List } from 'lucide-react'
import { AtlasPanel } from './components/AtlasPanel'
import { DreamEditor } from './components/DreamEditor'
import { DreamList } from './components/DreamList'
import { InsightsPanel } from './components/InsightsPanel'
import { useI18n } from './i18n'
import { useDreamStore } from './store/dreamStore'
import {
  createDreamJsonBackup,
  createDreamMarkdownBackup,
  downloadTextFile,
  parseDreamBackup,
} from './utils/dreamBackup'

type RightPanelMode = 'insights' | 'atlas'
type MobileView = 'list' | 'editor' | 'insights' | 'atlas'
type SaveStatus = 'saved' | 'saving'
type BackupStatus = {
  tone: 'idle' | 'success' | 'error'
  message: string
}
type PrivacyStatus = {
  tone: 'idle' | 'success'
  message: string
}

function App() {
  const { t } = useI18n()
  const [rightPanelMode, setRightPanelMode] =
    useState<RightPanelMode>('insights')
  const [mobileView, setMobileView] = useState<MobileView>('editor')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [isCaptureMode, setIsCaptureMode] = useState(false)
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    message: '',
    tone: 'idle',
  })
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus>({
    message: '',
    tone: 'idle',
  })
  const {
    analysisError,
    analysisStatus,
    analyzeSelectedDream,
    clearDreams,
    createDream,
    deleteDream,
    dreams,
    importDreams,
    selectDream,
    selectedDreamId,
    updateDreamDate,
    updateDreamMood,
    updateDreamReflectionNotes,
    updateDreamSymbolFeedback,
    updateDreamTitle,
    updateDreamText,
  } = useDreamStore()

  const selectedDream =
    dreams.find((dream) => dream.id === selectedDreamId) ?? dreams[0]
  const mobileViews: {
    icon: typeof List
    label: string
    value: MobileView
  }[] = [
    { icon: List, label: t.list, value: 'list' },
    { icon: Feather, label: t.write, value: 'editor' },
    { icon: Brain, label: t.insights, value: 'insights' },
    { icon: Layers, label: t.atlas, value: 'atlas' },
  ]

  useEffect(() => {
    if (!selectedDream) {
      setSaveStatus('saved')
      return
    }

    setSaveStatus('saving')
    const timeout = window.setTimeout(() => setSaveStatus('saved'), 420)

    return () => window.clearTimeout(timeout)
  }, [selectedDream])

  function createAndOpenDream() {
    createDream()
    setMobileView('editor')
    setIsCaptureMode(true)
  }

  function selectAndOpenDream(id: string) {
    selectDream(id)
    setMobileView('editor')
  }

  function createBackupFilename(extension: 'json' | 'md') {
    const date = new Date().toISOString().slice(0, 10)

    return `dream-atlas-${date}.${extension}`
  }

  function exportJsonBackup() {
    downloadTextFile(
      createBackupFilename('json'),
      createDreamJsonBackup(dreams),
      'application/json',
    )
    setBackupStatus({
      message: t.exportJsonSuccess(dreams.length),
      tone: 'success',
    })
  }

  function exportMarkdownBackup() {
    downloadTextFile(
      createBackupFilename('md'),
      createDreamMarkdownBackup(dreams),
      'text/markdown',
    )
    setBackupStatus({
      message: t.exportMarkdownSuccess(dreams.length),
      tone: 'success',
    })
  }

  async function importBackup(file: File) {
    try {
      const contents = await file.text()
      const nextDreams = parseDreamBackup(JSON.parse(contents))

      importDreams(nextDreams)
      setMobileView('list')
      setBackupStatus({
        message: t.importSuccess(nextDreams.length),
        tone: 'success',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''

      setBackupStatus({
        message: message.includes('array of dreams')
          ? t.backupInvalid
          : message.includes('does not contain any dreams')
            ? t.backupNoDreams
            : message || t.backupImportError,
        tone: 'error',
      })
    }
  }

  function clearLocalDreams() {
    const confirmed = window.confirm(t.deleteLocalConfirm)

    if (!confirmed) {
      return
    }

    clearDreams()
    setMobileView('list')
    setBackupStatus({ message: '', tone: 'idle' })
    setPrivacyStatus({
      message: t.localJournalDeleted,
      tone: 'success',
    })
  }

  return (
    <div className="relative h-screen overflow-hidden bg-night-950 text-mist-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_0%,rgba(155,140,255,0.13),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(216,201,155,0.10),transparent_30%),linear-gradient(180deg,rgba(8,10,16,0),rgba(8,10,16,0.72))]" />
      <div className="relative flex h-full flex-col lg:grid lg:grid-cols-[286px_minmax(0,1fr)_338px]">
        <nav className="grid grid-cols-4 gap-1 border-b border-white/[0.08] bg-night-950/80 p-2 lg:hidden">
          {mobileViews.map((view) => {
            const Icon = view.icon

            return (
              <button
                aria-pressed={mobileView === view.value}
                className={`flex h-10 items-center justify-center gap-1.5 rounded-md text-[11px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-moon/20 ${
                  mobileView === view.value
                    ? 'bg-white/[0.08] text-mist-100'
                    : 'text-mist-400 hover:text-mist-200'
                }`}
                key={view.value}
                onClick={() => setMobileView(view.value)}
                type="button"
              >
                <Icon size={14} />
                {view.label}
              </button>
            )
          })}
        </nav>

        <div
          className={`min-h-0 flex-1 lg:flex ${
            mobileView === 'list' ? 'flex' : 'hidden'
          }`}
        >
          <DreamList
            backupStatus={backupStatus}
            dreams={dreams}
            onExportJson={exportJsonBackup}
            onExportMarkdown={exportMarkdownBackup}
            onClearLocalDreams={clearLocalDreams}
            onCreateDream={createAndOpenDream}
            onImportBackup={importBackup}
            onSelectDream={selectAndOpenDream}
            privacyStatus={privacyStatus}
            selectedDreamId={selectedDream?.id ?? ''}
          />
        </div>

        <div
          className={`min-h-0 flex-1 lg:flex ${
            mobileView === 'editor' ? 'flex' : 'hidden'
          }`}
        >
          <DreamEditor
            analysisError={analysisError}
            analysisStatus={analysisStatus}
            dream={selectedDream}
            isCaptureMode={isCaptureMode}
            onAnalyzeDream={analyzeSelectedDream}
            onCreateDream={createAndOpenDream}
            onDateChange={(date) => {
              if (selectedDream) {
                updateDreamDate(selectedDream.id, date)
              }
            }}
            onDeleteDream={() => {
              if (selectedDream) {
                deleteDream(selectedDream.id)
              }
            }}
            onMoodChange={(mood) => {
              if (selectedDream) {
                updateDreamMood(selectedDream.id, mood)
              }
            }}
            onTextChange={(text) => {
              if (selectedDream) {
                updateDreamText(selectedDream.id, text)
              }
            }}
            onTitleChange={(title) => {
              if (selectedDream) {
                updateDreamTitle(selectedDream.id, title)
              }
            }}
            onToggleCaptureMode={() =>
              setIsCaptureMode((currentMode) => !currentMode)
            }
            saveStatus={saveStatus}
          />
        </div>

        <div
          className={`min-h-0 flex-1 lg:block ${
            mobileView === 'insights' || mobileView === 'atlas'
              ? 'block'
              : 'hidden'
          }`}
        >
          <aside className="flex h-full min-h-0 w-full flex-col border-l border-white/[0.08] bg-night-900/[0.82] lg:w-[338px]">
            <div className="hidden border-b border-white/[0.08] px-4 py-3 lg:block">
              <div className="grid grid-cols-2 rounded-md border border-white/[0.08] bg-night-950/[0.4] p-1">
                <button
                className={`h-8 rounded text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-moon/20 ${
                  rightPanelMode === 'insights'
                    ? 'bg-white/[0.08] text-mist-100'
                    : 'text-mist-400 hover:text-mist-200'
                  }`}
                  aria-pressed={rightPanelMode === 'insights'}
                  onClick={() => setRightPanelMode('insights')}
                  type="button"
                >
                  {t.insights}
                </button>
                <button
                className={`h-8 rounded text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-tide/20 ${
                  rightPanelMode === 'atlas'
                    ? 'bg-white/[0.08] text-mist-100'
                    : 'text-mist-400 hover:text-mist-200'
                  }`}
                  aria-pressed={rightPanelMode === 'atlas'}
                  onClick={() => setRightPanelMode('atlas')}
                  type="button"
                >
                  {t.atlas}
                </button>
              </div>
            </div>
            {mobileView === 'insights' ||
            (mobileView !== 'atlas' && rightPanelMode === 'insights') ? (
              <InsightsPanel
                dream={selectedDream}
                dreams={dreams}
                onReflectionNotesChange={(notes) => {
                  if (selectedDream) {
                    updateDreamReflectionNotes(selectedDream.id, notes)
                  }
                }}
                onSelectDream={selectAndOpenDream}
                onSymbolFeedbackChange={(symbolLabel, status) => {
                  if (selectedDream) {
                    updateDreamSymbolFeedback(
                      selectedDream.id,
                      symbolLabel,
                      status,
                    )
                  }
                }}
              />
            ) : (
              <AtlasPanel dreams={dreams} onSelectDream={selectAndOpenDream} />
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App
