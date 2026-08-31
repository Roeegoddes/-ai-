import { useState } from 'react'
import type { QuizQuestion } from '../types'

type Props = {
  questions: QuizQuestion[]
  onFinish: (correct: number, total: number) => void
}

export function Quiz({ questions, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const question = questions[index]
  const isCorrect = selected === question.correctIndex
  const isLast = index === questions.length - 1

  function choose(i: number) {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    if (i === question.correctIndex) setCorrectCount((c) => c + 1)
  }

  function next() {
    if (isLast) {
      onFinish(correctCount, questions.length)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  return (
    <div className="animate-pop-in">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[var(--color-text-faint)]">
          שאלה {index + 1} מתוך {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${i < index ? 'bg-[var(--color-brand)]' : i === index ? 'bg-[var(--color-brand-soft)]' : 'bg-[var(--color-surface-hi)]'}`}
            />
          ))}
        </div>
      </div>

      <h3 className="text-lg font-bold leading-snug mb-5">{question.question}</h3>

      <div className="grid gap-2.5">
        {question.choices.map((choice, i) => {
          const isSelected = selected === i
          const showCorrect = revealed && i === question.correctIndex
          const showWrong = revealed && isSelected && i !== question.correctIndex

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
        <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 animate-pop-in">
          <div className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-[var(--color-green)]' : 'text-[var(--color-amber)]'}`}>
            {isCorrect ? '✓ נכון!' : '💡 לא בדיוק'}
          </div>
          <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">{question.explanation}</p>
          <button
            onClick={next}
            className="mt-4 w-full rounded-lg bg-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] text-white font-semibold py-2.5 transition-colors cursor-pointer"
          >
            {isLast ? 'סיום השאלון' : 'לשאלה הבאה ←'}
          </button>
        </div>
      )}
    </div>
  )
}
