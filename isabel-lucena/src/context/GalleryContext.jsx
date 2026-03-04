import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, useMemo,
} from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_CATEGORIES = [
  { id: 'ensaios-externo', label: 'Ensaios Externo', tag: 'Ensaios' },
  { id: 'ensaios-estudio', label: 'Ensaios Estúdio', tag: 'Ensaios' },
  { id: 'casamentos', label: 'Casamentos', tag: 'Wedding' },
  { id: 'batizados', label: 'Batizados', tag: 'Eventos' },
  { id: 'aniversarios', label: 'Aniversários', tag: 'Eventos' },
  { id: 'infantil', label: 'Crianças', tag: 'Infantil' },
  { id: 'gravidas', label: 'Grávidas', tag: 'Grávidas' },
]

const getTagFromSlug = (slug = '', nome = '') => {
  const text = `${slug} ${nome}`.toLowerCase()
  if (text.includes('grav')) return 'Grávidas'
  if (text.includes('infan') || text.includes('crianc')) return 'Infantil'
  if (text.includes('casa') || text.includes('wedd')) return 'Wedding'
  if (text.includes('event') || text.includes('batiz') || text.includes('anivers')) return 'Eventos'
  return 'Ensaios'
}

const normalizeSlug = (value = '') => (
  String(value || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
)

const resolveCategorySlug = (rawSlug, availableSlugs) => {
  if (!rawSlug) return null
  if (availableSlugs.has(rawSlug)) return rawSlug
  const normalizedRaw = normalizeSlug(rawSlug)
  for (const slug of availableSlugs) {
    if (normalizeSlug(slug) === normalizedRaw) return slug
  }
  return null
}

const GalleryContext = createContext(null)

// Colunas reais da tabela fotos
const FOTO_COLS = 'id, categoria_slug, url, titulo, placeholder, views, likes'

const mapFoto = (f) => ({
  id: String(f.id),
  url: f.url,
  titulo: f.titulo || null,
  placeholder: f.placeholder || null,
  views: Number(f.views || 0),
  likes: Number(f.likes || 0),
})

export function GalleryProvider({ children }) {
  const loadedRef = useRef(new Set())
  const loadingRef = useRef({})

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('il_categories')
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
    } catch { return DEFAULT_CATEGORIES }
  })

  const [photos, setPhotos] = useState({})
  const [loadingPhotosByCategory, setLoadingPhotosByCategory] = useState({})

  useEffect(() => {
    localStorage.setItem('il_categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    let ativo = true

    const sync = async () => {
      const { data: cats, error: errCats } = await supabase
        .from('categorias')
        .select('nome, slug')
        .eq('ativo', true)
        .order('nome')

      if (errCats || !cats || !ativo) return

      const categoriasMapeadas = cats.map((c) => ({
        id: c.slug,
        label: c.nome,
        tag: getTagFromSlug(c.slug, c.nome),
      }))

      const slugs = categoriasMapeadas.map((c) => c.id)
      const availableSlugs = new Set(slugs)
      const baseFotos = Object.fromEntries(slugs.map((s) => [s, []]))

      if (!slugs.length) {
        if (ativo) { setCategories(categoriasMapeadas); setPhotos(baseFotos) }
        return
      }

      // Tenta RPC para capas otimizadas
      const { data: rpcData, error: rpcErr } = await supabase
        .rpc('get_category_covers', { category_slugs: slugs })

      let capasPorCategoria = { ...baseFotos }

      if (!rpcErr && rpcData) {
        for (const foto of rpcData) {
          const targetSlug = resolveCategorySlug(foto.categoria_slug, availableSlugs)
          if (!targetSlug) continue
          capasPorCategoria[targetSlug] = [mapFoto({ ...foto, categoria_slug: targetSlug })]
        }
      } else {
        const { data: fallbackData } = await supabase
          .from('fotos')
          .select(FOTO_COLS)
          .eq('ativo', true)
          .order('created_at', { ascending: false })

        if (fallbackData) {
          const seen = new Set()
          for (const foto of fallbackData) {
            const targetSlug = resolveCategorySlug(foto.categoria_slug, availableSlugs)
            if (!targetSlug || seen.has(targetSlug)) continue
            seen.add(targetSlug)
            capasPorCategoria[targetSlug] = [mapFoto({ ...foto, categoria_slug: targetSlug })]
          }
        }
      }

      if (!ativo) return

      setCategories(categoriasMapeadas)
      setPhotos((prev) => {
        const next = { ...capasPorCategoria }
        for (const slug of loadedRef.current) {
          if (prev[slug] && prev[slug].length > 0) {
            next[slug] = prev[slug]
          }
        }
        return next
      })
    }

    sync()
    return () => { ativo = false }
  }, [])

  const ensureCategoryPhotosLoaded = useCallback(async (categoryId, options = {}) => {
    const { force = false } = options
    if (!categoryId) return
    if (loadingRef.current[categoryId]) return
    if (!force && loadedRef.current.has(categoryId)) return

    loadingRef.current[categoryId] = true
    setLoadingPhotosByCategory((prev) => ({ ...prev, [categoryId]: true }))

    try {
      const normalizedCategoryId = normalizeSlug(categoryId)

      const { data, error } = await supabase
        .from('fotos')
        .select(FOTO_COLS)
        .eq('ativo', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        const filtered = data.filter(
          (foto) => normalizeSlug(foto.categoria_slug) === normalizedCategoryId
        )

        setPhotos((prev) => ({
          ...prev,
          [categoryId]: filtered.map(mapFoto),
        }))

        loadedRef.current.add(categoryId)
      }
    } finally {
      loadingRef.current[categoryId] = false
      setLoadingPhotosByCategory((prev) => ({ ...prev, [categoryId]: false }))
    }
  }, [])

  const addCategory = (cat) => setCategories((p) => [...p, cat])
  const removeCategory = (id) => {
    setCategories((p) => p.filter((c) => c.id !== id))
    setPhotos((p) => { const n = { ...p }; delete n[id]; return n })
  }
  const updateCategory = (id, data) =>
    setCategories((p) => p.map((c) => c.id === id ? { ...c, ...data } : c))

  const addPhoto = (categoryId, photo) =>
    setPhotos((p) => ({ ...p, [categoryId]: [...(p[categoryId] || []), photo] }))
  const removePhoto = (categoryId, photoId) =>
    setPhotos((p) => ({ ...p, [categoryId]: p[categoryId].filter((x) => x.id !== photoId) }))
  const reorderPhotos = (categoryId, newOrder) =>
    setPhotos((p) => ({ ...p, [categoryId]: newOrder }))
  const setCoverPhoto = (categoryId, photoId) =>
    setPhotos((p) => {
      const arr = [...(p[categoryId] || [])]
      const idx = arr.findIndex((x) => x.id === photoId)
      if (idx > 0) { const [item] = arr.splice(idx, 1); arr.unshift(item) }
      return { ...p, [categoryId]: arr }
    })

  // ─── VIEWS: incremento atômico via RPC (funciona para usuários anon) ───
  const incrementPhotoViews = useCallback(async (categoryId, photoId) => {
    if (!categoryId || !photoId) return

    // Atualiza UI imediatamente (otimista)
    setPhotos((prev) => {
      const list = prev[categoryId] || []
      return {
        ...prev,
        [categoryId]: list.map((photo) =>
          photo.id === String(photoId)
            ? { ...photo, views: (photo.views || 0) + 1 }
            : photo
        ),
      }
    })

    // Persiste no banco com incremento atômico
    try {
      const { data: novoValor } = await supabase
        .rpc('increment_foto_views', { foto_id: photoId })

      // Sincroniza com o valor real do banco (pode diferir se houver acessos simultâneos)
      if (novoValor !== null && novoValor !== undefined) {
        setPhotos((prev) => {
          const list = prev[categoryId] || []
          return {
            ...prev,
            [categoryId]: list.map((photo) =>
              photo.id === String(photoId)
                ? { ...photo, views: novoValor }
                : photo
            ),
          }
        })
      }
    } catch (err) {
      console.error('[views] Erro ao salvar no banco:', err)
    }
  }, [])

  // ─── LIKES: incremento/decremento atômico via RPC ───
  const togglePhotoLike = useCallback(async (categoryId, photoId, liked) => {
    if (!categoryId || !photoId) return

    // Atualiza UI imediatamente (otimista)
    setPhotos((prev) => {
      const list = prev[categoryId] || []
      return {
        ...prev,
        [categoryId]: list.map((photo) =>
          photo.id === String(photoId)
            ? { ...photo, likes: Math.max(0, (photo.likes || 0) + (liked ? 1 : -1)) }
            : photo
        ),
      }
    })

    // Persiste no banco com incremento atômico
    try {
      const { data: novoValor } = await supabase
        .rpc('toggle_foto_like', { foto_id: photoId, increment: liked })

      // Sincroniza com o valor real do banco
      if (novoValor !== null && novoValor !== undefined) {
        setPhotos((prev) => {
          const list = prev[categoryId] || []
          return {
            ...prev,
            [categoryId]: list.map((photo) =>
              photo.id === String(photoId)
                ? { ...photo, likes: novoValor }
                : photo
            ),
          }
        })
      }
    } catch (err) {
      console.error('[likes] Erro ao salvar no banco:', err)
    }
  }, [])

  const value = useMemo(() => ({
    categories, photos, loadingPhotosByCategory,
    addCategory, removeCategory, updateCategory,
    addPhoto, removePhoto, reorderPhotos, setCoverPhoto,
    incrementPhotoViews, togglePhotoLike,
    ensureCategoryPhotosLoaded,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [categories, photos, loadingPhotosByCategory, ensureCategoryPhotosLoaded, incrementPhotoViews, togglePhotoLike])

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  )
}

export const useGallery = () => useContext(GalleryContext)
