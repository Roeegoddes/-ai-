import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'limud-ai-progress-v1'

type ProgressState = {
  completedLessons: Record<string, boolean>
  quizScores: Record<string, { correct: number; total: number }>
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completedLessons: {}, quizScores: {} }
    const parsed = JSON.parse(raw)
    return {
      completedLessons: parsed.completedLessons ?? {},
      quizScores: parsed.quizScores ?? {},
    }
  } catch {
    return { completedLessons: {}, quizScores: {} }
  }
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => loadState())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage unavailable — progress just won't persist
    }
  }, [state])

  const markLessonComplete = useCallback((lessonId: string, correct: number, total: number) => {
    setState((prev) => ({
      completedLessons: { ...prev.completedLessons, [lessonId]: true },
      quizScores: { ...prev.quizScores, [lessonId]: { correct, total } },
    }))
  }, [])

  const isLessonComplete = useCallback((lessonId: string) => !!state.completedLessons[lessonId], [state])

  const getScore = useCallback(
    (lessonId: string) => state.quizScores[lessonId] ?? null,
    [state],
  )

  const resetProgress = useCallback(() => {
    setState({ completedLessons: {}, quizScores: {} })
  }, [])

  return { state, markLessonComplete, isLessonComplete, getScore, resetProgress }
}
