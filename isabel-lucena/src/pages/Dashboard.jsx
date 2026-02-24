// src/pages/Dashboard.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, uploadFoto, deleteFotoStorage } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────
//  ÍCONES SVG inline (sem dependência extra)
// ─────────────────────────────────────────────────────────────────
const Icon = {
  Camera: () => (
    <svg width="22" height="18" viewBox="0 0 28 22" fill="none">
      <path d="M10 2L7.5 5H3C1.9 5 1 5.9 1 7V19C1 20.1 1.9 21 3 21H25C26.1 21 27 20.1 27 19V7C27 5.9 26.1 5 25 5H20.5L18 2H10Z" stroke="#C9A96E" strokeWidth="1.5"/>
      <circle cx="14" cy="13" r="5" stroke="#C9A96E" strokeWidth="1.5"/>
      <circle cx="14" cy="13" r="2" fill="#C9A96E"/>
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
    </svg>
  ),
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Tag: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  ),
  Eye: ({ off }) => off ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────
//  COMPONENTE: TELA DE LOGIN
// ─────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) setErro('E-mail ou senha incorretos.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src="/src/assets/Logo-horzontal-branca.svg" alt="Isabel Lucena" className="max-h-20 w-auto object-contain" />
          <p className="sr-only">Área restrita</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="bg-dark-100 rounded-2xl p-8 border border-dark-300 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          <h2 className="font-body text-white font-medium text-lg mb-6">Entrar no painel</h2>

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="font-body text-xs text-white/50 tracking-wide mb-1.5 block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="isabel@email.com"
                className="w-full bg-dark-200 border border-dark-300 rounded-xl px-4 py-3
                           font-body text-sm text-white placeholder-white/25
                           focus:outline-none focus:border-gold/60 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="font-body text-xs text-white/50 tracking-wide mb-1.5 block">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-dark-200 border border-dark-300 rounded-xl px-4 py-3
                           font-body text-sm text-white placeholder-white/25
                           focus:outline-none focus:border-gold/60 transition-colors duration-200"
              />
            </div>
          </div>

          {erro && (
            <p className="font-body text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2.5 mb-4">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-dark font-body font-semibold text-sm py-3.5 rounded-xl
                       hover:bg-gold-light hover:shadow-[0_4px_24px_rgba(201,169,110,0.4)]
                       active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  COMPONENTE: ÁREA DE DROP/UPLOAD
// ─────────────────────────────────────────────────────────────────
function DropZone({ onFiles }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      className={`
        border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center
        cursor-pointer transition-all duration-300 text-center
        ${dragOver
          ? 'border-gold bg-gold/5 scale-[1.01]'
          : 'border-dark-300 hover:border-gold/40 hover:bg-dark-200/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => onFiles(Array.from(e.target.files))}
      />
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4
                       transition-all duration-300
                       ${dragOver ? 'bg-gold text-dark' : 'bg-dark-300 text-gold'}`}>
        <Icon.Upload />
      </div>
      <p className="font-body text-white/80 font-medium mb-1">
        {dragOver ? 'Solte as fotos aqui!' : 'Arraste as fotos ou clique para selecionar'}
      </p>
      <p className="font-body text-white/30 text-xs">JPG, PNG, WEBP — várias fotos de uma vez</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ABA: UPLOAD DE FOTOS
// ─────────────────────────────────────────────────────────────────
function AbaUpload({ categorias, onUploadConcluido }) {
  const [catSelecionada, setCatSelecionada] = useState('');
  const [filas, setFilas] = useState([]); // [{file, preview, status, progresso}]
  const [fazendoUpload, setFazendoUpload] = useState(false);

  const adicionarArquivos = useCallback((files) => {
    const novos = files.map((f) => ({
      id: `${f.name}-${Date.now()}`,
      file: f,
      preview: URL.createObjectURL(f),
      status: 'aguardando', // aguardando | enviando | ok | erro
      erro: '',
    }));
    setFilas((prev) => [...prev, ...novos]);
  }, []);

  const removerDaFila = (id) => {
    setFilas((prev) => prev.filter((f) => f.id !== id));
  };

  const enviarTudo = async () => {
    if (!catSelecionada) { alert('Selecione uma categoria antes de enviar.'); return; }
    if (!filas.length) { alert('Adicione pelo menos uma foto.'); return; }

    setFazendoUpload(true);

    for (const item of filas.filter((f) => f.status === 'aguardando')) {
      // Marca como "enviando"
      setFilas((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'enviando' } : f));

      try {
        const url = await uploadFoto(item.file, catSelecionada);

        // Salva na tabela 'fotos'
        const { error } = await supabase.from('fotos').insert({
          categoria_slug: catSelecionada,
          url,
          titulo: item.file.name.replace(/\.[^.]+$/, ''),
          ativo: true,
        });
        if (error) throw error;

        setFilas((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'ok' } : f));
      } catch (err) {
        setFilas((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'erro', erro: err.message } : f));
      }
    }

    setFazendoUpload(false);
    onUploadConcluido?.();
  };

  const pendentes = filas.filter((f) => f.status === 'aguardando').length;
  const concluidos = filas.filter((f) => f.status === 'ok').length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1">Adicionar fotos</h2>
        <p className="font-body text-sm text-white/40">Selecione a categoria e envie várias fotos de uma vez</p>
      </div>

      {/* Seleção de categoria */}
      <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
        <label className="font-body text-xs text-white/50 tracking-widest uppercase mb-3 block">
          1. Escolha a categoria
        </label>
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCatSelecionada(cat.slug)}
              className={`px-4 py-2 rounded-full font-body text-sm border transition-all duration-200 active:scale-95
                ${catSelecionada === cat.slug
                  ? 'bg-gold text-dark border-gold font-semibold shadow-[0_4px_16px_rgba(201,169,110,0.35)]'
                  : 'border-dark-300 text-white/60 hover:border-gold/40 hover:text-white'
                }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
        <label className="font-body text-xs text-white/50 tracking-widest uppercase mb-3 block">
          2. Selecione as fotos
        </label>
        <DropZone onFiles={adicionarArquivos} />
      </div>

      {/* Fila de arquivos */}
      {filas.length > 0 && (
        <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-sm text-white/70">
              {concluidos}/{filas.length} enviadas
              {pendentes > 0 && <span className="text-gold ml-2">· {pendentes} pendentes</span>}
            </p>
            <button
              onClick={() => setFilas([])}
              className="font-body text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Limpar lista
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-72 overflow-y-auto pr-1">
            {filas.map((item) => (
              <div key={item.id} className="relative rounded-xl overflow-hidden aspect-square group">
                <img src={item.preview} alt="" className="w-full h-full object-cover" />

                {/* Status overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300
                  ${item.status === 'enviando' ? 'bg-dark/60' :
                    item.status === 'ok' ? 'bg-green-500/30' :
                    item.status === 'erro' ? 'bg-red-500/40' : 'bg-transparent'}`}>
                  {item.status === 'enviando' && (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {item.status === 'ok' && (
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                      <Icon.Check />
                    </div>
                  )}
                  {item.status === 'erro' && (
                    <span className="text-white text-xs px-2 text-center">Erro</span>
                  )}
                </div>

                {/* Botão remover (só quando aguardando) */}
                {item.status === 'aguardando' && (
                  <button
                    onClick={() => removerDaFila(item.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-dark/80 text-white
                               flex items-center justify-center opacity-0 group-hover:opacity-100
                               transition-opacity duration-200 hover:bg-red-500"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão enviar */}
      {pendentes > 0 && (
        <button
          onClick={enviarTudo}
          disabled={fazendoUpload || !catSelecionada}
          className="btn-gold w-full justify-center py-4 text-base disabled:opacity-50"
        >
          {fazendoUpload
            ? 'Enviando...'
            : `Enviar ${pendentes} foto${pendentes > 1 ? 's' : ''} para "${catSelecionada || '...'}"`}
          <span className="btn-arrow">→</span>
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ABA: GERENCIAR FOTOS
// ─────────────────────────────────────────────────────────────────
function AbaFotos({ categorias }) {
  const [catAtiva, setCatAtiva] = useState('');
  const [fotos, setFotos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (categorias.length && !catAtiva) setCatAtiva(categorias[0]?.slug || '');
  }, [categorias]);

  useEffect(() => {
    if (!catAtiva) return;
    setCarregando(true);
    supabase
      .from('fotos')
      .select('*')
      .eq('categoria_slug', catAtiva)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFotos(data || []);
        setCarregando(false);
      });
  }, [catAtiva]);

  const toggleAtivo = async (foto) => {
    const novoValor = !foto.ativo;
    await supabase.from('fotos').update({ ativo: novoValor }).eq('id', foto.id);
    setFotos((prev) => prev.map((f) => f.id === foto.id ? { ...f, ativo: novoValor } : f));
  };

  const excluir = async (foto) => {
    if (!confirm(`Excluir a foto "${foto.titulo}"? Esta ação não pode ser desfeita.`)) return;
    await deleteFotoStorage(foto.url);
    await supabase.from('fotos').delete().eq('id', foto.id);
    setFotos((prev) => prev.filter((f) => f.id !== foto.id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1">Gerenciar fotos</h2>
        <p className="font-body text-sm text-white/40">Ative, desative ou exclua fotos por categoria</p>
      </div>

      {/* Tabs de categoria */}
      <div className="flex flex-wrap gap-2">
        {categorias.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setCatAtiva(cat.slug)}
            className={`px-4 py-2 rounded-full font-body text-sm border transition-all duration-200 active:scale-95
              ${catAtiva === cat.slug
                ? 'bg-gold text-dark border-gold font-semibold'
                : 'border-dark-300 text-white/60 hover:border-gold/40 hover:text-white'
              }`}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {/* Grid de fotos */}
      {carregando ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : fotos.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-body">
          Nenhuma foto nessa categoria ainda.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className={`rounded-xl overflow-hidden border transition-all duration-300 group
                ${foto.ativo ? 'border-dark-300' : 'border-red-500/30 opacity-60'}`}
            >
              {/* Imagem */}
              <div className="aspect-square relative overflow-hidden">
                <img src={foto.url} alt={foto.titulo} className="w-full h-full object-cover" />
                {!foto.ativo && (
                  <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
                    <span className="font-body text-xs text-white/70 bg-dark/80 px-2 py-1 rounded-full">
                      Oculta
                    </span>
                  </div>
                )}
              </div>

              {/* Rodapé do card */}
              <div className="bg-dark-200 p-3">
                <p className="font-body text-xs text-white/60 truncate mb-2">{foto.titulo}</p>
                <div className="flex items-center gap-2">
                  {/* Toggle visível/oculto */}
                  <button
                    onClick={() => toggleAtivo(foto)}
                    title={foto.ativo ? 'Ocultar do site' : 'Mostrar no site'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                                font-body text-xs border transition-all duration-200 active:scale-95
                                ${foto.ativo
                                  ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                                  : 'border-dark-300 text-white/40 hover:border-gold/40 hover:text-white'
                                }`}
                  >
                    <Icon.Eye off={!foto.ativo} />
                    {foto.ativo ? 'Visível' : 'Oculta'}
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => excluir(foto)}
                    title="Excluir foto"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-300
                               text-white/30 hover:border-red-500/50 hover:text-red-400
                               transition-all duration-200 active:scale-95"
                  >
                    <Icon.Trash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ABA: CATEGORIAS
// ─────────────────────────────────────────────────────────────────
function AbaCategorias({ categorias, onAtualizar }) {
  const [novoNome, setNovoNome] = useState('');
  const [novoSlug, setNovoSlug] = useState('');
  const [criando, setCriando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [editNome, setEditNome] = useState('');

  const gerarSlug = (nome) =>
    nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const criar = async () => {
    if (!novoNome.trim()) return;
    setCriando(true);
    await supabase.from('categorias').insert({
      nome: novoNome.trim(),
      slug: novoSlug || gerarSlug(novoNome),
      ativo: true,
    });
    setNovoNome('');
    setNovoSlug('');
    setCriando(false);
    onAtualizar();
  };

  const toggleCat = async (cat) => {
    await supabase.from('categorias').update({ ativo: !cat.ativo }).eq('id', cat.id);
    onAtualizar();
  };

  const salvarEdicao = async (id) => {
    if (!editNome.trim()) return;
    await supabase.from('categorias').update({ nome: editNome.trim() }).eq('id', id);
    setEditandoId(null);
    onAtualizar();
  };

  const excluirCat = async (cat) => {
    if (!confirm(`Excluir a categoria "${cat.nome}"? As fotos desta categoria não serão excluídas.`)) return;
    await supabase.from('categorias').delete().eq('id', cat.id);
    onAtualizar();
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl text-white mb-1">Categorias</h2>
        <p className="font-body text-sm text-white/40">Gerencie as categorias que aparecem no site</p>
      </div>

      {/* Nova categoria */}
      <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
        <p className="font-body text-xs text-white/50 tracking-widest uppercase mb-4">Nova categoria</p>
        <div className="flex gap-3">
          <input
            value={novoNome}
            onChange={(e) => { setNovoNome(e.target.value); setNovoSlug(gerarSlug(e.target.value)); }}
            placeholder="Ex: Ensaios Femininos"
            className="flex-1 bg-dark-200 border border-dark-300 rounded-xl px-4 py-3
                       font-body text-sm text-white placeholder-white/20
                       focus:outline-none focus:border-gold/60 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && criar()}
          />
          <button
            onClick={criar}
            disabled={!novoNome.trim() || criando}
            className="px-5 py-3 bg-gold text-dark font-body font-semibold text-sm rounded-xl
                       hover:bg-gold-light hover:shadow-[0_4px_20px_rgba(201,169,110,0.3)]
                       active:scale-95 transition-all duration-300 disabled:opacity-40
                       flex items-center gap-2"
          >
            <Icon.Plus /> Criar
          </button>
        </div>
        {novoSlug && (
          <p className="font-body text-xs text-white/30 mt-2">Slug: <span className="text-gold/60">{novoSlug}</span></p>
        )}
      </div>

      {/* Lista de categorias */}
      <div className="flex flex-col gap-3">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className={`bg-dark-100 rounded-xl border px-5 py-4 flex items-center gap-4 transition-all duration-300
              ${cat.ativo ? 'border-dark-300' : 'border-dark-300 opacity-60'}`}
          >
            {/* Nome / edição inline */}
            {editandoId === cat.id ? (
              <input
                autoFocus
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') salvarEdicao(cat.id); if (e.key === 'Escape') setEditandoId(null); }}
                className="flex-1 bg-dark-200 border border-gold/50 rounded-lg px-3 py-1.5
                           font-body text-sm text-white focus:outline-none"
              />
            ) : (
              <div className="flex-1">
                <p className="font-body text-sm text-white font-medium">{cat.nome}</p>
                <p className="font-body text-xs text-white/30 mt-0.5">{cat.slug}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Editar / salvar */}
              {editandoId === cat.id ? (
                <button
                  onClick={() => salvarEdicao(cat.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg
                             bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                >
                  <Icon.Check />
                </button>
              ) : (
                <button
                  onClick={() => { setEditandoId(cat.id); setEditNome(cat.nome); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-300
                             text-white/40 hover:border-gold/40 hover:text-gold transition-all duration-200"
                >
                  <Icon.Edit />
                </button>
              )}

              {/* Toggle ativo */}
              <button
                onClick={() => toggleCat(cat)}
                title={cat.ativo ? 'Ocultar categoria' : 'Mostrar categoria'}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-200
                  ${cat.ativo
                    ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                    : 'border-dark-300 text-white/30 hover:border-gold/40'
                  }`}
              >
                <Icon.Eye off={!cat.ativo} />
              </button>

              {/* Excluir */}
              <button
                onClick={() => excluirCat(cat)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-300
                           text-white/30 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
              >
                <Icon.Trash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  DASHBOARD PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('upload');
  const [categorias, setCategorias] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setSessao(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Categorias ──
  const carregarCategorias = useCallback(async () => {
    const { data } = await supabase.from('categorias').select('*').order('nome');
    setCategorias(data || []);
  }, []);

  useEffect(() => {
    if (sessao) carregarCategorias();
  }, [sessao, carregarCategorias]);

  const logout = () => supabase.auth.signOut();

  // ── Estados de carregamento / sem sessão ──
  if (carregando) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sessao) return <LoginScreen onLogin={() => {}} />;

  // ── Navegação ──
  const navItems = [
    { id: 'upload', label: 'Adicionar fotos', icon: <Icon.Upload /> },
    { id: 'fotos', label: 'Minhas fotos', icon: <Icon.Grid /> },
    { id: 'categorias', label: 'Categorias', icon: <Icon.Tag /> },
  ];

  return (
    <div className="min-h-screen bg-dark flex">

      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden md:flex w-64 bg-dark-100 border-r border-dark-300 flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-dark-300 flex items-center gap-2.5">
          <Icon.Camera />
          <div>
            <p className="font-display text-white text-base font-semibold italic">Isabel Lucena</p>
            <p className="font-body text-[10px] text-gold/60 tracking-[0.2em] uppercase">Painel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                          font-body text-sm text-left transition-all duration-200 active:scale-[0.98]
                          ${abaAtiva === item.id
                            ? 'bg-gold/15 text-gold border border-gold/20'
                            : 'text-white/50 hover:text-white hover:bg-dark-200 border border-transparent'
                          }`}
            >
              <span className={abaAtiva === item.id ? 'text-gold' : 'text-white/30'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Botão sair */}
        <div className="p-4 border-t border-dark-300">
          <div className="px-4 py-2 mb-3">
            <p className="font-body text-xs text-white/40 truncate">{sessao.user.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       font-body text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10
                       transition-all duration-200 border border-transparent active:scale-[0.98]"
          >
            <Icon.Logout />
            Sair
          </button>
        </div>
      </aside>

      {/* ── HEADER MOBILE ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-dark-100 border-b border-dark-300
                      flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon.Camera />
          <p className="font-display text-white text-sm font-semibold italic">Painel Isabel</p>
        </div>
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="w-9 h-9 flex flex-col gap-1.5 items-center justify-center"
        >
          <span className={`block w-5 h-px bg-gold transition-all duration-300 ${menuAberto ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuAberto ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-gold transition-all duration-300 ${menuAberto ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* ── DRAWER MOBILE ── */}
      {menuAberto && (
        <div className="md:hidden fixed inset-0 z-40 bg-dark-100 pt-16 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setAbaAtiva(item.id); setMenuAberto(false); }}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-body text-base
                          transition-all duration-200
                          ${abaAtiva === item.id ? 'bg-gold/15 text-gold' : 'text-white/70'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <button onClick={logout} className="flex items-center gap-3 px-5 py-4 text-red-400 font-body">
            <Icon.Logout /> Sair
          </button>
        </div>
      )}

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <main className="flex-1 p-6 md:p-10 mt-14 md:mt-0 overflow-y-auto">
        {abaAtiva === 'upload' && (
          <AbaUpload categorias={categorias} onUploadConcluido={carregarCategorias} />
        )}
        {abaAtiva === 'fotos' && (
          <AbaFotos categorias={categorias} />
        )}
        {abaAtiva === 'categorias' && (
          <AbaCategorias categorias={categorias} onAtualizar={carregarCategorias} />
        )}
      </main>
    </div>
  );
}
