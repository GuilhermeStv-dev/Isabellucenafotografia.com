import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useGallery } from '../context/GalleryContext'
import { getResponsiveImageSources } from '../lib/imageOptimization'
import trabalhoContainer from '../assets/trabalho-container.png'

const TAGS = ['Todos', 'Ensaios', 'Grávidas', 'Infantil', 'Wedding', 'Eventos']

export default function Trabalhos() {
  const { categories, photos } = useGallery()
  const [activeTag, setActiveTag] = useState('Todos')

  const filtered = activeTag === 'Todos'
    ? categories
    : categories.filter(c => c.tag === activeTag)

  return (
    <div className="bg-dark min-h-screen">
      {/* ── Hero ── */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end overflow-hidden">
        <img src={trabalhoContainer} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" loading="eager" fetchPriority="high" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl md:text-5xl italic"
          >
            Meus Trabalhos
          </motion.h1>
        </div>
      </section>

      {/* ── Filter tabs ── */}
      <section className="py-12 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center mb-14">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300
                  ${activeTag === tag
                    ? 'bg-white text-dark shadow-[0_0_16px_rgba(255,255,255,0.2)]'
                    : 'text-white/60 border border-white/15 hover:border-white/40 hover:text-white'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Category cards grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTag}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
            >
              {filtered.map((cat, i) => {
                const coverPhoto = photos[cat.id]?.[0]
                const coverImage = coverPhoto
                  ? getResponsiveImageSources(coverPhoto.url, {
                      widths: [480, 768, 1200],
                      qualities: [68, 70, 75],
                      fallbackWidth: 1200,
                      fallbackQuality: 75,
                    })
                  : { src: '', srcSet: undefined, fallbackSrc: '' }
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={`/galeria/${cat.id}`}
                      className="group block relative overflow-hidden rounded-2xl aspect-[3/4] bg-dark-card"
                    >
                      {coverPhoto ? (
                        <img
                          src={coverImage.src}
                          srcSet={coverImage.srcSet}
                          sizes="(min-width: 768px) 33vw, 50vw"
                          alt={cat.label}
                          loading="lazy"
                          fetchPriority="low"
                          decoding="async"
                          onError={(event) => {
                            if (coverImage.fallbackSrc && event.currentTarget.src !== coverImage.fallbackSrc) {
                              event.currentTarget.src = coverImage.fallbackSrc
                              event.currentTarget.srcset = ''
                            }
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-dark-surface flex items-center justify-center text-white/20 text-sm">
                          Sem fotos
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                        <div>
                          <p className="text-gold text-[10px] tracking-widest uppercase mb-1">{cat.tag}</p>
                          <h3 className="font-display text-xl italic text-white">{cat.label}</h3>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center
                                        group-hover:border-gold group-hover:shadow-[0_0_12px_rgba(201,169,110,0.4)]
                                        transition-all duration-300">
                          <ArrowRight size={13} className="text-white group-hover:text-gold group-hover:rotate-[-45deg] transition-all duration-300" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
