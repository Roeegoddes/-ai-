import { lazy, Suspense, useState } from 'react'
import { curriculum } from './data/curriculum'
import { PROTOTYPE_LESSON } from './data/prototypeLesson'
import { useProgress } from './hooks/useProgress'
import { Home } from './components/Home'
import { LessonPage } from './components/LessonPage'
import { GlossaryPage } from './components/GlossaryPage'
import { LessonPrototype } from './components/prototype/LessonPrototype'

// Lazy-loaded: pulls in three.js / @react-three/fiber, which is otherwise
// dead weight on every other page (home, glossary, all other lessons).
const NeuronLessonExperience = lazy(() =>
  import('./components/neuron3d/NeuronLessonExperience').then((m) => ({ default: m.NeuronLessonExperience })),
)

const NEURON_3D_LESSON = { moduleId: 'neural-networks', lessonId: 'artificial-neuron' } as const

type Route = { screen: 'home' } | { screen: 'glossary' } | { screen: 'lesson'; moduleId: string; lessonId: string }

function App() {
  const [route, setRoute] = useState<Route>({ screen: 'home' })
  const { markLessonComplete, getAskedIds, recordQuizAttempt } = useProgress()

  function openLesson(moduleId: string, lessonId: string) {
    setRoute({ screen: 'lesson', moduleId, lessonId })
    window.scrollTo(0, 0)
  }

  function goHome() {
    setRoute({ screen: 'home' })
    window.scrollTo(0, 0)
  }

  function openGlossary() {
    setRoute({ screen: 'glossary' })
    window.scrollTo(0, 0)
  }

  if (route.screen === 'home') {
    return <Home onOpenLesson={openLesson} onOpenGlossary={openGlossary} />
  }

  if (route.screen === 'glossary') {
    return <GlossaryPage onBack={goHome} />
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

  const isPrototype = module.id === PROTOTYPE_LESSON.moduleId && lesson.id === PROTOTYPE_LESSON.lessonId
  const isNeuron3D = module.id === NEURON_3D_LESSON.moduleId && lesson.id === NEURON_3D_LESSON.lessonId

  if (isPrototype) {
    return (
      <LessonPrototype
        key={lesson.id}
        lesson={lesson}
        moduleColor={module.color}
        onBack={goHome}
        onComplete={(correct, total) => markLessonComplete(lesson.id, correct, total)}
        onNextLesson={nextLessonRef ? () => openLesson(nextLessonRef.moduleId, nextLessonRef.lessonId) : null}
        getAskedIds={getAskedIds}
        recordQuizAttempt={recordQuizAttempt}
      />
    )
  }

  if (isNeuron3D) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0a0a12]" />}>
        <NeuronLessonExperience
          key={lesson.id}
          lesson={lesson}
          moduleColor={module.color}
          onBack={goHome}
          onComplete={(correct, total) => markLessonComplete(lesson.id, correct, total)}
          onNextLesson={nextLessonRef ? () => openLesson(nextLessonRef.moduleId, nextLessonRef.lessonId) : null}
          getAskedIds={getAskedIds}
          recordQuizAttempt={recordQuizAttempt}
        />
      </Suspense>
    )
  }

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
      getAskedIds={getAskedIds}
      recordQuizAttempt={recordQuizAttempt}
    />
  )
}

export default App
