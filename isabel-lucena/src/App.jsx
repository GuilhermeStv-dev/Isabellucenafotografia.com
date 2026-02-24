// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

// Placeholder para páginas ainda não criadas
const PlaceholderPage = ({ title }) => (
  <main className="min-h-screen flex items-center justify-center pt-24">
    <h1 className="font-display text-4xl text-gold">{title}</h1>
  </main>
);

// Layout do site público (com Header, Footer e WhatsApp)
function SiteLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/trabalhos" element={<PlaceholderPage title="Meus Trabalhos" />} />
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
    <BrowserRouter>
      <Routes>
        {/* Dashboard — tela própria, sem header/footer do site */}
        <Route path="/dashboard/*" element={<Dashboard />} />

        {/* Site público */}
        <Route path="/*" element={<SiteLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
