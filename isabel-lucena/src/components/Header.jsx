import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import LogoBranca from '../assets/Logo-horzontal-branca.svg';

// Ícone da câmera simples em SVG inline
const CameraIcon = () => (
  <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 2L7.5 5H3C1.9 5 1 5.9 1 7V19C1 20.1 1.9 21 3 21H25C26.1 21 27 20.1 27 19V7C27 5.9 26.1 5 25 5H20.5L18 2H10Z"
      stroke="#C9A96E" strokeWidth="1.5" fill="none"
    />
    <circle cx="14" cy="13" r="5" stroke="#C9A96E" strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="13" r="2" fill="#C9A96E" />
  </svg>
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha menu ao trocar de rota
  useEffect(() => setMenuOpen(false), [location]);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Trabalhos', to: '/trabalhos' },
    { label: 'Blog', to: '/blog' },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500 ease-in-out
          ${scrolled
            ? 'py-3 bg-dark/90 backdrop-blur-md shadow-[0_2px_40px_rgba(0,0,0,0.6)]'
            : 'py-5 bg-transparent'
          }
        `}
        style={{ animation: 'fadeInDown 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards' }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={LogoBranca} alt="Isabel Lucena" className="h-10 object-contain" />
          </Link>

          {/* ── Nav desktop ── */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`
                  font-body text-sm tracking-wide relative pb-0.5
                  transition-colors duration-300
                  after:absolute after:bottom-0 after:left-0 after:h-px after:bg-gold
                  after:transition-all after:duration-300
                  ${isActive(to)
                    ? 'text-gold after:w-full'
                    : 'text-white/80 hover:text-white after:w-0 hover:after:w-full'
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── CTA ── */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://wa.me/5587988449536"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              Entrar em contato
              <span className="btn-arrow text-gold">→</span>
            </a>
          </div>

          {/* ── Menu hamburger mobile ── */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 group"
            aria-label="Abrir menu"
          >
            <span className={`block w-6 h-px bg-gold transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 -translate-x-2' : ''}`} />
            <span className={`block w-6 h-px bg-gold transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div
        className={`
          fixed inset-0 z-40 bg-dark/98 backdrop-blur-md
          flex flex-col items-center justify-center gap-8
          transition-all duration-500
          md:hidden
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {navLinks.map(({ label, to }, i) => (
          <Link
            key={to}
            to={to}
            className="font-display text-4xl font-light text-white hover:text-gold transition-colors duration-300"
            style={{
              transitionDelay: `${i * 60}ms`,
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'none' : 'translateY(20px)',
              transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms, color 0.3s`,
            }}
          >
            {label}
          </Link>
        ))}
        <a
          href="https://wa.me/5587988449536"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4"
          style={{ transitionDelay: `${navLinks.length * 60}ms` }}
        >
          Entrar em contato <span className="btn-arrow text-gold">→</span>
        </a>
      </div>
    </>
  );
}
