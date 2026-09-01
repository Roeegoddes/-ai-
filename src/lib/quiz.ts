import type { QuizQuestion } from '../types'

// How many questions a single mastery-quiz attempt draws from a lesson's
// question bank (Lesson.quiz). Lessons with a smaller bank than this just
// use their whole bank.
export const MASTERY_QUESTION_COUNT = 5

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Shuffles a question's answer choices, remapping correctIndex to match. */
export function shuffleQuestionChoices(question: QuizQuestion, rng: () => number = Math.random): QuizQuestion {
  const order = shuffle(
    question.choices.map((_, i) => i),
    rng,
  )
  return {
    ...question,
    choices: order.map((i) => question.choices[i]),
    correctIndex: order.indexOf(question.correctIndex),
  }
}

export type QuizAttempt = {
  questions: QuizQuestion[]
  /** Updated "already asked" id list — persist this for the lesson so the next attempt can avoid repeats. */
  askedIds: string[]
}

/**
 * Selects up to `count` questions from a lesson's question bank for one
 * mastery-quiz attempt, preferring questions not in `askedIds` so a learner
 * doesn't see the same handful every time. Once the unseen pool can't fill a
 * full attempt, previously-asked questions are recycled back in — repeats
 * are avoided "when practical", not guaranteed once the bank is at or below
 * `count`. Each selected question's choices are independently shuffled.
 */
export function selectQuizAttempt(
  bank: QuizQuestion[],
  askedIds: string[],
  count: number = MASTERY_QUESTION_COUNT,
  rng: () => number = Math.random,
): QuizAttempt {
  const effectiveCount = Math.min(count, bank.length)
  const askedSet = new Set(askedIds)
  const unseen = bank.filter((q) => !askedSet.has(q.id))
  const seen = bank.filter((q) => askedSet.has(q.id))

  let picked: QuizQuestion[]
  let nextAskedIds: string[]

  if (unseen.length >= effectiveCount) {
    picked = shuffle(unseen, rng).slice(0, effectiveCount)
    nextAskedIds = [...askedIds, ...picked.map((q) => q.id)]
  } else {
    // Bank (nearly) exhausted: use every unseen question, then recycle the
    // fewest possible previously-asked ones to fill the rest. Recycled
    // questions are released back into "unseen" for next time instead of
    // staying marked asked, so the rotation keeps moving.
    const fillCount = effectiveCount - unseen.length
    const fill = shuffle(seen, rng).slice(0, fillCount)
    picked = shuffle([...unseen, ...fill], rng)
    const fillIds = new Set(fill.map((q) => q.id))
    nextAskedIds = [...askedIds.filter((id) => !fillIds.has(id)), ...unseen.map((q) => q.id)]
  }

  return {
    questions: picked.map((q) => shuffleQuestionChoices(q, rng)),
    askedIds: nextAskedIds,
  }
}
