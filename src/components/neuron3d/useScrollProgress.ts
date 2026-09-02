import { type RefObject, useEffect, useRef, useState } from 'react'

export type ScrollProgress = {
  /** Ref for imperative reads (e.g. inside an R3F useFrame loop) — always current, no re-render needed. */
  ref: RefObject<number>
  /** Same value mirrored into React state, for components that render off it directly. */
  value: number
}

/**
 * Tracks scroll progress (0..1) of a tall container relative to the
 * viewport: 0 when its top just reaches the top of the screen, 1 once its
 * bottom has scrolled fully past.
 */
export function useScrollProgress(containerRef: RefObject<HTMLElement | null>): ScrollProgress {
  const progressRef = useRef(0)
  const [value, setValue] = useState(0)

  useEffect(() => {
    let ticking = false

    function measure() {
      ticking = false
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0
      progressRef.current = p
      setValue(p)
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [containerRef])

  return { ref: progressRef, value }
}
