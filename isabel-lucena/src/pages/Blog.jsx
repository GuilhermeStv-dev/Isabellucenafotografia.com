import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, User } from 'lucide-react'
import FotoIsabel from '../assets/foto-isabel.webp'
import FotoIsabel2 from '../assets/Foto-isabel-2.webp'
import FotoIsabel3 from '../assets/Foto-isabel3.webp'
import FotoIsabel4 from '../assets/Foto-Isabel4.webp'
import FotoGravida from '../assets/foto-gravida1.webp'

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
   STATIC DATA
═══════════════════════════════════════════════════ */

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Motivos para fazer um ensaio comigo',
    excerpt:
      'Se você está buscando uma maneira de eternizar momentos únicos com autenticidade e sensibilidade, um ensaio fotográfico personalizado é a escolha certa...',
    date: '20/12/24',
    image: FotoIsabel,
    author: 'Isabel Lucena Fotografia',
  },
  {
    id: 2,
    title: 'Como se preparar para o seu ensaio gestante',
    excerpt:
      'A gestação é uma das fases mais especiais da vida. Separei dicas essenciais de roupa, postura e local para você arrasar nas fotos e guardar essa memória...',
    date: '10/11/24',
    image: FotoGravida,
    author: 'Isabel Lucena Fotografia',
  },
  {
    id: 3,
    title: 'Os melhores locais para ensaios ao ar livre em Petrolina',
    excerpt:
      'Petrolina tem cenários incríveis para ensaios externos. Conheça os meus lugares favoritos e como aproveitar a luz natural do sertão para fotos deslumbrantes...',
    date: '05/10/24',
    image: FotoIsabel2,
    author: 'Isabel Lucena Fotografia',
  },
  {
    id: 4,
    title: 'Por que investir em fotografia profissional para sua família',
    excerpt:
      'Fotos de família são um patrimônio afetivo que atravessa gerações. Descubra por que contratar uma fotógrafa profissional faz toda a diferença no resultado final...',
    date: '18/09/24',
    image: FotoIsabel4,
    author: 'Isabel Lucena Fotografia',
  },
]

/* ═══════════════════════════════════════════════════
   BLOG CARD
═══════════════════════════════════════════════════ */

function BlogCard({ post, delay }) {
  return (
    <article
      data-reveal
      style={revealStyle(delay)}
      className="group flex flex-col rounded-2xl overflow-hidden bg-dark-200 border border-dark-300
                 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Date badge */}
        <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px]
                         font-body px-2 py-1 rounded-full">
          {post.date}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-body font-bold text-white text-sm leading-snug">
          {post.title}
        </h3>
        <p className="font-body text-white/50 text-xs leading-relaxed flex-1">
          {post.excerpt}
        </p>

        {/* Author row */}
        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-dark-300">
          <div className="w-6 h-6 rounded-full bg-dark-300 flex items-center justify-center shrink-0">
            <User size={12} className="text-white/50" />
          </div>
          <span className="font-body text-white/50 text-xs">{post.author}</span>
        </div>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */

export default function Blog() {
  const [query, setQuery] = useState('')
  const pageRef = useRef(null)
  useReveal(pageRef)

  const filtered = BLOG_POSTS.filter((p) => {
    const q = query.toLowerCase()
    return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
  })

  return (
    <main ref={pageRef} className="min-h-screen bg-dark">

      {/* ─────────────────────────────────────────────────────
          1 · HERO
      ───────────────────────────────────────────────────── */}
      <section className="relative w-full h-[40vh] md:h-[45vh] overflow-hidden">
        <img
          src={FotoIsabel}
          alt="Meu Blog"
          className="absolute inset-0 w-full h-full object-cover object-top"
          loading="eager"
          decoding="async"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/20" />

        {/* Title */}
        <div className="absolute bottom-8 left-0 right-0 px-5 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h1
              className="font-display italic text-white leading-none"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
            >
              Meu Blog
            </h1>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          2 · SUBTITLE + SEARCH
      ───────────────────────────────────────────────────── */}
      <section className="bg-dark-100 border-b border-dark-300 py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <p className="font-body text-white/70 text-sm leading-relaxed flex-1">
              Dicas e inspirações para planejar o seu ensaio dos sonhos
            </p>
            {/* Search */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar"
                className="w-full bg-dark-200 border border-white/15 text-white text-sm
                           font-body rounded-full pl-9 pr-4 py-2.5
                           placeholder:text-white/40 focus:outline-none focus:border-gold/50
                           transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          3 · BLOG CARDS GRID
      ───────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-dark">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((post, i) => (
                <BlogCard key={post.id} post={post} delay={i * 80} />
              ))}
            </div>
          ) : (
            <div
              data-reveal
              style={revealStyle(0)}
              className="text-center py-20"
            >
              <p className="font-body text-white/40 text-sm">Nenhum post encontrado.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          4 · CTA FINAL
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
              <p
                data-reveal
                style={revealStyle(0)}
                className="font-body text-gold text-[10px] tracking-[0.3em] uppercase mb-3"
              >
                Vamos criar juntos
              </p>
              <h2
                data-reveal
                style={{
                  ...revealStyle(80),
                  fontSize: 'clamp(1.7rem, 5vw, 3rem)',
                }}
                className="font-display font-light text-white leading-[1.08] md:leading-[1.06] mb-4"
              >
                Pronta para preservar{' '}
                <em className="not-italic font-semibold text-gold whitespace-nowrap">seus momentos?</em>
              </h2>
              <p
                data-reveal
                style={revealStyle(160)}
                className="font-body text-white/50 text-sm leading-relaxed mb-8"
              >
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
                  <span className="arrow-icon" style={{ display: 'inline-block', transition: 'transform 0.7s ease-out' }}>
                    <ArrowRight size={14} />
                  </span>
                </a>
                <Link
                  to="/trabalhos"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                             border-2 border-white/20 text-white/70 font-body text-sm
                             transition-all duration-300 hover:border-gold/80 hover:text-white
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
