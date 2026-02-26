// src/pages/Dashboard.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase, supabaseAnonRead, uploadFoto, deleteFotoStorage } from '../lib/supabase';
import { compressImage, runWithConcurrency } from '../lib/imageUtils';
import { generatePlaceholder } from '../lib/generatePlaceholder';
import LogoBranca from '../assets/Logo-horzontal-branca.webp';

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
  Image: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  ),
};

function LoginScreen({ onLogin }) {
  const emailRef = useRef(null);
  const senhaRef = useRef(null);
  const rememberRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const stored = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('dashboardCreds') || 'null'); }
    catch { return null; }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const email = emailRef.current?.value || '';
    const senha = senhaRef.current?.value || '';
    const remember = rememberRef.current?.checked || false;

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro('E-mail ou senha incorretos.');
    } else {
      if (remember) localStorage.setItem('dashboardCreds', JSON.stringify({ email, senha }));
      else localStorage.removeItem('dashboardCreds');
      onLogin?.();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <img src={LogoBranca} alt="Isabel Lucena" className="h-12 w-auto object-contain" />
        </div>
        <form onSubmit={handleLogin} autoComplete="on" className="bg-dark-100 rounded-2xl p-8 border border-dark-300 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <h2 className="font-body text-white font-medium text-lg mb-6">Entrar no painel</h2>
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label htmlFor="dashboard-email" className="font-body text-xs text-white/50 tracking-wide mb-1.5 block">E-mail</label>
              <input
                ref={emailRef}
                id="dashboard-email"
                name="email"
                autoComplete="email"
                type="email"
                required
                placeholder="isabel@email.com"
                defaultValue={stored?.email || ''}
                className="w-full bg-dark-200 border border-dark-300 rounded-xl px-4 py-3 font-body text-sm text-white placeholder-white/25 focus:outline-none focus:border-gold/60 transition-colors duration-200" />
            </div>
            <div>
              <label htmlFor="dashboard-password" className="font-body text-xs text-white/50 tracking-wide mb-1.5 block">Senha</label>
              <input
                ref={senhaRef}
                id="dashboard-password"
                name="password"
                autoComplete="current-password"
                type="password"
                required
                placeholder="••••••••"
                defaultValue={stored?.senha || ''}
                className="w-full bg-dark-200 border border-dark-300 rounded-xl px-4 py-3 font-body text-sm text-white placeholder-white/25 focus:outline-none focus:border-gold/60 transition-colors duration-200" />
            </div>
            <label className="inline-flex items-center gap-2 text-white text-sm">
              <input
                ref={rememberRef}
                type="checkbox"
                defaultChecked={!!stored}
                className="form-checkbox h-4 w-4 text-gold bg-dark-200 border-dark-300 rounded" />
              Lembrar de mim
            </label>
          </div>
          {erro && <p className="font-body text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2.5 mb-4">{erro}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gold text-dark font-body font-semibold text-sm py-3.5 rounded-xl hover:bg-gold-light hover:shadow-[0_4px_24px_rgba(201,169,110,0.4)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DropZone({ onFiles }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 text-center
        ${dragOver ? 'border-gold bg-gold/5 scale-[1.01]' : 'border-dark-300 hover:border-gold/40 hover:bg-dark-200/50'}`}
    >
      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
        onChange={(e) => onFiles(Array.from(e.target.files))} />
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${dragOver ? 'bg-gold text-dark' : 'bg-dark-300 text-gold'}`}>
        <Icon.Upload />
      </div>
      <p className="font-body text-white/80 font-medium mb-1">
        {dragOver ? 'Solte as fotos aqui!' : 'Arraste as fotos ou clique para selecionar'}
      </p>
      <p className="font-body text-white/30 text-xs">JPG, PNG, WEBP — várias fotos de uma vez</p>
    </div>
  );
}

function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between font-body text-xs text-white/50 mb-1.5">
        <span>{done} de {total} enviadas</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-dark-300 overflow-hidden">
        <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AbaUpload({ categorias, onUploadConcluido }) {
  const [catSelecionada, setCatSelecionada] = useState('');
  const [filas, setFilas] = useState([]);
  const [fazendoUpload, setFazendoUpload] = useState(false);

  const isMissingPlaceholderColumnError = useCallback((error) => {
    const text = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    return text.includes('placeholder') && text.includes('fotos');
  }, []);

  const adicionarArquivos = useCallback((files) => {
    const novos = files.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      preview: URL.createObjectURL(f),
      status: 'aguardando',
      erro: '',
      tamanhoOriginal: f.size,
      tamanhoComprimido: null,
    }));
    setFilas((prev) => [...prev, ...novos]);
  }, []);

  const removerDaFila = useCallback((id) => {
    setFilas((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const setItemStatus = useCallback((id, update) => {
    setFilas((prev) => prev.map((f) => f.id === id ? { ...f, ...update } : f));
  }, []);

  const enviarTudo = async () => {
    if (!catSelecionada) { alert('Selecione uma categoria antes de enviar.'); return; }
    const pendentes = filas.filter((f) => f.status === 'aguardando');
    if (!pendentes.length) { alert('Adicione pelo menos uma foto.'); return; }

    setFazendoUpload(true);

    const tasks = pendentes.map((item) => async () => {
      setItemStatus(item.id, { status: 'enviando' });
      try {
        // 1. Comprime
        const compressed = await compressImage(item.file, 2048, 0.85);
        setItemStatus(item.id, { tamanhoComprimido: compressed.size });

        const fileToUpload = compressed instanceof File
          ? compressed
          : new File([compressed], item.file.name, { type: compressed.type || 'image/webp' });

        // 2. Gera placeholder minúsculo (20 px) com blur
        const placeholder = await generatePlaceholder(fileToUpload, 20);

        // 3. Upload para Storage
        const url = await uploadFoto(fileToUpload, catSelecionada);

        // 4. Persiste no banco (inclui placeholder)
        let { error } = await supabase.from('fotos').insert({
          categoria_slug: catSelecionada,
          url,
          titulo: item.file.name.replace(/\.[^.]+$/, ''),
          ativo: true,
          placeholder: placeholder || null,
        });

        if (error && isMissingPlaceholderColumnError(error)) {
          const retry = await supabase.from('fotos').insert({
            categoria_slug: catSelecionada,
            url,
            titulo: item.file.name.replace(/\.[^.]+$/, ''),
            ativo: true,
          });
          error = retry.error;
        }

        if (error) throw error;

        setItemStatus(item.id, { status: 'ok' });
      } catch (err) {
        setItemStatus(item.id, { status: 'erro', erro: err?.message ?? 'Erro desconhecido' });
      }
    });

    await runWithConcurrency(tasks, 3);
    setFazendoUpload(false);
    onUploadConcluido?.();
  };

  const pendentes = filas.filter((f) => f.status === 'aguardando');
  const concluidos = filas.filter((f) => f.status === 'ok');
  const comErro = filas.filter((f) => f.status === 'erro');
  const emAndamento = filas.filter((f) => f.status === 'enviando');

  const economizado = filas.reduce((acc, f) => {
    if (f.tamanhoComprimido) return acc + (f.tamanhoOriginal - f.tamanhoComprimido);
    return acc;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1">Adicionar fotos</h2>
        <p className="font-body text-sm text-white/40">
          As fotos são comprimidas + placeholder de blur gerado automaticamente
        </p>
      </div>

      <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
        <label className="font-body text-xs text-white/50 tracking-widest uppercase mb-3 block">
          1. Escolha a categoria
        </label>
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <button key={cat.slug} onClick={() => setCatSelecionada(cat.slug)}
              className={`px-4 py-2 rounded-full font-body text-sm border transition-all duration-200 active:scale-95
                ${catSelecionada === cat.slug
                  ? 'bg-gold text-dark border-gold font-semibold shadow-[0_4px_16px_rgba(201,169,110,0.35)]'
                  : 'border-dark-300 text-white/60 hover:border-gold/40 hover:text-white'}`}>
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
        <label className="font-body text-xs text-white/50 tracking-widest uppercase mb-3 block">
          2. Selecione as fotos
        </label>
        <DropZone onFiles={adicionarArquivos} />
      </div>

      {filas.length > 0 && (
        <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
          <div className="mb-4">
            {fazendoUpload || concluidos.length > 0 ? (
              <ProgressBar
                done={concluidos.length}
                total={pendentes.length + concluidos.length + emAndamento.length + comErro.length}
              />
            ) : (
              <div className="flex items-center justify-between">
                <p className="font-body text-sm text-white/70">
                  {pendentes.length} foto{pendentes.length !== 1 ? 's' : ''} selecionada{pendentes.length !== 1 ? 's' : ''}
                </p>
                <button onClick={() => { filas.forEach((f) => f.preview && URL.revokeObjectURL(f.preview)); setFilas([]); }}
                  className="font-body text-xs text-white/30 hover:text-white/60 transition-colors">
                  Limpar lista
                </button>
              </div>
            )}
            {economizado > 1024 && (
              <p className="font-body text-xs text-green-400/70 mt-2">
                ↓ {(economizado / 1024 / 1024).toFixed(1)} MB economizados com a compressão
              </p>
            )}
            {pendentes.length > 0 && !fazendoUpload && (
              <p className="font-body text-xs text-gold/60 mt-1.5 flex items-center gap-1">
                <Icon.Image />
                Placeholder de blur será gerado automaticamente para cada foto
              </p>
            )}
            {comErro.length > 0 && (
              <p className="font-body text-xs text-red-400 mt-2">
                ⚠ {comErro.length} foto{comErro.length !== 1 ? 's' : ''} com erro
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-72 overflow-y-auto pr-1">
            {filas.map((item) => (
              <div key={item.id} className="relative rounded-xl overflow-hidden aspect-square group">
                <img src={item.preview} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200
                  ${item.status === 'enviando' ? 'bg-dark/70' : item.status === 'ok' ? 'bg-green-500/25' : item.status === 'erro' ? 'bg-red-500/40' : 'bg-transparent'}`}>
                  {item.status === 'enviando' && <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {item.status === 'ok' && <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center"><Icon.Check /></div>}
                  {item.status === 'erro' && <span className="text-white text-[10px] px-2 text-center leading-tight">{item.erro || 'Erro'}</span>}
                </div>
                {item.status === 'aguardando' && (
                  <button onClick={() => removerDaFila(item.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-dark/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500 text-sm leading-none">
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pendentes.length > 0 && !fazendoUpload && (
        <button onClick={enviarTudo} disabled={!catSelecionada} className="btn-gold w-full justify-center py-4 text-base disabled:opacity-50">
          Enviar {pendentes.length} foto{pendentes.length !== 1 ? 's' : ''}
          {catSelecionada ? ` para "${catSelecionada}"` : ''}
          <span className="btn-arrow">→</span>
        </button>
      )}

      {fazendoUpload && (
        <div className="text-center font-body text-sm text-white/50 py-2">
          Enviando + gerando placeholders (3 simultâneos)…
        </div>
      )}

      {comErro.length > 0 && !fazendoUpload && (
        <button
          onClick={() => setFilas((prev) => prev.map((f) => f.status === 'erro' ? { ...f, status: 'aguardando', erro: '' } : f))}
          className="btn-outline w-full justify-center py-3 text-sm text-red-400 border-red-400/30 hover:border-red-400">
          Tentar novamente ({comErro.length} com erro)
        </button>
      )}
    </div>
  );
}

function AbaFotos({ categorias }) {
  const [catSelecionada, setCatSelecionada] = useState('__all__');
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [usingAnonFallback, setUsingAnonFallback] = useState(false);

  const normalizeSlug = useCallback((value) => (
    String(value || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/_+/g, '-')
      .replace(/-+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  ), []);

  const isMissingPlaceholderColumnError = useCallback((error) => {
    const text = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    return text.includes('placeholder') && text.includes('fotos');
  }, []);

  const carregarFotos = useCallback(async (slug) => {
    setLoading(true);
    setUsingAnonFallback(false);

    const runQuery = async (client, withPlaceholder = true) => client
      .from('fotos')
      .select(withPlaceholder
        ? 'id, url, placeholder, titulo, ativo, created_at, categoria_slug'
        : 'id, url, titulo, ativo, created_at, categoria_slug')
      .order('created_at', { ascending: false });

    const runQuerySafe = async (client) => {
      const first = await runQuery(client, true);
      if (!isMissingPlaceholderColumnError(first.error)) return first;
      const fallback = await runQuery(client, false);
      return {
        ...fallback,
        data: (fallback.data || []).map((row) => ({ ...row, placeholder: null }),
      )
      };
    };

    let { data, error } = await runQuerySafe(supabase);

    if ((!data || data.length === 0) && !error) {
      const anonResult = await runQuerySafe(supabaseAnonRead);
      if (anonResult?.data?.length > 0) {
        data = anonResult.data;
        setUsingAnonFallback(true);
      }
    }

    if (error) {
      const anonResult = await runQuerySafe(supabaseAnonRead);
      if (anonResult?.data?.length > 0) {
        data = anonResult.data;
        error = null;
        setUsingAnonFallback(true);
      }
    }

    const allPhotos = data || [];
    if (!slug || slug === '__all__') {
      setFotos(allPhotos);
    } else {
      const wanted = normalizeSlug(slug);
      setFotos(allPhotos.filter((foto) => normalizeSlug(foto.categoria_slug) === wanted));
    }
    setLoading(false);
  }, [normalizeSlug, isMissingPlaceholderColumnError]);

  useEffect(() => {
    carregarFotos(catSelecionada);
  }, [catSelecionada, carregarFotos]);

  useEffect(() => {
    if (!categorias?.length && catSelecionada !== '__all__') {
      setCatSelecionada('__all__');
    }
  }, [categorias, catSelecionada]);

  const toggleAtivo = async (foto) => {
    await supabase.from('fotos').update({ ativo: !foto.ativo }).eq('id', foto.id);
    carregarFotos(catSelecionada);
  };

  const excluir = async (foto) => {
    if (!confirm('Excluir esta foto permanentemente?')) return;
    setExcluindo(foto.id);
    try {
      await deleteFotoStorage(foto.url);
      await supabase.from('fotos').delete().eq('id', foto.id);
      carregarFotos(catSelecionada);
    } finally {
      setExcluindo(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1">Minhas fotos</h2>
        <p className="font-body text-sm text-white/40">Gerencie as fotos por categoria</p>
      </div>

      <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
        <label className="font-body text-xs text-white/50 tracking-widest uppercase mb-3 block">
          Categoria
        </label>
        <div className="flex flex-wrap gap-2">
          <button key="__all__" onClick={() => setCatSelecionada('__all__')}
            className={`px-4 py-2 rounded-full font-body text-sm border transition-all duration-200 active:scale-95
              ${catSelecionada === '__all__'
                ? 'bg-gold text-dark border-gold font-semibold'
                : 'border-dark-300 text-white/60 hover:border-gold/40 hover:text-white'}`}>
            Todas
          </button>
          {categorias.map((cat) => (
            <button key={cat.slug} onClick={() => setCatSelecionada(cat.slug)}
              className={`px-4 py-2 rounded-full font-body text-sm border transition-all duration-200 active:scale-95
                ${catSelecionada === cat.slug
                  ? 'bg-gold text-dark border-gold font-semibold'
                  : 'border-dark-300 text-white/60 hover:border-gold/40 hover:text-white'}`}>
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
        {usingAnonFallback && (
          <p className="font-body text-xs text-yellow-300/80 mb-3">
            Exibindo leitura pública (anon). A sessão logada não está com permissão de leitura completa em `public.fotos`.
          </p>
        )}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : fotos.length === 0 ? (
          <p className="text-center font-body text-white/30 py-12">Nenhuma foto encontrada no Supabase para este filtro.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {fotos.map((foto) => (
              <div key={foto.id} className="relative group rounded-xl overflow-hidden aspect-square">
                {foto.placeholder && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("${foto.placeholder}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(8px)',
                      transform: 'scale(1.1)',
                    }}
                  />
                )}
                <img
                  src={foto.url}
                  alt={foto.titulo || ''}
                  className="relative z-10 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {!foto.ativo && (
                  <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
                    <span className="font-body text-xs text-white/60">Oculta</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 z-30 rounded-full bg-black/55 border border-white/10 px-2 py-0.5">
                  <span className="font-body text-[10px] text-white/70">{foto.categoria_slug || 'sem-categoria'}</span>
                </div>
                <div className="absolute inset-0 z-30 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button onClick={() => toggleAtivo(foto)}
                    title={foto.ativo ? 'Ocultar' : 'Mostrar'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                      ${foto.ativo ? 'border-green-400/50 text-green-400' : 'border-white/30 text-white/60'}`}>
                    <Icon.Eye off={!foto.ativo} />
                  </button>
                  <button onClick={() => excluir(foto)}
                    disabled={excluindo === foto.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-red-400/40 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40">
                    {excluindo === foto.id
                      ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <Icon.Trash />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {fotos.length > 0 && (
          <p className="font-body text-xs text-white/30 mt-4 text-right">{fotos.length} foto{fotos.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  );
}

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
    await supabase.from('categorias').insert({ nome: novoNome.trim(), slug: novoSlug || gerarSlug(novoNome), ativo: true });
    setNovoNome(''); setNovoSlug(''); setCriando(false); onAtualizar();
  };

  const toggleCat = async (cat) => {
    await supabase.from('categorias').update({ ativo: !cat.ativo }).eq('id', cat.id);
    onAtualizar();
  };

  const salvarEdicao = async (id) => {
    if (!editNome.trim()) return;
    await supabase.from('categorias').update({ nome: editNome.trim() }).eq('id', id);
    setEditandoId(null); onAtualizar();
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

      <div className="bg-dark-100 rounded-2xl p-6 border border-dark-300">
        <p className="font-body text-xs text-white/50 tracking-widest uppercase mb-4">Nova categoria</p>
        <div className="flex gap-3">
          <input value={novoNome} onChange={(e) => { setNovoNome(e.target.value); setNovoSlug(gerarSlug(e.target.value)); }}
            placeholder="Ex: Ensaios Femininos"
            className="flex-1 bg-dark-200 border border-dark-300 rounded-xl px-4 py-3 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/60 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && criar()} />
          <button onClick={criar} disabled={!novoNome.trim() || criando}
            className="px-5 py-3 bg-gold text-dark font-body font-semibold text-sm rounded-xl hover:bg-gold-light hover:shadow-[0_4px_20px_rgba(201,169,110,0.3)] active:scale-95 transition-all duration-300 disabled:opacity-40 flex items-center gap-2">
            <Icon.Plus /> Criar
          </button>
        </div>
        {novoSlug && <p className="font-body text-xs text-white/30 mt-2">Slug: <span className="text-gold/60">{novoSlug}</span></p>}
      </div>

      <div className="flex flex-col gap-3">
        {categorias.map((cat) => (
          <div key={cat.id} className={`bg-dark-100 rounded-xl border px-5 py-4 flex items-center gap-4 transition-all duration-300 ${cat.ativo ? 'border-dark-300' : 'border-dark-300 opacity-60'}`}>
            {editandoId === cat.id ? (
              <input autoFocus value={editNome} onChange={(e) => setEditNome(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') salvarEdicao(cat.id); if (e.key === 'Escape') setEditandoId(null); }}
                className="flex-1 bg-dark-200 border border-gold/50 rounded-lg px-3 py-1.5 font-body text-sm text-white focus:outline-none" />
            ) : (
              <div className="flex-1">
                <p className="font-body text-sm text-white font-medium">{cat.nome}</p>
                <p className="font-body text-xs text-white/30 mt-0.5">{cat.slug}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              {editandoId === cat.id ? (
                <button onClick={() => salvarEdicao(cat.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                  <Icon.Check />
                </button>
              ) : (
                <button onClick={() => { setEditandoId(cat.id); setEditNome(cat.nome); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-300 text-white/40 hover:border-gold/40 hover:text-gold transition-all duration-200">
                  <Icon.Edit />
                </button>
              )}
              <button onClick={() => toggleCat(cat)} title={cat.ativo ? 'Ocultar categoria' : 'Mostrar categoria'}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-200
                  ${cat.ativo ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-dark-300 text-white/30 hover:border-gold/40'}`}>
                <Icon.Eye off={!cat.ativo} />
              </button>
              <button onClick={() => excluirCat(cat)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-300 text-white/30 hover:border-red-500/50 hover:text-red-400 transition-all duration-200">
                <Icon.Trash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('upload');
  const [categorias, setCategorias] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSessao(data.session); setCarregando(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => { setSessao(session); });
    return () => listener.subscription.unsubscribe();
  }, []);

  const carregarCategorias = useCallback(async () => {
    const { data } = await supabase.from('categorias').select('*').order('nome');
    setCategorias(data || []);
  }, []);

  useEffect(() => { if (sessao) carregarCategorias(); }, [sessao, carregarCategorias]);

  const logout = () => supabase.auth.signOut();

  if (carregando) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sessao) return <LoginScreen onLogin={() => {}} />;

  const navItems = [
    { id: 'upload', label: 'Adicionar fotos', icon: <Icon.Upload /> },
    { id: 'fotos', label: 'Minhas fotos', icon: <Icon.Grid /> },
    { id: 'categorias', label: 'Categorias', icon: <Icon.Tag /> },
  ];

  return (
    <div className="min-h-screen bg-dark flex">
      <aside className="hidden md:flex w-64 bg-dark-100 border-r border-dark-300 flex-col shrink-0">
        <div className="p-6 border-b border-dark-300 flex items-center gap-2.5">
          <img src={LogoBranca} alt="Isabel Lucena" className="h-8 w-auto object-contain" />
          <span className="font-body text-[10px] text-gold/60 tracking-[0.2em] uppercase">Painel</span>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setAbaAtiva(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-left transition-all duration-200 active:scale-[0.98]
                ${abaAtiva === item.id
                  ? 'bg-gold/15 text-gold border border-gold/20'
                  : 'text-white/50 hover:text-white hover:bg-dark-200 border border-transparent'}`}>
              <span className={abaAtiva === item.id ? 'text-gold' : 'text-white/30'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-300">
          <div className="px-4 py-2 mb-3">
            <p className="font-body text-xs text-white/40 truncate">{sessao.user.email}</p>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent active:scale-[0.98]">
            <Icon.Logout /> Sair
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-dark-100 border-b border-dark-300 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={LogoBranca} alt="Isabel Lucena" className="h-6 w-auto object-contain" />
          <p className="font-display text-white text-sm font-semibold italic">Painel</p>
        </div>
        <button onClick={() => setMenuAberto(!menuAberto)} className="w-9 h-9 flex flex-col gap-1.5 items-center justify-center">
          <span className={`block w-5 h-px bg-gold transition-all duration-300 ${menuAberto ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuAberto ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-gold transition-all duration-300 ${menuAberto ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {menuAberto && (
        <div className="md:hidden fixed inset-0 z-40 bg-dark-100 pt-16 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setAbaAtiva(item.id); setMenuAberto(false); }}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-body text-base transition-all duration-200 ${abaAtiva === item.id ? 'bg-gold/15 text-gold' : 'text-white/70'}`}>
              {item.icon} {item.label}
            </button>
          ))}
          <button onClick={logout} className="flex items-center gap-3 px-5 py-4 text-red-400 font-body">
            <Icon.Logout /> Sair
          </button>
        </div>
      )}

      <main className="flex-1 p-6 md:p-10 mt-14 md:mt-0 overflow-y-auto">
        {abaAtiva === 'upload' && <AbaUpload categorias={categorias} onUploadConcluido={carregarCategorias} />}
        {abaAtiva === 'fotos' && <AbaFotos categorias={categorias} />}
        {abaAtiva === 'categorias' && <AbaCategorias categorias={categorias} onAtualizar={carregarCategorias} />}
      </main>
    </div>
  );
}