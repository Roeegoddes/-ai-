import { useState } from 'react'
import { curriculum, totalLessons, totalQuizQuestions } from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'
import { ProgressRing } from './ProgressRing'
import { LearningPath } from './LearningPath'

type Props = {
  onOpenLesson: (moduleId: string, lessonId: string) => void
  onOpenGlossary: () => void
}

export function Home({ onOpenLesson, onOpenGlossary }: Props) {
  const { isLessonComplete, getScore, resetProgress } = useProgress()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const flatLessons = curriculum.flatMap((m) => m.lessons.map((l) => ({ moduleId: m.id, lesson: l })))
  const completedCount = flatLessons.filter(({ lesson }) => isLessonComplete(lesson.id)).length
  const overallProgress = totalLessons ? completedCount / totalLessons : 0
  const currentLessonId = flatLessons.find(({ lesson }, idx) => !isLessonComplete(lesson.id) && isUnlockedAt(idx))?.lesson.id ?? null

  function isUnlockedAt(idx: number) {
    if (idx === 0) return true
    return isLessonComplete(flatLessons[idx - 1].lesson.id)
  }

  function isUnlocked(moduleIndex: number, lessonIndex: number) {
    const idx = curriculum.slice(0, moduleIndex).reduce((s, m) => s + m.lessons.length, 0) + lessonIndex
    return isUnlockedAt(idx)
  }

  return (
    <div className="min-h-screen bg-mesh">
      <header className="max-w-5xl mx-auto px-5 pt-14 pb-10 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-brand-soft)] animate-float">
            <span>✨</span>
            <span>קורס אינטראקטיבי · {totalLessons} שיעורים · {totalQuizQuestions} שאלות</span>
          </div>
          <button
            onClick={onOpenGlossary}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors cursor-pointer"
          >
            <span>📖</span>
            <span>מילון מושגים</span>
          </button>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
          לומדים <span className="bg-gradient-to-l from-[var(--color-brand)] via-[var(--color-pink)] to-[var(--color-cyan)] bg-clip-text text-transparent">בינה מלאכותית</span>
          <br />מאפס עד מאה
        </h1>
        <p className="mt-5 text-lg text-[var(--color-text-dim)] max-w-2xl mx-auto leading-relaxed">
          מסלול למידה שמתחיל מ"מה זה בכלל AI" ומגיע עד Transformers, מודלי שפה גדולים ואתיקה — הסבר פשוט, מושג אחר מושג, עם שאלון קצר בסוף כל שיעור.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
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
