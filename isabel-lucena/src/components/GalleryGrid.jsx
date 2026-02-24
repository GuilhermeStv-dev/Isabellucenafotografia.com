import { lazy, Suspense, useState } from 'react'
import PhotoCard from './PhotoCard'
import { motion } from 'framer-motion'
import { getResponsiveImageSources } from '../lib/imageOptimization'

const Lightbox = lazy(() => import('yet-another-react-lightbox'))

const CHUNK = 6

export default function GalleryGrid({ photos }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(CHUNK)

  const slides = photos.map((photo) => {
    const optimized = getResponsiveImageSources(photo.url, {
      widths: [1024, 1600, 2048],
      qualities: [72, 75, 80],
      fallbackWidth: 2048,
      fallbackQuality: 80,
    })
    return { src: optimized.src }
  })

  const handleClick = (photo) => {
    const i = photos.indexOf(photo)
    setIndex(i)
    setOpen(true)
  }

  // Split into two columns
  const left = photos.filter((_, i) => i % 2 === 0)
  const right = photos.filter((_, i) => i % 2 !== 0)

  const visibleLeft = left.slice(0, Math.ceil(visible / 2))
  const visibleRight = right.slice(0, Math.floor(visible / 2))

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-3 md:gap-4">
          {visibleLeft.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <PhotoCard photo={photo} onClick={handleClick} />
            </motion.div>
          ))}
        </div>
        {/* Right column */}
        <div className="flex flex-col gap-3 md:gap-4">
          {visibleRight.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 + 0.08 }}
            >
              <PhotoCard photo={photo} onClick={handleClick} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Load more */}
      {visible < photos.length && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setVisible(v => v + CHUNK)}
            className="btn-outline px-8 py-3 text-sm"
          >
            Carregar mais
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
