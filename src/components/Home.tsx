import { curriculum, totalLessons, totalQuizQuestions } from '../data/curriculum'
import type { Lesson, Module } from '../types'
import { useProgress } from '../hooks/useProgress'
import { ProgressRing } from './ProgressRing'

type Props = {
  onOpenLesson: (moduleId: string, lessonId: string) => void
}

const difficultyStyle: Record<string, string> = {
  קל: 'text-[var(--color-green)] bg-[color-mix(in_srgb,var(--color-green)_14%,transparent)]',
  בינוני: 'text-[var(--color-amber)] bg-[color-mix(in_srgb,var(--color-amber)_14%,transparent)]',
  מתקדם: 'text-[var(--color-red)] bg-[color-mix(in_srgb,var(--color-red)_14%,transparent)]',
}

export function Home({ onOpenLesson }: Props) {
  const { isLessonComplete, getScore, resetProgress } = useProgress()

  const flatLessons = curriculum.flatMap((m) => m.lessons.map((l) => ({ moduleId: m.id, lesson: l })))
  const completedCount = flatLessons.filter(({ lesson }) => isLessonComplete(lesson.id)).length
  const overallProgress = totalLessons ? completedCount / totalLessons : 0

  function isUnlocked(moduleIndex: number, lessonIndex: number) {
    const idx = curriculum.slice(0, moduleIndex).reduce((s, m) => s + m.lessons.length, 0) + lessonIndex
    if (idx === 0) return true
    const prev = flatLessons[idx - 1]
    return isLessonComplete(prev.lesson.id)
  }

  return (
    <div className="min-h-screen bg-mesh">
      <header className="max-w-5xl mx-auto px-5 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-brand-soft)] mb-6 animate-float">
          <span>✨</span>
          <span>קורס אינטראקטיבי · {totalLessons} שיעורים · {totalQuizQuestions} שאלות</span>
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
              onClick={() => {
                if (confirm('לאפס את כל ההתקדמות שלכם? אי אפשר לבטל את זה.')) resetProgress()
              }}
              className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-red)] transition-colors underline underline-offset-4 cursor-pointer"
            >
              איפוס התקדמות
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 pb-24 flex flex-col gap-14">
        {curriculum.map((module, moduleIndex) => (
          <ModuleSection
            key={module.id}
            module={module}
            moduleIndex={moduleIndex}
            isUnlocked={isUnlocked}
            isLessonComplete={isLessonComplete}
            getScore={getScore}
            onOpenLesson={onOpenLesson}
          />
        ))}

        <footer className="text-center text-xs text-[var(--color-text-faint)] pt-8 border-t border-[var(--color-border)]">
          נבנה כדי ללמד AI מהיסודות — בלי באזז, עם דוגמאות אמיתיות.
        </footer>
      </main>
    </div>
  )
}

function ModuleSection({
  module,
  moduleIndex,
  isUnlocked,
  isLessonComplete,
  getScore,
  onOpenLesson,
}: {
  module: Module
  moduleIndex: number
  isUnlocked: (moduleIndex: number, lessonIndex: number) => boolean
  isLessonComplete: (id: string) => boolean
  getScore: (id: string) => { correct: number; total: number } | null
  onOpenLesson: (moduleId: string, lessonId: string) => void
}) {
  const moduleDone = module.lessons.filter((l) => isLessonComplete(l.id)).length

  return (
    <section className="animate-pop-in">
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border"
          style={{ background: `color-mix(in srgb, ${module.color} 14%, transparent)`, borderColor: `color-mix(in srgb, ${module.color} 30%, transparent)` }}
        >
          {module.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold">{module.title}</h2>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${difficultyStyle[module.difficulty]}`}>
              {module.difficulty}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-dim)] mt-0.5">{module.subtitle}</p>
        </div>
        <div className="text-xs text-[var(--color-text-faint)] shrink-0 hidden sm:block">
          {moduleDone}/{module.lessons.length}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 min-w-0">
        {module.lessons.map((lesson: Lesson, lessonIndex: number) => {
          const unlocked = isUnlocked(moduleIndex, lessonIndex)
          const done = isLessonComplete(lesson.id)
          const score = getScore(lesson.id)

          return (
            <button
              key={lesson.id}
              disabled={!unlocked}
              onClick={() => onOpenLesson(module.id, lesson.id)}
              className={`group flex items-center gap-4 text-right w-full min-w-0 rounded-xl border px-4 py-3.5 transition-all ${
                unlocked
                  ? 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand)] hover:bg-[var(--color-surface-hi)] cursor-pointer'
                  : 'border-[var(--color-border)]/50 bg-[var(--color-surface)]/40 cursor-not-allowed opacity-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  done
                    ? 'bg-[var(--color-green)] text-[#0a0a12]'
                    : unlocked
                      ? 'bg-[var(--color-surface-hi)] text-[var(--color-text)] group-hover:bg-[var(--color-brand)] group-hover:text-white transition-colors'
                      : 'bg-[var(--color-surface-hi)] text-[var(--color-text-faint)]'
                }`}
              >
                {done ? '✓' : unlocked ? lessonIndex + 1 : '🔒'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{lesson.title}</div>
                <div className="text-xs text-[var(--color-text-faint)] mt-0.5">
                  {lesson.minutes} דקות קריאה · {lesson.quiz.length} שאלות
                  {score && ` · ${score.correct}/${score.total} בשאלון`}
                </div>
              </div>
              {unlocked && <span className="text-[var(--color-text-faint)] group-hover:text-[var(--color-brand)] transition-colors">←</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}
