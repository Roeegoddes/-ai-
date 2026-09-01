import type { CSSProperties, ReactNode } from 'react'
import { curriculum } from '../data/curriculum'
import { PROTOTYPE_LESSON } from '../data/prototypeLesson'
import type { Lesson, Module } from '../types'

type Props = {
  isLessonComplete: (id: string) => boolean
  getScore: (id: string) => { correct: number; total: number } | null
  isUnlocked: (moduleIndex: number, lessonIndex: number) => boolean
  onOpenLesson: (moduleId: string, lessonId: string) => void
  currentLessonId: string | null
}

const difficultyStyle: Record<string, string> = {
  קל: 'text-[var(--color-green)] bg-[color-mix(in_srgb,var(--color-green)_14%,transparent)]',
  בינוני: 'text-[var(--color-amber)] bg-[color-mix(in_srgb,var(--color-amber)_14%,transparent)]',
  מתקדם: 'text-[var(--color-red)] bg-[color-mix(in_srgb,var(--color-red)_14%,transparent)]',
}

export function LearningPath({ isLessonComplete, getScore, isUnlocked, onOpenLesson, currentLessonId }: Props) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col">
      {curriculum.map((module, moduleIndex) => (
        <ModulePath
          key={module.id}
          module={module}
          moduleIndex={moduleIndex}
          isUnlocked={isUnlocked}
          isLessonComplete={isLessonComplete}
          getScore={getScore}
          onOpenLesson={onOpenLesson}
          currentLessonId={currentLessonId}
        />
      ))}
    </div>
  )
}

// One row of the rail: a marker in a fixed-width column (with a line continuing
// below it into the next row), and free-flowing content beside it. Content drives
// the row's height, so the marker/line always line up — no coordinate math needed.
function RailRow({ marker, lineColor, pad, children }: { marker: ReactNode; lineColor: string | null; pad?: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-11 shrink-0 flex flex-col items-center">
        {marker}
        {lineColor && <div className="w-[2.5px] flex-1 my-1.5 rounded-full" style={{ background: lineColor }} />}
      </div>
      <div className={`flex-1 min-w-0 ${pad ?? 'pb-6'}`}>{children}</div>
    </div>
  )
}

function ModulePath({
  module,
  moduleIndex,
  isUnlocked,
  isLessonComplete,
  getScore,
  onOpenLesson,
  currentLessonId,
}: {
  module: Module
  moduleIndex: number
  isUnlocked: (moduleIndex: number, lessonIndex: number) => boolean
  isLessonComplete: (id: string) => boolean
  getScore: (id: string) => { correct: number; total: number } | null
  onOpenLesson: (moduleId: string, lessonId: string) => void
  currentLessonId: string | null
}) {
  const moduleDone = module.lessons.filter((l) => isLessonComplete(l.id)).length
  const moduleFullyDone = moduleDone === module.lessons.length
  const firstLessonUnlocked = isUnlocked(moduleIndex, 0)

  return (
    <section className="animate-pop-in">
      <RailRow
        marker={
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `color-mix(in srgb, ${module.color} 20%, transparent)` }}
          >
            {module.icon}
          </div>
        }
        lineColor={firstLessonUnlocked ? module.color : 'var(--color-border)'}
      >
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold">{module.title}</h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyStyle[module.difficulty]}`}>
                {module.difficulty}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-dim)] mt-0.5">{module.subtitle}</p>
          </div>
          <div className="text-xs font-semibold text-[var(--color-text-faint)] shrink-0 pt-1.5">
            {moduleDone}/{module.lessons.length}
          </div>
        </div>
      </RailRow>

      {module.lessons.map((lesson: Lesson, lessonIndex: number) => {
        const unlocked = isUnlocked(moduleIndex, lessonIndex)
        const done = isLessonComplete(lesson.id)
        const score = getScore(lesson.id)
        const isCurrent = lesson.id === currentLessonId
        const isPrototype = module.id === PROTOTYPE_LESSON.moduleId && lesson.id === PROTOTYPE_LESSON.lessonId
        const isLast = lessonIndex === module.lessons.length - 1

        return (
          <RailRow
            key={lesson.id}
            lineColor={isLast ? null : done ? module.color : 'var(--color-border)'}
            pad={isCurrent ? 'pb-7' : done ? 'pb-3' : 'pb-5'}
            marker={
              <div
                aria-hidden="true"
                className={`rounded-full flex items-center justify-center font-bold shrink-0 transition-all ${
                  isCurrent ? 'w-14 h-14 text-xl animate-pulse-ring' : done ? 'w-8 h-8 text-xs' : 'w-11 h-11 text-base'
                }`}
                style={
                  {
                    background: isCurrent
                      ? module.color
                      : done
                        ? `color-mix(in srgb, ${module.color} 45%, var(--color-surface))`
                        : unlocked
                          ? 'var(--color-surface)'
                          : 'var(--color-surface-hi)',
                    border: `${isCurrent ? 3 : 2}px solid ${done ? `color-mix(in srgb, ${module.color} 60%, transparent)` : unlocked ? module.color : 'var(--color-text-faint)'}`,
                    color: isCurrent ? '#0a0a12' : done ? module.color : unlocked ? 'var(--color-text)' : 'var(--color-text-faint)',
                    '--pulse-color': module.color,
                  } as CSSProperties
                }
              >
                {done ? '✓' : isCurrent ? '▶' : unlocked ? lessonIndex + 1 : '🔒'}
              </div>
            }
          >
            {isCurrent ? (
              // dominant card: the active step in the journey
              <div className="pt-1">
                <div className="text-[11px] font-bold tracking-wide mb-1.5" style={{ color: module.color }}>
                  השיעור הבא במסע שלכם
                </div>
                <button
                  onClick={() => onOpenLesson(module.id, lesson.id)}
                  className="w-full text-right rounded-2xl border-2 px-5 py-4 cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: module.color,
                    background: `color-mix(in srgb, ${module.color} 9%, var(--color-surface))`,
                    boxShadow: `0 8px 24px -8px color-mix(in srgb, ${module.color} 35%, transparent)`,
                  }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-bold leading-snug text-[var(--color-text)]">{lesson.title}</span>
                    {isPrototype && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-amber)_18%,transparent)] text-[var(--color-amber)] shrink-0">
                        🧪 פורמט חדש
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-text-dim)] mt-1.5">
                    {lesson.minutes} דקות קריאה · {lesson.quiz.length} שאלות
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full text-white mt-3"
                    style={{ background: module.color }}
                  >
                    ▶ התחילו כאן
                  </div>
                </button>
              </div>
            ) : done ? (
              // compact, subtle: a step already behind you
              <button
                disabled={!unlocked}
                onClick={() => onOpenLesson(module.id, lesson.id)}
                className="w-full flex items-center justify-between gap-3 text-right rounded-lg px-3 py-1.5 cursor-pointer transition-colors hover:bg-[var(--color-surface)]"
              >
                <span className="text-sm text-[var(--color-text-dim)] leading-snug truncate">{lesson.title}</span>
                {score && (
                  <span className="text-[11px] text-[var(--color-text-faint)] shrink-0">
                    {score.correct}/{score.total}
                  </span>
                )}
              </button>
            ) : (
              // muted: a step still ahead, not yet reachable in detail
              <button
                disabled={!unlocked}
                onClick={() => onOpenLesson(module.id, lesson.id)}
                className={`w-full text-right rounded-xl border px-4 py-3 transition-all ${
                  unlocked ? 'cursor-pointer hover:-translate-y-0.5 hover:border-[var(--color-brand)]' : 'cursor-not-allowed'
                }`}
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-surface)',
                  opacity: unlocked ? 1 : 0.5,
                }}
              >
                <span className={`text-sm leading-snug font-medium ${unlocked ? 'text-[var(--color-text)]' : 'text-[var(--color-text-faint)]'}`}>
                  {lesson.title}
                </span>
                {unlocked && (
                  <div className="text-xs text-[var(--color-text-faint)] mt-1">
                    {lesson.minutes} דקות קריאה · {lesson.quiz.length} שאלות
                  </div>
                )}
              </button>
            )}
          </RailRow>
        )
      })}

      {moduleFullyDone && (
        <div className="flex items-center gap-3 pb-10 pt-1">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left, color-mix(in srgb, ${module.color} 50%, transparent), transparent)` }} />
          <span className="text-xs font-bold tracking-wide shrink-0" style={{ color: module.color }}>
            ✦ שלב הושלם
          </span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, color-mix(in srgb, ${module.color} 50%, transparent), transparent)` }} />
        </div>
      )}
    </section>
  )
}
