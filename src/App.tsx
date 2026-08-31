import { useState } from 'react'
import { curriculum } from './data/curriculum'
import { useProgress } from './hooks/useProgress'
import { Home } from './components/Home'
import { LessonPage } from './components/LessonPage'

type Route = { screen: 'home' } | { screen: 'lesson'; moduleId: string; lessonId: string }

function App() {
  const [route, setRoute] = useState<Route>({ screen: 'home' })
  const { markLessonComplete } = useProgress()

  function openLesson(moduleId: string, lessonId: string) {
    setRoute({ screen: 'lesson', moduleId, lessonId })
    window.scrollTo(0, 0)
  }

  function goHome() {
    setRoute({ screen: 'home' })
    window.scrollTo(0, 0)
  }

  if (route.screen === 'home') {
    return <Home onOpenLesson={openLesson} />
  }

  const moduleIndex = curriculum.findIndex((m) => m.id === route.moduleId)
  const module = curriculum[moduleIndex]
  const lessonIndex = module.lessons.findIndex((l) => l.id === route.lessonId)
  const lesson = module.lessons[lessonIndex]

  const nextInModule = module.lessons[lessonIndex + 1]
  const nextModule = curriculum[moduleIndex + 1]
  const nextLessonRef = nextInModule
    ? { moduleId: module.id, lessonId: nextInModule.id }
    : nextModule
      ? { moduleId: nextModule.id, lessonId: nextModule.lessons[0].id }
      : null

  return (
    <LessonPage
      key={lesson.id}
      module={module}
      lesson={lesson}
      lessonNumber={lessonIndex + 1}
      totalInModule={module.lessons.length}
      onBack={goHome}
      onComplete={(correct, total) => markLessonComplete(lesson.id, correct, total)}
      onNextLesson={nextLessonRef ? () => openLesson(nextLessonRef.moduleId, nextLessonRef.lessonId) : null}
    />
  )
}

export default App
