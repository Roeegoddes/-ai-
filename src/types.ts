export type QuizQuestion = {
  id: string
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export type Lesson = {
  id: string
  title: string
  minutes: number
  summary: string
  content: string[] // paragraphs / markdown-lite blocks
  keyTerms?: { term: string; def: string }[]
  // Question bank for the lesson's mastery quiz — a random subset is drawn
  // per attempt (see src/lib/quiz.ts), not shown in full every time.
  quiz: QuizQuestion[]
}

export type Difficulty = 'קל' | 'בינוני' | 'מתקדם'

export type Module = {
  id: string
  title: string
  subtitle: string
  icon: string
  difficulty: Difficulty
  color: string
  lessons: Lesson[]
}
