import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Lesson } from '../../types'
import { Quiz } from '../Quiz'
import { selectQuizAttempt, type QuizAttempt } from '../../lib/quiz'
import { NeuronScene } from './NeuronScene'
import { useScrollProgress } from './useScrollProgress'
import { beats, scrollHint } from '../../data/neuronExperienceContent'

type Props = {
  lesson: Lesson
  moduleColor: string
  onBack: () => void
  onComplete: (correct: number, total: number) => void
  onNextLesson: (() => void) | null
  getAskedIds: (lessonId: string) => string[]
  recordQuizAttempt: (lessonId: string, askedIds: string[]) => void
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

function useIsNarrowViewport(): boolean {
  const [narrow, setNarrow] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setNarrow(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return narrow
}

export function NeuronLessonExperience({ lesson, moduleColor, onBack, onComplete, onNextLesson, getAskedIds, recordQuizAttempt }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <ChromeButtons onBack={onBack} />
      <ScrollExperience moduleColor={moduleColor} />
      <div className="bg-mesh">
        <div className="max-w-2xl mx-auto px-5 py-14 flex flex-col gap-14">
          {lesson.keyTerms && lesson.keyTerms.length > 0 && <KeyTermsSection terms={lesson.keyTerms} moduleColor={moduleColor} />}
          <MasterySection
            lesson={lesson}
            moduleColor={moduleColor}
            onBack={onBack}
            onComplete={onComplete}
            onNextLesson={onNextLesson}
            getAskedIds={getAskedIds}
            recordQuizAttempt={recordQuizAttempt}
          />
        </div>
      </div>
    </div>
  )
}

function ChromeButtons({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed top-4 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-6 pointer-events-none">
      <button
        onClick={onBack}
        className="pointer-events-auto text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10"
      >
        <span>→</span> חזרה למסלול
      </button>
      <span className="pointer-events-auto text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-[var(--color-cyan)] tracking-wide">
        🧬 שיעור תלת-ממדי
      </span>
    </div>
  )
}

const SCROLL_HEIGHT_VH = 620

function ScrollExperience({ moduleColor }: { moduleColor: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { ref: progressRef, value: p } = useScrollProgress(containerRef)
  const reducedMotion = usePrefersReducedMotion()
  const isNarrow = useIsNarrowViewport()

  const beat = beats.find((b) => p >= b.range[0] && p < b.range[1]) ?? beats[beats.length - 1]
  const showHint = p < 0.05

  return (
    <div ref={containerRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas
          dpr={isNarrow ? [1, 1.5] : [1, 2]}
          camera={{ fov: 45, position: [0, 0, 10] }}
          gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
        >
          <Suspense fallback={null}>
            <NeuronScene progressRef={progressRef} moduleColor={moduleColor} reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>

        <div className="absolute inset-x-0 bottom-0 pointer-events-none px-5 pb-8 sm:pb-14 flex justify-center">
          <div
            key={beat.key}
            className="pointer-events-none animate-pop-in max-w-md w-full rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md p-5 sm:p-6"
          >
            <div className="text-xs font-bold tracking-wide mb-2" style={{ color: 'var(--color-cyan)' }}>
              {beat.eyebrow}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold leading-snug mb-2 text-white text-balance">{beat.title}</h2>
            <p className="text-sm text-white/70 leading-relaxed">{beat.body}</p>
          </div>
        </div>

        {showHint && (
          <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none">
            <span className="text-xs text-white/50 animate-float">⌄ {scrollHint}</span>
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10">
          <div className="h-full transition-[width] duration-75" style={{ width: `${p * 100}%`, background: moduleColor }} />
        </div>
      </div>
    </div>
  )
}

function KeyTermsSection({ terms, moduleColor }: { terms: NonNullable<Lesson['keyTerms']>; moduleColor: string }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">📚</span>
        <h3 className="font-bold text-lg">מושגי מפתח</h3>
      </div>
      <p className="text-sm text-[var(--color-text-faint)] mb-4">לחצו על כרטיס כדי לגלות את ההסבר</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {terms.map((kt, i) => {
          const isFlipped = flipped.has(i)
          return (
            <button
              key={kt.term}
              onClick={() => toggle(i)}
              className="text-right rounded-xl border p-4 transition-all cursor-pointer min-h-[92px] flex flex-col justify-center"
              style={{
                borderColor: isFlipped ? moduleColor : 'var(--color-border)',
                background: isFlipped ? `color-mix(in srgb, ${moduleColor} 8%, transparent)` : 'var(--color-surface-hi)',
              }}
            >
              {isFlipped ? (
                <p className="text-sm text-[var(--color-text-dim)] leading-relaxed animate-pop-in">{kt.def}</p>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{kt.term}</span>
                  <span className="text-xs text-[var(--color-text-faint)] shrink-0">הצג ↺</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MasterySection({
  lesson,
  moduleColor,
  onBack,
  onComplete,
  onNextLesson,
  getAskedIds,
  recordQuizAttempt,
}: {
  lesson: Lesson
  moduleColor: string
  onBack: () => void
  onComplete: (correct: number, total: number) => void
  onNextLesson: (() => void) | null
  getAskedIds: (lessonId: string) => string[]
  recordQuizAttempt: (lessonId: string, askedIds: string[]) => void
}) {
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)
  const [attempt, setAttempt] = useState<QuizAttempt>(() => selectQuizAttempt(lesson.quiz, getAskedIds(lesson.id)))

  useEffect(() => {
    recordQuizAttempt(lesson.id, attempt.askedIds)
  }, [attempt, lesson.id, recordQuizAttempt])

  function retry() {
    setAttempt(selectQuizAttempt(lesson.quiz, getAskedIds(lesson.id)))
    setResult(null)
  }

  if (result) {
    const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0
    const mastered = pct >= 75
    return (
      <div className="text-center animate-pop-in rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-10">
        <div className="text-6xl mb-4">{mastered ? '🏆' : '💪'}</div>
        <h2 className="text-2xl font-extrabold mb-2">{mastered ? 'שליטה הושגה!' : 'כמעט שם'}</h2>
        <p className="text-[var(--color-text-dim)] mb-6">
          {result.correct} מתוך {result.total} נכונות ({pct}%)
          {!mastered && ' — כדאי לגלול שוב ולנסות'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={retry}
            className="rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand)] px-5 py-3 font-semibold transition-colors cursor-pointer"
          >
            לנסות שוב
          </button>
          {onNextLesson ? (
            <button
              onClick={onNextLesson}
              className="rounded-xl text-white px-5 py-3 font-semibold transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: moduleColor }}
            >
              לשיעור הבא ←
            </button>
          ) : (
            <button
              onClick={onBack}
              className="rounded-xl text-white px-5 py-3 font-semibold transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: moduleColor }}
            >
              חזרה למסלול הלמידה
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
      <div className="text-xs font-bold tracking-wide mb-1" style={{ color: moduleColor }}>
        למונחי המפתח
      </div>
      <h2 className="text-xl font-bold leading-snug mb-1">🏆 בדיקת שליטה</h2>
      <p className="text-sm text-[var(--color-text-faint)] mb-5">ענו נכון על 75% ומעלה כדי לסיים את השיעור בהצלחה.</p>
      <Quiz
        questions={attempt.questions}
        onFinish={(correct, total) => {
          setResult({ correct, total })
          onComplete(correct, total)
        }}
      />
    </div>
  )
}
