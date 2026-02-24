import { lazy, Suspense, useState, useMemo, memo } from 'react'
import PhotoCard from './PhotoCard'
import { motion } from 'framer-motion'
import { getResponsiveImageSources } from '../lib/imageOptimization'

const Lightbox = lazy(() => import('yet-another-react-lightbox'))

const CHUNK = 9

// Memoiza cada coluna para evitar re-renders desnecessários
const Column = memo(({ items, offset }) => (
  <div className="flex flex-col gap-3 md:gap-4">
    {items.map((photo, i) => (
      <motion.div
        key={photo.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -60px 0px' }}
        transition={{ duration: 0.45, delay: (i + offset) * 0.04 }}
      >
        <PhotoCard photo={photo} />
      </motion.div>
    ))}
  </div>
))
Column.displayName = 'Column'

function GalleryGridInner({ photos }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(CHUNK)

  // Memoiza slides — recalcula só quando photos muda
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

  // Memoiza colunas visíveis
  const { leftCol, rightCol } = useMemo(() => {
    const visiblePhotos = photos.slice(0, visible)
    return {
      leftCol: visiblePhotos.filter((_, i) => i % 2 === 0),
      rightCol: visiblePhotos.filter((_, i) => i % 2 !== 0),
    }
  }, [photos, visible])

  const handleOpen = (photo) => {
    const i = photos.indexOf(photo)
    setIndex(i)
    setOpen(true)
  }

  // Passa handleOpen via prop; PhotoCard não precisa do contexto inteiro
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Column items={leftCol} offset={0} />
        <Column items={rightCol} offset={1} />
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

// Wrapper que passa handleOpen para baixo sem precisar de contexto
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
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -60px 0px' }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <PhotoCard photo={photo} onClick={handleClick} />
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col gap-3 md:gap-4">
          {rightCol.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -60px 0px' }}
              transition={{ duration: 0.45, delay: i * 0.05 + 0.08 }}
            >
              <PhotoCard photo={photo} onClick={handleClick} />
            </motion.div>
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
