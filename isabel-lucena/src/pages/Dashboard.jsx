import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Plus, Trash2, Edit2, Check, X, Image,
  LayoutGrid, FolderOpen, ChevronDown, GripVertical, Star
} from 'lucide-react'
import { useGallery } from '../context/GalleryContext'

// ── Tag options for categories ──
const TAG_OPTIONS = ['Ensaios', 'Grávidas', 'Infantil', 'Wedding', 'Eventos']

// ── Utility: generate a URL from an uploaded File ──
function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

/* ─────────────────────────────────── */
/* Mini Modal                          */
/* ─────────────────────────────────── */
function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 bg-dark-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl italic">{title}</h3>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────── */
/* Category Row                        */
/* ─────────────────────────────────── */
function CategoryRow({ cat, isSelected, onSelect, onEdit, onDelete, photoCount }) {
  return (
    <div
      onClick={() => onSelect(cat.id)}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200
        ${isSelected
          ? 'border-gold/40 bg-gold/5 text-white'
          : 'border-white/5 hover:border-white/15 text-white/70 hover:text-white'
        }`}
    >
      <FolderOpen size={16} className={isSelected ? 'text-gold' : 'text-white/30'} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{cat.label}</p>
        <p className="text-xs text-white/30">{cat.tag} · {photoCount} fotos</p>
      </div>
      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
        <button onClick={() => onEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────── */
/* Photo Thumb                         */
/* ─────────────────────────────────── */
function PhotoThumb({ photo, onDelete, onSetCover, isCover }) {
  return (
    <div className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-dark-surface">
      <img src={photo.url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        <button
          onClick={() => onSetCover(photo.id)}
          title="Definir como capa"
          className={`p-2 rounded-full border ${isCover ? 'border-gold text-gold bg-gold/20' : 'border-white/40 text-white hover:border-gold hover:text-gold'} transition-all`}
        >
          <Star size={14} fill={isCover ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => onDelete(photo.id)}
          className="p-2 rounded-full border border-white/40 text-white hover:border-red-400 hover:text-red-400 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {isCover && (
        <div className="absolute top-2 left-2 bg-gold text-dark text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
          CAPA
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────── */
/* Dashboard main                      */
/* ─────────────────────────────────── */
export default function Dashboard() {
  const { categories, photos, addCategory, removeCategory, updateCategory, addPhoto, removePhoto, setCoverPhoto } = useGallery()

  // Auth gate (simple password)
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('il_auth') === '1')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || null)
  const [catModal, setCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatTag, setNewCatTag] = useState(TAG_OPTIONS[0])
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // catId to delete

  const fileInputRef = useRef(null)

  // ── Auth ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-card border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center"
        >
          <Camera size={32} className="text-gold mx-auto mb-4" />
          <h1 className="font-display text-2xl italic mb-2">Dashboard</h1>
          <p className="text-white/40 text-sm mb-6">Isabel Lucena Fotografia</p>
          <input
            type="password"
            placeholder="Senha de acesso"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwError(false) }}
            onKeyDown={e => { if (e.key === 'Enter') checkPw() }}
            className={`w-full bg-dark border ${pwError ? 'border-red-400' : 'border-white/15'} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-gold transition-colors mb-3`}
          />
          {pwError && <p className="text-red-400 text-xs mb-3">Senha incorreta.</p>}
          <button
            onClick={checkPw}
            className="btn-gold w-full justify-center py-3"
          >
            <span>Entrar</span>
          </button>
        </motion.div>
      </div>
    )
  }

  function checkPw() {
    // Change 'isabel2025' to your desired password
    if (pw === 'isabel2025') {
      sessionStorage.setItem('il_auth', '1')
      setAuthed(true)
    } else {
      setPwError(true)
    }
  }

  // ── Handlers ──
  const openAddCat = () => { setEditingCat(null); setNewCatLabel(''); setNewCatTag(TAG_OPTIONS[0]); setCatModal(true) }
  const openEditCat = (cat) => { setEditingCat(cat); setNewCatLabel(cat.label); setNewCatTag(cat.tag); setCatModal(true) }

  const saveCat = () => {
    if (!newCatLabel.trim()) return
    if (editingCat) {
      updateCategory(editingCat.id, { label: newCatLabel.trim(), tag: newCatTag })
    } else {
      const id = newCatLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      addCategory({ id, label: newCatLabel.trim(), tag: newCatTag })
      setSelectedCatId(id)
    }
    setCatModal(false)
  }

  const handleDelete = (catId) => {
    removeCategory(catId)
    if (selectedCatId === catId) setSelectedCatId(categories.find(c => c.id !== catId)?.id || null)
    setDeleteConfirm(null)
  }

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length || !selectedCatId) return
    setUploading(true)
    for (const file of files) {
      const url = await readFileAsDataURL(file)
      addPhoto(selectedCatId, {
        id: `photo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        url,
        views: 0,
        likes: 0,
        comments: 0,
      })
    }
    setUploading(false)
    e.target.value = ''
  }

  const selectedCat = categories.find(c => c.id === selectedCatId)
  const selectedPhotos = photos[selectedCatId] || []

  return (
    <div className="min-h-screen bg-dark">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-dark/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <Camera size={18} className="text-gold" />
        <span className="font-display italic text-lg">Isabel Lucena</span>
        <span className="text-white/20 mx-1">·</span>
        <span className="text-white/40 text-sm">Dashboard</span>
        <div className="ml-auto">
          <button
            onClick={() => { sessionStorage.removeItem('il_auth'); setAuthed(false) }}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* ── Sidebar ── */}
        <aside className="w-64 flex-shrink-0 border-r border-white/5 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-white/30 font-medium">Categorias</p>
            <button
              onClick={openAddCat}
              className="p-1.5 rounded-lg border border-white/10 hover:border-gold text-white/40 hover:text-gold transition-all"
              title="Nova categoria"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-1.5">
            {categories.map(cat => (
              <CategoryRow
                key={cat.id}
                cat={cat}
                isSelected={selectedCatId === cat.id}
                onSelect={setSelectedCatId}
                onEdit={openEditCat}
                onDelete={(id) => setDeleteConfirm(id)}
                photoCount={(photos[cat.id] || []).length}
              />
            ))}
            {categories.length === 0 && (
              <p className="text-white/20 text-xs text-center py-8">
                Nenhuma categoria.<br />Clique em + para criar.
              </p>
            )}
          </div>
        </aside>

        {/* ── Main area ── */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedCat ? (
            <div className="h-full flex items-center justify-center text-white/20 text-sm">
              Selecione ou crie uma categoria
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl italic">{selectedCat.label}</h2>
                  <p className="text-white/40 text-sm">{selectedCat.tag} · {selectedPhotos.length} fotos</p>
                </div>
                <div className="flex gap-2">
                  {/* Upload button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn-gold py-2 px-4 text-sm"
                  >
                    <Plus size={14} />
                    <span>{uploading ? 'Enviando...' : 'Adicionar fotos'}</span>
                  </button>
                </div>
              </div>

              {/* Info banner */}
              <div className="bg-gold/5 border border-gold/15 rounded-xl p-4 mb-6 text-xs text-gold/70 flex items-start gap-2">
                <Star size={13} className="mt-0.5 flex-shrink-0" />
                <p>Clique no ícone de estrela em uma foto para definir como imagem de capa da categoria. A foto de capa aparece na galeria e no topo da página.</p>
              </div>

              {/* Photo grid */}
              {selectedPhotos.length === 0 ? (
                <div
                  className="border-2 border-dashed border-white/10 rounded-2xl py-20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-gold/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image size={32} className="text-white/20" />
                  <p className="text-white/30 text-sm">Clique para adicionar as primeiras fotos</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {selectedPhotos.map((photo, i) => (
                    <PhotoThumb
                      key={photo.id}
                      photo={photo}
                      isCover={i === 0}
                      onDelete={(id) => removePhoto(selectedCatId, id)}
                      onSetCover={(id) => setCoverPhoto(selectedCatId, id)}
                    />
                  ))}
                  {/* Add more box */}
                  <div
                    className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-gold/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus size={20} className="text-white/20" />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Category modal ── */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title={editingCat ? 'Editar categoria' : 'Nova categoria'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Nome</label>
            <input
              autoFocus
              value={newCatLabel}
              onChange={e => setNewCatLabel(e.target.value)}
              placeholder="Ex: Ensaios Femininos"
              className="w-full bg-dark border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Grupo</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setNewCatTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${newCatTag === t ? 'bg-gold text-dark font-medium' : 'border border-white/15 text-white/60 hover:border-white/40'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setCatModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              onClick={saveCat}
              disabled={!newCatLabel.trim()}
              className="flex-1 btn-gold justify-center py-2.5 text-sm disabled:opacity-40"
            >
              <Check size={14} /> <span>Salvar</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete confirm modal ── */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Excluir categoria">
        <p className="text-white/50 text-sm mb-5">
          Tem certeza? Todas as fotos desta categoria serão <span className="text-red-400">removidas permanentemente</span>.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => handleDelete(deleteConfirm)}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all"
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  )
}
