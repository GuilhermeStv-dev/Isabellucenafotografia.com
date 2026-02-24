import { createContext, useContext, useState, useEffect } from 'react'

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

const GalleryContext = createContext(null)

export function GalleryProvider({ children }) {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('il_categories')
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
    } catch { return DEFAULT_CATEGORIES }
  })

  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('il_photos')
      return saved ? JSON.parse(saved) : DEFAULT_PHOTOS
    } catch { return DEFAULT_PHOTOS }
  })

  useEffect(() => {
    localStorage.setItem('il_categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('il_photos', JSON.stringify(photos))
  }, [photos])

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
      categories, photos, allPhotos,
      addCategory, removeCategory, updateCategory,
      addPhoto, removePhoto, reorderPhotos, setCoverPhoto,
    }}>
      {children}
    </GalleryContext.Provider>
  )
}

export const useGallery = () => useContext(GalleryContext)
