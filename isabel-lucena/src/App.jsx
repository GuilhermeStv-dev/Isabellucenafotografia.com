// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Trabalhos from './pages/Trabalhos';
import GalleryPage from './pages/GalleryPage';
import { GalleryProvider } from './context/GalleryContext';

// Placeholder para páginas ainda não criadas
const PlaceholderPage = ({ title }) => (
  <main className="min-h-screen flex items-center justify-center pt-24">
    <h1 className="font-display text-4xl text-gold">{title}</h1>
  </main>
);

// Layout do site público (com Header, Footer e WhatsApp)
function SiteLayout() {
  useEffect(() => {
    const easeInOutCubic = (t) => (t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const lenis = new Lenis({
      duration: 1.05,
      easing: easeInOutCubic,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.1,
    });

    window.__lenis = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/trabalhos" element={<Trabalhos />} />
        <Route path="/galeria/:categoryId" element={<GalleryPage />} />
        <Route path="/blog"      element={<PlaceholderPage title="Blog" />} />
        <Route path="/sobre"     element={<PlaceholderPage title="Sobre Mim" />} />
        <Route path="/servicos"  element={<PlaceholderPage title="Serviços" />} />
      </Routes>
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
          {/* Dashboard — tela própria, sem header/footer do site */}
          <Route path="/dashboard/*" element={<Dashboard />} />

          {/* Site público */}
          <Route path="/*" element={<SiteLayout />} />
        </Routes>
      </BrowserRouter>
    </GalleryProvider>
  );
}
