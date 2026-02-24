import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Pages (serão criadas nas próximas etapas)
import Home from './pages/Home';

// Placeholder temporário para as páginas ainda não criadas
const PlaceholderPage = ({ title }) => (
  <main className="min-h-screen flex items-center justify-center pt-24">
    <h1 className="font-display text-4xl text-gold">{title}</h1>
  </main>
);

export default function App() {
  return (
    <BrowserRouter>
      {/* Header flutua sobre todas as páginas */}
      <Header />

      {/* Rotas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trabalhos" element={<PlaceholderPage title="Meus Trabalhos" />} />
        <Route path="/blog" element={<PlaceholderPage title="Blog" />} />
        <Route path="/sobre" element={<PlaceholderPage title="Sobre Mim" />} />
        <Route path="/servicos" element={<PlaceholderPage title="Serviços" />} />
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
      </Routes>

      {/* Footer em todas as páginas */}
      <Footer />

      {/* Botão WhatsApp flutuante em todas as páginas */}
      <WhatsAppButton />
    </BrowserRouter>
  );
}
