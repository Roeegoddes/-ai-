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
