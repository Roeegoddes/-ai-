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
function RailRow({ marker, lineColor, children }: { marker: ReactNode; lineColor: string | null; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-11 shrink-0 flex flex-col items-center">
        {marker}
        {lineColor && <div className="w-[2.5px] flex-1 my-1.5 rounded-full" style={{ background: lineColor }} />}
      </div>
      <div className="flex-1 min-w-0 pb-6">{children}</div>
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
            marker={
              <div
                aria-hidden="true"
                className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${
                  isCurrent ? 'animate-pulse-ring' : ''
                }`}
                style={
                  {
                    background: done || isCurrent ? module.color : unlocked ? 'var(--color-surface)' : 'var(--color-surface-hi)',
                    border: `2.5px solid ${done || unlocked ? module.color : 'var(--color-text-faint)'}`,
                    color: done || isCurrent ? '#0a0a12' : unlocked ? 'var(--color-text)' : 'var(--color-text-faint)',
                    '--pulse-color': module.color,
                  } as CSSProperties
                }
              >
                {done ? '✓' : isCurrent ? '▶' : unlocked ? lessonIndex + 1 : '🔒'}
              </div>
            }
          >
            <button
              disabled={!unlocked}
              onClick={() => onOpenLesson(module.id, lesson.id)}
              className={`w-full text-right rounded-2xl border px-4 py-3.5 transition-all ${
                unlocked ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-not-allowed opacity-55'
              }`}
              style={{
                borderColor: isCurrent ? module.color : done ? `color-mix(in srgb, ${module.color} 35%, var(--color-border))` : 'var(--color-border)',
                borderWidth: isCurrent ? 2 : 1,
                background: isCurrent ? `color-mix(in srgb, ${module.color} 7%, var(--color-surface))` : 'var(--color-surface)',
              }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm leading-snug ${isCurrent ? 'font-bold' : 'font-medium'} ${unlocked ? 'text-[var(--color-text)]' : 'text-[var(--color-text-faint)]'}`}>
                  {lesson.title}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0" style={{ background: module.color }}>
                    ▶ התחילו כאן
                  </span>
                )}
                {isPrototype && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-amber)_18%,transparent)] text-[var(--color-amber)] shrink-0">
                    🧪 פורמט חדש
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--color-text-faint)] mt-1">
                {lesson.minutes} דקות קריאה · {lesson.quiz.length} שאלות
                {score && ` · ✓ ${score.correct}/${score.total}`}
              </div>
            </button>
          </RailRow>
        )
      })}
    </section>
  )
}
