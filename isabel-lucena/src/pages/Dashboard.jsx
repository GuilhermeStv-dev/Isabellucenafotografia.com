// src/pages/Dashboard.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase, supabaseAnonRead, uploadFoto, deleteFotoStorage } from '../lib/supabase';
import { compressImage, runWithConcurrency } from '../lib/imageUtils';
import { generatePlaceholder } from '../lib/generatePlaceholder';
import RichEditor from '../components/RichEditor';
import Toast from '../components/Toast';
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
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
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
            className="btn-gold w-full py-3.5 rounded-xl active:scale-[0.98]">
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
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

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
    if (!catSelecionada) { showToast('Selecione uma categoria antes de enviar.', 'info'); return; }
    const pendentes = filas.filter((f) => f.status === 'aguardando');
    if (!pendentes.length) { showToast('Adicione pelo menos uma foto.', 'info'); return; }

    setFazendoUpload(true);
    let enviadosComSucesso = 0;
    let enviadosComErro = 0;

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
        enviadosComSucesso += 1;
      } catch (err) {
        setItemStatus(item.id, { status: 'erro', erro: err?.message ?? 'Erro desconhecido' });
        enviadosComErro += 1;
      }
    });

    await runWithConcurrency(tasks, 3);
    setFazendoUpload(false);
    onUploadConcluido?.();

    if (enviadosComErro === 0) {
      showToast(`${enviadosComSucesso} foto${enviadosComSucesso !== 1 ? 's' : ''} enviada${enviadosComSucesso !== 1 ? 's' : ''} com sucesso!`, 'success');
      return;
    }

    if (enviadosComSucesso > 0) {
      showToast(`${enviadosComSucesso} enviada${enviadosComSucesso !== 1 ? 's' : ''} e ${enviadosComErro} com erro.`, 'info');
      return;
    }

    showToast(`Não foi possível enviar as fotos. ${enviadosComErro} item${enviadosComErro !== 1 ? 'ns' : ''} com erro.`, 'error');
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
                ${catSelecionada === cat.slug ? 'btn-gold' : 'btn-outline'}`}>
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
                : 'btn-outline'}`}>
            Todas
          </button>
          {categorias.map((cat) => (
            <button key={cat.slug} onClick={() => setCatSelecionada(cat.slug)}
              className={`px-4 py-2 rounded-full font-body text-sm border transition-all duration-200 active:scale-95
                ${catSelecionada === cat.slug ? 'btn-gold' : 'btn-outline'}`}>
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
            className="btn-gold px-5 py-3 rounded-xl flex items-center gap-2">
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

/* ═══════════════════════════════════════════════════
   ABA BLOG
═══════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════
   ABA BLOG - AUTORES
═══════════════════════════════════════════════════ */

function AbaAutoresModal({ isOpen, onClose, onAuthorAdded, editingAuthor = null }) {
  const [foto, setFoto] = useState(editingAuthor?.foto_url || '');
  const [fotoPreviewing, setFotoPreviewing] = useState(editingAuthor?.foto_url || '');
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [formData, setFormData] = useState({
    nome: editingAuthor?.nome || '',
    profissao: editingAuthor?.profissao || '',
    bio: editingAuthor?.bio || '',
    ativo: editingAuthor?.ativo ?? true
  });

  const [loading, setLoading] = useState(false);

  const uploadFotoAutor = async (file) => {
    if (!file) return null;
    try {
      setUploadingFoto(true);
      const ext = file.name.split('.').pop();
      const fileName = `autor-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(`authors/${fileName}`, file);

      if (error) throw error;
      
      const { data: publicUrl } = await supabase.storage
        .from('blog-images')
        .getPublicUrl(`authors/${fileName}`);

      return publicUrl.publicUrl;
    } catch (err) {
      showToast('Erro ao fazer upload: ' + err.message, 'error');
      return null;
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setFotoPreviewing(preview);

    const url = await uploadFotoAutor(file);
    if (url) {
      setFoto(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      showToast('Nome é obrigatório', 'error');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        foto_url: foto || null
      };

      if (editingAuthor) {
        const { error } = await supabase
          .from('blog_authors')
          .update(dataToSave)
          .eq('id', editingAuthor.id);
        if (error) throw error;
        showToast('Autor atualizado!', 'success');
      } else {
        const { error } = await supabase
          .from('blog_authors')
          .insert(dataToSave);
        if (error) throw error;
        showToast('Autor criado!', 'success');
      }

      onAuthorAdded?.();
      onClose();
    } catch (err) {
      showToast('Erro: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-dark-200 border border-dark-300 rounded-2xl p-6 max-w-2xl w-full my-8">
        <h3 className="font-display text-2xl text-white mb-6">
          {editingAuthor ? 'Editar Autor' : 'Novo Autor'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Foto */}
          <div>
            <label className="block font-body text-sm text-white/70 mb-3">Foto de Perfil</label>
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-300 border border-white/10 shrink-0">
                {fotoPreviewing ? (
                  <img src={fotoPreviewing} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">👤</div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  disabled={uploadingFoto}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFoto}
                  className="block px-4 py-2 rounded-lg bg-dark-300 text-white text-sm font-body
                             hover:bg-dark-100 transition-colors disabled:opacity-50"
                >
                  {uploadingFoto ? 'Enviando...' : 'Escolher Foto'}
                </button>
                <p className="text-xs text-white/40 mt-2">JPEG, PNG (máx 5MB)</p>
              </div>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block font-body text-sm text-white/70 mb-2">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Isabel Lucena"
              className="w-full bg-dark-300 border border-white/10 text-white rounded-xl px-4 py-3
                         font-body text-sm placeholder:text-white/30 focus:outline-none focus:border-gold/50"
              required
            />
          </div>

          {/* Profissão */}
          <div>
            <label className="block font-body text-sm text-white/70 mb-2">Profissão</label>
            <input
              type="text"
              value={formData.profissao}
              onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
              placeholder="Ex: Fotógrafa"
              className="w-full bg-dark-300 border border-white/10 text-white rounded-xl px-4 py-3
                         font-body text-sm placeholder:text-white/30 focus:outline-none focus:border-gold/50"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block font-body text-sm text-white/70 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Breve descrição sobre o autor"
              rows={3}
              className="w-full bg-dark-300 border border-white/10 text-white rounded-xl px-4 py-3
                         font-body text-sm placeholder:text-white/30 focus:outline-none focus:border-gold/50 resize-none"
            />
          </div>

          {/* Ativo */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="author-ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="w-4 h-4 accent-gold"
            />
            <label htmlFor="author-ativo" className="font-body text-sm text-white/70 cursor-pointer">
              Autor ativo
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-6 border-t border-dark-300">
            <button
              type="submit"
              disabled={loading || uploadingFoto}
              className="px-6 py-3 rounded-xl bg-gold text-dark font-body font-semibold text-sm
                         hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Autor'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-white/20 text-white/70 font-body text-sm
                         hover:border-white/40 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ABA BLOG
═══════════════════════════════════════════════════ */

function AbaBlog() {
  const [tab, setTab] = useState('posts'); // 'posts' ou 'autores'
  const [posts, setPosts] = useState([]);
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarAuthorModal, setMostrarAuthorModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);

  const [imagemCapaUrl, setImagemCapaUrl] = useState('');
  const [imagemCapaPreview, setImagemCapaPreview] = useState('');
  const [uploadingCapa, setUploadingCapa] = useState(false);
  const fileInputCapaRef = useRef(null);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [formData, setFormData] = useState({
    titulo: '',
    excerpt: '',
    conteudo: '',
    autor_id: ''
  });

  const gerarSlug = (titulo) => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const carregarPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, blog_authors(nome, profissao)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      showToast('Erro ao carregar posts: ' + err.message, 'error');
    }
  };

  const carregarAutores = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_authors')
        .select('*')
        .order('nome');

      if (error) throw error;
      setAutores(data || []);
    } catch (err) {
      showToast('Erro ao carregar autores: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([carregarPosts(), carregarAutores()]).finally(() => setLoading(false));
  }, []);

  const uploadCapaBlog = async (file) => {
    if (!file) return null;
    try {
      setUploadingCapa(true);
      const ext = file.name.split('.').pop();
      const fileName = `post-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(`posts/${fileName}`, file);

      if (error) throw error;
      
      const { data: publicUrl } = await supabase.storage
        .from('blog-images')
        .getPublicUrl(`posts/${fileName}`);

      return publicUrl.publicUrl;
    } catch (err) {
      showToast('Erro ao fazer upload: ' + err.message, 'error');
      return null;
    } finally {
      setUploadingCapa(false);
    }
  };

  const handleCapaChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagemCapaPreview(preview);

    const url = await uploadCapaBlog(file);
    if (url) {
      setImagemCapaUrl(url);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      excerpt: '',
      conteudo: '',
      autor_id: ''
    });
    setImagemCapaUrl('');
    setImagemCapaPreview('');
    setEditando(null);
    setMostrarForm(false);
  };

  const salvarPost = async (publicar = true) => {
    if (!formData.titulo || !formData.excerpt || !formData.conteudo || !imagemCapaUrl) {
      showToast('Preencha todos os campos obrigatórios (incluindo imagem de capa).', 'error');
      return;
    }

    const slug = gerarSlug(formData.titulo);
    const dataToSave = {
      titulo: formData.titulo,
      slug,
      excerpt: formData.excerpt,
      conteudo: formData.conteudo,
      imagem_capa: imagemCapaUrl,
      autor_id: formData.autor_id || null,
      ativo: publicar
    };

    try {
      if (editando) {
        const { error } = await supabase
          .from('blog_posts')
          .update(dataToSave)
          .eq('id', editando);

        if (error) throw error;
        showToast('Post atualizado com sucesso!', 'success');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(dataToSave);

        if (error) throw error;
        const msgSucesso = publicar ? 'Post publicado com sucesso!' : 'Post salvo como rascunho!';
        showToast(msgSucesso, 'success');
      }

      resetForm();
      carregarPosts();
    } catch (err) {
      showToast('Erro ao salvar post: ' + err.message, 'error');
    }
  };

  const handleEdit = (post) => {
    setFormData({
      titulo: post.titulo,
      excerpt: post.excerpt,
      conteudo: post.conteudo,
      autor_id: post.autor_id || ''
    });
    setImagemCapaUrl(post.imagem_capa);
    setImagemCapaPreview(post.imagem_capa);
    setEditando(post.id);
    setMostrarForm(true);
  };

  const handleToggleAtivo = async (post) => {
    try {
      await supabase
        .from('blog_posts')
        .update({ ativo: !post.ativo })
        .eq('id', post.id);
      carregarPosts();
    } catch (err) {
      showToast('Erro: ' + err.message, 'error');
    }
  };

  const handleDeletePost = async (post) => {
    if (!confirm(`Excluir "${post.titulo}"?`)) return;

    try {
      await supabase.from('blog_posts').delete().eq('id', post.id);
      showToast('Post excluído!', 'success');
      carregarPosts();
    } catch (err) {
      showToast('Erro: ' + err.message, 'error');
    }
  };

  const handleDeleteAuthor = async (author) => {
    if (!confirm(`Excluir autor "${author.nome}"?`)) return;

    try {
      await supabase.from('blog_authors').delete().eq('id', author.id);
      showToast('Autor excluído!', 'success');
      carregarAutores();
    } catch (err) {
      showToast('Erro: ' + err.message, 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-white/40">Carregando...</p></div>;
  }

  return (
    <div className="max-w-7xl space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Tabs */}
      <div className="flex gap-4 border-b border-dark-300">
        <button
          onClick={() => setTab('posts')}
          className={`px-4 py-3 font-body text-sm font-semibold border-b-2 transition-colors ${
            tab === 'posts'
              ? 'border-gold text-gold'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Posts ({posts.length})
        </button>
        <button
          onClick={() => setTab('autores')}
          className={`px-4 py-3 font-body text-sm font-semibold border-b-2 transition-colors ${
            tab === 'autores'
              ? 'border-gold text-gold'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Autores ({autores.length})
        </button>
      </div>

      {/* TAB: POSTSunlock */}
      {tab === 'posts' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl text-white">Meus Posts</h2>
              <p className="font-body text-white/40 text-sm mt-1">Crie e gerencie seus artigos de blog</p>
            </div>
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold text-dark font-body font-semibold text-sm
                         hover:brightness-110 transition-all active:scale-95"
            >
              <Icon.Plus />
              {mostrarForm ? 'Cancelar' : 'Novo Post'}
            </button>
          </div>

          {/* Formulário */}
          {mostrarForm && (
            <form onSubmit={(e) => { e.preventDefault(); }} className="bg-dark-200 border border-dark-300 rounded-2xl p-8 space-y-6">
              <h3 className="font-display text-2xl text-white">
                {editando ? 'Editar Post' : 'Criar Novo Post'}
              </h3>

              {/* Título */}
              <div>
                <label className="block font-body text-sm text-white/70 mb-2">Título do Post</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Como se preparar para o seu ensaio gestante"
                  className="w-full bg-dark-300 border border-white/10 text-white rounded-xl px-4 py-3
                             font-body text-sm placeholder:text-white/30 focus:outline-none focus:border-gold/50"
                  required
                />
              </div>

              {/* Resumo */}
              <div>
                <label className="block font-body text-sm text-white/70 mb-2">Resumo (Excerpt)</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve descrição que aparece no card do post"
                  rows={2}
                  maxLength={250}
                  className="w-full bg-dark-300 border border-white/10 text-white rounded-xl px-4 py-3
                             font-body text-sm placeholder:text-white/30 focus:outline-none focus:border-gold/50 resize-none"
                  required
                />
                <p className="text-xs text-white/40 text-right mt-1">{formData.excerpt.length}/250</p>
              </div>

              {/* Imagem de Capa */}
              <div>
                <label className="block font-body text-sm text-white/70 mb-3">Imagem de Capa</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      ref={fileInputCapaRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCapaChange}
                      disabled={uploadingCapa}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputCapaRef.current?.click()}
                      disabled={uploadingCapa}
                      className="w-full px-6 py-4 rounded-xl border-2 border-dashed border-white/20
                                 text-white/60 font-body text-sm hover:border-gold/50 hover:text-gold transition-colors
                                 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploadingCapa ? (
                        <>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Icon.Upload size={20} />
                          Clique para escolher ou arraste uma imagem
                        </>
                      )}
                    </button>
                  </div>
                  {imagemCapaPreview && (
                    <div className="w-32 h-32 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={imagemCapaPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Conteúdo com Editor Visual */}
              <div>
                <label className="block font-body text-sm text-white/70 mb-2">Conteúdo do Post</label>
                <RichEditor
                  value={formData.conteudo}
                  onChange={(html) => setFormData({ ...formData, conteudo: html })}
                />
              </div>

              {/* Autor */}
              <div>
                <label className="block font-body text-sm text-white/70 mb-2">Autor</label>
                {autores.length === 0 ? (
                  <div className="p-4 bg-dark-300 rounded-xl text-center">
                    <p className="font-body text-sm text-white/50 mb-3">Nenhum autor cadastrado</p>
                    <button
                      type="button"
                      onClick={() => setMostrarAuthorModal(true)}
                      className="text-gold font-semibold text-sm hover:underline"
                    >
                      Criar primeiro autor
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.autor_id}
                    onChange={(e) => setFormData({ ...formData, autor_id: e.target.value })}
                    className="w-full bg-dark-300 border border-white/10 text-white rounded-xl px-4 py-3
                               font-body text-sm focus:outline-none focus:border-gold/50"
                  >
                    <option value="">Selecionar autor (opcional)</option>
                    {autores.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.nome} {author.profissao ? `- ${author.profissao}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-6 border-t border-dark-300">
                <button
                  type="button"
                  onClick={() => salvarPost(true)}
                  disabled={uploadingCapa}
                  className="flex-1 px-6 py-3 rounded-xl bg-gold text-dark font-body font-semibold text-sm
                             hover:brightness-110 transition-all disabled:opacity-50 active:scale-95"
                >
                  <Icon.Check size={18} className="inline mr-2" />
                  Publicar Post
                </button>
                <button
                  type="button"
                  onClick={() => salvarPost(false)}
                  disabled={uploadingCapa}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-white/20 text-white/70 font-body font-semibold text-sm
                             hover:border-gold/50 hover:text-gold transition-all disabled:opacity-50 active:scale-95"
                >
                  <Icon.FileText size={18} className="inline mr-2" />
                  Salvar como Rascunho
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-white/20 text-white/70 font-body font-semibold text-sm
                             hover:border-white/40 hover:text-white transition-all active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de Posts */}
          {posts.length === 0 ? (
            <div className="bg-dark-200 border border-dark-300 rounded-2xl p-12 text-center">
              <p className="font-body text-white/40 text-sm">Nenhum post criado ainda. Comece a escrever!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-dark-200 border border-dark-300 rounded-xl p-4 flex gap-4 items-start hover:border-white/20 transition-colors"
                >
                  <img src={post.imagem_capa} alt="" className="w-24 h-24 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-display text-lg text-white truncate">{post.titulo}</h4>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-body shrink-0 ${
                        post.ativo ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {post.ativo ? '✓ Publicado' : '📝 Rascunho'}
                      </span>
                    </div>
                    <p className="font-body text-xs text-white/40">/blog/{gerarSlug(post.titulo)}</p>
                    {post.blog_authors && (
                      <p className="font-body text-xs text-white/50 mt-2">
                        Por <strong>{post.blog_authors.nome}</strong>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 rounded-lg bg-dark-300 hover:bg-blue-500/20 text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Icon.Edit />
                    </button>
                    <button
                      onClick={() => handleToggleAtivo(post)}
                      className="p-2 rounded-lg bg-dark-300 hover:bg-gold/20 text-gold transition-colors"
                      title={post.ativo ? 'Despublicar' : 'Publicar'}
                    >
                      <Icon.Eye off={!post.ativo} />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post)}
                      className="p-2 rounded-lg bg-dark-300 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Icon.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB: AUTORES */}
      {tab === 'autores' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl text-white">Autores</h2>
              <p className="font-body text-white/40 text-sm mt-1">Cadastre autores para seus posts</p>
            </div>
            <button
              onClick={() => {
                setEditingAuthor(null);
                setMostrarAuthorModal(true);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold text-dark font-body font-semibold text-sm
                         hover:brightness-110 transition-all active:scale-95"
            >
              <Icon.Plus />
              Novo Autor
            </button>
          </div>

          {autores.length === 0 ? (
            <div className="bg-dark-200 border border-dark-300 rounded-2xl p-12 text-center">
              <p className="font-body text-white/40 text-sm">Nenhum autor cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {autores.map((author) => (
                <div
                  key={author.id}
                  className="bg-dark-200 border border-dark-300 rounded-xl p-6 text-center hover:border-white/20 transition-colors"
                >
                  {author.foto_url && (
                    <img
                      src={author.foto_url}
                      alt={author.nome}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gold/20"
                    />
                  )}
                  <h4 className="font-display text-lg text-white">{author.nome}</h4>
                  {author.profissao && (
                    <p className="font-body text-sm text-gold my-1">{author.profissao}</p>
                  )}
                  {author.bio && (
                    <p className="font-body text-xs text-white/50 mt-3 line-clamp-2">{author.bio}</p>
                  )}
                  <div className="flex gap-2 mt-4 justify-center">
                    <button
                      onClick={() => {
                        setEditingAuthor(author);
                        setMostrarAuthorModal(true);
                      }}
                      className="p-2 rounded-lg bg-dark-300 hover:bg-blue-500/20 text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Icon.Edit />
                    </button>
                    <button
                      onClick={() => handleDeleteAuthor(author)}
                      className="p-2 rounded-lg bg-dark-300 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Icon.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Autores */}
      <AbaAutoresModal
        isOpen={mostrarAuthorModal}
        onClose={() => {
          setMostrarAuthorModal(false);
          setEditingAuthor(null);
        }}
        onAuthorAdded={carregarAutores}
        editingAuthor={editingAuthor}
      />
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
    { id: 'blog', label: 'Blog', icon: <Icon.FileText /> },
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
        {abaAtiva === 'blog' && <AbaBlog />}
      </main>
    </div>
  );
}