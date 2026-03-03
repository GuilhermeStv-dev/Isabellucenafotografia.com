let smoothResetTimer = null

export function enforceSmoothScrollBehavior() {
  const root = document.documentElement
  root.style.setProperty('scroll-behavior', 'smooth', 'important')

  if (smoothResetTimer) {
    window.clearTimeout(smoothResetTimer)
  }

  smoothResetTimer = window.setTimeout(() => {
    root.style.removeProperty('scroll-behavior')
    smoothResetTimer = null
  }, 1800)
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

export function smoothScrollToTarget(target, options = {}) {
  if (!target) return

  enforceSmoothScrollBehavior()

  const { offset = 0, duration = 1.15 } = options

  if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
    window.__lenis.scrollTo(target, { offset, duration, easing: easeOutCubic })
    return
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function smoothScrollToId(id, options = {}) {
  const target = document.getElementById(id)
  if (!target) return
  smoothScrollToTarget(target, options)
}

export function smoothScrollToTop(options = {}) {
  enforceSmoothScrollBehavior()

  const { duration = 1.15 } = options

  if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
    window.__lenis.scrollTo(0, { duration, easing: easeOutCubic })
    return
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}

export function smoothHorizontalScrollTo(element, left, duration = 600) {
  if (!element) return

  const start = element.scrollLeft
  const distance = left - start
  const startTime = performance.now()

  const step = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeOutCubic(progress)

    element.scrollLeft = start + distance * eased

    if (progress < 1) {
      window.requestAnimationFrame(step)
    }
  }

  window.requestAnimationFrame(step)
}
