import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, User, Calendar } from 'lucide-react'
import { supabaseAnonRead } from '../lib/supabase'
import FotoIsabel from '../assets/foto-isabel.webp'
import FotoIsabel2 from '../assets/Foto-isabel-2.webp'
import FotoIsabel3 from '../assets/Foto-isabel3.webp'
import trabalhoContainer from '../assets/trabalho-container.webp'

/* ═══════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════ */

function useReveal(ref, deps = []) {
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
  }, [ref, ...deps])
}

const revealStyle = (delay = 0) => ({
  opacity: 0,
  transform: 'translateY(28px)',
  transition: `opacity 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,
               transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`,
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const getOptimizedAuthorPhoto = (url) => {
  if (!url) return ''
  if (!url.includes('/storage/v1/object/public/blog-images/')) return url

  const baseUrl = url.replace('/storage/v1/object/public/blog-images/', '/storage/v1/render/image/public/blog-images/')
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}width=160&height=160&quality=100&resize=cover`
}

/* ═══════════════════════════════════════════════════
   BLOG CARD
═══════════════════════════════════════════════════ */

function BlogCard({ post, delay }) {
  const authorName = post.blog_authors?.nome || 'Isabel Lucena Fotografia'
  const authorRole = post.blog_authors?.profissao || ''
  const authorPhoto = getOptimizedAuthorPhoto(post.blog_authors?.foto_url || '')

  return (
    <Link
      to={`/blog/${post.slug}`}
      data-reveal
      style={revealStyle(delay)}
      className="group flex flex-col rounded-2xl overflow-hidden bg-dark-200 border border-dark-300
             transition-all duration-500 hover:scale-[1.02] hover:border-gold/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={post.imagem_capa}
          alt={post.titulo}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Date badge */}
        <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px]
                         font-body px-2 py-1 rounded-full flex items-center gap-1">
          <Calendar size={10} />
          {formatDate(post.created_at)}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-body font-bold text-white text-sm leading-snug line-clamp-2">
          {post.titulo}
        </h3>
        <p className="font-body text-white/50 text-xs leading-relaxed flex-1 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Author row */}
        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-dark-300">
          {authorPhoto ? (
            <img
              src={authorPhoto}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover border border-white/20 group-hover:border-gold/70 transition-colors shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-dark-300 border border-white/20 group-hover:border-gold/70 transition-colors flex items-center justify-center shrink-0">
              <User size={12} className="text-white/50" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-body text-white/70 text-xs truncate">{authorName}</p>
            {authorRole && (
              <p className="font-body text-white/45 text-[11px] truncate">{authorRole}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */

export default function Blog() {
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const pageRef = useRef(null)
  useReveal(pageRef, [posts.length, loading, query])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabaseAnonRead
          .from('blog_posts')
          .select('*, blog_authors(nome, profissao, foto_url)')
          .eq('ativo', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setPosts(data || [])
      } catch (err) {
        console.error('Erro ao carregar posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filtered = posts.filter((p) => {
    const q = query.toLowerCase()
    return p.titulo.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
  })

  return (
    <main ref={pageRef} className="min-h-screen bg-dark">

      {/* ─────────────────────────────────────────────────────
          1 · HERO (Baseado em Trabalhos)
      ───────────────────────────────────────────────────── */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end overflow-hidden">
        <img
          src={trabalhoContainer}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
          <h1 className="font-display text-4xl md:text-5xl italic text-white">Meu Blog</h1>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          2 · SEARCH BAR (sem faixa cinza)
      ───────────────────────────────────────────────────── */}
      <section className="py-8 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 md:justify-between">
            <p className="font-body text-white/70 text-sm leading-relaxed">
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
                placeholder="Buscar posts"
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
      <section className="py-12 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-20">
              <p className="font-body text-white/40 text-sm">Carregando posts...</p>
            </div>
          ) : filtered.length > 0 ? (
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
              <p className="font-body text-white/40 text-sm">
                {query ? 'Nenhum post encontrado.' : 'Nenhum post publicado ainda.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          4 · CTA FINAL
      ───────────────────────────────────────────────────── */}
      <section className="py-14 md:py-24 bg-dark-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
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
