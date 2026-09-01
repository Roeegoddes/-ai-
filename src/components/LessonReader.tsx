import { useState } from 'react'
import type { Lesson } from '../types'

const STEP_ICONS = ['💡', '🔍', '🧩', '🎯', '📌', '✨', '🚀', '🔑', '📈', '🌐']

type Step = { kind: 'paragraph'; text: string } | { kind: 'terms'; terms: NonNullable<Lesson['keyTerms']> }

type Props = {
  lesson: Lesson
  moduleColor: string
  onDone: () => void
}

export function LessonReader({ lesson, moduleColor, onDone }: Props) {
  const steps: Step[] = [
    ...lesson.content.map((text): Step => ({ kind: 'paragraph', text })),
    ...(lesson.keyTerms && lesson.keyTerms.length > 0 ? [{ kind: 'terms', terms: lesson.keyTerms } as Step] : []),
  ]
  const [index, setIndex] = useState(0)
  const isLast = index === steps.length - 1
  const step = steps[index]

  return (
    <div className="animate-pop-in">
      <h1 className="text-3xl font-extrabold mb-2 leading-tight">{lesson.title}</h1>
      <p className="text-[var(--color-text-dim)] mb-6">{lesson.summary}</p>

      <div className="flex items-center gap-1.5 mb-5">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i <= index ? moduleColor : 'var(--color-surface-hi)' }}
          />
        ))}
      </div>

      <div
        key={index}
        className="animate-pop-in rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 min-h-[260px] flex flex-col"
      >
        {step.kind === 'paragraph' ? (
          <>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl mb-5 shrink-0"
              style={{ background: `color-mix(in srgb, ${moduleColor} 16%, transparent)` }}
            >
              {STEP_ICONS[index % STEP_ICONS.length]}
            </div>
            <p className="text-[17px] leading-[1.75] text-[var(--color-text)] flex-1">{step.text}</p>
          </>
        ) : (
          <TermsStep terms={step.terms} moduleColor={moduleColor} />
        )}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-dim)] hover:border-[var(--color-brand)] hover:text-[var(--color-text)] disabled:opacity-0 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
        >
          → הקודם
        </button>

        <button
          onClick={() => (isLast ? onDone() : setIndex((i) => i + 1))}
          className="flex-1 rounded-xl text-white font-bold py-3 transition-colors cursor-pointer"
          style={{ background: moduleColor }}
        >
          {isLast ? `בואו נבדוק הבנה — ${lesson.quiz.length} שאלות ←` : 'הבא ←'}
        </button>
      </div>

      <div className="text-center mt-3 text-xs text-[var(--color-text-faint)]">
        שלב {index + 1} מתוך {steps.length}
        {!isLast && (
          <>
            {' · '}
            <button onClick={onDone} className="underline underline-offset-2 hover:text-[var(--color-text)] cursor-pointer">
              דלג ישר לשאלון
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function TermsStep({ terms, moduleColor }: { terms: NonNullable<Lesson['keyTerms']>; moduleColor: string }) {
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
    <div className="flex-1">
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
