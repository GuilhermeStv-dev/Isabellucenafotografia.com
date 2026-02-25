import { useState, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useGallery } from '../context/GalleryContext'
import { getResponsiveImageSources } from '../lib/imageOptimization'
import trabalhoContainer from '../assets/trabalho-container.webp'

const TAGS = ['Todos', 'Ensaios', 'Grávidas', 'Infantil', 'Wedding', 'Eventos']

function CardSkeleton() {
  return (
    <div className="rounded-2xl aspect-[3/4] bg-dark-200 overflow-hidden relative">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, #1A1A1A 0%, #2E2E2E 50%, #1A1A1A 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite linear',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
        <div className="h-2 w-16 rounded-full bg-white/10" />
        <div className="h-4 w-28 rounded-full bg-white/15" />
      </div>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  )
}

const CategoryCard = memo(({ cat, coverPhoto }) => {
  const [loaded, setLoaded] = useState(false)

  const coverImage = useMemo(() => {
    if (!coverPhoto) return null
    return getResponsiveImageSources(coverPhoto.url, {
      widths: [480, 768],
      qualities: [68, 72],
      fallbackWidth: 768,
      fallbackQuality: 72,
    })
  }, [coverPhoto?.url])

  return (
    <Link
      to={`/galeria/${cat.id}`}
      className="group block relative overflow-hidden rounded-2xl aspect-[3/4] bg-dark-200"
    >
      {!loaded && <CardSkeleton />}

      {coverImage ? (
        <img
          src={coverImage.src}
          srcSet={coverImage.srcSet}
          sizes="(min-width: 768px) 33vw, 50vw"
          alt={cat.label}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            setLoaded(true)
            if (coverImage.fallbackSrc && e.currentTarget.src !== coverImage.fallbackSrc) {
              e.currentTarget.src = coverImage.fallbackSrc
              e.currentTarget.srcset = ''
            }
          }}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
        />
      ) : (
        <CardSkeleton />
      )}

      {loaded && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
            <div>
              <p className="text-gold text-[10px] tracking-widest uppercase mb-1">{cat.tag}</p>
              <h3 className="font-display text-xl italic text-white">{cat.label}</h3>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center
                            group-hover:border-gold group-hover:shadow-[0_0_12px_rgba(201,169,110,0.4)]
                            transition-all duration-300">
              <ArrowRight
                size={13}
                className="text-white group-hover:text-gold group-hover:rotate-[-45deg] transition-all duration-300"
              />
            </div>
          </div>
        </>
      )}
    </Link>
  )
}, (prev, next) =>
  prev.cat.id === next.cat.id &&
  prev.coverPhoto?.url === next.coverPhoto?.url
)
CategoryCard.displayName = 'CategoryCard'

const FilterTabs = memo(({ activeTag, onSelect }) => (
  <div className="flex flex-wrap gap-3 justify-center mb-14">
    {TAGS.map((tag) => (
      <button
        key={tag}
        onClick={() => onSelect(tag)}
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
))
FilterTabs.displayName = 'FilterTabs'

export default function Trabalhos() {
  const { categories, photos } = useGallery()
  const [activeTag, setActiveTag] = useState('Todos')

  const filtered = useMemo(
    () => activeTag === 'Todos'
      ? categories
      : categories.filter((c) => c.tag === activeTag),
    [categories, activeTag]
  )

  return (
    <div className="bg-dark min-h-screen">
      <section className="relative h-[45vh] md:h-[55vh] flex items-end overflow-hidden">
        <img
          src={trabalhoContainer}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
          <h1 className="font-display text-4xl md:text-5xl italic">Meus Trabalhos</h1>
        </div>
      </section>

      <section className="py-12 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <FilterTabs activeTag={activeTag} onSelect={setActiveTag} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {filtered.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                coverPhoto={photos[cat.id]?.[0] ?? null}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
