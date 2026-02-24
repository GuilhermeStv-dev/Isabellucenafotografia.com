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
  'ensaios-externo': [
    { id: 'ee1', url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800', views: 810, likes: 305 },
    { id: 'ee2', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800', views: 620, likes: 200 },
    { id: 'ee3', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800', views: 540, likes: 180 },
    { id: 'ee4', url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800', views: 430, likes: 150 },
    { id: 'ee5', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800', views: 390, likes: 130 },
    { id: 'ee6', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', views: 310, likes: 95 },
  ],
  'ensaios-estudio': [
    { id: 'es1', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', views: 900, likes: 400 },
    { id: 'es2', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', views: 700, likes: 300 },
    { id: 'es3', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800', views: 500, likes: 200 },
    { id: 'es4', url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800', views: 450, likes: 170 },
    { id: 'es5', url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800', views: 380, likes: 140 },
    { id: 'es6', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800', views: 290, likes: 100 },
  ],
  'casamentos': [
    { id: 'c1', url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800', views: 1100, likes: 820 },
    { id: 'c2', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', views: 980, likes: 710 },
    { id: 'c3', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', views: 870, likes: 630 },
    { id: 'c4', url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800', views: 750, likes: 520 },
    { id: 'c5', url: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800', views: 640, likes: 410 },
    { id: 'c6', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', views: 520, likes: 320 },
  ],
  'batizados': [
    { id: 'b1', url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800', views: 600, likes: 180 },
    { id: 'b2', url: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800', views: 480, likes: 150 },
    { id: 'b3', url: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800', views: 390, likes: 120 },
    { id: 'b4', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800', views: 310, likes: 90 },
  ],
  'aniversarios': [
    { id: 'a1', url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800', views: 800, likes: 300 },
    { id: 'a2', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800', views: 650, likes: 240 },
    { id: 'a3', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', views: 510, likes: 190 },
    { id: 'a4', url: 'https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=800', views: 420, likes: 150 },
    { id: 'a5', url: 'https://images.unsplash.com/photo-1543083115-638c32cd3d58?w=800', views: 340, likes: 110 },
    { id: 'a6', url: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=800', views: 280, likes: 80 },
  ],
  'infantil': [
    { id: 'i1', url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', views: 920, likes: 410 },
    { id: 'i2', url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800', views: 760, likes: 340 },
    { id: 'i3', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=800', views: 610, likes: 270 },
    { id: 'i4', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800', views: 480, likes: 200 },
    { id: 'i5', url: 'https://images.unsplash.com/photo-1473990107820-4c1d31e3e001?w=800', views: 370, likes: 150 },
    { id: 'i6', url: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800', views: 290, likes: 110 },
  ],
  'gravidas': [
    { id: 'g1', url: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800', views: 1050, likes: 490 },
    { id: 'g2', url: 'https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=800', views: 830, likes: 360 },
    { id: 'g3', url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800', views: 640, likes: 270 },
    { id: 'g4', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=800', views: 510, likes: 200 },
  ],
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
