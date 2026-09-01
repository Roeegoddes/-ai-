import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'limud-ai-progress-v1'

type ProgressState = {
  completedLessons: Record<string, boolean>
  quizScores: Record<string, { correct: number; total: number }>
  // Ids of questions already drawn from each lesson's question bank, so the
  // next mastery-quiz attempt can avoid repeats until the bank cycles.
  quizAskedIds: Record<string, string[]>
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completedLessons: {}, quizScores: {}, quizAskedIds: {} }
    const parsed = JSON.parse(raw)
    return {
      completedLessons: parsed.completedLessons ?? {},
      quizScores: parsed.quizScores ?? {},
      quizAskedIds: parsed.quizAskedIds ?? {},
    }
  } catch {
    return { completedLessons: {}, quizScores: {}, quizAskedIds: {} }
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
      ...prev,
      completedLessons: { ...prev.completedLessons, [lessonId]: true },
      quizScores: { ...prev.quizScores, [lessonId]: { correct, total } },
    }))
  }, [])

  const isLessonComplete = useCallback((lessonId: string) => !!state.completedLessons[lessonId], [state])

  const getScore = useCallback(
    (lessonId: string) => state.quizScores[lessonId] ?? null,
    [state],
  )

  const getAskedIds = useCallback((lessonId: string) => state.quizAskedIds[lessonId] ?? [], [state])

  const recordQuizAttempt = useCallback((lessonId: string, askedIds: string[]) => {
    setState((prev) => ({
      ...prev,
      quizAskedIds: { ...prev.quizAskedIds, [lessonId]: askedIds },
    }))
  }, [])

  const resetProgress = useCallback(() => {
    setState({ completedLessons: {}, quizScores: {}, quizAskedIds: {} })
  }, [])

  return { state, markLessonComplete, isLessonComplete, getScore, resetProgress, getAskedIds, recordQuizAttempt }
}
