import type { CSSProperties } from 'react'
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

const PATH_WIDTH = 320
const ROW_HEIGHT = 132
const NODE_SIZE = 64
// zigzag amplitude cycle (px offset from center), repeats every 8 nodes
const OFFSETS = [0, 52, 80, 52, 0, -52, -80, -52]

export function LearningPath({ isLessonComplete, getScore, isUnlocked, onOpenLesson, currentLessonId }: Props) {
  return (
    <div className="flex flex-col gap-16">
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
  const pathHeight = (module.lessons.length - 1) * ROW_HEIGHT + NODE_SIZE

  const centers = module.lessons.map((_, i) => ({
    x: PATH_WIDTH / 2 + OFFSETS[i % OFFSETS.length],
    y: i * ROW_HEIGHT + NODE_SIZE / 2,
  }))

  // how many segments are "traversed" (both endpoints completed, or leading up to the current node)
  let litSegments = 0
  for (let i = 0; i < module.lessons.length - 1; i++) {
    if (isLessonComplete(module.lessons[i].id)) litSegments++
    else break
  }

  const firstLessonUnlocked = isUnlocked(moduleIndex, 0)
  const connectorLit = firstLessonUnlocked

  return (
    <section className="animate-pop-in">
      <div
        className="flex items-center gap-4 mx-auto rounded-2xl border px-5 py-4"
        style={{
          maxWidth: PATH_WIDTH + 40,
          background: `color-mix(in srgb, ${module.color} 10%, var(--color-surface))`,
          borderColor: `color-mix(in srgb, ${module.color} 30%, transparent)`,
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `color-mix(in srgb, ${module.color} 20%, transparent)` }}
        >
          {module.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold">{module.title}</h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyStyle[module.difficulty]}`}>
              {module.difficulty}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-dim)] mt-0.5 truncate">{module.subtitle}</p>
        </div>
        <div className="text-xs font-semibold text-[var(--color-text-faint)] shrink-0">
          {moduleDone}/{module.lessons.length}
        </div>
      </div>

      {/* connector from the module card into the first node of the path */}
      <div
        className="mx-auto"
        style={{
          width: 0,
          height: 28,
          borderLeft: connectorLit ? `4px solid ${module.color}` : '4px dashed var(--color-text-faint)',
          opacity: connectorLit ? 1 : 0.35,
        }}
      />

      <div className="relative mx-auto" style={{ width: PATH_WIDTH, height: pathHeight }}>
        <svg
          className="absolute inset-0 pointer-events-none"
          width={PATH_WIDTH}
          height={pathHeight}
          viewBox={`0 0 ${PATH_WIDTH} ${pathHeight}`}
        >
          {centers.slice(0, -1).map((p0, i) => {
            const p1 = centers[i + 1]
            const midY = (p0.y + p1.y) / 2
            const lit = i < litSegments
            return (
              <path
                key={i}
                d={`M ${p0.x} ${p0.y} C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`}
                fill="none"
                stroke={lit ? module.color : 'var(--color-text-faint)'}
                strokeOpacity={lit ? 1 : 0.35}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={lit ? undefined : '2 12'}
              />
            )
          })}
        </svg>

        {module.lessons.map((lesson: Lesson, lessonIndex: number) => {
          const unlocked = isUnlocked(moduleIndex, lessonIndex)
          const done = isLessonComplete(lesson.id)
          const score = getScore(lesson.id)
          const isCurrent = lesson.id === currentLessonId
          const isPrototype = module.id === PROTOTYPE_LESSON.moduleId && lesson.id === PROTOTYPE_LESSON.lessonId
          const center = centers[lessonIndex]

          return (
            <div
              key={lesson.id}
              className="absolute flex flex-col items-center"
              style={{ left: center.x, top: center.y, transform: 'translate(-50%, -50%)', width: 128 }}
            >
              <button
                disabled={!unlocked}
                onClick={() => onOpenLesson(module.id, lesson.id)}
                title={lesson.title}
                className={`relative rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-transform ${
                  unlocked ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed'
                } ${isCurrent ? 'animate-pulse-ring' : ''}`}
                style={
                  {
                    width: isCurrent ? NODE_SIZE + 10 : NODE_SIZE,
                    height: isCurrent ? NODE_SIZE + 10 : NODE_SIZE,
                    background: done || isCurrent ? module.color : unlocked ? 'var(--color-surface)' : 'var(--color-surface-hi)',
                    border: `3px solid ${done || unlocked ? module.color : 'var(--color-text-faint)'}`,
                    color: done || isCurrent ? '#0a0a12' : unlocked ? 'var(--color-text)' : 'var(--color-text-faint)',
                    '--pulse-color': module.color,
                  } as CSSProperties
                }
              >
                {done ? '✓' : isCurrent ? '▶' : unlocked ? lessonIndex + 1 : '🔒'}
              </button>

              <div className="mt-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span
                    className={`text-xs leading-snug line-clamp-2 ${isCurrent ? 'font-bold' : 'font-medium'} ${unlocked ? 'text-[var(--color-text)]' : 'text-[var(--color-text-faint)]'}`}
                  >
                    {lesson.title}
                  </span>
                </div>
                {isPrototype && (
                  <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-amber)_18%,transparent)] text-[var(--color-amber)]">
                    🧪 פורמט חדש
                  </span>
                )}
                {isCurrent ? (
                  <div className="text-[11px] font-bold mt-0.5" style={{ color: module.color }}>
                    התחילו כאן ←
                  </div>
                ) : (
                  unlocked && (
                    <div className="text-[10px] text-[var(--color-text-faint)] mt-0.5">
                      {score ? `✓ ${score.correct}/${score.total}` : `${lesson.quiz.length} שאלות`}
                    </div>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
