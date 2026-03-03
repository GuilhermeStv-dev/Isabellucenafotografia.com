import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, ArrowRight, MessageCircle, Instagram, Copy, Check } from 'lucide-react'
import { supabaseAnonRead } from '../lib/supabase'

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [shareFeedback, setShareFeedback] = useState('')

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = post ? `${post.titulo} - ${currentUrl}` : currentUrl
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  const copyLink = async (message = 'Link copiado!') => {
    if (!currentUrl) return
    try {
      await navigator.clipboard.writeText(currentUrl)
      setShareFeedback(message)
      setTimeout(() => setShareFeedback(''), 2500)
    } catch {
      setShareFeedback('Não foi possível copiar o link.')
      setTimeout(() => setShareFeedback(''), 2500)
    }
  }

  const handleInstagramShare = async () => {
    await copyLink('Link copiado! Cole no Instagram.')
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Buscar post atual com autor
        const { data, error } = await supabaseAnonRead
          .from('blog_posts')
          .select('*, blog_authors(id, nome, profissao, foto_url, bio)')
          .eq('slug', slug)
          .eq('ativo', true)
          .single()

        if (error) throw error
        
        if (!data) {
          navigate('/blog')
          return
        }

        setPost(data)

        // Buscar posts relacionados (3 mais recentes, excluindo o atual)
        const { data: related } = await supabaseAnonRead
          .from('blog_posts')
          .select('id, titulo, slug, excerpt, imagem_capa, created_at')
          .eq('ativo', true)
          .neq('id', data.id)
          .order('created_at', { ascending: false })
          .limit(3)

        setRelatedPosts(related || [])
      } catch (err) {
        console.error('Erro ao carregar post:', err)
        navigate('/blog')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug, navigate])

  if (loading) {
    return (
      <main className="min-h-screen bg-dark flex items-center justify-center">
        <p className="font-body text-white/40 text-sm">Carregando...</p>
      </main>
    )
  }

  if (!post) {
    return null
  }

  return (
    <main className="min-h-screen bg-dark">
      
      {/* Header com imagem de capa */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={post.imagem_capa}
          alt={post.titulo}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/30" />
        
        {/* Botão voltar */}
        <Link
          to="/blog"
          className="absolute top-6 left-6 bg-black/40 backdrop-blur-sm hover:bg-black/60
                     text-white px-4 py-2 rounded-full text-sm font-body flex items-center gap-2
                     transition-all duration-300 z-10"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </section>

      {/* Conteúdo do post */}
      <article className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        
        {/* Card do post */}
        <div className="bg-dark-200 border border-dark-300 rounded-3xl p-8 md:p-12 shadow-2xl">
          
          {/* Meta informações */}
          <div className="flex flex-wrap items-center gap-4 text-white/50 text-xs mb-6 pb-6 border-b border-dark-300">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gold" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            {post.blog_authors && (
              <div className="flex items-center gap-2">
                <User size={14} className="text-gold" />
                <span>{post.blog_authors.nome}</span>
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-6 leading-tight">
            {post.titulo}
          </h1>

          {/* Excerpt */}
          <p className="font-body text-lg text-white/70 leading-relaxed mb-8 pb-8 border-b border-dark-300">
            {post.excerpt}
          </p>

          {/* Compartilhar */}
          <div className="mb-8 pb-8 border-b border-dark-300">
            <p className="font-body text-xs text-white/50 tracking-widest uppercase mb-3">Compartilhar</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold min-h-[42px]"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
              <button
                type="button"
                onClick={handleInstagramShare}
                className="btn-outline min-h-[42px]"
              >
                <Instagram size={14} />
                Instagram
              </button>
              <button
                type="button"
                onClick={() => copyLink('Link copiado com sucesso!')}
                className="btn-outline min-h-[42px]"
              >
                <Copy size={14} />
                Copiar link
              </button>
            </div>
            {shareFeedback && (
              <p className="font-body text-xs text-gold mt-3 inline-flex items-center gap-1.5">
                <Check size={12} />
                {shareFeedback}
              </p>
            )}
          </div>

          {/* Conteúdo HTML */}
          <div 
            className="prose prose-invert prose-gold max-w-none
                       prose-headings:font-display prose-headings:text-white
                       prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                       prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                       prose-p:font-body prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-4
                       prose-strong:text-gold prose-strong:font-semibold
                       prose-a:text-gold prose-a:no-underline hover:prose-a:underline
                       prose-ul:my-6 prose-li:text-white/80 prose-li:mb-2
                       prose-img:rounded-2xl prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: post.conteudo }}
          />

          {/* About the Author */}
          {post.blog_authors && (
            <div className="mt-12 pt-8 border-t border-dark-300">
              <h3 className="font-display text-xl text-white mb-6">Sobre o Autor</h3>
              <div className="flex gap-6 items-start">
                {post.blog_authors.foto_url && (
                  <img
                    src={post.blog_authors.foto_url}
                    alt={post.blog_authors.nome}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gold/20 shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-display text-lg text-gold">{post.blog_authors.nome}</h4>
                  {post.blog_authors.profissao && (
                    <p className="font-body text-sm text-white/70 mb-2">{post.blog_authors.profissao}</p>
                  )}
                  {post.blog_authors.bio && (
                    <p className="font-body text-sm text-white/60">{post.blog_authors.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA de contato */}
        <div className="mt-12 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-8 text-center">
          <p className="font-body text-gold text-xs tracking-widest uppercase mb-3">
            Gostou do que viu?
          </p>
          <h3 className="font-display text-2xl md:text-3xl text-white mb-4">
            Vamos agendar seu ensaio?
          </h3>
          <p className="font-body text-white/60 text-sm mb-6 max-w-md mx-auto">
            Entre em contato e vamos criar memórias incríveis juntos
          </p>
          <a
            href="https://wa.me/5587988449536"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                       bg-gold text-dark font-body font-semibold text-sm
                       transition-all duration-300 hover:brightness-110 active:scale-95"
          >
            Falar no WhatsApp
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Posts relacionados */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 mb-20">
            <h3 className="font-display text-2xl text-white mb-8">Continue lendo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group block rounded-2xl overflow-hidden bg-dark-200 border border-dark-300
                             hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={related.imagem_capa}
                      alt={related.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-body font-bold text-white text-sm mb-2 line-clamp-2">
                      {related.titulo}
                    </h4>
                    <p className="font-body text-white/50 text-xs line-clamp-2">
                      {related.excerpt}
                    </p>
                    <div className="mt-3 pt-3 border-t border-dark-300">
                      <span className="text-xs text-white/40">
                        {formatDate(related.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  )
}
