'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

// ── Toolbar button ───────────────────────────────────────────────────

function Btn({
  editor,
  label,
  shortcut,
  action,
  isActive,
  children,
}: {
  editor: Editor
  label: string
  shortcut?: string
  action: () => void
  isActive: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      onMouseDown={(e) => {
        e.preventDefault()
        action()
        editor.commands.focus()
      }}
      className={`flex items-center justify-center w-8 h-8 rounded-md text-sm transition-colors ${
        isActive
          ? 'bg-sky-500/20 text-sky-300'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

// ── Link popover ─────────────────────────────────────────────────────

function LinkPopover({
  editor,
  onClose,
}: {
  editor: Editor
  onClose: () => void
}) {
  const previousUrl = editor.getAttributes('link').href || ''

  const [url, setUrl] = useState(previousUrl)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (url.trim()) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url.trim() })
          .run()
      } else {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
      }
      onClose()
    },
    [editor, url, onClose]
  )

  const handleRemove = useCallback(() => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    onClose()
  }, [editor, onClose])

  return (
    <div className="absolute top-full mt-1 left-0 z-50 bg-slate-800 border border-slate-600/70 rounded-lg shadow-xl p-2.5 flex items-center gap-2 min-w-[280px]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          autoFocus
          className="flex-1 bg-slate-900/80 border border-slate-600/50 rounded-md px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-md transition-colors"
        >
          Save
        </button>
        {previousUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-2 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Remove
          </button>
        )}
      </form>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  minHeight = 300,
}: RichTextEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-sky-400 underline hover:text-sky-300' },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[200px]',
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  // Sync editor content when `value` changes from outside (e.g. editing a product)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [editor, value])

  const closeAll = useCallback(() => {
    setLinkOpen(false)
  }, [])

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="richtext-editor border border-slate-600/60 rounded-lg overflow-hidden bg-slate-900/70">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-600/40 bg-slate-800/40">
        {/* Undo / Redo */}
        <Btn editor={editor} label="Undo" shortcut="Ctrl+Z" action={() => editor.chain().focus().undo().run()} isActive={false}>
          ↶
        </Btn>
        <Btn editor={editor} label="Redo" shortcut="Ctrl+Shift+Z" action={() => editor.chain().focus().redo().run()} isActive={false}>
          ↷
        </Btn>

        <span className="w-px h-5 bg-slate-600/40 mx-1" />

        {/* Heading levels */}
        <Btn editor={editor} label="Heading 1" shortcut="Ctrl+Alt+1" action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}>
          H1
        </Btn>
        <Btn editor={editor} label="Heading 2" shortcut="Ctrl+Alt+2" action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
          H2
        </Btn>
        <Btn editor={editor} label="Heading 3" shortcut="Ctrl+Alt+3" action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}>
          H3
        </Btn>

        <span className="w-px h-5 bg-slate-600/40 mx-1" />

        {/* Inline formatting */}
        <Btn editor={editor} label="Bold" shortcut="Ctrl+B" action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
          <strong className="text-sm">B</strong>
        </Btn>
        <Btn editor={editor} label="Italic" shortcut="Ctrl+I" action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
          <em className="text-sm">I</em>
        </Btn>
        <Btn editor={editor} label="Strikethrough" shortcut="Ctrl+Shift+S" action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
          <span className="text-sm line-through">S</span>
        </Btn>
        <Btn editor={editor} label="Code" shortcut="Ctrl+E" action={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>
          <code className="text-sm">&lt;/&gt;</code>
        </Btn>

        <span className="w-px h-5 bg-slate-600/40 mx-1" />

        {/* Block formatting */}
        <Btn editor={editor} label="Bullet List" shortcut="Ctrl+Shift+8" action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </Btn>
        <Btn editor={editor} label="Ordered List" shortcut="Ctrl+Shift+7" action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </Btn>
        <Btn editor={editor} label="Blockquote" shortcut="Ctrl+Shift+B" action={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </Btn>

        <span className="w-px h-5 bg-slate-600/40 mx-1" />

        {/* Horizontal rule */}
        <Btn editor={editor} label="Horizontal Rule" action={() => editor.chain().focus().setHorizontalRule().run()} isActive={false}>
          —
        </Btn>

        {/* Image */}
        <Btn editor={editor} label="Image" action={addImage} isActive={false}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </Btn>

        {/* Link */}
        <div className="relative">
          <Btn
            editor={editor}
            label="Link"
            shortcut="Ctrl+K"
            action={() => {
              closeAll()
              setLinkOpen(!linkOpen)
            }}
            isActive={editor.isActive('link')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </Btn>
          {linkOpen && <LinkPopover editor={editor} onClose={() => setLinkOpen(false)} />}
        </div>

        {/* Text align */}
        <span className="w-px h-5 bg-slate-600/40 mx-1" />
        <Btn editor={editor} label="Align Left" action={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
        </Btn>
        <Btn editor={editor} label="Align Center" action={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="14" x2="6" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
        </Btn>
        <Btn editor={editor} label="Align Right" action={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="7" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
        </Btn>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* HTML preview toggle (optional) */}
      <div className="border-t border-slate-600/30 px-3 py-1.5 bg-slate-800/20">
        <span className="text-[10px] text-slate-500">
          {editor.storage.characterCount?.characters?.() ?? 0} characters
        </span>
      </div>
    </div>
  )
}
