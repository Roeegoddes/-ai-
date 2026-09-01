import { useEffect, useState } from 'react'
import { curriculum } from '../../data/curriculum'
import type { Lesson } from '../../types'
import { Quiz } from '../Quiz'
import { selectQuizAttempt, type QuizAttempt } from '../../lib/quiz'
import {
  applyApps,
  applyScenarioIntro,
  conceptCards,
  hook,
  prediction,
  sortItems,
  understandingChecks,
  type ApplyVerdict,
  type ConceptCard,
  type SortVerdict,
} from '../../data/prototypeLesson'

type Props = {
  lesson: Lesson
  moduleColor: string
  onBack: () => void
  onComplete: (correct: number, total: number) => void
  onNextLesson: (() => void) | null
  getAskedIds: (lessonId: string) => string[]
  recordQuizAttempt: (lessonId: string, askedIds: string[]) => void
}

const STAGES = [
  { key: 'hook', icon: '🎬', label: 'פתיחה' },
  { key: 'prediction', icon: '🔮', label: 'ניחוש' },
  { key: 'concepts', icon: '💡', label: 'מושגים' },
  { key: 'interactive', icon: '🎯', label: 'תרגול' },
  { key: 'apply', icon: '🧩', label: 'יישום' },
  { key: 'checks', icon: '✅', label: 'בדיקה' },
  { key: 'map', icon: '🗺️', label: 'מפה' },
  { key: 'mastery', icon: '🏆', label: 'שליטה' },
] as const

export function LessonPrototype({ lesson, moduleColor, onBack, onComplete, onNextLesson, getAskedIds, recordQuizAttempt }: Props) {
  const [stageIndex, setStageIndex] = useState(0)
  const stage = STAGES[stageIndex]

  function next() {
    setStageIndex((i) => Math.min(STAGES.length - 1, i + 1))
    window.scrollTo(0, 0)
  }
  function back() {
    setStageIndex((i) => Math.max(0, i - 1))
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onBack}
            className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>→</span> חזרה למסלול
          </button>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-amber)_16%,transparent)] text-[var(--color-amber)] tracking-wide">
            🧪 פורמט ניסיוני
          </span>
        </div>

        {/* stage progress dots */}
        <div className="flex items-center gap-1.5 mb-6">
          {STAGES.map((s, i) => (
            <div
              key={s.key}
              className="flex-1 flex flex-col items-center gap-1.5"
              title={s.label}
            >
              <div
                className="h-1.5 w-full rounded-full transition-colors duration-300"
                style={{ background: i <= stageIndex ? moduleColor : 'var(--color-surface-hi)' }}
              />
              <span className={`text-[13px] hidden sm:block ${i === stageIndex ? 'opacity-100' : 'opacity-35'}`}>{s.icon}</span>
            </div>
          ))}
        </div>

        <div key={stage.key} className="animate-pop-in">
          {stage.key === 'hook' && <HookStage moduleColor={moduleColor} onNext={next} />}
          {stage.key === 'prediction' && <PredictionStage moduleColor={moduleColor} onNext={next} onBack={back} />}
          {stage.key === 'concepts' && <ConceptsStage moduleColor={moduleColor} onNext={next} onBack={back} />}
          {stage.key === 'interactive' && <InteractiveStage moduleColor={moduleColor} onNext={next} onBack={back} />}
          {stage.key === 'apply' && <ApplyStage moduleColor={moduleColor} onNext={next} onBack={back} />}
          {stage.key === 'checks' && <ChecksStage moduleColor={moduleColor} onNext={next} onBack={back} />}
          {stage.key === 'map' && <MapStage lesson={lesson} moduleColor={moduleColor} onNext={next} onBack={back} />}
          {stage.key === 'mastery' && (
            <MasteryStage
              lesson={lesson}
              moduleColor={moduleColor}
              onBack={back}
              onComplete={onComplete}
              onBackToPath={onBack}
              onNextLesson={onNextLesson}
              getAskedIds={getAskedIds}
              recordQuizAttempt={recordQuizAttempt}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- shared bits ----------

function NavRow({
  onNext,
  onBack,
  nextLabel = 'הבא ←',
  moduleColor,
  nextDisabled,
}: {
  onNext: () => void
  onBack?: () => void
  nextLabel?: string
  moduleColor: string
  nextDisabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3 mt-6">
      {onBack && (
        <button
          onClick={onBack}
          className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-dim)] hover:border-[var(--color-brand)] hover:text-[var(--color-text)] transition-all cursor-pointer shrink-0"
        >
          → הקודם
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 rounded-xl text-white font-bold py-3 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: moduleColor }}
      >
        {nextLabel}
      </button>
    </div>
  )
}

// ---------- 1. Hook ----------

function HookStage({ moduleColor, onNext }: { moduleColor: string; onNext: () => void }) {
  return (
    <div className="text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-10">
      <div className="text-6xl mb-5 animate-float">{hook.icon}</div>
      <div className="text-xs font-bold tracking-wide mb-3" style={{ color: moduleColor }}>
        {hook.eyebrow}
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug mb-4 text-balance">{hook.title}</h1>
      <p className="text-[var(--color-text-dim)] leading-relaxed">{hook.subtitle}</p>
      <NavRow onNext={onNext} moduleColor={moduleColor} nextLabel="בואו נגלה ←" />
    </div>
  )
}

// ---------- 2. Prediction ----------

function PredictionStage({ moduleColor, onNext, onBack }: { moduleColor: string; onNext: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const selectedOption = selected !== null ? prediction.options[selected] : null

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
      <div className="text-xs font-bold tracking-wide mb-2" style={{ color: moduleColor }}>
        נחשו לפני שממשיכים
      </div>
      <h2 className="text-xl font-bold leading-snug mb-5">{prediction.question}</h2>

      <div className="flex flex-col gap-2.5">
        {prediction.options.map((opt, i) => {
          const isSelected = selected === i
          return (
            <div key={i}>
              <button
                onClick={() => setSelected(i)}
                className="w-full text-right rounded-xl border px-4 py-3 transition-all cursor-pointer"
                style={
                  isSelected
                    ? opt.isClose
                      ? { borderColor: 'var(--color-green)', background: 'color-mix(in srgb, var(--color-green) 10%, transparent)' }
                      : { borderColor: moduleColor, background: `color-mix(in srgb, ${moduleColor} 10%, transparent)` }
                    : { borderColor: 'var(--color-border)' }
                }
              >
                {opt.text}
              </button>
              {isSelected && (
                <p className="mt-2 mb-1 px-1 text-sm text-[var(--color-text-dim)] leading-relaxed animate-pop-in">
                  {opt.isClose ? '✅' : '💭'} {opt.feedback}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {selectedOption && (
        <p className="mt-4 text-xs text-[var(--color-text-faint)]">
          אפשר ללחוץ על אפשרות אחרת כדי לראות מה קורה שם — ואז להמשיך כשמוכנים.
        </p>
      )}

      <NavRow onNext={onNext} onBack={onBack} moduleColor={moduleColor} nextDisabled={selected === null} />
    </div>
  )
}

// ---------- 3. Concept cards ----------

function ConceptsStage({ moduleColor, onNext, onBack }: { moduleColor: string; onNext: () => void; onBack: () => void }) {
  const [index, setIndex] = useState(0)
  const isLast = index === conceptCards.length - 1
  const card = conceptCards[index]

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-4">
        {conceptCards.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: i <= index ? moduleColor : 'var(--color-surface-hi)' }}
          />
        ))}
      </div>
      <ConceptCardBody key={index} card={card} moduleColor={moduleColor} />
      <NavRow
        onNext={() => (isLast ? onNext() : setIndex((i) => i + 1))}
        onBack={index === 0 ? onBack : () => setIndex((i) => i - 1)}
        moduleColor={moduleColor}
        nextLabel={isLast ? 'לתרגול ←' : 'הבא ←'}
      />
    </div>
  )
}

function ConceptCardBody({ card, moduleColor }: { card: ConceptCard; moduleColor: string }) {
  const [showDeepDive, setShowDeepDive] = useState(false)

  return (
    <div className="animate-pop-in rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 min-h-[220px] flex flex-col">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl mb-4 shrink-0"
        style={{ background: `color-mix(in srgb, ${moduleColor} 16%, transparent)` }}
      >
        {card.icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{card.title}</h3>
      <p className="text-[var(--color-text-dim)] leading-relaxed">{card.text}</p>

      {card.deepDive && (
        <div className="mt-5">
          <button
            onClick={() => setShowDeepDive((v) => !v)}
            className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
            style={{ color: moduleColor }}
          >
            <span>🔬</span>
            <span>{showDeepDive ? 'הסתירו את הצלילה לעומק' : 'איך זה עובד בפועל? (צלילה לעומק, אופציונלי)'}</span>
            <span className={`transition-transform ${showDeepDive ? 'rotate-180' : ''}`}>⌄</span>
          </button>

          {showDeepDive && (
            <div className="mt-4 animate-pop-in flex flex-col">
              {card.deepDive.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border"
                      style={{ borderColor: 'color-mix(in srgb, ' + moduleColor + ' 40%, transparent)', background: 'var(--color-surface-hi)' }}
                    >
                      {step.icon}
                    </div>
                    {i < card.deepDive!.length - 1 && <div className="w-0.5 flex-1 min-h-[14px]" style={{ background: 'var(--color-border)' }} />}
                  </div>
                  <p className="text-sm text-[var(--color-text-dim)] leading-relaxed pb-3">{step.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- 4. Interactive: AI or not AI sorting ----------

const VERDICT_LABEL: Record<SortVerdict, string> = {
  ai: 'יש כאן AI',
  'not-ai': 'אין כאן AI',
  unclear: 'אין מספיק מידע כדי לדעת',
}

function InteractiveStage({ moduleColor, onNext, onBack }: { moduleColor: string; onNext: () => void; onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<string, SortVerdict>>({})

  function answer(id: string, guess: SortVerdict) {
    if (answers[id] !== undefined) return
    setAnswers((prev) => ({ ...prev, [id]: guess }))
  }

  const answeredCount = Object.keys(answers).length
  const allDone = answeredCount === sortItems.length

  return (
    <div>
      <div className="mb-5">
        <div className="text-xs font-bold tracking-wide mb-2" style={{ color: moduleColor }}>
          תרגול — AI, לא AI, או שאין מספיק מידע?
        </div>
        <h2 className="text-xl font-bold leading-snug">לכל דוגמה, נחשו: איך היא בנויה מבפנים?</h2>
        <p className="text-sm text-[var(--color-text-faint)] mt-1">{answeredCount} / {sortItems.length} נבדקו</p>
      </div>

      <div className="flex flex-col gap-3">
        {sortItems.map((item) => {
          const guessed = answers[item.id]
          const isRevealed = guessed !== undefined
          const wasCorrect = isRevealed && guessed === item.verdict

          return (
            <div
              key={item.id}
              className="rounded-xl border p-4"
              style={{ borderColor: isRevealed ? (wasCorrect ? 'var(--color-green)' : 'var(--color-red)') : 'var(--color-border)' }}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl shrink-0">{item.icon}</span>
                <span className="font-medium flex-1">{item.label}</span>
              </div>

              {!isRevealed ? (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => answer(item.id, 'ai')}
                    className="flex-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-brand)] py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    🤖 יש AI
                  </button>
                  <button
                    onClick={() => answer(item.id, 'not-ai')}
                    className="flex-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-brand)] py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    🙅 אין AI
                  </button>
                  <button
                    onClick={() => answer(item.id, 'unclear')}
                    className="flex-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-brand)] py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    🤷 אין מספיק מידע
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-dim)] mt-2 animate-pop-in">
                  {wasCorrect ? '✅ נכון! ' : `↳ למעשה: ${VERDICT_LABEL[item.verdict]}. `}
                  {item.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <NavRow onNext={onNext} onBack={onBack} moduleColor={moduleColor} nextLabel="ליישום ←" nextDisabled={!allDone} />
    </div>
  )
}

// ---------- 5. Apply It ----------

const APPLY_BADGE: Record<ApplyVerdict, { label: string; color: string }> = {
  ai: { label: 'AI', color: 'var(--color-green)' },
  'not-ai': { label: 'לא AI', color: 'var(--color-text-faint)' },
  unclear: { label: 'תלוי!', color: 'var(--color-amber)' },
}

function ApplyStage({ moduleColor, onNext, onBack }: { moduleColor: string; onNext: () => void; onBack: () => void }) {
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [revealed, setRevealed] = useState(false)

  function toggle(id: string) {
    if (revealed) return
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
      <div className="text-xs font-bold tracking-wide mb-2" style={{ color: moduleColor }}>
        תורכם — תרחיש חדש
      </div>
      <h2 className="text-xl font-bold leading-snug mb-1">{applyScenarioIntro}</h2>
      <p className="text-sm text-[var(--color-text-faint)] mb-5">סמנו את מה שאתם חושבים, ואז בדקו את עצמכם</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {applyApps.map((app) => {
          const isPicked = picked.has(app.id)
          const showBadge = revealed
          const badge = APPLY_BADGE[app.verdict]
          return (
            <button
              key={app.id}
              onClick={() => toggle(app.id)}
              className="rounded-xl border p-3 text-center transition-all cursor-pointer relative"
              style={{
                borderColor: showBadge ? badge.color : isPicked ? moduleColor : 'var(--color-border)',
                background: !showBadge && isPicked ? `color-mix(in srgb, ${moduleColor} 10%, transparent)` : 'var(--color-surface-hi)',
              }}
            >
              <div className="text-2xl mb-1">{app.icon}</div>
              <div className="text-xs font-semibold">{app.label}</div>
              {showBadge && (
                <div className="text-[10px] mt-1 font-bold" style={{ color: badge.color }}>
                  {badge.label}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-5 w-full rounded-xl border-2 border-dashed py-3 text-sm font-semibold transition-colors cursor-pointer"
          style={{ borderColor: moduleColor, color: moduleColor }}
        >
          🔍 בדקו את עצמכם
        </button>
      ) : (
        <div className="mt-5 flex flex-col gap-2 animate-pop-in">
          {applyApps.map((app) => (
            <p key={app.id} className="text-sm text-[var(--color-text-dim)] leading-relaxed rounded-xl bg-[var(--color-surface-hi)] p-3">
              <span className="font-semibold" style={{ color: APPLY_BADGE[app.verdict].color }}>
                {app.icon} {app.label}:
              </span>{' '}
              {app.note}
            </p>
          ))}
        </div>
      )}

      <NavRow onNext={onNext} onBack={onBack} moduleColor={moduleColor} nextLabel="לבדיקת הבנה ←" nextDisabled={!revealed} />
    </div>
  )
}

// ---------- 6. Understanding checks ----------

function ChecksStage({ moduleColor, onNext, onBack }: { moduleColor: string; onNext: () => void; onBack: () => void }) {
  const [done, setDone] = useState(false)

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
      {!done ? (
        <>
          <div className="text-xs font-bold tracking-wide mb-4" style={{ color: moduleColor }}>
            בדיקת הבנה מהירה
          </div>
          <Quiz questions={understandingChecks} onFinish={() => setDone(true)} />
        </>
      ) : (
        <div className="text-center animate-pop-in">
          <div className="text-4xl mb-3">👌</div>
          <h3 className="text-lg font-bold mb-2">מעולה, אתם מבינים את הרעיון הבסיסי</h3>
          <p className="text-sm text-[var(--color-text-dim)] mb-2">בואו נראה איפה זה משתלב בתמונה הגדולה של הקורס.</p>
          <NavRow onNext={onNext} onBack={onBack} moduleColor={moduleColor} nextLabel="למפת ה-AI ←" />
        </div>
      )}
    </div>
  )
}

// ---------- 7. AI Map ----------

function MapStage({ lesson, moduleColor, onNext, onBack }: { lesson: Lesson; moduleColor: string; onNext: () => void; onBack: () => void }) {
  const currentModuleIndex = curriculum.findIndex((m) => m.lessons.some((l) => l.id === lesson.id))

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
      <div className="text-xs font-bold tracking-wide mb-2" style={{ color: moduleColor }}>
        איפה זה משתלב?
      </div>
      <h2 className="text-xl font-bold leading-snug mb-5">מפת עולם ה-AI שנלמד בקורס</h2>

      <div className="flex flex-col">
        {curriculum.map((module, i) => {
          const isCurrent = i === currentModuleIndex
          const isPast = i < currentModuleIndex
          const isLastRow = i === curriculum.length - 1
          return (
            <div key={module.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 border-2"
                  style={{
                    borderColor: isCurrent ? moduleColor : isPast ? 'var(--color-green)' : 'var(--color-border)',
                    background: isCurrent ? `color-mix(in srgb, ${moduleColor} 20%, transparent)` : 'var(--color-surface-hi)',
                  }}
                >
                  {isPast ? '✓' : module.icon}
                </div>
                {!isLastRow && <div className="w-0.5 flex-1 min-h-[24px]" style={{ background: 'var(--color-border)' }} />}
              </div>
              <div className={`pb-6 ${isCurrent ? '' : 'opacity-70'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{module.title}</span>
                  {isCurrent && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: moduleColor }}
                    >
                      אתם כאן
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{module.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>

      <NavRow onNext={onNext} onBack={onBack} moduleColor={moduleColor} nextLabel="לבדיקת שליטה ←" />
    </div>
  )
}

// ---------- 8. Mastery check ----------

function MasteryStage({
  lesson,
  moduleColor,
  onBack,
  onComplete,
  onBackToPath,
  onNextLesson,
  getAskedIds,
  recordQuizAttempt,
}: {
  lesson: Lesson
  moduleColor: string
  onBack: () => void
  onComplete: (correct: number, total: number) => void
  onBackToPath: () => void
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
          {!mastered && ' — כדאי לחזור על מושגי המפתח ולנסות שוב'}
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
              onClick={onBackToPath}
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
        השלב האחרון
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
      <button
        onClick={onBack}
        className="mt-4 text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text)] underline underline-offset-2 cursor-pointer"
      >
        → חזרה למפה
      </button>
    </div>
  )
}
