import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Defaults ──
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
  // Refs para controle de loading sem causar re-renders extras
  const loadedCategoryIdsRef = useRef(new Set())
  const loadingRef = useRef({})          // substitui loadingPhotosByCategory nas guards

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('il_categories')
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
    } catch { return DEFAULT_CATEGORIES }
  })

  const [photos, setPhotos] = useState({})
  const [loadingPhotosByCategory, setLoadingPhotosByCategory] = useState({})

  // Persiste categorias no localStorage (sem fotos — dados demais)
  useEffect(() => {
    localStorage.setItem('il_categories', JSON.stringify(categories))
  }, [categories])

  // ── Sync inicial: 2 queries no total (era N+1) ──
  useEffect(() => {
    let ativo = true

    const syncFromSupabase = async () => {
      // Query 1: categorias ativas
      const { data: categoriasDb, error: erroCategorias } = await supabase
        .from('categorias')
        .select('nome, slug')
        .eq('ativo', true)
        .order('nome')

      if (erroCategorias || !categoriasDb || !ativo) return

      const categoriasMapeadas = categoriasDb.map((cat) => ({
        id: cat.slug,
        label: cat.nome,
        tag: getTagFromSlug(cat.slug, cat.nome),
      }))

      const slugs = categoriasMapeadas.map((c) => c.id)
      const baseFotos = Object.fromEntries(slugs.map((s) => [s, []]))

      if (slugs.length === 0) {
        if (ativo) { setCategories(categoriasMapeadas); setPhotos(baseFotos) }
        return
      }

      // ────────────────────────────────────────────────────────────────────
      // CORREÇÃO PRINCIPAL: 1 única query com .in() em vez de N queries
      // paralelas (Promise.all com N .eq('categoria_slug', slug)).
      // Buscamos as fotos mais recentes de todas as categorias de uma vez
      // e agrupamos no cliente — 1 roundtrip vs N roundtrips.
      // ────────────────────────────────────────────────────────────────────
      const { data: coverPhotos, error: erroCovers } = await supabase
        .from('fotos')
        .select('id, categoria_slug, url')
        .eq('ativo', true)
        .in('categoria_slug', slugs)
        .order('created_at', { ascending: false })
        .limit(500) // suficiente para portfólios reais; ajuste se necessário

      if (!ativo) return

      const fotosPorCategoria = { ...baseFotos }

      if (!erroCovers && coverPhotos) {
        // Agrupa no cliente — pega a 1ª ocorrência (mais recente) de cada categoria
        for (const foto of coverPhotos) {
          const slug = foto.categoria_slug
          if (!fotosPorCategoria[slug]) fotosPorCategoria[slug] = []
          fotosPorCategoria[slug].push({
            id: String(foto.id),
            url: foto.url,
            views: 0,
            likes: 0,
          })
        }

        // Marca categorias com fotos como "já carregadas" para evitar re-fetch
        for (const slug of slugs) {
          if (fotosPorCategoria[slug]?.length > 0) {
            loadedCategoryIdsRef.current.add(slug)
          }
        }
      }

      setCategories(categoriasMapeadas)
      setPhotos(fotosPorCategoria)
    }

    syncFromSupabase()
    return () => { ativo = false }
  }, [])

  // ── Carregamento lazy por categoria ──
  // CORREÇÃO: deps vazias + ref para guard de loading (evita stale closure
  // e re-criação da função a cada mudança de loadingPhotosByCategory)
  const ensureCategoryPhotosLoaded = useCallback(async (categoryId) => {
    if (!categoryId) return
    if (loadingRef.current[categoryId]) return           // já está carregando
    if (loadedCategoryIdsRef.current.has(categoryId)) return // já carregado

    loadingRef.current[categoryId] = true
    setLoadingPhotosByCategory((prev) => ({ ...prev, [categoryId]: true }))

    try {
      const { data: fotosDb, error } = await supabase
        .from('fotos')
        .select('id, categoria_slug, url')
        .eq('ativo', true)
        .eq('categoria_slug', categoryId)
        .order('created_at', { ascending: false })

      if (!error && fotosDb) {
        const mapped = fotosDb.map((f) => ({
          id: String(f.id),
          url: f.url,
          views: 0,
          likes: 0,
        }))
        setPhotos((prev) => ({ ...prev, [categoryId]: mapped }))
        loadedCategoryIdsRef.current.add(categoryId)
      }
    } finally {
      loadingRef.current[categoryId] = false
      setLoadingPhotosByCategory((prev) => ({ ...prev, [categoryId]: false }))
    }
  }, []) // deps vazias — usa refs para não ter stale closure

  // ── CRUD de categorias ──
  const addCategory = (cat) => setCategories((prev) => [...prev, cat])
  const removeCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setPhotos((prev) => { const n = { ...prev }; delete n[id]; return n })
  }
  const updateCategory = (id, data) =>
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c))

  // ── CRUD de fotos ──
  const addPhoto = (categoryId, photo) =>
    setPhotos((prev) => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), photo],
    }))

  const removePhoto = (categoryId, photoId) =>
    setPhotos((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((p) => p.id !== photoId),
    }))

  const reorderPhotos = (categoryId, newOrder) =>
    setPhotos((prev) => ({ ...prev, [categoryId]: newOrder }))

  const setCoverPhoto = (categoryId, photoId) =>
    setPhotos((prev) => {
      const arr = [...(prev[categoryId] || [])]
      const idx = arr.findIndex((p) => p.id === photoId)
      if (idx > 0) { const [p] = arr.splice(idx, 1); arr.unshift(p) }
      return { ...prev, [categoryId]: arr }
    })

  // Flat de todas as fotos para o grid de Trabalhos
  const allPhotos = Object.entries(photos).flatMap(([catId, arr]) =>
    arr.map((p) => ({ ...p, categoryId: catId }))
  )

  return (
    <GalleryContext.Provider value={{
      categories, photos, allPhotos, loadingPhotosByCategory,
      addCategory, removeCategory, updateCategory,
      addPhoto, removePhoto, reorderPhotos, setCoverPhoto,
      ensureCategoryPhotosLoaded,
    }}>
      {children}
    </GalleryContext.Provider>
  )
}

export const useGallery = () => useContext(GalleryContext)
