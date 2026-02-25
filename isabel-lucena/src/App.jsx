// src/App.jsx
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { GalleryProvider } from './context/GalleryContext';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Trabalhos = lazy(() => import('./pages/Trabalhos'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));

const PlaceholderPage = ({ title }) => (
  <main className="min-h-screen flex items-center justify-center pt-24">
    <h1 className="font-display text-4xl text-gold">{title}</h1>
  </main>
);

const PageLoader = () => (
  <main className="min-h-[40vh] flex items-center justify-center">
    <p className="font-body text-sm text-white/50">Carregando…</p>
  </main>
);

function SiteLayout() {
  useEffect(() => {
    // Safari iOS já tem scroll suave nativo — Lenis causa crash nesses devices
    const isSafariIOS = /iP(ad|hone|od)/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    if (isSafariIOS) return

    const easeInOutCubic = (t) => (t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2);

    let ativo = true;
    let rafId;
    let lenis;

    const initLenis = async () => {
      const { default: Lenis } = await import('lenis');
      if (!ativo) return;

      lenis = new Lenis({
        duration: 0.75,
        easing: easeInOutCubic,
        smoothWheel: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        smoothTouch: false,
        wheelMultiplier: 0.95,
      });

      window.__lenis = lenis;

      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    initLenis();

    return () => {
      ativo = false;
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/trabalhos" element={<Trabalhos />} />
          <Route path="/galeria/:categoryId" element={<GalleryPage />} />
          <Route path="/blog"      element={<PlaceholderPage title="Blog" />} />
          <Route path="/sobre"     element={<PlaceholderPage title="Sobre Mim" />} />
          <Route path="/servicos"  element={<PlaceholderPage title="Serviços" />} />
        </Routes>
      </Suspense>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default function App() {
  return (
    <GalleryProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/dashboard/*"
            element={(
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            )}
          />
          <Route path="/*" element={<SiteLayout />} />
        </Routes>
      </BrowserRouter>
    </GalleryProvider>
  );
}
