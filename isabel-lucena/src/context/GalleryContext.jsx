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

const GalleryContext = createContext(null)

export function GalleryProvider({ children }) {
  const loadedRef = useRef(new Set())    // categorias com todas as fotos carregadas
  const loadingRef = useRef({})          // guard de loading sem causar re-render

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

  // ── Sync inicial: categorias + 1 capa por categoria ──
  useEffect(() => {
    let ativo = true

    const sync = async () => {
      // Query 1: categorias ativas
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
      const baseFotos = Object.fromEntries(slugs.map((s) => [s, []]))

      if (!slugs.length) {
        if (ativo) { setCategories(categoriasMapeadas); setPhotos(baseFotos) }
        return
      }

      // ── Query 2: tenta usar RPC com DISTINCT ON (mais eficiente) ──
      // Retorna exatamente 1 foto por categoria (a mais recente)
      // Fallback para .in() se o RPC não existir ainda
      let fotosPorCategoria = { ...baseFotos }

      const { data: rpcData, error: rpcErr } = await supabase
        .rpc('get_category_covers', { category_slugs: slugs })

      if (!rpcErr && rpcData) {
        // RPC disponível: cada row já é a foto mais recente da categoria
        for (const foto of rpcData) {
          fotosPorCategoria[foto.categoria_slug] = [{
            id: String(foto.id),
            url: foto.url,
            views: 0,
            likes: 0,
          }]
          // Com RPC DISTINCT ON, a capa já está carregada mas o restante não
          // (não marca como "fully loaded" para permitir lazy load da galeria)
        }
      } else {
        // Fallback: .in() buscando somente as colunas necessárias
        // Limita a 7 fotos (1 por categoria) via order + limit por slug
        // Nota: sem RPC não há como fazer DISTINCT ON via client SDK,
        // então buscamos poucas fotos e agrupamos no cliente
        const { data: fallbackData } = await supabase
          .from('fotos')
          .select('id, categoria_slug, url')
          .eq('ativo', true)
          .in('categoria_slug', slugs)
          .order('created_at', { ascending: false })
          .limit(slugs.length * 10) // poucas fotos, só para ter 1 capa por cat

        if (fallbackData) {
          const seen = new Set()
          for (const foto of fallbackData) {
            if (seen.has(foto.categoria_slug)) continue
            seen.add(foto.categoria_slug)
            fotosPorCategoria[foto.categoria_slug] = [{
              id: String(foto.id),
              url: foto.url,
              views: 0,
              likes: 0,
            }]
          }
        }
      }

      if (!ativo) return
      setCategories(categoriasMapeadas)
      setPhotos(fotosPorCategoria)
    }

    sync()
    return () => { ativo = false }
  }, [])

  // ── Carregamento lazy — todas as fotos de uma categoria ──
  const ensureCategoryPhotosLoaded = useCallback(async (categoryId) => {
    if (!categoryId) return
    if (loadingRef.current[categoryId]) return
    if (loadedRef.current.has(categoryId)) return

    loadingRef.current[categoryId] = true
    setLoadingPhotosByCategory((prev) => ({ ...prev, [categoryId]: true }))

    try {
      const { data, error } = await supabase
        .from('fotos')
        .select('id, categoria_slug, url')
        .eq('ativo', true)
        .eq('categoria_slug', categoryId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPhotos((prev) => ({
          ...prev,
          [categoryId]: data.map((f) => ({
            id: String(f.id),
            url: f.url,
            views: 0,
            likes: 0,
          })),
        }))
        loadedRef.current.add(categoryId)
      }
    } finally {
      loadingRef.current[categoryId] = false
      setLoadingPhotosByCategory((prev) => ({ ...prev, [categoryId]: false }))
    }
  }, []) // deps vazias — guards via refs

  // ── CRUD ──
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

  // allPhotos memoizado — não recalcula em todo render
  const allPhotos = useMemo(
    () => Object.entries(photos).flatMap(([catId, arr]) =>
      arr.map((p) => ({ ...p, categoryId: catId }))
    ),
    [photos]
  )

  const value = useMemo(() => ({
    categories, photos, allPhotos, loadingPhotosByCategory,
    addCategory, removeCategory, updateCategory,
    addPhoto, removePhoto, reorderPhotos, setCoverPhoto,
    ensureCategoryPhotosLoaded,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [categories, photos, loadingPhotosByCategory, ensureCategoryPhotosLoaded])

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  )
}

export const useGallery = () => useContext(GalleryContext)
