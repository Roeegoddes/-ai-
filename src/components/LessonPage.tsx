import { useState } from 'react'
import type { Lesson, Module } from '../types'
import { Quiz } from './Quiz'

type Props = {
  module: Module
  lesson: Lesson
  lessonNumber: number
  totalInModule: number
  onBack: () => void
  onComplete: (correct: number, total: number) => void
  onNextLesson: (() => void) | null
}

type Stage = 'reading' | 'quiz' | 'result'

export function LessonPage({ module, lesson, lessonNumber, totalInModule, onBack, onComplete, onNextLesson }: Props) {
  const [stage, setStage] = useState<Stage>('reading')
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)

  function handleQuizFinish(correct: number, total: number) {
    setResult({ correct, total })
    onComplete(correct, total)
    setStage('result')
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <button
          onClick={onBack}
          className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors mb-6 flex items-center gap-1.5 cursor-pointer"
        >
          <span>→</span> חזרה למסלול הלמידה
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold mb-3" style={{ color: module.color }}>
          <span>{module.icon}</span>
          <span>{module.title}</span>
          <span className="text-[var(--color-text-faint)] font-normal">· שיעור {lessonNumber} מתוך {totalInModule}</span>
        </div>

        {stage === 'reading' && (
          <div className="animate-pop-in">
            <h1 className="text-3xl font-extrabold mb-2 leading-tight">{lesson.title}</h1>
            <p className="text-[var(--color-text-dim)] mb-8">{lesson.summary}</p>

            <div className="flex flex-col gap-4 text-[15.5px] leading-relaxed text-[var(--color-text)]">
              {lesson.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {lesson.keyTerms && lesson.keyTerms.length > 0 && (
              <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="text-xs font-bold text-[var(--color-brand-soft)] mb-3 tracking-wide">מושגי מפתח</div>
                <dl className="flex flex-col gap-3">
                  {lesson.keyTerms.map((kt) => (
                    <div key={kt.term}>
                      <dt className="font-semibold text-sm">{kt.term}</dt>
                      <dd className="text-sm text-[var(--color-text-dim)] mt-0.5">{kt.def}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <button
              onClick={() => setStage('quiz')}
              className="mt-10 w-full rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] text-white font-bold py-3.5 transition-colors cursor-pointer"
            >
              בואו נבדוק הבנה — {lesson.quiz.length} שאלות ←
            </button>
          </div>
        )}

        {stage === 'quiz' && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-6">
            <Quiz questions={lesson.quiz} onFinish={handleQuizFinish} />
          </div>
        )}

        {stage === 'result' && result && (
          <ResultScreen
            result={result}
            onRetry={() => setStage('quiz')}
            onBack={onBack}
            onNextLesson={onNextLesson}
          />
        )}
      </div>
    </div>
  )
}

function ResultScreen({
  result,
  onRetry,
  onBack,
  onNextLesson,
}: {
  result: { correct: number; total: number }
  onRetry: () => void
  onBack: () => void
  onNextLesson: (() => void) | null
}) {
  const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0
  const great = pct >= 80
  const ok = pct >= 50 && pct < 80

  return (
    <div className="text-center animate-pop-in rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10">
      <div className="text-6xl mb-4">{great ? '🎉' : ok ? '👍' : '💪'}</div>
      <h2 className="text-2xl font-extrabold mb-2">
        {great ? 'מצוין!' : ok ? 'לא רע בכלל!' : 'שווה לחזור על השיעור'}
      </h2>
      <p className="text-[var(--color-text-dim)] mb-6">
        ענית נכון על {result.correct} מתוך {result.total} שאלות ({pct}%)
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand)] px-5 py-3 font-semibold transition-colors cursor-pointer"
        >
          לנסות שוב
        </button>
        {onNextLesson ? (
          <button
            onClick={onNextLesson}
            className="rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] text-white px-5 py-3 font-semibold transition-colors cursor-pointer"
          >
            לשיעור הבא ←
          </button>
        ) : (
          <button
            onClick={onBack}
            className="rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] text-white px-5 py-3 font-semibold transition-colors cursor-pointer"
          >
            חזרה למסלול הלמידה
          </button>
        )}
      </div>
    </div>
  )
}
