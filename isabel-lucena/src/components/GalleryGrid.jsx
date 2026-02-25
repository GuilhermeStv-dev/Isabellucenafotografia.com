import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Heart, Eye, X } from 'lucide-react'
import PhotoCard from './PhotoCard'
import { getResponsiveImageSources } from '../lib/imageOptimization'

const CHUNK = 9

function GridSkeleton() {
  const blocks = Array.from({ length: CHUNK })

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4" aria-hidden="true">
      {blocks.map((_, index) => (
        <div key={index} className="relative overflow-hidden rounded-lg aspect-[3/4] bg-dark-surface">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, #1A1A1A 0%, #2E2E2E 50%, #1A1A1A 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite linear',
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

function FullscreenViewer({
  photo,
  index,
  total,
  liked,
  onClose,
  onPrev,
  onNext,
  onToggleLike,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onPrev()
      if (event.key === 'ArrowRight') onNext()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, onPrev, onNext])

  if (!photo) return null

  const image = getResponsiveImageSources(photo.url, {
    widths: [1024, 1600, 2048],
    qualities: [72, 75, 80],
    fallbackWidth: 2048,
    fallbackQuality: 80,
  })

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 border border-white/20
                   text-white/80 hover:text-white hover:border-white/50 transition-all flex items-center justify-center"
        aria-label="Fechar visualização"
      >
        <X size={18} />
      </button>

      <button
        onClick={onPrev}
        className="absolute left-4 md:left-6 w-10 h-10 rounded-full bg-black/40 border border-white/20
                   text-white/80 hover:text-white hover:border-white/50 transition-all flex items-center justify-center"
        aria-label="Foto anterior"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 md:right-6 w-10 h-10 rounded-full bg-black/40 border border-white/20
                   text-white/80 hover:text-white hover:border-white/50 transition-all flex items-center justify-center"
        aria-label="Próxima foto"
      >
        <ChevronRight size={18} />
      </button>

      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes="100vw"
        alt="Foto ampliada"
        className="max-h-[85vh] max-w-[94vw] object-contain"
        loading="eager"
        decoding="async"
        onError={(event) => {
          if (image.fallbackSrc && event.currentTarget.src !== image.fallbackSrc) {
            event.currentTarget.src = image.fallbackSrc
            event.currentTarget.srcset = ''
          }
        }}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/55 border border-white/15 rounded-full px-4 py-2
                      flex items-center gap-4 text-xs text-white/80 backdrop-blur-sm">
        <span>{index + 1} / {total}</span>
        <span className="flex items-center gap-1"><Eye size={13} /> {photo.views || 0}</span>
        <button
          onClick={onToggleLike}
          className={`flex items-center gap-1 transition-colors ${liked ? 'text-gold' : 'text-white/80 hover:text-white'}`}
          aria-label={liked ? 'Descurtir foto' : 'Curtir foto'}
        >
          <Heart size={13} fill={liked ? 'currentColor' : 'none'} /> {photo.likes || 0}
        </button>
      </div>
    </div>
  )
}

export default function GalleryGrid({ photos, categoryId, onRegisterView, onToggleLike }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(CHUNK)
  const [loadedIds, setLoadedIds] = useState(() => new Set())

  const likesKey = `il_liked_photos_${categoryId || 'global'}`
  const [likedByUser, setLikedByUser] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(likesKey) || '[]'))
    } catch {
      return new Set()
    }
  })

  const lastTrackedViewRef = useRef('')

  useEffect(() => {
    try {
      localStorage.setItem(likesKey, JSON.stringify(Array.from(likedByUser)))
    } catch {
      // noop
    }
  }, [likedByUser, likesKey])

  useEffect(() => {
    setLoadedIds(new Set())
  }, [visible, photos])

  const visiblePhotos = useMemo(() => photos.slice(0, visible), [photos, visible])
  const expectedLoaded = visiblePhotos.length
  const allVisibleLoaded = expectedLoaded === 0 || loadedIds.size >= expectedLoaded

  const leftCol = visiblePhotos.filter((_, itemIndex) => itemIndex % 2 === 0)
  const rightCol = visiblePhotos.filter((_, itemIndex) => itemIndex % 2 !== 0)

  const trackView = useCallback((photoId) => {
    if (!photoId || !categoryId) return
    onRegisterView?.(categoryId, photoId)
  }, [categoryId, onRegisterView])

  useEffect(() => {
    if (!open) return
    const current = photos[index]
    if (!current?.id) return

    const marker = `${current.id}:${index}`
    if (lastTrackedViewRef.current === marker) return
    lastTrackedViewRef.current = marker

    trackView(current.id)
  }, [open, index, photos, trackView])

  const handleOpen = useCallback((photo) => {
    const nextIndex = photos.findIndex((item) => item.id === photo.id)
    if (nextIndex < 0) return
    setIndex(nextIndex)
    setOpen(true)
  }, [photos])

  const handleLoadComplete = useCallback((photoId) => {
    if (!photoId) return
    setLoadedIds((prev) => {
      if (prev.has(photoId)) return prev
      const next = new Set(prev)
      next.add(photoId)
      return next
    })
  }, [])

  const handlePrev = useCallback(() => {
    setIndex((current) => (current - 1 + photos.length) % photos.length)
  }, [photos.length])

  const handleNext = useCallback(() => {
    setIndex((current) => (current + 1) % photos.length)
  }, [photos.length])

  const currentPhoto = photos[index]
  const currentLiked = currentPhoto ? likedByUser.has(String(currentPhoto.id)) : false

  const handleToggleLike = useCallback(() => {
    if (!currentPhoto?.id || !categoryId) return

    const photoId = String(currentPhoto.id)
    const willLike = !likedByUser.has(photoId)

    setLikedByUser((prev) => {
      const next = new Set(prev)
      if (willLike) next.add(photoId)
      else next.delete(photoId)
      return next
    })

    onToggleLike?.(categoryId, photoId, willLike)
  }, [currentPhoto, categoryId, likedByUser, onToggleLike])

  return (
    <div>
      {!allVisibleLoaded && <GridSkeleton />}

      <div style={{ opacity: allVisibleLoaded ? 1 : 0, transition: 'opacity 0.35s ease' }}>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="flex flex-col gap-3 md:gap-4">
            {leftCol.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={handleOpen}
                onLoadComplete={handleLoadComplete}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3 md:gap-4">
            {rightCol.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={handleOpen}
                onLoadComplete={handleLoadComplete}
              />
            ))}
          </div>
        </div>
      </div>

      {visible < photos.length && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setVisible((value) => value + CHUNK)}
            className="btn-outline px-8 py-3 text-sm"
          >
            Carregar mais ({photos.length - visible} restantes)
          </button>
        </div>
      )}

      {open && (
        <FullscreenViewer
          photo={currentPhoto}
          index={index}
          total={photos.length}
          liked={currentLiked}
          onClose={() => setOpen(false)}
          onPrev={handlePrev}
          onNext={handleNext}
          onToggleLike={handleToggleLike}
        />
      )}
    </div>
  )
}
