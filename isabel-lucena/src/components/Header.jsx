import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import LogoBranca from '../assets/Logo-horzontal-branca.webp'
import LogoPreta from '../assets/Logo-horzontal-preta.webp'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Trabalhos', to: '/trabalhos' },
  { label: 'Blog', to: '/blog' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Detecta scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Fecha menu ao navegar
  useEffect(() => setMenuOpen(false), [location])

  // Bloqueia scroll do body quando menu aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isDashboard = location.pathname.startsWith('/dashboard')
  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <>
      {/* ── Barra de navegação ── */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500
          ${scrolled
            ? 'py-3 bg-dark/90 backdrop-blur-xl shadow-[0_1px_40px_rgba(0,0,0,0.5)]'
            : 'py-4 md:py-5 bg-transparent'
          }
        `}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="relative z-10 flex items-center">
            <img
              src={isDashboard ? LogoPreta : LogoBranca}
              alt="Isabel Lucena Fotografia"
              className="h-7 md:h-9 w-auto object-contain"
              loading="eager"
            />
          </Link>

          {/* Nav links — apenas desktop */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`
                  relative font-body text-sm tracking-wide pb-0.5
                  transition-colors duration-250
                  after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-gold
                  after:transition-all after:duration-300
                  ${isActive(to)
                    ? 'text-gold after:w-full'
                    : 'text-white/70 hover:text-white after:w-0 hover:after:w-full'
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA desktop */}
          <a
            href="https://wa.me/5587988449536"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2
                       px-5 py-2.5 rounded-full
                       border border-white/20 text-white/80 font-body text-sm
                       transition-all duration-300
                       hover:bg-gold hover:border-gold hover:text-dark
                       active:scale-95 btn-arrow-hover"
          >
            Contato
            <ArrowRight size={14} className="arrow-icon" />
          </a>

          {/* Botão hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            className="md:hidden relative z-10 w-11 h-11 flex flex-col items-center justify-center gap-[5px]"
          >
            <span className={`block h-[1.5px] bg-gold origin-center transition-all duration-350
              ${menuOpen ? 'w-5 rotate-45 translate-y-[6.5px]' : 'w-5'}`} />
            <span className={`block h-[1.5px] bg-white transition-all duration-350
              ${menuOpen ? 'w-0 opacity-0' : 'w-4'}`} />
            <span className={`block h-[1.5px] bg-gold origin-center transition-all duration-350
              ${menuOpen ? 'w-5 -rotate-45 -translate-y-[6.5px]' : 'w-5'}`} />
          </button>

        </div>
      </header>


      {/* ── Overlay escuro ── */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`
          fixed inset-0 z-40 bg-dark/70 backdrop-blur-sm md:hidden
          transition-opacity duration-400
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />


      {/* ── Drawer — desliza da direita ── */}
      <aside
        aria-hidden={!menuOpen}
        className={`
          fixed top-0 right-0 bottom-0 z-40
          w-[min(80vw,300px)]
          bg-[#111111] border-l border-white/8
          flex flex-col md:hidden
          transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Topo do drawer */}
        <div className="flex items-center px-6 pt-7 pb-5 border-b border-white/8">
          <img src={LogoBranca} alt="Isabel Lucena" className="h-7 w-auto" />
        </div>

        {/* Links com animação de entrada em cascata */}
        <nav className="flex flex-col px-3 pt-4 gap-0.5 flex-1">
          {NAV_LINKS.map(({ label, to }, i) => (
            <Link
              key={to}
              to={to}
              className={`
                flex items-center gap-3.5 px-4 py-4 rounded-xl
                font-body text-base transition-all duration-200
                min-h-[52px]
                ${isActive(to)
                  ? 'text-gold bg-gold/8'
                  : 'text-white/65 hover:text-white hover:bg-white/5'
                }
              `}
              style={{
                transitionDelay: menuOpen ? `${i * 50 + 60}ms` : '0ms',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'none' : 'translateX(12px)',
                transition: `opacity 0.3s ease ${i * 50 + 60}ms,
                             transform 0.3s ease ${i * 50 + 60}ms,
                             background-color 0.15s, color 0.15s`,
              }}
            >
              {/* Indicador lateral */}
              <span className={`w-[3px] h-5 rounded-full transition-colors duration-200
                ${isActive(to) ? 'bg-gold' : 'bg-white/10'}`} />
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA no rodapé do drawer */}
        <div
          className="px-5 pb-10 pt-5 border-t border-white/8"
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'none' : 'translateY(8px)',
            transition: `opacity 0.35s ease ${NAV_LINKS.length * 50 + 120}ms,
                         transform 0.35s ease ${NAV_LINKS.length * 50 + 120}ms`,
          }}
        >
          <a
            href="https://wa.me/5587988449536"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2
                       py-4 rounded-2xl
                       bg-gold text-dark font-body font-semibold text-sm
                       transition-all duration-250 active:scale-95 min-h-[52px] btn-arrow-hover"
          >
            Falar no WhatsApp
            <ArrowRight size={14} className="arrow-icon" />
          </a>
          <p className="font-body text-[11px] text-white/20 text-center mt-4">
            São José do Egito · PE
          </p>
        </div>
      </aside>
    </>
  )
}
