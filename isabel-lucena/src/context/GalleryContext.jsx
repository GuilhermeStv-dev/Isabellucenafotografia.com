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
const LOCAL_METRICS_KEY = 'il_photo_metrics'

const readLocalMetrics = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_METRICS_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const writeLocalMetrics = (metrics) => {
  try {
    localStorage.setItem(LOCAL_METRICS_KEY, JSON.stringify(metrics))
  } catch {
    // noop
  }
}

const mergeMetricValue = (photoId, field, dbValue, localMetrics) => {
  const local = Number(localMetrics?.[String(photoId)]?.[field] || 0)
  return Math.max(Number(dbValue || 0), local)
}

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
  const localMetricsRef = useRef(readLocalMetrics())

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
            views: mergeMetricValue(foto.id, 'views', foto.views, localMetricsRef.current),
            likes: mergeMetricValue(foto.id, 'likes', foto.likes, localMetricsRef.current),
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
          .select('id, categoria_slug, url, views, likes')
          .eq('ativo', true)
          .in('categoria_slug', slugs)
          .order('created_at', { ascending: false })
          .limit(100) // Busca mais fotos para garantir que cada categoria tenha uma capa no fallback

        if (fallbackData) {
          const seen = new Set()
          for (const foto of fallbackData) {
            if (seen.has(foto.categoria_slug)) continue
            seen.add(foto.categoria_slug)
            fotosPorCategoria[foto.categoria_slug] = [{
              id: String(foto.id),
              url: foto.url,
              views: mergeMetricValue(foto.id, 'views', foto.views, localMetricsRef.current),
              likes: mergeMetricValue(foto.id, 'likes', foto.likes, localMetricsRef.current),
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
  const ensureCategoryPhotosLoaded = useCallback(async (categoryId, options = {}) => {
    const { force = false } = options
    if (!categoryId) return
    if (loadingRef.current[categoryId]) return
    if (!force && loadedRef.current.has(categoryId)) return

    loadingRef.current[categoryId] = true
    setLoadingPhotosByCategory((prev) => ({ ...prev, [categoryId]: true }))

    try {
      const { data, error } = await supabase
        .from('fotos')
        .select('id, categoria_slug, url, views, likes')
        .eq('ativo', true)
        .eq('categoria_slug', categoryId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPhotos((prev) => ({
          ...prev,
          [categoryId]: data.map((f) => ({
            id: String(f.id),
            url: f.url,
            views: mergeMetricValue(f.id, 'views', f.views, localMetricsRef.current),
            likes: mergeMetricValue(f.id, 'likes', f.likes, localMetricsRef.current),
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

  const incrementPhotoViews = useCallback(async (categoryId, photoId) => {
    if (!categoryId || !photoId) return

    let nextViews = null
    setPhotos((prev) => {
      const list = prev[categoryId] || []
      const updated = list.map((photo) => {
        if (photo.id !== String(photoId)) return photo
        const views = Number(photo.views || 0) + 1
        nextViews = views
        return { ...photo, views }
      })
      return { ...prev, [categoryId]: updated }
    })

    if (nextViews === null) return

    localMetricsRef.current = {
      ...localMetricsRef.current,
      [String(photoId)]: {
        ...(localMetricsRef.current[String(photoId)] || {}),
        views: nextViews,
      },
    }
    writeLocalMetrics(localMetricsRef.current)

    try {
      await supabase
        .from('fotos')
        .update({ views: nextViews })
        .eq('id', Number(photoId))
    } catch {
      // noop: mantém UX local mesmo se persistência falhar
    }
  }, [])

  const togglePhotoLike = useCallback(async (categoryId, photoId, liked) => {
    if (!categoryId || !photoId) return

    let nextLikes = null
    const delta = liked ? 1 : -1

    setPhotos((prev) => {
      const list = prev[categoryId] || []
      const updated = list.map((photo) => {
        if (photo.id !== String(photoId)) return photo
        const likes = Math.max(0, Number(photo.likes || 0) + delta)
        nextLikes = likes
        return { ...photo, likes }
      })
      return { ...prev, [categoryId]: updated }
    })

    if (nextLikes === null) return

    localMetricsRef.current = {
      ...localMetricsRef.current,
      [String(photoId)]: {
        ...(localMetricsRef.current[String(photoId)] || {}),
        likes: nextLikes,
      },
    }
    writeLocalMetrics(localMetricsRef.current)

    try {
      await supabase
        .from('fotos')
        .update({ likes: nextLikes })
        .eq('id', Number(photoId))
    } catch {
      // noop: mantém UX local mesmo se persistência falhar
    }
  }, [])

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
    incrementPhotoViews, togglePhotoLike,
    ensureCategoryPhotosLoaded,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [categories, photos, allPhotos, loadingPhotosByCategory, ensureCategoryPhotosLoaded, incrementPhotoViews, togglePhotoLike])

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  )
}

export const useGallery = () => useContext(GalleryContext)
