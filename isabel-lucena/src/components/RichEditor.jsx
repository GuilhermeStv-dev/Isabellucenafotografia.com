import { useRef, useState } from 'react'
import { Heading2, Heading3, Type, List, ListOrdered, Link2, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'

const RichEditor = ({ value, onChange, placeholder = "Escreva o conteúdo do seu post aqui..." }) => {
  const editorRef = useRef(null)
  const imageInputRef = useRef(null)
  const selectionRangeRef = useRef(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const applyFormatting = (command, arg = null) => {
    document.execCommand(command, false, arg)
    editorRef.current?.focus()
  }

  const insertLink = () => {
    const url = prompt('Digite a URL:')
    if (url) {
      applyFormatting('createLink', url)
    }
  }

  const saveSelectionRange = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    selectionRangeRef.current = selection.getRangeAt(0).cloneRange()
  }

  const restoreSelectionRange = () => {
    const selection = window.getSelection()
    if (!selection || !selectionRangeRef.current) return
    selection.removeAllRanges()
    selection.addRange(selectionRangeRef.current)
  }

  const uploadImageToBlog = async (file) => {
    const ext = file.name.split('.').pop()
    const fileName = `post-content-${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(`content/${fileName}`, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(`content/${fileName}`)

    return data.publicUrl
  }

  const insertImage = () => {
    saveSelectionRange()
    imageInputRef.current?.click()
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const imageUrl = await uploadImageToBlog(file)
      editorRef.current?.focus()
      restoreSelectionRange()
      applyFormatting('insertImage', imageUrl)
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
    } catch (error) {
      console.error('Erro ao enviar imagem no editor:', error)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
      selectionRangeRef.current = null
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div className="space-y-2">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-4 bg-dark-300 rounded-t-xl border border-white/10 border-b-0">
        {/* Format styles */}
        <div className="flex gap-2 border-r border-white/20 pr-3">
          <button
            onClick={() => applyFormatting('formatBlock', '<h2>')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-dark-200 text-white/70 hover:bg-gold hover:text-dark rounded-lg transition-colors"
            title="Título Grande"
          >
            <Heading2 size={16} />
            Grande
          </button>
          <button
            onClick={() => applyFormatting('formatBlock', '<h3>')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-dark-200 text-white/70 hover:bg-gold hover:text-dark rounded-lg transition-colors"
            title="Título Médio"
          >
            <Heading3 size={16} />
            Médio
          </button>
          <button
            onClick={() => applyFormatting('formatBlock', '<p>')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-dark-200 text-white/70 hover:bg-gold hover:text-dark rounded-lg transition-colors"
            title="Parágrafo"
          >
            <Type size={16} />
            Texto
          </button>
        </div>

        {/* Text formatting */}
        <div className="flex gap-2 border-r border-white/20 pr-3">
          <button
            onClick={() => applyFormatting('bold')}
            className="px-3 py-2 text-xs font-bold bg-dark-200 text-white/70 hover:bg-gold hover:text-dark rounded-lg transition-colors"
            title="Negrito (Ctrl+B)"
          >
            Negrito
          </button>
          <button
            onClick={() => applyFormatting('italic')}
            className="px-3 py-2 text-xs italic bg-dark-200 text-white/70 hover:bg-gold hover:text-dark rounded-lg transition-colors"
            title="Itálico (Ctrl+I)"
          >
            Itálico
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-2 border-r border-white/20 pr-3">
          <button
            onClick={() => applyFormatting('insertUnorderedList')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-dark-200 text-white/70 hover:bg-gold hover:text-dark rounded-lg transition-colors"
            title="Lista com pontos"
          >
            <List size={16} />
            Pontos
          </button>
          <button
            onClick={() => applyFormatting('insertOrderedList')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-dark-200 text-white/70 hover:bg-gold hover:text-dark rounded-lg transition-colors"
            title="Lista numerada"
          >
            <ListOrdered size={16} />
            Número
          </button>
        </div>

        {/* Links and media */}
        <div className="flex gap-2">
          <button
            onClick={insertLink}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-dark-200 text-white/70 hover:bg-gold hover:text-dark rounded-lg transition-colors"
            title="Inserir link"
          >
            <Link2 size={16} />
            Link
          </button>
          <button
            onClick={insertImage}
            disabled={uploadingImage}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-dark-200 text-white/70 hover:bg-gold hover:text-dark rounded-lg transition-colors"
            title="Inserir imagem"
          >
            <Image size={16} />
            {uploadingImage ? 'Enviando...' : 'Imagem'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        onInput={handleInput}
        onPaste={handlePaste}
        contentEditable
        suppressContentEditableWarning
        className="min-h-80 bg-dark-300 border border-white/10 rounded-b-xl px-4 py-3 text-white font-body text-sm
                   focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                   prose prose-invert max-w-none
                   [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-white
                   [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-white
                   [&_p]:mb-3 [&_p]:text-white/80 [&_p]:leading-relaxed
                   [&_strong]:text-gold [&_strong]:font-semibold
                   [&_em]:text-white/70
                   [&_a]:text-gold [&_a]:underline [&_a]:cursor-pointer
                   [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:mb-3
                   [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:mb-3
                   [&_li]:mb-1 [&_li]:text-white/80
                   [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4
                   whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: value }}
      />

      {/* Dica */}
      <p className="text-xs text-white/40 font-body">
        Use os botões acima para formatar seu texto. Clique em "Imagem" para adicionar fotos.
      </p>
    </div>
  )
}

export default RichEditor

