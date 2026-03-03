import { useRef, useState } from 'react'

const RichEditor = ({ value, onChange, placeholder = "Escreva o conteúdo do seu post aqui..." }) => {
  const editorRef = useRef(null)
  const [showFormatMenu, setShowFormatMenu] = useState(false)

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

  const insertImage = () => {
    const url = prompt('Digite a URL da imagem:')
    if (url) {
      applyFormatting('insertImage', url)
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
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 bg-dark-300 rounded-t-xl border border-white/10 border-b-0">
        {/* Format styles */}
        <div className="flex gap-1 border-r border-white/10 pr-2">
          <button
            onClick={() => applyFormatting('formatBlock', '<h2>')}
            className="px-3 py-1.5 text-xs font-bold bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-white rounded transition-colors"
            title="Título grande"
          >
            H2
          </button>
          <button
            onClick={() => applyFormatting('formatBlock', '<h3>')}
            className="px-3 py-1.5 text-xs font-bold bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-white rounded transition-colors"
            title="Título médio"
          >
            H3
          </button>
          <button
            onClick={() => applyFormatting('formatBlock', '<p>')}
            className="px-3 py-1.5 text-xs bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-white rounded transition-colors"
            title="Parágrafo"
          >
            P
          </button>
        </div>

        {/* Text formatting */}
        <div className="flex gap-1 border-r border-white/10 pr-2">
          <button
            onClick={() => applyFormatting('bold')}
            className="px-3 py-1.5 text-xs font-bold bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-gold rounded transition-colors"
            title="Negrito (Ctrl+B)"
          >
            B
          </button>
          <button
            onClick={() => applyFormatting('italic')}
            className="px-3 py-1.5 text-xs italic bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-gold rounded transition-colors"
            title="Itálico (Ctrl+I)"
          >
            I
          </button>
          <button
            onClick={() => applyFormatting('underline')}
            className="px-3 py-1.5 text-xs underline bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-gold rounded transition-colors"
            title="Sublinhado (Ctrl+U)"
          >
            U
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-white/10 pr-2">
          <button
            onClick={() => applyFormatting('insertUnorderedList')}
            className="px-3 py-1.5 text-xs bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-white rounded transition-colors"
            title="Lista com pontos"
          >
            • Lista
          </button>
          <button
            onClick={() => applyFormatting('insertOrderedList')}
            className="px-3 py-1.5 text-xs bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-white rounded transition-colors"
            title="Lista numerada"
          >
            1. Lista
          </button>
        </div>

        {/* Links and media */}
        <div className="flex gap-1">
          <button
            onClick={insertLink}
            className="px-3 py-1.5 text-xs bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-gold rounded transition-colors"
            title="Inserir link"
          >
            🔗 Link
          </button>
          <button
            onClick={insertImage}
            className="px-3 py-1.5 text-xs bg-dark-200 text-white/70 hover:bg-dark-100 hover:text-gold rounded transition-colors"
            title="Inserir imagem"
          >
            🖼️ Imagem
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
        Use os botões acima para formatar seu texto. Pressione Enter para nova linha.
      </p>
    </div>
  )
}

export default RichEditor
