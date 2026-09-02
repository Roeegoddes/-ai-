import { useId, useState, type CSSProperties } from 'react'
import { curriculum, totalLessons, totalQuizQuestions } from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'
import { ProgressRing } from './ProgressRing'
import { LearningPath } from './LearningPath'

type Props = {
  onOpenLesson: (moduleId: string, lessonId: string) => void
  onOpenGlossary: () => void
}

// Dev-only escape hatch to inspect any lesson without completing the ones
// before it. import.meta.env.DEV is statically false in production builds,
// so this (and everything gated behind it) is stripped out of the real app —
// it never touches the real progress/unlock logic for actual users.
const isDevBuild = import.meta.env.DEV

export function Home({ onOpenLesson, onOpenGlossary }: Props) {
  const { isLessonComplete, getScore, resetProgress } = useProgress()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [devUnlockAll, setDevUnlockAll] = useState(false)
  const ringGradientId = useId()

  const flatLessons = curriculum.flatMap((m) => m.lessons.map((l) => ({ moduleId: m.id, lesson: l })))
  const completedCount = flatLessons.filter(({ lesson }) => isLessonComplete(lesson.id)).length
  const overallProgress = totalLessons ? completedCount / totalLessons : 0
  const currentLessonId = flatLessons.find(({ lesson }, idx) => !isLessonComplete(lesson.id) && isUnlockedAt(idx))?.lesson.id ?? null

  function isUnlockedAt(idx: number) {
    if (idx === 0) return true
    return isLessonComplete(flatLessons[idx - 1].lesson.id)
  }

  function isUnlocked(moduleIndex: number, lessonIndex: number) {
    if (isDevBuild && devUnlockAll) return true
    const idx = curriculum.slice(0, moduleIndex).reduce((s, m) => s + m.lessons.length, 0) + lessonIndex
    return isUnlockedAt(idx)
  }

  return (
    <div className="min-h-screen bg-mesh">
      {isDevBuild && (
        // Fixed so it survives scrolling down to the lesson list (where you'd actually use
        // it), but column-aligned to the same max-w-5xl/px-5 grid as the hero content below —
        // it lines up with the pill row instead of pinning to the raw viewport corner.
        <div className="fixed top-4 inset-x-0 z-50 pointer-events-none">
          <div className="max-w-5xl mx-auto px-5 relative">
            <button
              onClick={() => setDevUnlockAll((v) => !v)}
              className={`pointer-events-auto absolute left-5 top-0 flex items-center gap-2 text-xs font-bold tracking-wide px-4 py-2.5 rounded-xl border-2 shadow-lg shadow-black/40 cursor-pointer transition-colors ${
                devUnlockAll
                  ? 'border-[var(--color-amber)] bg-[var(--color-amber)] text-[#0a0a12]'
                  : 'border-[var(--color-amber)] bg-[color-mix(in_srgb,var(--color-amber)_18%,var(--color-surface))] text-[var(--color-amber)] hover:bg-[color-mix(in_srgb,var(--color-amber)_30%,var(--color-surface))]'
              }`}
              title="כלי פיתוח בלבד — לא מופיע/פועל בבנייה לפרודקשן"
            >
              <span className="text-sm">{devUnlockAll ? '🔓' : '🔒'}</span>
              <span>DEV · {devUnlockAll ? 'הכל פתוח' : 'פתח הכל'}</span>
            </button>
          </div>
        </div>
      )}
      <header className="max-w-5xl mx-auto px-5 pt-12 pb-10 text-center">
        {/* one grouped cluster, not two isolated corners — two real components, matched weight */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] whitespace-nowrap">
            <span className="text-base leading-none">📊</span>
            <span className="text-sm text-[var(--color-text)]">
              קורס אינטראקטיבי · <span className="font-mono font-bold">{totalLessons}</span> שיעורים ·{' '}
              <span className="font-mono font-bold">{totalQuizQuestions}</span> שאלות
            </span>
          </div>
          <button
            onClick={onOpenGlossary}
            className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[color-mix(in_srgb,var(--color-cyan)_14%,var(--color-surface))] border border-[color-mix(in_srgb,var(--color-cyan)_45%,var(--color-border))] hover:border-[var(--color-cyan)] hover:bg-[color-mix(in_srgb,var(--color-cyan)_22%,var(--color-surface))] transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[color-mix(in_srgb,var(--color-cyan)_28%,transparent)] text-sm leading-none shrink-0">
              📖
            </span>
            <span className="text-sm font-bold text-[var(--color-cyan)]">מילון מושגים</span>
            <span aria-hidden className="text-[var(--color-cyan)] transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
          </button>
        </div>

        {/* signature: a mastery ring — the same SVG language as the lesson progress rings —
            wrapped snugly around the RO-AI wordmark. An unclosed arc, not a full circle: a
            course you move through, not a static badge. The ambient pulse reuses the exact
            halo the learning path uses to mark your current lesson — the brand mark and the
            "you are here" indicator are, deliberately, the same motion. */}
        <div className="animate-pop-in">
        <div
          className="relative mx-auto aspect-square rounded-full animate-pulse-ring"
          style={{ width: 'clamp(176px, 26vw, 240px)', '--pulse-color': 'var(--color-brand)' } as CSSProperties}
        >
          <svg viewBox="0 0 380 380" className="absolute inset-0 w-full h-full" aria-hidden>
            <defs>
              <linearGradient id={ringGradientId} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="55%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <circle cx="190" cy="190" r="172" fill="none" stroke="var(--color-border)" strokeWidth="2" />
            <circle
              cx="190"
              cy="190"
              r="172"
              fill="none"
              stroke={`url(#${ringGradientId})`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 172}
              strokeDashoffset={2 * Math.PI * 172 * 0.24}
              transform="rotate(-90 190 190)"
            />
          </svg>
          <div
            aria-hidden
            className="absolute inset-[12%] -z-10 rounded-full blur-3xl opacity-30 bg-[radial-gradient(ellipse_at_center,var(--color-brand)_0%,var(--color-pink)_45%,transparent_70%)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center text-3xl sm:text-5xl font-extrabold tracking-tight" dir="ltr">
              <span className="text-[var(--color-text)]">RO</span>
              <span className="mx-1 font-mono font-normal text-[var(--color-brand-soft)]">-</span>
              <span className="relative font-mono">
                <span
                  aria-hidden
                  className="absolute inset-0 blur-lg opacity-70 bg-gradient-to-l from-[var(--color-cyan)] via-[var(--color-brand)] to-[var(--color-pink)] bg-clip-text text-transparent"
                >
                  AI
                </span>
                <span className="relative bg-gradient-to-l from-[var(--color-cyan)] via-[var(--color-brand)] to-[var(--color-pink)] bg-clip-text text-transparent">
                  AI
                </span>
              </span>
            </div>
          </div>
        </div>
        </div>

        {/* tagline — given real weight and size of its own, right under the mark */}
        <p className="mt-4 font-mono text-base sm:text-lg font-medium text-[var(--color-text)]" dir="ltr">
          Don&apos;t just use AI. <span className="text-[var(--color-text-dim)]">Understand it.</span>
        </p>

        <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
          לומדים <span className="bg-gradient-to-l from-[var(--color-brand)] via-[var(--color-pink)] to-[var(--color-cyan)] bg-clip-text text-transparent">בינה מלאכותית</span>
          <br />מאפס עד מאה
        </h1>
        <p className="mt-4 text-lg text-[var(--color-text-dim)] max-w-2xl mx-auto leading-relaxed">
          מסלול למידה שמתחיל מ"מה זה בכלל AI" ומגיע עד Transformers, מודלי שפה גדולים ואתיקה — הסבר פשוט, מושג אחר מושג, עם שאלון קצר בסוף כל שיעור.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-5 py-3">
            <ProgressRing value={overallProgress} size={48} strokeWidth={4}>
              {Math.round(overallProgress * 100)}%
            </ProgressRing>
            <div className="text-right">
              <div className="text-sm font-semibold">{completedCount} / {totalLessons} שיעורים</div>
              <div className="text-xs text-[var(--color-text-faint)]">ההתקדמות שלכם נשמרת בדפדפן</div>
            </div>
          </div>
          {completedCount > 0 && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-red)] transition-colors underline underline-offset-4 cursor-pointer"
            >
              איפוס התקדמות
            </button>
          )}
        </div>
      </header>

      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="animate-pop-in w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold mb-2">לאפס את כל ההתקדמות?</h3>
            <p className="text-sm text-[var(--color-text-dim)] mb-6">
              כל השיעורים שהושלמו והציונים בשאלונים יימחקו. אי אפשר לבטל את זה.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand)] py-2.5 font-semibold transition-colors cursor-pointer"
              >
                ביטול
              </button>
              <button
                onClick={() => {
                  resetProgress()
                  setShowResetConfirm(false)
                }}
                className="flex-1 rounded-xl bg-[var(--color-red)] hover:opacity-90 text-[#0a0a12] py-2.5 font-semibold transition-opacity cursor-pointer"
              >
                כן, אפס
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-5 pb-24">
        <LearningPath
          isUnlocked={isUnlocked}
          isLessonComplete={isLessonComplete}
          getScore={getScore}
          onOpenLesson={onOpenLesson}
          currentLessonId={currentLessonId}
        />

        <footer className="text-center text-xs text-[var(--color-text-faint)] pt-14 mt-8 border-t border-[var(--color-border)]">
          נבנה כדי ללמד AI מהיסודות — בלי באזז, עם דוגמאות אמיתיות.
        </footer>
      </main>
    </div>
  )
}
