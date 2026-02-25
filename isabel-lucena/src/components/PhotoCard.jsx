import { useState, useMemo, memo, useRef, useEffect } from 'react'
import { Eye, Heart, MessageCircle } from 'lucide-react'
import { getResponsiveImageSources } from '../lib/imageOptimization'

function PhotoCard({ photo, onClick, onLoadComplete }) {
  const [loaded, setLoaded] = useState(false)
  const notifiedRef = useRef(false)

  // Memoiza a transformação da URL — evita recalcular em cada render
  const image = useMemo(
    () => getResponsiveImageSources(photo.url, {
      widths: [480, 768, 1200],
      qualities: [68, 70, 75],
      fallbackWidth: 1200,
      fallbackQuality: 75,
    }),
    [photo.url]
  )

  useEffect(() => {
    notifiedRef.current = false
    setLoaded(false)
  }, [photo?.id, photo?.url])

  useEffect(() => {
    if (!photo?.url && !notifiedRef.current) {
      notifiedRef.current = true
      onLoadComplete?.(photo?.id)
    }
  }, [photo?.id, photo?.url, onLoadComplete])

  const completeLoad = () => {
    setLoaded(true)
    if (!notifiedRef.current) {
      notifiedRef.current = true
      onLoadComplete?.(photo.id)
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group bg-dark-surface"
      onClick={() => onClick?.(photo)}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(min-width: 1024px) 26vw, (min-width: 768px) 33vw, 50vw"
          alt=""
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          onLoad={completeLoad}
          onError={(e) => {
            if (image.fallbackSrc && e.currentTarget.src !== image.fallbackSrc) {
              e.currentTarget.src = image.fallbackSrc
              e.currentTarget.srcset = ''
              completeLoad()
              return
            }
            completeLoad()
          }}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105
            ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!loaded && (
          <div className="absolute inset-0 bg-dark-surface animate-pulse" />
        )}
      </div>

      {/* Overlay hover — só renderiza quando tem dados */}
      {(photo.views > 0 || photo.likes > 0 || photo.comments > 0) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-4 text-white/80 text-xs translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span className="flex items-center gap-1">
              <Eye size={13} /> {photo.views ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={13} /> {photo.likes ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={13} /> {photo.comments ?? 0}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// memo: só re-renderiza se photo.id ou photo.url mudar
export default memo(PhotoCard, (prev, next) =>
  prev.photo.id === next.photo.id &&
  prev.photo.url === next.photo.url &&
  prev.photo.views === next.photo.views &&
  prev.photo.likes === next.photo.likes &&
  prev.photo.comments === next.photo.comments &&
  prev.onClick === next.onClick &&
  prev.onLoadComplete === next.onLoadComplete
)
