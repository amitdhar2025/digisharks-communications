'use client'

import { useCallback, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  List, ListOrdered, ListChecks,
  Quote, Image, Link, Link2Off, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Code, Baseline, Superscript as SuperscriptIcon,
  Highlighter, Minus, FileCode, Eye,
} from 'lucide-react'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function TipTapEditor({ content, onChange, placeholder = 'Start writing...' }: TipTapEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState<'visual' | 'source'>('visual')
  const [sourceHtml, setSourceHtml] = useState(content || '')
  const sourceRef = useRef<HTMLTextAreaElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (mode === 'visual') {
        onChange(editor.getHTML())
        setSourceHtml(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: 'tipTap-editor-content prose prose-invert max-w-none min-h-[400px] outline-none px-4 py-3 text-sm leading-relaxed',
      },
    },
    immediatelyRender: false,
  })

  const toggleMode = useCallback(() => {
    if (!editor) return
    if (mode === 'visual') {
      // Switch to source: capture current HTML
      setSourceHtml(editor.getHTML())
      setMode('source')
      setTimeout(() => sourceRef.current?.focus(), 50)
    } else {
      // Switch to visual: apply HTML from source
      setMode('visual')
      editor.commands.setContent(sourceHtml)
      onChange(sourceHtml)
    }
  }, [mode, editor, sourceHtml, onChange])

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceHtml(e.target.value)
    onChange(e.target.value)
  }, [onChange])

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('image', file)
        const res = await fetch('/api/admin/blog/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')

        if (mode === 'visual') {
          editor?.chain().focus().setImage({ src: data.url }).run()
        } else {
          setSourceHtml((prev) => prev + `\n<img src="${data.url}" alt="" />\n`)
        }
      } catch (err: any) {
        alert('Upload failed: ' + err.message)
      } finally {
        setUploading(false)
      }
    }
    input.click()
  }, [editor, mode])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  const ToolButton = ({ onClick, active, children, title }: {
    onClick: () => void; active?: boolean; children: React.ReactNode; title?: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-5 bg-slate-700 mx-1" />

  const wordCount = editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 250))

  return (
    <div className="tipTap-editor border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/70 border-b border-slate-700">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className={mode === 'visual' ? 'text-sky-400 font-semibold' : ''}>
            {wordCount} words
          </span>
          <span className="text-slate-600">·</span>
          <span>~{readTime} min read</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-900/70 rounded-lg p-0.5 border border-slate-600/50">
          <button
            type="button"
            onClick={() => {
              if (mode === 'source') {
                setMode('visual')
                editor.commands.setContent(sourceHtml)
                onChange(sourceHtml)
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              mode === 'visual'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye size={13} /> Visual
          </button>
          <button
            type="button"
            onClick={toggleMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              mode === 'source'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode size={13} /> Source
          </button>
        </div>
      </div>

      {mode === 'visual' ? (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-slate-700 bg-slate-800/50">
            {/* Headings */}
            <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
              <Heading1 size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
              <Heading2 size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
              <Heading3 size={16} />
            </ToolButton>

            <Divider />

            {/* Text formatting */}
            <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
              <Bold size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
              <Italic size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
              <UnderlineIcon size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
              <Strikethrough size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
              <Highlighter size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
              <SuperscriptIcon size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
              <Baseline size={16} />
            </ToolButton>

            <Divider />

            {/* Alignment */}
            <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
              <AlignLeft size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
              <AlignCenter size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
              <AlignRight size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
              <AlignJustify size={16} />
            </ToolButton>

            <Divider />

            {/* Lists */}
            <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
              <List size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
              <ListOrdered size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Checklist">
              <ListChecks size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
              <Quote size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
              <Code size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
              <Minus size={16} />
            </ToolButton>

            <Divider />

            {/* Media & Links */}
            <ToolButton onClick={handleImageUpload} title={uploading ? 'Uploading...' : 'Insert Image'}>
              <Image size={16} className={uploading ? 'animate-pulse' : ''} />
            </ToolButton>
            <ToolButton onClick={setLink} active={editor.isActive('link')} title="Insert Link">
              <Link size={16} />
            </ToolButton>
            {editor.isActive('link') && (
              <ToolButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
                <Link2Off size={16} />
              </ToolButton>
            )}

            <div className="flex-1" />

            {/* Undo/Redo */}
            <ToolButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
              <Undo size={16} />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
              <Redo size={16} />
            </ToolButton>
          </div>

          {/* Bubble Menu */}
          <BubbleMenu editor={editor} updateDelay={150}>
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-2 py-1.5">
              <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded ${editor.isActive('bold') ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'}`}>
                <Bold size={14} />
              </button>
              <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded ${editor.isActive('italic') ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'}`}>
                <Italic size={14} />
              </button>
              <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1 rounded ${editor.isActive('underline') ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'}`}>
                <UnderlineIcon size={14} />
              </button>
              <button type="button" onClick={setLink} className={`p-1 rounded ${editor.isActive('link') ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'}`}>
                <Link size={14} />
              </button>
              <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'}`}>
                <Heading2 size={14} />
              </button>
            </div>
          </BubbleMenu>

          {/* Editor Content */}
          <EditorContent editor={editor} />
        </>
      ) : (
        /* Source Code View */
        <textarea
          ref={sourceRef}
          value={sourceHtml}
          onChange={handleSourceChange}
          className="w-full min-h-[400px] bg-slate-950 text-green-300 font-mono text-sm p-4 outline-none resize-y border-0 focus:ring-0 leading-relaxed"
          spellCheck={false}
          placeholder="<!-- HTML source code -->"
          style={{ tabSize: 2 }}
        />
      )}

      {/* Bottom bar */}
      <div className="px-4 py-1.5 border-t border-slate-700 text-xs text-slate-500 flex justify-between">
        <span>
          {mode === 'visual' ? (
            <>{wordCount} words · ~{readTime} min read</>
          ) : (
            <>Editing HTML source — tags will be rendered when switching to Visual mode</>
          )}
        </span>
      </div>
    </div>
  )
}
