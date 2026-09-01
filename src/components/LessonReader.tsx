import { useState } from 'react'
import { curriculum } from '../data/curriculum'
import { lessonEnrichments, type AlgoTraceData, type ApplicationCheckData, type GigoDemoData } from '../data/lessonEnrichments'
import { useProgress } from '../hooks/useProgress'
import { MASTERY_QUESTION_COUNT } from '../lib/quiz'
import type { Lesson, QuizQuestion } from '../types'

const STEP_ICONS = ['💡', '🔍', '🧩', '🎯', '📌', '✨', '🚀', '🔑', '📈', '🌐']
const RECALL_CHANCE = 0.6
// Step kinds that require an interaction before "הבא" is enabled.
const GATED_KINDS = new Set(['recall', 'algo-trace', 'gigo-demo', 'application-check'])

type Step =
  | { kind: 'paragraph'; text: string }
  | { kind: 'terms'; terms: NonNullable<Lesson['keyTerms']> }
  | { kind: 'recall'; question: QuizQuestion; sourceLessonTitle: string }
  | { kind: 'algo-trace'; data: AlgoTraceData }
  | { kind: 'gigo-demo'; data: GigoDemoData }
  | { kind: 'application-check'; data: ApplicationCheckData }

type Props = {
  lesson: Lesson
  moduleColor: string
  onDone: () => void
}

function pickRecallQuestion(currentLessonId: string, completedLessons: Record<string, boolean>) {
  const pool: { question: QuizQuestion; sourceLessonTitle: string }[] = []
  for (const module of curriculum) {
    for (const l of module.lessons) {
      if (l.id === currentLessonId || !completedLessons[l.id]) continue
      for (const q of l.quiz) pool.push({ question: q, sourceLessonTitle: l.title })
    }
  }
  if (pool.length === 0 || Math.random() > RECALL_CHANCE) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export function LessonReader({ lesson, moduleColor, onDone }: Props) {
  const { state } = useProgress()
  const [recall] = useState(() => pickRecallQuestion(lesson.id, state.completedLessons))
  const [interactionSatisfied, setInteractionSatisfied] = useState(false)

  const enrichments = lessonEnrichments[lesson.id] ?? []
  const paragraphSteps: Step[] = []
  lesson.content.forEach((text, i) => {
    paragraphSteps.push({ kind: 'paragraph', text })
    for (const e of enrichments.filter((e) => e.insertAfterParagraph === i)) {
      paragraphSteps.push({ kind: e.kind, data: e.data } as Step)
    }
  })

  const steps: Step[] = [
    ...paragraphSteps,
    ...(recall ? [{ kind: 'recall', question: recall.question, sourceLessonTitle: recall.sourceLessonTitle } as Step] : []),
    ...(lesson.keyTerms && lesson.keyTerms.length > 0 ? [{ kind: 'terms', terms: lesson.keyTerms } as Step] : []),
  ]
  const [index, setIndex] = useState(0)
  const isLast = index === steps.length - 1
  const step = steps[index]
  const nextDisabled = GATED_KINDS.has(step.kind) && !interactionSatisfied

  function goTo(newIndex: number) {
    setIndex(newIndex)
    setInteractionSatisfied(false)
  }

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
        className="animate-pop-in rounded-2xl border p-6 sm:p-8 min-h-[260px] flex flex-col"
        style={
          GATED_KINDS.has(step.kind) && step.kind !== 'algo-trace'
            ? { borderColor: 'var(--color-brand)', background: 'color-mix(in srgb, var(--color-brand) 7%, var(--color-surface))' }
            : step.kind === 'algo-trace'
              ? { borderColor: moduleColor, background: `color-mix(in srgb, ${moduleColor} 7%, var(--color-surface))` }
              : { borderColor: 'var(--color-border)', background: 'var(--color-surface)' }
        }
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
        ) : step.kind === 'terms' ? (
          <TermsStep terms={step.terms} moduleColor={moduleColor} />
        ) : step.kind === 'recall' ? (
          <RecallStep question={step.question} sourceLessonTitle={step.sourceLessonTitle} onAnswered={() => setInteractionSatisfied(true)} />
        ) : step.kind === 'algo-trace' ? (
          <AlgoTraceStep data={step.data} moduleColor={moduleColor} onAnswered={() => setInteractionSatisfied(true)} />
        ) : step.kind === 'gigo-demo' ? (
          <GigoDemoStep data={step.data} onAnswered={() => setInteractionSatisfied(true)} />
        ) : (
          <ApplicationCheckStep data={step.data} onAnswered={() => setInteractionSatisfied(true)} />
        )}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-dim)] hover:border-[var(--color-brand)] hover:text-[var(--color-text)] disabled:opacity-0 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
        >
          → הקודם
        </button>

        <button
          onClick={() => (isLast ? onDone() : goTo(index + 1))}
          disabled={nextDisabled}
          className="flex-1 rounded-xl text-white font-bold py-3 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: GATED_KINDS.has(step.kind) && step.kind !== 'algo-trace' ? 'var(--color-brand)' : moduleColor }}
        >
          {isLast ? `בואו נבדוק הבנה — ${Math.min(MASTERY_QUESTION_COUNT, lesson.quiz.length)} שאלות ←` : 'הבא ←'}
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

function RecallStep({
  question,
  sourceLessonTitle,
  onAnswered,
}: {
  question: QuizQuestion
  sourceLessonTitle: string
  onAnswered: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)

  function choose(i: number) {
    if (selected !== null) return
    setSelected(i)
    onAnswered()
  }

  const revealed = selected !== null
  const isCorrect = selected === question.correctIndex

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🧠</span>
        <span className="text-xs font-bold tracking-wide px-2.5 py-1 rounded-full text-white" style={{ background: 'var(--color-brand)' }}>
          בדיקת זיכרון
        </span>
      </div>
      <p className="text-xs text-[var(--color-text-faint)] mb-4">רגע לפני שממשיכים — זוכרים את זה מ&quot;{sourceLessonTitle}&quot;?</p>

      <h3 className="text-lg font-bold leading-snug mb-4">{question.question}</h3>

      <div className="grid gap-2.5">
        {question.choices.map((choice, i) => {
          const showCorrect = revealed && i === question.correctIndex
          const showWrong = revealed && selected === i && i !== question.correctIndex
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={revealed}
              className={`text-right rounded-xl border px-4 py-3 transition-all flex items-center gap-3 ${
                showCorrect
                  ? 'border-[var(--color-green)] bg-[color-mix(in_srgb,var(--color-green)_12%,transparent)]'
                  : showWrong
                    ? 'border-[var(--color-red)] bg-[color-mix(in_srgb,var(--color-red)_12%,transparent)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand)] cursor-pointer'
              } ${revealed && !showCorrect && !showWrong ? 'opacity-50' : ''}`}
            >
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                  showCorrect
                    ? 'border-[var(--color-green)] bg-[var(--color-green)] text-[#0a0a12]'
                    : showWrong
                      ? 'border-[var(--color-red)] bg-[var(--color-red)] text-[#0a0a12]'
                      : 'border-[var(--color-border)]'
                }`}
              >
                {showCorrect ? '✓' : showWrong ? '✕' : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{choice}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hi)] p-4 animate-pop-in">
          <div className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-[var(--color-green)]' : 'text-[var(--color-amber)]'}`}>
            {isCorrect ? '✓ הזיכרון עדיין טרי!' : '💡 שווה לרענן'}
          </div>
          <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

function AlgoTraceStep({ data, moduleColor, onAnswered }: { data: AlgoTraceData; moduleColor: string; onAnswered: () => void }) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({})

  function choose(id: string, guess: boolean) {
    if (answers[id] !== undefined) return
    const next = { ...answers, [id]: guess }
    setAnswers(next)
    if (Object.keys(next).length === data.conditions.length) onAnswered()
  }

  const allAnswered = Object.keys(answers).length === data.conditions.length
  const trueCount = data.conditions.filter((c) => c.correctAnswer).length
  const isSpam = trueCount >= data.threshold

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">⚙️</span>
        <span className="text-xs font-bold tracking-wide" style={{ color: moduleColor }}>
          {data.title}
        </span>
      </div>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">{data.scenario}</p>

      <div className="rounded-xl bg-[var(--color-surface-hi)] p-3 mb-4 text-sm text-[var(--color-text)] leading-relaxed" dir="rtl">
        {data.exampleText}
      </div>

      <div className="flex flex-col gap-2.5">
        {data.conditions.map((cond) => {
          const guessed = answers[cond.id]
          const revealed = guessed !== undefined
          const wasRight = revealed && guessed === cond.correctAnswer
          return (
            <div key={cond.id} className="rounded-xl border border-[var(--color-border)] p-3">
              <div className="text-sm font-medium mb-2">{cond.question}</div>
              {!revealed ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => choose(cond.id, true)}
                    className="flex-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-brand)] py-1.5 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    כן
                  </button>
                  <button
                    onClick={() => choose(cond.id, false)}
                    className="flex-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-brand)] py-1.5 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    לא
                  </button>
                </div>
              ) : (
                <div className={`text-sm animate-pop-in ${wasRight ? 'text-[var(--color-green)]' : 'text-[var(--color-amber)]'}`}>
                  {wasRight ? '✓ נכון — ' : '↳ בהודעה הזו למעשה '}
                  {cond.correctAnswer ? 'כן' : 'לא'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allAnswered && (
        <div className="mt-4 rounded-xl border p-4 animate-pop-in" style={{ borderColor: moduleColor, background: `color-mix(in srgb, ${moduleColor} 10%, transparent)` }}>
          <div className="text-sm font-semibold mb-1">
            {trueCount} מתוך {data.conditions.length} תנאים התקיימו → החלטת האלגוריתם: <span style={{ color: moduleColor }}>{isSpam ? data.verdictLabel : 'לא ' + data.verdictLabel}</span>
          </div>
          <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-2">{data.determinismNote}</p>
        </div>
      )}
    </div>
  )
}

function GigoDemoStep({ data, onAnswered }: { data: GigoDemoData; onAnswered: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)

  function choose(i: number) {
    if (selected !== null) return
    setSelected(i)
    onAnswered()
  }

  const revealed = selected !== null
  const isCorrect = selected === data.correctIndex

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🍎</span>
        <span className="text-xs font-bold tracking-wide px-2.5 py-1 rounded-full text-white" style={{ background: 'var(--color-brand)' }}>
          {data.title}
        </span>
      </div>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">{data.intro}</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {data.rows.map((row, i) => (
          <div key={i} className="rounded-lg bg-[var(--color-surface-hi)] p-2 text-center">
            <div className="text-xl">{row.icon}</div>
            <div className="text-[11px] text-[var(--color-text-faint)] mt-1">{row.features}</div>
            <div className="text-xs font-semibold mt-0.5">{row.label}</div>
          </div>
        ))}
      </div>

      <h3 className="text-base font-bold leading-snug mb-3">{data.question}</h3>

      <div className="grid gap-2.5">
        {data.choices.map((choice, i) => {
          const showCorrect = revealed && i === data.correctIndex
          const showWrong = revealed && selected === i && i !== data.correctIndex
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={revealed}
              className={`text-right rounded-xl border px-4 py-3 transition-all flex items-center gap-3 ${
                showCorrect
                  ? 'border-[var(--color-green)] bg-[color-mix(in_srgb,var(--color-green)_12%,transparent)]'
                  : showWrong
                    ? 'border-[var(--color-red)] bg-[color-mix(in_srgb,var(--color-red)_12%,transparent)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand)] cursor-pointer'
              } ${revealed && !showCorrect && !showWrong ? 'opacity-50' : ''}`}
            >
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                  showCorrect
                    ? 'border-[var(--color-green)] bg-[var(--color-green)] text-[#0a0a12]'
                    : showWrong
                      ? 'border-[var(--color-red)] bg-[var(--color-red)] text-[#0a0a12]'
                      : 'border-[var(--color-border)]'
                }`}
              >
                {showCorrect ? '✓' : showWrong ? '✕' : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{choice}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hi)] p-4 animate-pop-in">
          <div className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-[var(--color-green)]' : 'text-[var(--color-amber)]'}`}>
            {isCorrect ? '✓ בדיוק!' : '💡 לא בדיוק'}
          </div>
          <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">{data.explanation}</p>
        </div>
      )}
    </div>
  )
}

function ApplicationCheckStep({ data, onAnswered }: { data: ApplicationCheckData; onAnswered: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)

  function choose(i: number) {
    if (selected !== null) return
    setSelected(i)
    onAnswered()
  }

  const revealed = selected !== null
  const isCorrect = selected === data.correctIndex

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">✅</span>
        <span className="text-xs font-bold tracking-wide px-2.5 py-1 rounded-full text-white" style={{ background: 'var(--color-brand)' }}>
          בדיקת יישום
        </span>
      </div>

      <h3 className="text-lg font-bold leading-snug mb-4">{data.question}</h3>

      <div className="grid gap-2.5">
        {data.choices.map((choice, i) => {
          const showCorrect = revealed && i === data.correctIndex
          const showWrong = revealed && selected === i && i !== data.correctIndex
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={revealed}
              className={`text-right rounded-xl border px-4 py-3 transition-all flex items-center gap-3 ${
                showCorrect
                  ? 'border-[var(--color-green)] bg-[color-mix(in_srgb,var(--color-green)_12%,transparent)]'
                  : showWrong
                    ? 'border-[var(--color-red)] bg-[color-mix(in_srgb,var(--color-red)_12%,transparent)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand)] cursor-pointer'
              } ${revealed && !showCorrect && !showWrong ? 'opacity-50' : ''}`}
            >
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                  showCorrect
                    ? 'border-[var(--color-green)] bg-[var(--color-green)] text-[#0a0a12]'
                    : showWrong
                      ? 'border-[var(--color-red)] bg-[var(--color-red)] text-[#0a0a12]'
                      : 'border-[var(--color-border)]'
                }`}
              >
                {showCorrect ? '✓' : showWrong ? '✕' : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{choice}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hi)] p-4 animate-pop-in">
          <div className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-[var(--color-green)]' : 'text-[var(--color-amber)]'}`}>
            {isCorrect ? '✓ בדיוק!' : '💡 לא בדיוק'}
          </div>
          <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">{data.explanation}</p>
        </div>
      )}
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
