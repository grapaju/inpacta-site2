'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { useState } from 'react'

export default function RichTextEditor({ 
  content = '', 
  onChange, 
  className = '',
  placeholder = 'Digite seu conteúdo aqui...' 
}) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        // Desabilita o link do StarterKit para usar nossa configuração customizada
        link: false,
      }),
      TextStyle,
      Color,
      Highlight.configure({ 
        multicolor: true 
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 ${className}`,
        placeholder,
      },
    },
  })

  const addLink = () => {
    const url = window.prompt('Digite a URL:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt('Digite a URL da imagem:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const colors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F97316', 
    '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'
  ]

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-md p-4 min-h-[300px] bg-gray-50 animate-pulse">
        <div className="text-gray-500">Carregando editor...</div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2">
        <div className="flex flex-wrap gap-1">
          {/* Formatação de Texto */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('bold') ? 'bg-gray-300' : ''
              }`}
              title="Negrito"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
              </svg>
            </button>
            
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('italic') ? 'bg-gray-300' : ''
              }`}
              title="Itálico"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('strike') ? 'bg-gray-300' : ''
              }`}
              title="Riscado"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43.25.55.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13-.29.09-.53.21-.72.36-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51.21.17.35.36.43.57.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13-.35-.09-.65-.22-.89-.39-.25-.17-.44-.37-.59-.62-.15-.24-.22-.5-.22-.78H9.1c0 .55.08 1.13.24 1.58.16.45.37.85.65 1.21.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28.66-.19 1.23-.45 1.71-.79.48-.34.85-.74 1.11-1.21.26-.47.38-.99.38-1.58 0-.54-.08-1.017-.24-1.43-.16-.413-.43-.777-.81-1.09-.38-.31-.85-.57-1.41-.77C13.87 12.26 13.12 12.1 12.25 12H21z"/>
              </svg>
            </button>
          </div>

          {/* Títulos */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <select
              onChange={(e) => {
                const level = parseInt(e.target.value)
                if (level === 0) {
                  editor.chain().focus().setParagraph().run()
                } else {
                  editor.chain().focus().toggleHeading({ level }).run()
                }
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="0">Parágrafo</option>
              <option value="1">Título 1</option>
              <option value="2">Título 2</option>
              <option value="3">Título 3</option>
            </select>
          </div>

          {/* Cores */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2 relative">
            <button
              type="button"
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Cor do Texto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM15.95 18.5L15 16.75H9l-.95 1.75H6.5L12 5.5l5.5 13h-1.55z"/>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('highlight') ? 'bg-yellow-300' : ''
              }`}
              title="Destacar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 14l3 3-3 3-3-3 3-3m0-4.24L9.76 6 18 14.24 14.24 18 6 9.76z"/>
              </svg>
            </button>

            {/* Paleta de Cores */}
            {colorPickerOpen && (
              <div className="absolute top-full left-0 z-10 bg-white border border-gray-300 rounded shadow-lg p-2 grid grid-cols-5 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run()
                      setColorPickerOpen(false)
                    }}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run()
                    setColorPickerOpen(false)
                  }}
                  className="w-6 h-6 rounded border border-gray-300 bg-white hover:scale-110 transition-transform text-xs"
                  title="Remover cor"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Listas */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('bulletList') ? 'bg-gray-300' : ''
              }`}
              title="Lista com Marcadores"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('orderedList') ? 'bg-gray-300' : ''
              }`}
              title="Lista Numerada"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
              </svg>
            </button>
          </div>

          {/* Links e Mídia */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={addLink}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('link') ? 'bg-gray-300' : ''
              }`}
              title="Adicionar Link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
              </svg>
            </button>

            <button
              type="button"
              onClick={addImage}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Adicionar Imagem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="min-h-[300px] max-h-[500px] overflow-y-auto"
      />
    </div>
  )
}