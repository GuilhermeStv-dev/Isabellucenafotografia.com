import { useEffect, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Heart } from 'lucide-react'
import { useGallery } from '../context/GalleryContext'
import GalleryGrid from '../components/GalleryGrid'
import { getResponsiveImageSources } from '../lib/imageOptimization'

export default function GalleryPage() {
  const { categoryId } = useParams()
  const {
    categories,
    photos,
    ensureCategoryPhotosLoaded,
    loadingPhotosByCategory,
    incrementPhotoViews,
    togglePhotoLike,
  } = useGallery()
  const heroTextRef = useRef(null)

  const category = categories.find(c => c.id === categoryId)
  const categoryPhotos = photos[categoryId] || []
  const loadingCategory = !!loadingPhotosByCategory[categoryId]

  useEffect(() => {
    if (!categoryId) return
    ensureCategoryPhotosLoaded(categoryId, { force: true })
  }, [categoryId, ensureCategoryPhotosLoaded])

  // CSS reveal no título — sem Framer Motion
  useEffect(() => {
    const el = heroTextRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(30px)'
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease'
    const timer = setTimeout(() => {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 80)
    return () => clearTimeout(timer)
  }, [categoryId])

  if (!category) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Categoria não encontrada.</p>
          <Link to="/trabalhos" className="btn-outline">← Voltar</Link>
        </div>
      </div>
    )
  }

  const heroBg = categoryPhotos[0]?.url
  const heroImage = useMemo(
    () => (heroBg ? getResponsiveImageSources(heroBg) : null),
    [heroBg]
  )

  const totalViews = useMemo(
    () => categoryPhotos.reduce((s, p) => s + (p.views || 0), 0),
    [categoryPhotos]
  )
  const totalLikes = useMemo(
    () => categoryPhotos.reduce((s, p) => s + (p.likes || 0), 0),
    [categoryPhotos]
  )

  return (
    <div className="bg-dark min-h-screen">
      {/* ── Hero ── */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end overflow-hidden">
        {heroImage && (
          <img
            src={heroImage.src}
            srcSet={heroImage.srcSet}
            sizes="100vw"
            alt={category.label}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(event) => {
              if (heroImage.fallbackSrc && event.currentTarget.src !== heroImage.fallbackSrc) {
                event.currentTarget.src = heroImage.fallbackSrc
                event.currentTarget.srcset = ''
              }
            }}
          />
        )}
        {!heroImage && <div className="absolute inset-0 bg-dark-200" />}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-10 w-full">
          <div ref={heroTextRef}>
            <h1 className="font-display text-4xl md:text-5xl italic mb-3">{category.label}</h1>
            <div className="flex items-center gap-6 text-white/40 text-sm">
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> {totalViews.toLocaleString('pt-BR')} visualizações
              </span>
              <span className="flex items-center gap-1.5">
                <Heart size={14} /> {totalLikes.toLocaleString('pt-BR')} curtidas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="py-12 max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <Link
            to="/trabalhos"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Voltar aos trabalhos
          </Link>
        </div>

        {categoryPhotos.length > 0 ? (
          <GalleryGrid
            photos={categoryPhotos}
            categoryId={categoryId}
            onRegisterView={incrementPhotoViews}
            onToggleLike={togglePhotoLike}
          />
        ) : loadingCategory ? (
          <div className="text-center py-24 text-white/40">
            <p>Carregando fotos...</p>
          </div>
        ) : (
          <div className="text-center py-24 text-white/30">
            <p>Nenhuma foto nesta categoria ainda.</p>
          </div>
        )}
      </section>
    </div>
  )
}
