import { useEffect, useRef, useState, useMemo, memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useGallery } from '../context/GalleryContext'
import BlurImage from '../components/BlurImage'
import { getResponsiveImageSources } from '../lib/imageOptimization'
import FotoIsabel from '../assets/foto-isabel.webp'
import FotoIsabel2 from '../assets/Foto-isabel-2.webp'
import FotoIsabel3 from '../assets/Foto-isabel3.webp'

/* ═══════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════ */

function useReveal(ref) {
  useEffect(() => {
    const elements = ref?.current
      ? ref.current.querySelectorAll('[data-reveal]')
      : document.querySelectorAll('[data-reveal]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ref])
}

const revealStyle = (delay = 0) => ({
  opacity: 0,
  transform: 'translateY(28px)',
  transition: `opacity 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,
               transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`,
})

/* ═══════════════════════════════════════════════════
   DESKTOP CATEGORY CARD
═══════════════════════════════════════════════════ */

const CategoryCard = memo(({ cat, coverPhoto, index, layout, onLoad }) => {
  const imgSrc = useMemo(() => {
    if (!coverPhoto?.url) return null
    return getResponsiveImageSources(coverPhoto.url, {
      widths: [480, 768],
      qualities: [72, 75],
      fallbackWidth: 768,
      fallbackQuality: 75,
    })
  }, [coverPhoto?.url])

  // Se não tem foto, avisa o pai que esse slot está "pronto"
  useEffect(() => {
    if (!imgSrc) onLoad?.()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgSrc])

  const desktopClass = {
    tall: 'md:row-span-2',
    wide: 'md:col-span-2',
    normal: '',
  }[layout] || ''

  return (
    <Link
      to={`/galeria/${cat.id}`}
      className={`group relative overflow-hidden rounded-2xl bg-dark-200 aspect-[3/4] ${desktopClass}`}
    >
      {imgSrc ? (
        <BlurImage
          src={imgSrc.src}
          srcSet={imgSrc.srcSet}
          sizes="(min-width: 768px) 30vw, 75vw"
          alt={cat.label}
          placeholder={coverPhoto?.placeholder}
          loading={index < 2 ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={onLoad}
          onError={onLoad}
          className="absolute inset-0 w-full h-full object-cover
                     transition-transform duration-700 ease-out
                     group-hover:scale-105 will-change-transform"
        />
      ) : (
        /* Skeleton quando sem foto */
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #1A1A1A 0%, #2E2E2E 50%, #1A1A1A 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite linear',
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5
                      translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
        <span className="inline-block font-body text-[9px] tracking-[0.25em] uppercase
                         text-gold/90 border border-gold/30 rounded-full
                         px-2.5 py-1 mb-2 bg-black/30 backdrop-blur-sm">
          {cat.tag}
        </span>
        <h3 className="font-display text-lg md:text-xl italic text-white leading-tight">
          {cat.label}
        </h3>
      </div>
      <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full
                      border border-white/20 bg-black/20 backdrop-blur-sm
                      flex items-center justify-center
                      opacity-0 group-hover:opacity-100
                      translate-y-1 group-hover:translate-y-0
                      transition-all duration-300">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2 10L10 2M10 2H4M10 2v6"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </Link>
  )
}, (prev, next) =>
  prev.coverPhoto?.url === next.coverPhoto?.url &&
  prev.coverPhoto?.placeholder === next.coverPhoto?.placeholder &&
  prev.cat.id === next.cat.id &&
  prev.onLoad === next.onLoad
)
CategoryCard.displayName = 'CategoryCard'

/* ═══════════════════════════════════════════════════
   MOBILE CAROUSEL CARD
═══════════════════════════════════════════════════ */

const MobileCarouselCard = memo(({ cat, coverPhoto, index }) => {
  const imgSrc = useMemo(() => {
    if (!coverPhoto?.url) return null
    return getResponsiveImageSources(coverPhoto.url, {
      widths: [320, 480],
      qualities: [70, 75],
      fallbackWidth: 480,
      fallbackQuality: 75,
    })
  }, [coverPhoto?.url])

  return (
    <Link
      to={`/galeria/${cat.id}`}
      className="group relative shrink-0 rounded-2xl overflow-hidden bg-dark-200"
      style={{
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        width: 'min(75vw, 260px)',
        aspectRatio: '3/4',
      }}
    >
      {imgSrc ? (
        <BlurImage
          src={imgSrc.src}
          srcSet={imgSrc.srcSet}
          sizes="75vw"
          alt={cat.label}
          placeholder={coverPhoto?.placeholder}
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover
                     transition-transform duration-500 group-active:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #1A1A1A 0%, #2E2E2E 50%, #1A1A1A 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite linear',
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="inline-block font-body text-[9px] tracking-[0.2em] uppercase
                         text-gold border border-gold/30 rounded-full px-2 py-0.5 mb-2
                         bg-black/30 backdrop-blur-sm">
          {cat.tag}
        </span>
        <h3 className="font-display text-lg italic text-white">{cat.label}</h3>
      </div>
      <div className="absolute top-3.5 left-3.5 font-body text-[10px] text-white/40 tracking-wider">
        {String(index + 1).padStart(2, '0')}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </Link>
  )
})
MobileCarouselCard.displayName = 'MobileCarouselCard'

/* ═══════════════════════════════════════════════════
   DEPOIMENTOS
═══════════════════════════════════════════════════ */
const DEPOIMENTOS = [
  {
    id: 1, nome: 'Ana Carolina', sessao: 'Ensaio de Grávida', estrelas: 5,
    texto: 'Isabel capturou exatamente o que eu queria: leveza, emoção e beleza. As fotos ficaram perfeitas, chorei quando vi o resultado!',
  },
  {
    id: 2, nome: 'Fernanda & Lucas', sessao: 'Casamento', estrelas: 5,
    texto: 'Desde o primeiro contato soubemos que era a fotógrafa certa. Atenção a cada detalhe, sensibilidade e profissionalismo impecável.',
  },
  {
    id: 3, nome: 'Mariana Silva', sessao: 'Ensaio Feminino', estrelas: 5,
    texto: 'Nunca me senti tão à vontade em um ensaio. Isabel tem o dom de deixar a gente natural e o resultado prova isso.',
  },
]

/* ═══════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════ */
export default function Home() {
  useReveal()
  const { categories, photos } = useGallery()
  const carouselRef = useRef(null)
  const [activeCard, setActiveCard] = useState(0)
  const [loadedCount, setLoadedCount] = useState(0)
  const gridRef = useRef(null)

  const handleCardLoad = useCallback(() => {
    setLoadedCount(c => c + 1)
  }, [])

  // Só mostra categorias que têm pelo menos 1 foto
  const categoriesWithPhotos = useMemo(
    () => categories.filter((cat) => photos[cat.id]?.length > 0),
    [categories, photos]
  )

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const onScroll = () => {
      const cardWidth = el.firstChild?.offsetWidth || 0
      setActiveCard(Math.round(el.scrollLeft / (cardWidth + 12)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Quando todos os cards do grid desktop carregarem, anima o grid inteiro
  useEffect(() => {
    const total = categoriesWithPhotos.slice(0, 7).length
    if (total === 0) return
    if (loadedCount < total) return

    const el = gridRef.current
    if (!el) return
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  }, [loadedCount, categoriesWithPhotos])

  const desktopLayouts = ['tall', 'normal', 'normal', 'tall', 'normal', 'normal', 'normal']

  return (
    <main>

      {/* ─────────────────────────────────────────────────────
          1 · HERO
      ───────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col justify-end pb-12 overflow-hidden
                          md:flex-row md:items-center md:justify-start md:pb-0">
        <div className="absolute inset-0">
          <img
            src={FotoIsabel}
            alt="Isabel Lucena Fotografia"
            className="w-full h-full object-cover object-top md:object-right"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/20 md:hidden" />
          <div className="hidden md:block absolute inset-0
                          bg-gradient-to-r from-dark via-dark/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 md:px-8 pt-24 md:pt-0">
          <div className="md:max-w-lg">
            <p
              data-reveal
              style={revealStyle(50)}
              className="font-body text-gold text-[10px] tracking-[0.4em] uppercase mb-4"
            >
              Isabel Lucena · Fotografia
            </p>

            <h1
              data-reveal
              style={{
                ...revealStyle(150),
                fontSize: 'clamp(2.6rem, 9vw, 5.5rem)',
                lineHeight: 1.05,
              }}
              className="font-display font-light text-white mb-5"
            >
              Capturando
              <br />
              <em className="not-italic font-semibold text-gold">Histórias</em>
              <br />
              Autênticas
            </h1>

            <p
              data-reveal
              style={revealStyle(250)}
              className="font-body text-white/55 text-sm md:text-base leading-relaxed mb-8 max-w-sm"
            >
              Cada imagem é uma promessa de que aquele momento não será esquecido.
            </p>

            <div data-reveal style={revealStyle(350)} className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/5587988449536"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                           bg-gold text-dark font-body font-semibold text-sm
                           transition-all duration-300 hover:brightness-110
                           active:scale-95 min-h-[44px] btn-arrow-hover"
              >
                Agendar sessão
                <ArrowRight size={14} className="arrow-icon" />
              </a>
              <button
                onClick={() => scrollTo('trabalhos-home')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                           border border-white/25 text-white/80 font-body text-sm
                           transition-all duration-300 hover:border-white/60 hover:text-white
                           active:scale-95 min-h-[44px]"
              >
                Ver trabalhos
              </button>
            </div>
          </div>
        </div>

        <div
          data-reveal
          style={revealStyle(500)}
          className="relative z-10 mx-5 mt-8 md:hidden"
        >
          <div className="inline-flex items-center gap-3
                          bg-white/8 backdrop-blur-md border border-white/10
                          rounded-2xl px-4 py-3">
            <div>
              <p className="font-display font-semibold text-2xl text-gold leading-none">+500</p>
              <p className="font-body text-[11px] text-white/50 mt-0.5">histórias capturadas</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="font-display font-semibold text-2xl text-gold leading-none">7</p>
              <p className="font-body text-[11px] text-white/50 mt-0.5">anos de experiência</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => scrollTo('trabalhos-home')}
          aria-label="Scroll para baixo"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10
                     text-white/30 hover:text-gold transition-colors
                     hidden md:flex flex-col items-center gap-1.5"
        >
          <span className="font-body text-[10px] tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </button>
      </section>


      {/* ─────────────────────────────────────────────────────
          2 · TRABALHOS — CategoryCard com BlurImage
      ───────────────────────────────────────────────────── */}
      <section id="trabalhos-home" className="py-14 md:py-24 bg-dark overflow-hidden">
        <div className="max-w-6xl mx-auto">

          <div className="px-5 md:px-8 flex items-end justify-between gap-4 mb-8 md:mb-10">
            <div>
              <p
                data-reveal
                style={revealStyle(0)}
                className="font-body text-gold text-[10px] tracking-[0.3em] uppercase mb-2"
              >
                Portfólio
              </p>
              <h2
                data-reveal
                style={{
                  ...revealStyle(80),
                  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                }}
                className="font-display font-light text-white"
              >
                Meus{' '}
                <em className="not-italic font-semibold text-gold">trabalhos</em>
              </h2>
            </div>

            <Link
              data-reveal
              style={revealStyle(120)}
              to="/trabalhos"
              className="shrink-0 inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full
                         border border-white/20 text-white/60 font-body text-xs md:text-sm
                         transition-all duration-300 hover:border-gold/50 hover:text-white
                         min-h-[44px] btn-arrow-hover"
            >
              Ver todos
              <ArrowRight size={14} className="arrow-icon" />
            </Link>
          </div>

          {categoriesWithPhotos.length > 0 && (
            <>
              {/* ── MOBILE: Carrossel ── */}
              <div className="md:hidden relative">
                <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-14 z-10
                                bg-gradient-to-l from-dark to-transparent" />

                <div
                  ref={carouselRef}
                  className="flex gap-3 px-5 pb-3 overflow-x-auto"
                  style={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {categoriesWithPhotos.slice(0, 7).map((cat, i) => (
                    <MobileCarouselCard
                      key={cat.id}
                      cat={cat}
                      coverPhoto={photos[cat.id]?.[0]}
                      index={i}
                    />
                  ))}

                  <Link
                    to="/trabalhos"
                    className="shrink-0 rounded-2xl border border-white/10 bg-dark-200
                               flex flex-col items-center justify-center gap-4 btn-arrow-hover"
                    style={{
                      scrollSnapAlign: 'start',
                      width: 'min(55vw, 180px)',
                      aspectRatio: '3/4',
                    }}
                  >
                    <div className="w-11 h-11 rounded-full border border-gold/40
                                    flex items-center justify-center text-gold">
                      <ArrowRight size={16} className="arrow-icon" />
                    </div>
                    <p className="font-body text-xs text-white/40 text-center px-4 leading-snug">
                      Ver todos<br />os trabalhos
                    </p>
                  </Link>
                </div>

                <div className="flex justify-center gap-1.5 mt-4 px-5">
                  {categoriesWithPhotos.slice(0, 7).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const el = carouselRef.current
                        if (!el) return
                        const cardWidth = el.firstChild?.offsetWidth || 0
                        el.scrollTo({ left: i * (cardWidth + 12), behavior: 'smooth' })
                      }}
                      className={`rounded-full transition-all duration-300 min-w-[8px] min-h-[8px]
                        ${activeCard === i
                          ? 'bg-gold w-5 h-2'
                          : 'bg-white/20 w-2 h-2 hover:bg-white/40'
                        }`}
                      aria-label={`Ir para ${categoriesWithPhotos[i]?.label}`}
                    />
                  ))}
                </div>
              </div>

              {/* ── DESKTOP: Grid editorial ── */}
              <div className="hidden md:block px-8">
                <div
                  ref={gridRef}
                  style={{
                    gridTemplateRows: 'repeat(3, 180px)',
                    opacity: 0,
                    transform: 'translateY(28px)',
                    transition: 'opacity 0.7s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)',
                  }}
                  className="grid grid-cols-3 gap-3"
                >
                  {categoriesWithPhotos.slice(0, 7).map((cat, i) => (
                    <CategoryCard
                      key={cat.id}
                      cat={cat}
                      coverPhoto={photos[cat.id]?.[0]}
                      index={i}
                      layout={desktopLayouts[i]}
                      onLoad={handleCardLoad}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────
          3 · SOBRE
      ───────────────────────────────────────────────────── */}
      <section className="py-14 md:py-24 bg-dark-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16">

            <div
              data-reveal
              style={revealStyle(0)}
              className="relative w-[75%] max-w-[320px] mx-auto md:mx-0 md:w-[42%] shrink-0"
            >
              <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-gold/10">
                <img
                  src={FotoIsabel2}
                  alt="Isabel Lucena"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24
                              rounded-2xl border border-gold/20 -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16
                              rounded-xl bg-gold/5 border border-gold/15 -z-10" />
              <div className="absolute -bottom-2 left-6
                              bg-dark border border-gold/25 rounded-2xl px-4 py-3 shadow-xl">
                <p className="font-display font-semibold text-xl text-gold leading-none">7+</p>
                <p className="font-body text-[10px] text-white/50 mt-0.5 tracking-wide">anos de experiência</p>
              </div>
            </div>

            <div className="flex-1">
              <p data-reveal style={revealStyle(80)}
                className="font-body text-gold text-[10px] tracking-[0.3em] uppercase mb-3">
                Sobre mim
              </p>
              <h2
                data-reveal
                style={{
                  ...revealStyle(120),
                  fontSize: 'clamp(1.7rem, 4.5vw, 2.8rem)',
                }}
                className="font-display font-light text-white leading-tight mb-5"
              >
                Apaixonada por <br />
                <em className="not-italic font-semibold text-gold">contar histórias</em>
                <br />com a câmera
              </h2>

              <p data-reveal style={revealStyle(180)}
                className="font-body text-white/55 text-sm md:text-base leading-relaxed mb-4">
                Sou Isabel Lucena, fotógrafa baseada em São José do Egito, Pernambuco. Com mais de 7 anos de experiência,
                especializo-me em transformar momentos únicos em memórias eternas.
              </p>
              <p data-reveal style={revealStyle(220)}
                className="font-body text-white/40 text-sm leading-relaxed mb-8">
                Cada sessão é planejada com atenção aos mínimos detalhes — da iluminação ao pós-processamento —
                para entregar imagens que te fazem sentir a emoção novamente.
              </p>

              <div data-reveal style={revealStyle(280)}>
                <a
                  href="https://wa.me/5587988449536"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                             bg-gold text-dark font-body font-semibold text-sm
                             transition-all duration-300 hover:brightness-110
                             active:scale-95 min-h-[44px] btn-arrow-hover"
                >
                  Falar com Isabel
                  <ArrowRight size={14} className="arrow-icon" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────
          4 · DEPOIMENTOS
      ───────────────────────────────────────────────────── */}
      <section className="py-14 md:py-24 bg-dark overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 md:px-8">

          <div className="text-center mb-10 md:mb-14">
            <p data-reveal style={revealStyle(0)}
              className="font-body text-gold text-[10px] tracking-[0.3em] uppercase mb-2">
              Depoimentos
            </p>
            <h2
              data-reveal
              style={{
                ...revealStyle(80),
                fontSize: 'clamp(1.7rem, 4.5vw, 2.8rem)',
              }}
              className="font-display font-light text-white"
            >
              O que dizem{' '}
              <em className="not-italic font-semibold text-gold">minhas clientes</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {DEPOIMENTOS.map((dep, i) => (
              <div
                key={dep.id}
                data-reveal
                style={revealStyle(i * 100)}
                className="bg-dark-100 border border-dark-300 rounded-2xl p-6 md:p-7
                           flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: dep.estrelas }).map((_, j) => (
                    <svg key={j} width="13" height="13" viewBox="0 0 24 24" fill="#C9A96E">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="font-body text-white/65 text-sm leading-relaxed flex-1">
                  "{dep.texto}"
                </p>
                <div className="flex items-center gap-3 pt-1 border-t border-dark-300">
                  <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/25
                                  flex items-center justify-center shrink-0">
                    <span className="font-display text-gold text-sm font-semibold">
                      {dep.nome[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-body text-white text-sm font-medium">{dep.nome}</p>
                    <p className="font-body text-white/35 text-xs">{dep.sessao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────
          5 · CTA FINAL
      ───────────────────────────────────────────────────── */}
      <section className="py-14 md:py-24 bg-dark-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-dark-200 border border-dark-300 p-8 md:p-14">

            <div className="absolute inset-0 opacity-15">
              <img src={FotoIsabel3} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-dark-200/90 via-dark-200/70 to-dark-200/95" />

            <div className="absolute top-0 left-0 w-40 h-40 rounded-br-full
                            bg-gold/5 border-b border-r border-gold/15" />

            <div className="relative z-10 text-center max-w-xl mx-auto">
              <p data-reveal style={revealStyle(0)}
                className="font-body text-gold text-[10px] tracking-[0.3em] uppercase mb-3">
                Vamos criar juntos
              </p>
              <h2
                data-reveal
                style={{
                  ...revealStyle(80),
                  fontSize: 'clamp(1.7rem, 5vw, 3rem)',
                }}
                className="font-display font-light text-white mb-4"
              >
                Pronta para preservar{' '}
                <em className="not-italic font-semibold text-gold">seus momentos?</em>
              </h2>
              <p data-reveal style={revealStyle(160)}
                className="font-body text-white/50 text-sm leading-relaxed mb-8">
                Entre em contato e vamos conversar sobre a sessão dos seus sonhos.
              </p>
              <div data-reveal style={revealStyle(240)} className="flex flex-wrap gap-3 justify-center">
                <a
                  href="https://wa.me/5587988449536"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                             bg-gold text-dark font-body font-semibold text-sm
                             transition-all duration-300 hover:brightness-110
                             active:scale-95 min-h-[44px] btn-arrow-hover"
                >
                  Agendar sessão
                  <ArrowRight size={14} className="arrow-icon" />
                </a>
                <Link
                  to="/trabalhos"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                             border border-white/20 text-white/70 font-body text-sm
                             transition-all duration-300 hover:border-white/50 hover:text-white
                             active:scale-95 min-h-[44px]"
                >
                  Ver portfólio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}