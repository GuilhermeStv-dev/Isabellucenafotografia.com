import { Link, useLocation } from 'react-router-dom';
import LogoBranca from '../assets/Logo-horzontal-branca.svg';
import LogoPreta from '../assets/Logo-horzontal-preta.svg';

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.2a8.16 8.16 0 004.77 1.52V7.27a4.85 4.85 0 01-1-.58z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const scrollToTop = () => {
  const hero = document.getElementById('hero');
  if (hero) {
    hero.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

export default function Footer() {
  const navLinks = [
    { label: 'Trabalhos', to: '/trabalhos' },
    { label: 'Sobre mim', to: '/sobre' },
    { label: 'Serviços', to: '/servicos' },
    { label: 'Destaques', to: '/destaques' },
    { label: 'Meu Blog', to: '/blog' },
  ];

  const socialLinks = [
    { label: 'Tiktok', href: 'https://tiktok.com/@isabeltravassos', icon: <TikTokIcon /> },
    { label: 'Instagram', href: 'https://instagram.com/isabeltravassos', icon: <InstagramIcon /> },
  ];

  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <footer className="bg-dark-100 border-t border-dark-300 pt-14 pb-8 font-body">
      <div className="max-w-6xl mx-auto px-6">
        {/* ── Linha superior: logo | contato | nav | social | back-to-top ── */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto] gap-10 md:gap-8 items-start">

          {/* Logo */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <img src={isDashboard ? LogoPreta : LogoBranca} alt="Isabel Lucena" className="max-h-10 w-auto object-contain" />
            </div>
          </div>

          {/* Contato */}
          <div className="flex flex-col gap-2 md:pl-8">
            <a
              href="tel:+5587988449536"
              className="text-sm text-white/70 hover:text-gold transition-colors duration-300"
            >
              (87) 9 8844-9536
            </a>
            <a
              href="mailto:isabeltravassos2015@gmail.com"
              className="text-sm text-white/70 hover:text-gold transition-colors duration-300"
            >
              isabeltravassos2015@gmail.com
            </a>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-2">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-white/70 hover:text-gold transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Social links */}
          <div className="flex flex-col gap-2">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-gold transition-colors duration-300 group"
              >
                <span className="text-gold/60 group-hover:text-gold transition-colors duration-300">
                  {icon}
                </span>
                {label}
              </a>
            ))}
          </div>

          {/* Back to top */}
          <div className="flex items-start justify-end">
            <button
              onClick={scrollToTop}
              aria-label="Voltar ao topo"
              className="
                w-12 h-12 rounded-full border border-gold/40
                flex items-center justify-center
                text-gold hover:bg-gold hover:text-dark
                hover:shadow-[0_4px_20px_rgba(201,169,110,0.35)]
                transition-all duration-300
                active:scale-95
                group
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Divisor ── */}
        <div className="mt-10 mb-6 border-t border-dark-300" />

        {/* ── Copyright ── */}
        <p className="text-center text-xs text-white/30 tracking-wide">
          © 2025 Isabel Lucena Fotografia. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
