import { lazy, Suspense, useState, useMemo, memo, useEffect, useRef } from 'react'
import PhotoCard from './PhotoCard'
import { getResponsiveImageSources } from '../lib/imageOptimization'

const Lightbox = lazy(() => import('yet-another-react-lightbox'))

const CHUNK = 9

// RevealItem: animação via CSS + IntersectionObserver (sem Framer Motion)
// Seguro em Safari iOS — cada observer é destruído após animar
// revealed.current garante que a animação nunca se repete após o primeiro trigger
const RevealItem = memo(({ children, delay = 0 }) => {
  const ref = useRef(null)
  const revealed = useRef(false)

  useEffect(() => {
    const el = ref.current
    // ← Sai imediatamente se já foi revelado — impede reset de opacity
    if (!el || revealed.current) return

    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          revealed.current = true   // ← Marca como revelado de forma permanente
          observer.unobserve(el)
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return <div ref={ref}>{children}</div>
})
RevealItem.displayName = 'RevealItem'

export default function GalleryGrid({ photos }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(CHUNK)

  const slides = useMemo(
    () => photos.map((photo) => ({
      src: getResponsiveImageSources(photo.url, {
        widths: [1024, 1600, 2048],
        qualities: [72, 75, 80],
        fallbackWidth: 2048,
        fallbackQuality: 80,
      }).src,
    })),
    [photos]
  )

  const visiblePhotos = photos.slice(0, visible)
  const leftCol = visiblePhotos.filter((_, i) => i % 2 === 0)
  const rightCol = visiblePhotos.filter((_, i) => i % 2 !== 0)

  const handleClick = (photo) => {
    setIndex(photos.indexOf(photo))
    setOpen(true)
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="flex flex-col gap-3 md:gap-4">
          {leftCol.map((photo, i) => (
            <RevealItem key={photo.id} delay={i * 50}>
              <PhotoCard photo={photo} onClick={handleClick} />
            </RevealItem>
          ))}
        </div>
        <div className="flex flex-col gap-3 md:gap-4">
          {rightCol.map((photo, i) => (
            <RevealItem key={photo.id} delay={i * 50 + 80}>
              <PhotoCard photo={photo} onClick={handleClick} />
            </RevealItem>
          ))}
        </div>
      </div>

      {visible < photos.length && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setVisible((v) => v + CHUNK)}
            className="btn-outline px-8 py-3 text-sm"
          >
            Carregar mais ({photos.length - visible} restantes)
          </button>
        </div>
      )}

      {open && (
        <Suspense fallback={null}>
          <Lightbox
            open={open}
            close={() => setOpen(false)}
            index={index}
            slides={slides}
            styles={{ container: { backgroundColor: 'rgba(0,0,0,0.95)' } }}
          />
        </Suspense>
      )}
    </div>
  )
}
