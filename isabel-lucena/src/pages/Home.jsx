import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FotoIsabel640 from '../assets/optimized/foto-isabel-640.webp';
import FotoIsabel1024 from '../assets/optimized/foto-isabel-1024.webp';
import FotoIsabel1600 from '../assets/optimized/foto-isabel-1600.webp';
import FotoIsabelFallback from '../assets/optimized/foto-isabel-1600.jpg';
import FotoIsabel2640 from '../assets/optimized/foto-isabel-2-640.webp';
import FotoIsabel21024 from '../assets/optimized/foto-isabel-2-1024.webp';
import FotoIsabel21600 from '../assets/optimized/foto-isabel-2-1600.webp';
import FotoIsabel2Fallback from '../assets/optimized/foto-isabel-2-1600.jpg';
import FotoIsabel3640 from '../assets/optimized/foto-isabel3-640.webp';
import FotoIsabel31024 from '../assets/optimized/foto-isabel3-1024.webp';
import FotoIsabel31600 from '../assets/optimized/foto-isabel3-1600.webp';
import FotoIsabel3Fallback from '../assets/optimized/foto-isabel3-1600.jpg';
import FotoIsabel4640 from '../assets/optimized/foto-isabel4-640.webp';
import FotoIsabel41024 from '../assets/optimized/foto-isabel4-1024.webp';
import FotoIsabel41600 from '../assets/optimized/foto-isabel4-1600.webp';
import FotoIsabel4Fallback from '../assets/optimized/foto-isabel4-1600.jpg';
import FotoGravida1640 from '../assets/optimized/foto-gravida1-640.webp';
import FotoGravida11024 from '../assets/optimized/foto-gravida1-1024.webp';
import FotoGravida11600 from '../assets/optimized/foto-gravida1-1600.webp';
import FotoGravida1Fallback from '../assets/optimized/foto-gravida1-1600.jpg';

/* ─────────────────────────────────────────────
   HOOK — Revela elementos ao entrar no viewport
───────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────
   DADOS — Altere aqui os textos / imagens
───────────────────────────────────────────── */

// Pré-visualização da galeria na Home
// Substitua 'src' pelas URLs/paths das suas fotos
const GALLERY_PREVIEW = [
  { id: 1, src: '', alt: 'Grávida casal', category: 'Grávidas', span: 'row-span-2' },
  { id: 2, src: '', alt: 'Retrato feminino', category: 'Ensaios', span: '' },
  { id: 3, src: '', alt: 'Ensaio externo', category: 'Ensaios', span: '' },
  { id: 4, src: '', alt: 'Casamento', category: 'Wedding', span: 'row-span-2' },
  { id: 5, src: '', alt: 'Ensaio feminino', category: 'Ensaios', span: '' },
  { id: 6, src: '', alt: 'Infantil', category: 'Infantil', span: '' },
  { id: 7, src: '', alt: 'Aniversário', category: 'Eventos', span: '' },
];

const SERVICES = [
  {
    id: 1,
    title: 'Wedding',
    desc: 'Cada detalhe do seu dia especial capturado com cuidado e emoção. Do getting ready à festa, nenhum momento é perdido.',
    bullets: ['Cobertura completa do dia', 'Álbum digital em alta resolução', 'Entrega em até 60 dias', 'Prévia em 7 dias'],
    img: '',
  },
  {
    id: 2,
    title: 'Ensaios Femininos',
    desc: 'Estúdio ou externo, cada mulher tem uma história única a contar. Sessões pensadas para realçar sua beleza autêntica.',
    bullets: ['Estúdio ou locação externa', 'Figurino e maquiagem à combinar', 'Entrega em até 30 dias', 'Mini sessão disponível'],
    img: '',
  },
  {
    id: 3,
    title: 'Infantil & Maternidade',
    desc: 'Crianças crescem rápido. Preserve cada gargalhada, cada olhar de descoberta e cada abraço quentinho.',
    bullets: ['Estúdio equipado para bebês', 'Newborn disponível', 'Pacotes família', 'Entrega em até 30 dias'],
    img: '',
  },
];

const FEATURED = [
  { id: 1, src: '', title: 'Grávidas', category: 'Maternidade', href: '/trabalhos?cat=gravidas' },
  { id: 2, src: '', title: 'Ensaio Estúdio', category: 'Feminino', href: '/trabalhos?cat=estudio' },
  { id: 3, src: '', title: 'Casamento', category: 'Wedding', href: '/trabalhos?cat=casamento' },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ana Carolina',
    role: 'Ensaio de Grávida',
    text: 'Isabel capturou exatamente o que eu queria: leveza, emoção e beleza. As fotos ficaram perfeitas e eu chorei quando vi o resultado!',
    stars: 5,
  },
  {
    id: 2,
    name: 'Fernanda & Lucas',
    role: 'Casamento',
    text: 'Desde o primeiro contato soubemos que era a fotógrafa certa. Atenção a cada detalhe, sensibilidade e profissionalismo impecável.',
    stars: 5,
  },
  {
    id: 3,
    name: 'Mariana Silva',
    role: 'Ensaio Feminino',
    text: 'Nunca me senti tão à vontade em um ensaio. Isabel tem um dom de deixar a gente natural e o resultado prova isso. Amei cada foto!',
    stars: 5,
  },
];

const BLOG_POSTS = [
  { id: 1, src: '', category: 'Dicas', title: 'Como se preparar para o seu ensaio fotográfico', date: 'Jan 2025', href: '/blog/preparar-ensaio' },
  { id: 2, src: '', category: 'Corporativo', title: 'Importância da fotografia corporativa para empresas', date: 'Fev 2025', href: '/blog/fotografia-corporativa' },
  { id: 3, src: '', category: 'Casamento', title: 'Como criar um álbum de casamento único', date: 'Mar 2025', href: '/blog/album-casamento' },
];

const HERO_SRCSET = `${FotoIsabel640} 640w, ${FotoIsabel1024} 1024w, ${FotoIsabel1600} 1600w`;
const HERO_SIDE_SRCSET = `${FotoIsabel2640} 640w, ${FotoIsabel21024} 1024w, ${FotoIsabel21600} 1600w`;
const ABOUT_MAIN_SRCSET = `${FotoIsabel3640} 640w, ${FotoIsabel31024} 1024w, ${FotoIsabel31600} 1600w`;
const ABOUT_SECOND_SRCSET = `${FotoIsabel4640} 640w, ${FotoIsabel41024} 1024w, ${FotoIsabel41600} 1600w`;
const CTA_SRCSET = `${FotoGravida1640} 640w, ${FotoGravida11024} 1024w, ${FotoGravida11600} 1600w`;

/* ─────────────────────────────────────────────
   SUB-COMPONENTES
───────────────────────────────────────────── */

// Placeholder visual enquanto não há imagem
const ImgPlaceholder = ({ className = '', icon = '📷' }) => (
  <div className={`bg-dark-200 flex items-center justify-center text-3xl select-none ${className}`}>
    <span className="opacity-20">{icon}</span>
  </div>
);

// Estrelas de avaliação
const Stars = ({ count }) => (
  <div className="flex gap-0.5 mb-3">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#C9A96E">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   PÁGINA HOME
───────────────────────────────────────────── */
export default function Home() {
  useReveal();
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('snap-scroll');
    document.body.classList.add('snap-scroll');
    return () => {
      root.classList.remove('snap-scroll');
      document.body.classList.remove('snap-scroll');
    };
  }, []);

  const scrollTo = (id) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.scrollIntoView({ behavior: 'auto' });
      return;
    }

    const lenis = window.__lenis;
    if (lenis?.scrollTo) {
      lenis.scrollTo(target, {
        duration: 1.6,
        easing: (t) => (t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2),
      });
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          1 · HERO
      ══════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="snap-section relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0f0f0f 0%,#1a1509 60%,#0f0f0f 100%)' }}
      >
        {/* Overlay gradiente sobre imagem */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/70 to-dark/10 z-10" />

        {/* Foto de fundo hero */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet={HERO_SRCSET} sizes="100vw" type="image/webp" />
            <img src={FotoIsabelFallback} className="w-full h-full object-cover" alt="Isabel Lucena" loading="eager" fetchPriority="high" decoding="async" />
          </picture>
        </div>

        {/* Conteúdo */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 pt-24 w-full grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p
              className="font-body text-gold text-xs tracking-[0.35em] uppercase mb-5"
              style={{ animation: 'fadeInUp 0.6s 0.1s both' }}
            >
              Isabel Lucena · Fotografia
            </p>
            <h1
              className="font-display font-light text-white leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2.8rem,7vw,5rem)', animation: 'fadeInUp 0.6s 0.3s both' }}
            >
              Capturando
              <br />
              <em className="text-gold not-italic font-semibold">Histórias</em>
              <br />
              Autênticas
            </h1>
            <p
              className="font-body text-white/55 text-base leading-relaxed max-w-md mb-10"
              style={{ animation: 'fadeInUp 0.6s 0.5s both' }}
            >
              Fotografia é conhecer o artístico e a atenção aos detalhes que fazem a diferença.
            </p>
            <div style={{ animation: 'fadeInUp 0.6s 0.7s both' }}>
              <a
                href="https://wa.me/5587988449536"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                Agende sua sessão agora mesmo
                <span className="btn-arrow">→</span>
              </a>
            </div>
          </div>

          {/* Destaque foto lateral — opcional */}
          <div
            className="hidden md:block"
            style={{ animation: 'fadeIn 1s 0.6s both' }}
          >
            <div className="relative w-[360px] ml-auto">
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-gold/15 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
                <picture>
                  <source srcSet={HERO_SIDE_SRCSET} sizes="(min-width: 768px) 360px, 100vw" type="image/webp" />
                  <img src={FotoIsabel2Fallback} className="w-full h-full object-cover" alt="Isabel Lucena" loading="lazy" decoding="async" />
                </picture>
              </div>
              {/* Badge flutuante */}
              <div className="absolute -bottom-5 -left-8 bg-gold text-dark px-5 py-3 rounded-xl shadow-xl">
                <p className="font-display font-semibold text-lg leading-none">+500</p>
                <p className="font-body text-xs tracking-wide mt-0.5">Histórias capturadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seta bounce — scroll pra seção de trabalhos */}
        <button
          onClick={() => scrollTo('meus-trabalhos')}
          aria-label="Ver meus trabalhos"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20
                     text-gold/60 hover:text-gold transition-colors duration-300
                     animate-bounce_arrow"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 4v16M12 20l-5-5M12 20l5-5"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      {/* ══════════════════════════════════════════════════
          2 · MEUS TRABALHOS
      ══════════════════════════════════════════════════ */}
      <section id="meus-trabalhos" className="snap-section py-28 bg-dark-100">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header da seção */}
          <div className="reveal flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-3">Portfólio</p>
              <h2 className="font-display font-light text-white" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
                Meus <em className="text-gold not-italic font-semibold">trabalhos</em>
              </h2>
            </div>
            <Link to="/trabalhos" className="btn-primary shrink-0">
              Ver tudo <span className="btn-arrow">→</span>
            </Link>
          </div>

          {/* Grid masonry-like */}
          <div className="reveal grid grid-cols-3 gap-3" style={{ gridAutoRows: '180px' }}>
            {GALLERY_PREVIEW.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl overflow-hidden group relative cursor-pointer ${item.span}`}
              >
                {item.src
                  ? <img src={item.src} alt={item.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                  : <ImgPlaceholder className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                }
                {/* Overlay com categoria no hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4">
                  <span className="font-body text-xs text-gold tracking-widest uppercase">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          3 · OLÁ, SOU ISABEL LUCENA
      ══════════════════════════════════════════════════ */}
      <section id="sobre" className="snap-section py-28 bg-dark">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          {/* Fotos — composição com 2 imagens sobrepostas */}
          <div className="reveal relative h-[520px]">
            {/* Foto principal */}
            <div className="absolute left-0 top-0 w-[72%] aspect-square rounded-2xl overflow-hidden border border-gold/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <picture>
                <source srcSet={ABOUT_MAIN_SRCSET} sizes="(min-width: 768px) 45vw, 90vw" type="image/webp" />
                <img src={FotoIsabel3Fallback} alt="Isabel Lucena" className="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
              </picture>
            </div>
            {/* Foto secundária — sobreposta */}
            <div className="absolute right-0 bottom-0 w-[55%] aspect-[4/5] rounded-2xl overflow-hidden border border-gold/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <picture>
                <source srcSet={ABOUT_SECOND_SRCSET} sizes="(min-width: 768px) 35vw, 80vw" type="image/webp" />
                <img src={FotoIsabel4Fallback} alt="Isabel Lucena" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </picture>
            </div>
            {/* Detalhe decorativo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-gold/30 pointer-events-none" />
          </div>

          {/* Texto */}
          <div className="reveal">
            <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-4">Sobre mim</p>
            <h2 className="font-display font-light text-white mb-2" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>
              Olá, sou
            </h2>
            <h2 className="font-display font-semibold text-gold mb-6" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>
              Isabel Lucena
            </h2>

            {/* Intro */}
            <div className="mb-6 pb-6 border-b border-dark-300">
              <p className="font-body text-xs text-gold tracking-widest uppercase mb-2">Introdução</p>
              <p className="font-body text-white/65 text-sm leading-relaxed">
                Apaixonada por fotografia há mais de 8 anos, acredito que cada imagem tem o poder de transformar
                um momento em memória eterna. Sou de Paulo Afonso, Bahia, e atendo em todo o Nordeste.
                Tudo que faço é com o coração — porque fotografia não é só técnica, é sentimento.
              </p>
            </div>

            {/* Contato rápido */}
            <div className="mb-8">
              <p className="font-body text-xs text-gold tracking-widest uppercase mb-3">Informações de contato</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  <span className="font-body text-sm text-white/65">isabeltravassos2015@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  <span className="font-body text-sm text-white/65">(87) 9 8844-9536 · Paulo Afonso, BA</span>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/5587988449536"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Agendar um ensaio <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4 · MEUS SERVIÇOS
      ══════════════════════════════════════════════════ */}
      <section id="servicos" className="snap-section py-28 bg-dark-100">
        <div className="max-w-6xl mx-auto px-6">

          <div className="reveal mb-14 text-center">
            <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-4">O que ofereço</p>
            <h2 className="font-display font-light text-white" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Meus <em className="text-gold not-italic font-semibold">serviços</em>
            </h2>
          </div>

          {/* Tabs de serviço */}
          <div className="reveal flex flex-wrap justify-center gap-2 mb-10">
            {SERVICES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveService(i)}
                className={`font-body text-sm px-5 py-2.5 rounded-full border transition-all duration-300 active:scale-95
                  ${activeService === i
                    ? 'bg-gold text-dark border-gold font-semibold shadow-[0_4px_20px_rgba(201,169,110,0.4)]'
                    : 'border-dark-300 text-white/60 hover:border-gold/50 hover:text-white'
                  }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Card do serviço ativo */}
          {SERVICES.map((s, i) => (
            <div
              key={s.id}
              className={`reveal grid md:grid-cols-2 gap-10 items-center transition-all duration-500
                ${activeService === i ? 'block' : 'hidden'}`}
            >
              {/* Imagem */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-gold/10">
                {s.img
                  ? <img src={s.img} alt={s.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  : <ImgPlaceholder className="w-full h-full" />
                }
              </div>

              {/* Texto */}
              <div>
                <h3 className="font-display text-3xl font-semibold text-gold mb-4">{s.title}</h3>
                <p className="font-body text-white/65 text-sm leading-relaxed mb-6">{s.desc}</p>
                <ul className="flex flex-col gap-3 mb-8">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 font-body text-sm text-white/75">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                        <circle cx="8" cy="8" r="7" stroke="#C9A96E" strokeWidth="1" />
                        <path d="M5 8l2 2 4-4" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wa.me/5587988449536"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                >
                  Guardar momentos <span className="btn-arrow">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          5 · TRABALHOS EM DESTAQUE
      ══════════════════════════════════════════════════ */}
      <section id="destaques" className="snap-section py-28 bg-dark">
        <div className="max-w-6xl mx-auto px-6">

          <div className="reveal flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-3">Destaques</p>
              <h2 className="font-display font-light text-white" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
                Trabalhos em <em className="text-gold not-italic font-semibold">destaque</em>
              </h2>
            </div>
            <Link to="/trabalhos" className="btn-primary shrink-0">
              Ver tudo <span className="btn-arrow">→</span>
            </Link>
          </div>

          <div className="reveal grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {FEATURED.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="group relative rounded-2xl overflow-hidden border border-dark-300
                           hover:border-gold/40 transition-all duration-400"
              >
                {/* Foto */}
                <div className="aspect-[3/4] overflow-hidden">
                  {item.src
                    ? <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                    : <ImgPlaceholder className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                  }
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent flex flex-col justify-end p-5">
                  <span className="font-body text-gold text-[10px] tracking-[0.3em] uppercase mb-1">{item.category}</span>
                  <h3 className="font-display text-xl text-white font-semibold">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-3 text-gold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span className="font-body text-xs tracking-wide">Ver fotos</span>
                    <span className="text-sm transition-transform duration-300 group-hover:rotate-[-45deg]">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          6 · DEPOIMENTOS
      ══════════════════════════════════════════════════ */}
      <section id="depoimentos" className="snap-section py-28 bg-dark-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">

          <div className="reveal mb-14 text-center">
            <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-4">Clientes</p>
            <h2 className="font-display font-light text-white" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              O que os meus <em className="text-gold not-italic font-semibold">clientes</em> dizem
            </h2>
          </div>

          <div className="reveal grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-dark-200 rounded-2xl p-7 border border-dark-300
                           hover:border-gold/25 hover:shadow-[0_8px_40px_rgba(201,169,110,0.08)]
                           transition-all duration-400"
              >
                <Stars count={t.stars} />
                <p className="font-body text-white/65 text-sm leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                    <span className="font-display text-gold font-semibold text-sm">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-body text-white text-sm font-medium">{t.name}</p>
                    <p className="font-body text-gold/70 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          7 · MEU BLOG
      ══════════════════════════════════════════════════ */}
      <section id="blog" className="snap-section py-28 bg-dark">
        <div className="max-w-6xl mx-auto px-6">

          <div className="reveal flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-3">Artigos</p>
              <h2 className="font-display font-light text-white" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
                Meu <em className="text-gold not-italic font-semibold">blog</em>
              </h2>
            </div>
            <Link to="/blog" className="btn-primary shrink-0">
              Ver tudo <span className="btn-arrow">→</span>
            </Link>
          </div>

          <div className="reveal grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.id}
                to={post.href}
                className="group rounded-2xl overflow-hidden border border-dark-300
                           hover:border-gold/30 transition-all duration-300
                           flex flex-col h-full"
              >
                {/* Thumb */}
                <div className="aspect-[16/9] overflow-hidden">
                  {post.src
                    ? <img src={post.src} alt={post.title} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105" loading="lazy" decoding="async" />
                    : <ImgPlaceholder className="w-full h-full transition-transform duration-600 group-hover:scale-105" />
                  }
                </div>

                {/* Texto */}
                <div className="p-5 bg-dark-200 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-body text-[10px] text-gold tracking-widest uppercase">{post.category}</span>
                    <span className="w-1 h-1 rounded-full bg-dark-300" />
                    <span className="font-body text-[10px] text-white/35">{post.date}</span>
                  </div>
                  <h3 className="font-display text-lg text-white font-medium leading-snug
                             group-hover:text-gold transition-colors duration-300
                             min-h-[3.25rem]">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-auto pt-4 text-gold text-xs font-body">
                    <span>Ler mais</span>
                    <span className="transition-transform duration-300 group-hover:rotate-[-45deg]">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          8 · CTA FINAL
      ══════════════════════════════════════════════════ */}
      <section className="snap-section relative py-28 bg-dark-100 overflow-hidden">
        <div className="absolute inset-0">
          <picture>
            <source srcSet={CTA_SRCSET} sizes="100vw" type="image/webp" />
            <img src={FotoGravida1Fallback} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-dark/60" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="reveal">
            <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-2">Vamos criar juntas?</p>
            <h2
              className="font-display text-white mb-4 leading-tight"
              style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}
            >
              <span className="font-semibold">Pronta para guardar os seus</span><br />
              <em className="text-gold not-italic font-semibold">momentos especiais?</em>
            </h2>
            <p className="font-body text-white/50 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Entre em contato e vamos conversar sobre a sessão dos seus sonhos.
              Atendo em Paulo Afonso e região.
            </p>
            <a
              href="https://wa.me/5587988449536"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              Falar no WhatsApp <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
