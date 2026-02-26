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
const LOCAL_METRICS_KEY = 'il_photo_metrics'

const readLocalMetrics = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_METRICS_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch { return {} }
}

const writeLocalMetrics = (metrics) => {
  try { localStorage.setItem(LOCAL_METRICS_KEY, JSON.stringify(metrics)) } catch { /* noop */ }
}

const mergeMetricValue = (photoId, field, dbValue, localMetrics) => {
  const local = Number(localMetrics?.[String(photoId)]?.[field] || 0)
  return Math.max(Number(dbValue || 0), local)
}

const mapFoto = (f, localMetrics) => ({
  id: String(f.id),
  url: f.url,
  placeholder: f.placeholder || null,
  views: mergeMetricValue(f.id, 'views', f.views, localMetrics),
  likes: mergeMetricValue(f.id, 'likes', f.likes, localMetrics),
})

const FOTO_COLS = 'id, categoria_slug, url, placeholder, views, likes'
const FOTO_COLS_NO_PLACEHOLDER = 'id, categoria_slug, url, views, likes'

const isMissingPlaceholderColumnError = (error) => {
  const text = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()
  return text.includes('placeholder') && text.includes('fotos')
}

const selectFotosWithPlaceholderFallback = async (buildQuery) => {
  const primary = await buildQuery(FOTO_COLS)
  if (!isMissingPlaceholderColumnError(primary.error)) return primary

  const fallback = await buildQuery(FOTO_COLS_NO_PLACEHOLDER)
  return {
    ...fallback,
    data: (fallback.data || []).map((row) => ({ ...row, placeholder: null })),
  }
}

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
  const localMetricsRef = useRef(readLocalMetrics())

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

      let capasPorCategoria = { ...baseFotos }

      const { data: rpcData, error: rpcErr } = await supabase
        .rpc('get_category_covers', { category_slugs: slugs })

      if (!rpcErr && rpcData) {
        for (const foto of rpcData) {
          const targetSlug = resolveCategorySlug(foto.categoria_slug, availableSlugs)
          if (!targetSlug) continue
          capasPorCategoria[targetSlug] = [mapFoto({ ...foto, categoria_slug: targetSlug }, localMetricsRef.current)]
        }
      } else {
        const { data: fallbackData } = await selectFotosWithPlaceholderFallback((cols) =>
          supabase
            .from('fotos')
            .select(cols)
            .eq('ativo', true)
            .in('categoria_slug', slugs)
            .order('created_at', { ascending: false })
            .limit(100)
        )

        if (fallbackData) {
          const seen = new Set()
          for (const foto of fallbackData) {
            const targetSlug = resolveCategorySlug(foto.categoria_slug, availableSlugs)
            if (!targetSlug || seen.has(targetSlug)) continue
            seen.add(targetSlug)
            capasPorCategoria[targetSlug] = [mapFoto({ ...foto, categoria_slug: targetSlug }, localMetricsRef.current)]
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
      const normalizedId = normalizeSlug(categoryId)

      const { data, error } = await selectFotosWithPlaceholderFallback((cols) =>
        supabase
          .from('fotos')
          .select(cols)
          .eq('ativo', true)
          .order('created_at', { ascending: false })
          .limit(1000)
      )

      if (!error && data) {
        const filtered = data.filter(
          (foto) => normalizeSlug(foto.categoria_slug) === normalizedId
        )

        setPhotos((prev) => ({
          ...prev,
          [categoryId]: filtered.map((f) => mapFoto(f, localMetricsRef.current)),
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
      [String(photoId)]: { ...(localMetricsRef.current[String(photoId)] || {}), views: nextViews },
    }
    writeLocalMetrics(localMetricsRef.current)
    try {
      await supabase.from('fotos').update({ views: nextViews }).eq('id', Number(photoId))
    } catch { /* noop */ }
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
      [String(photoId)]: { ...(localMetricsRef.current[String(photoId)] || {}), likes: nextLikes },
    }
    writeLocalMetrics(localMetricsRef.current)
    try {
      await supabase.from('fotos').update({ likes: nextLikes }).eq('id', Number(photoId))
    } catch { /* noop */ }
  }, [])

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