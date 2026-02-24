import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Default data (placeholders — client replaces via dashboard) ──
const DEFAULT_CATEGORIES = [
  { id: 'ensaios-externo', label: 'Ensaios Externo', tag: 'Ensaios' },
  { id: 'ensaios-estudio', label: 'Ensaios Estúdio', tag: 'Ensaios' },
  { id: 'casamentos', label: 'Casamentos', tag: 'Wedding' },
  { id: 'batizados', label: 'Batizados', tag: 'Eventos' },
  { id: 'aniversarios', label: 'Aniversários', tag: 'Eventos' },
  { id: 'infantil', label: 'Crianças', tag: 'Infantil' },
  { id: 'gravidas', label: 'Grávidas', tag: 'Grávidas' },
]

const DEFAULT_PHOTOS = {
  'ensaios-externo': [],
  'ensaios-estudio': [],
  'casamentos': [],
  'batizados': [],
  'aniversarios': [],
  'infantil': [],
  'gravidas': [],
}

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
  const loadedCategoryIdsRef = useRef(new Set())

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('il_categories')
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
    } catch { return DEFAULT_CATEGORIES }
  })

  const [photos, setPhotos] = useState(DEFAULT_PHOTOS)
  const [loadingPhotosByCategory, setLoadingPhotosByCategory] = useState({})

  useEffect(() => {
    localStorage.setItem('il_categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    let ativo = true

    const syncFromSupabase = async () => {
      const { data: categoriasDb, error: erroCategorias } = await supabase
        .from('categorias')
        .select('nome, slug, ativo')
        .eq('ativo', true)
        .order('nome')

      if (erroCategorias || !categoriasDb) return

      const categoriasMapeadas = categoriasDb.map((cat) => ({
        id: cat.slug,
        label: cat.nome,
        tag: getTagFromSlug(cat.slug, cat.nome),
      }))

      const slugs = categoriasMapeadas.map((cat) => cat.id)
      const baseFotos = Object.fromEntries(slugs.map((slug) => [slug, []]))

      let fotosPorCategoria = { ...baseFotos }
      if (slugs.length > 0) {
        const covers = await Promise.all(
          slugs.map(async (slug) => {
            const { data, error } = await supabase
              .from('fotos')
              .select('id, categoria_slug, url')
              .eq('ativo', true)
              .eq('categoria_slug', slug)
              .order('created_at', { ascending: false })
              .limit(1)

            if (error || !data?.length) return { slug, cover: null }

            const foto = data[0]
            return {
              slug,
              cover: {
                id: String(foto.id),
                url: foto.url,
                views: 0,
                likes: 0,
              },
            }
          })
        )

        fotosPorCategoria = covers.reduce((acc, item) => {
          if (item.cover) acc[item.slug] = [item.cover]
          return acc
        }, { ...baseFotos })
      }

      if (ativo) {
        loadedCategoryIdsRef.current = new Set()
        setCategories(categoriasMapeadas)
        setPhotos(fotosPorCategoria)
      }
    }

    syncFromSupabase()
    return () => { ativo = false }
  }, [])

  const ensureCategoryPhotosLoaded = useCallback(async (categoryId) => {
    if (!categoryId || loadingPhotosByCategory[categoryId] || loadedCategoryIdsRef.current.has(categoryId)) return

    setLoadingPhotosByCategory((prev) => ({ ...prev, [categoryId]: true }))

    const { data: fotosDb, error: erroFotos } = await supabase
      .from('fotos')
      .select('id, categoria_slug, url, ativo')
      .eq('ativo', true)
      .eq('categoria_slug', categoryId)
      .order('created_at', { ascending: false })

    if (!erroFotos && fotosDb) {
      const mapped = fotosDb.map((foto) => ({
        id: String(foto.id),
        url: foto.url,
        views: 0,
        likes: 0,
      }))
      setPhotos((prev) => ({ ...prev, [categoryId]: mapped }))
      loadedCategoryIdsRef.current.add(categoryId)
    }

    setLoadingPhotosByCategory((prev) => ({ ...prev, [categoryId]: false }))
  }, [loadingPhotosByCategory])

  // ── Category CRUD ──
  const addCategory = (cat) => setCategories(prev => [...prev, cat])
  const removeCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    setPhotos(prev => { const n = { ...prev }; delete n[id]; return n })
  }
  const updateCategory = (id, data) =>
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))

  // ── Photo CRUD ──
  const addPhoto = (categoryId, photo) =>
    setPhotos(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), photo],
    }))

  const removePhoto = (categoryId, photoId) =>
    setPhotos(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(p => p.id !== photoId),
    }))

  const reorderPhotos = (categoryId, newOrder) =>
    setPhotos(prev => ({ ...prev, [categoryId]: newOrder }))

  const setCoverPhoto = (categoryId, photoId) =>
    setPhotos(prev => {
      const arr = [...(prev[categoryId] || [])]
      const idx = arr.findIndex(p => p.id === photoId)
      if (idx > 0) { const [p] = arr.splice(idx, 1); arr.unshift(p) }
      return { ...prev, [categoryId]: arr }
    })

  // ── All photos flat (for Trabalhos grid) ──
  const allPhotos = Object.entries(photos).flatMap(([catId, arr]) =>
    arr.map(p => ({ ...p, categoryId: catId }))
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
