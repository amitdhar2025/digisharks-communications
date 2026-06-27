'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Image, X, Plus } from 'lucide-react'
import TipTapEditor from './TipTapEditor'

const blogPostSchema = z.object({
  // Basic Info
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  excerpt: z.string().max(500, 'Excerpt must be under 500 characters').optional().or(z.literal('')),
  shortDescription: z.string().max(1000).optional().or(z.literal('')),
  author: z.string().min(1, 'Author is required'),
  authorImage: z.string().optional().or(z.literal('')),
  publishedAt: z.string().optional().or(z.literal('')),

  // Status
  status: z.enum(['draft', 'published', 'active', 'inactive', 'featured', 'scheduled']),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  scheduledAt: z.string().optional().or(z.literal('')),

  // Categories & Tags
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  // Images
  featuredImage: z.string().optional().or(z.literal('')),
  seoAltTag: z.string().optional().or(z.literal('')),

  // SEO
  seoTitle: z.string().max(200).optional().or(z.literal('')),
  seoKeywords: z.string().optional().or(z.literal('')),
  seoDescription: z.string().max(300).optional().or(z.literal('')),
  metaRobots: z.enum(['index', 'noindex']).optional(),
  metaFollow: z.enum(['follow', 'nofollow']).optional(),
  canonicalUrl: z.string().optional().or(z.literal('')),
  ogTitle: z.string().max(200).optional().or(z.literal('')),
  ogDescription: z.string().max(300).optional().or(z.literal('')),
  ogImage: z.string().optional().or(z.literal('')),
  twitterTitle: z.string().max(200).optional().or(z.literal('')),
  twitterDescription: z.string().max(300).optional().or(z.literal('')),
  twitterImage: z.string().optional().or(z.literal('')),
  breadcrumbTitle: z.string().max(200).optional().or(z.literal('')),
  schemaType: z.string().optional().or(z.literal('BlogPosting')),
})

type BlogFormData = z.infer<typeof blogPostSchema>

interface BlogFormProps {
  initialData?: any
  isEditing?: boolean
}

interface SelectOption {
  _id: string
  name: string
  slug: string
  color?: string
}

interface CloudinaryImageData {
  url: string
  publicId: string
  width: number
  height: number
}

const AUTO_SAVE_KEY = 'digisharks-blog-draft'
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

export default function BlogForm({ initialData, isEditing }: BlogFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState(initialData?.content || '')
  const [categories, setCategories] = useState<SelectOption[]>([])
  const [tags, setTags] = useState<SelectOption[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#4F46E5')
  const [newTagName, setNewTagName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [addingTag, setAddingTag] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [recoverDraft, setRecoverDraft] = useState<any>(null)
  const [featuredImageUploading, setFeaturedImageUploading] = useState(false)
  const [featuredImageData, setFeaturedImageData] = useState<CloudinaryImageData | null>(
    initialData?.featuredImage || null
  )

  const slugTimeoutRef = useRef<NodeJS.Timeout>()

  const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<BlogFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      excerpt: initialData?.excerpt || '',
      shortDescription: initialData?.shortDescription || '',
      author: initialData?.author || 'Digisharks Team',
      authorImage: initialData?.authorImage || '',
      publishedAt: initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      status: initialData?.status || 'draft',
      featured: initialData?.isFeatured || initialData?.featured || false,
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
      scheduledAt: initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
      categories: initialData?.categories?.map((c: any) => c._id || c) || [],
      tags: initialData?.tags?.map((t: any) => t._id || t) || [],
      featuredImage: initialData?.featuredImage?.url || '',
      seoAltTag: initialData?.seoAltTag || '',
      seoTitle: initialData?.seoTitle || '',
      seoKeywords: initialData?.seoKeywords?.join(', ') || '',
      seoDescription: initialData?.seoDescription || '',
      metaRobots: initialData?.metaRobots || 'index',
      metaFollow: initialData?.metaFollow || 'follow',
      canonicalUrl: initialData?.canonicalUrl || '',
      ogTitle: initialData?.ogTitle || '',
      ogDescription: initialData?.ogDescription || '',
      ogImage: initialData?.ogImage || '',
      twitterTitle: initialData?.twitterTitle || '',
      twitterDescription: initialData?.twitterDescription || '',
      twitterImage: initialData?.twitterImage || '',
      breadcrumbTitle: initialData?.breadcrumbTitle || '',
      schemaType: initialData?.schemaType || 'BlogPosting',
    },
  })

  const status = watch('status')
  const title = watch('title')
  const slug = watch('slug')

  // Sync featured checkbox with status dropdown
  useEffect(() => {
    if (status === 'featured') {
      setValue('featured', true, { shouldValidate: true })
    }
  }, [status, setValue])

  // Auto-generate slug from title
  useEffect(() => {
    if (isEditing && initialData?.slug) return // Don't auto-generate for existing posts
    if (slugTimeoutRef.current) clearTimeout(slugTimeoutRef.current)
    slugTimeoutRef.current = setTimeout(() => {
      const generatedSlug = title
        ? title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : ''
      if (generatedSlug && !slug) {
        setValue('slug', generatedSlug, { shouldValidate: true })
      }
    }, 500)
    return () => { if (slugTimeoutRef.current) clearTimeout(slugTimeoutRef.current) }
  }, [title, slug, setValue, isEditing, initialData])

  // Load categories & tags
  useEffect(() => {
    fetch('/api/admin/blog/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
    fetch('/api/admin/blog/tags')
      .then((r) => r.json())
      .then((d) => setTags(d.tags || []))
      .catch(() => {})
  }, [])

  // Check for recoverable draft (only for new posts)
  useEffect(() => {
    if (isEditing) return
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Check if it's recent (within last 24 hours)
        const savedTime = new Date(parsed._savedAt).getTime()
        if (Date.now() - savedTime < 24 * 60 * 60 * 1000) {
          setRecoverDraft(parsed)
        } else {
          localStorage.removeItem(AUTO_SAVE_KEY)
        }
      }
    } catch {}
  }, [isEditing])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isEditing) return // Only auto-save for new posts
    const interval = setInterval(() => {
      const values = getValues()
      const draft = {
        ...values,
        content,
        _savedAt: new Date().toISOString(),
      }
      try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(draft))
        setLastSaved(new Date().toLocaleTimeString())
      } catch {}
    }, AUTO_SAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [isEditing, getValues, content])

  function recoverFromDraft() {
    if (!recoverDraft) return
    const draft = recoverDraft
    Object.entries(draft).forEach(([key, value]) => {
      if (key !== '_savedAt' && key !== 'content') {
        ;(setValue as any)(key, value, { shouldValidate: false })
      }
    })
    if (draft.content) setContent(draft.content)
    setRecoverDraft(null)
    localStorage.removeItem(AUTO_SAVE_KEY)
  }

  function dismissRecover() {
    setRecoverDraft(null)
    localStorage.removeItem(AUTO_SAVE_KEY)
  }

  // Image upload handler
  const uploadImage = useCallback(async (file: File, type: 'featured'): Promise<CloudinaryImageData | null> => {
    const formData = new FormData()
    formData.append('image', file)
    setFeaturedImageUploading(true)

    try {
      const res = await fetch('/api/admin/blog/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      return { url: data.url, publicId: data.publicId, width: data.width, height: data.height }
    } catch (err: any) {
      alert('Upload failed: ' + err.message)
      return null
    } finally {
      setFeaturedImageUploading(false)
    }
  }, [])

  async function handleFeaturedImageUpload() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const result = await uploadImage(file, 'featured')
      if (result) {
        setFeaturedImageData(result)
        setValue('featuredImage', result.url, { shouldValidate: true })
        setValue('seoAltTag', file.name.split('.')[0], { shouldValidate: false })
      }
    }
    input.click()
  }

  function removeFeaturedImage() {
    setFeaturedImageData(null)
    setValue('featuredImage', '', { shouldValidate: true })
  }

  async function onSubmit(data: BlogFormData) {
    setSaving(true)
    setError(null)
    try {
      const seoKeywords = data.seoKeywords
        ? data.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : []

      const body = {
        ...data,
        content,
        seoKeywords,
        featuredImage: featuredImageData || (data.featuredImage ? { url: data.featuredImage } : null),
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined,
        scheduledAt: data.status === 'scheduled' && data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
        readingTime: Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 250)),
      }

      const url = isEditing
        ? `/api/admin/blog/posts/${initialData._id}`
        : '/api/admin/blog/posts'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to save post')

      // Clear auto-save on successful save
      if (!isEditing) localStorage.removeItem(AUTO_SAVE_KEY)

      router.push('/admin/blog')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function toggleCategory(id: string) {
    const current = watch('categories') || []
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    setValue('categories', next, { shouldValidate: true })
  }

  function toggleTag(id: string) {
    const current = watch('tags') || []
    const next = current.includes(id) ? current.filter((t) => t !== id) : [...current, id]
    setValue('tags', next, { shouldValidate: true })
  }

  // Add new category
  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    setAddingCategory(true)
    try {
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim(), color: newCategoryColor }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create category')
      // Reload categories
      const catRes = await fetch('/api/admin/blog/categories', { credentials: 'include' })
      const catData = await catRes.json()
      if (catRes.ok) setCategories(catData.categories || [])
      // Auto-select the new category
      const newCat = data.category
      if (newCat?._id) {
        const current = watch('categories') || []
        setValue('categories', [...current, newCat._id], { shouldValidate: true })
      }
      setNewCategoryName('')
      setNewCategoryColor('#4F46E5')
    } catch (e: any) {
      alert('Failed to add category: ' + e.message)
    } finally {
      setAddingCategory(false)
    }
  }

  // Delete a category
  async function handleDeleteCategory(catId: string, catName: string) {
    if (!confirm(`Delete category "${catName}"? This will remove it from all blog posts.`)) return
    try {
      const res = await fetch(`/api/admin/blog/categories?id=${catId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      // Remove from selection
      const current = watch('categories') || []
      setValue('categories', current.filter((id: string) => id !== catId), { shouldValidate: true })
      // Reload categories
      const catRes = await fetch('/api/admin/blog/categories', { credentials: 'include' })
      const catData = await catRes.json()
      if (catRes.ok) setCategories(catData.categories || [])
    } catch (e: any) {
      alert('Failed to delete category: ' + e.message)
    }
  }

  // Add new tag
  async function handleAddTag() {
    if (!newTagName.trim()) return
    setAddingTag(true)
    try {
      const res = await fetch('/api/admin/blog/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create tag')
      // Reload tags
      const tagRes = await fetch('/api/admin/blog/tags', { credentials: 'include' })
      const tagData = await tagRes.json()
      if (tagRes.ok) setTags(tagData.tags || [])
      // Auto-select the new tag
      const newTag = data.tag
      if (newTag?._id) {
        const current = watch('tags') || []
        setValue('tags', [...current, newTag._id], { shouldValidate: true })
      }
      setNewTagName('')
    } catch (e: any) {
      alert('Failed to add tag: ' + e.message)
    } finally {
      setAddingTag(false)
    }
  }

  // Delete a tag
  async function handleDeleteTag(tagId: string, tagName: string) {
    if (!confirm(`Delete tag "${tagName}"? This will remove it from all blog posts.`)) return
    try {
      const res = await fetch(`/api/admin/blog/tags?id=${tagId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      // Remove from selection
      const current = watch('tags') || []
      setValue('tags', current.filter((id: string) => id !== tagId), { shouldValidate: true })
      // Reload tags
      const tagRes = await fetch('/api/admin/blog/tags', { credentials: 'include' })
      const tagData = await tagRes.json()
      if (tagRes.ok) setTags(tagData.tags || [])
    } catch (e: any) {
      alert('Failed to delete tag: ' + e.message)
    }
  }

  const colorOptionsCat = ['#4F46E5', '#7C3AED', '#6366F1', '#FB7185', '#FDA4AF', '#F97316', '#0EA5E9', '#10B981']

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Recovery Prompt */}
      {recoverDraft && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>Unsaved draft found from auto-save. Would you like to recover it?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-success" onClick={recoverFromDraft} style={{ padding: '6px 12px', fontSize: 12 }}>
              Recover Draft
            </button>
            <button type="button" className="btn btn-ghost" onClick={dismissRecover} style={{ padding: '6px 12px', fontSize: 12 }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Auto-save indicator */}
      {!isEditing && lastSaved && (
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Auto-saved at {lastSaved}
        </div>
      )}

      {/* =========== BLOG INFORMATION =========== */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-sky-500 rounded-full inline-block" />
          Blog Information
        </h3>
        <div className="space-y-4">
          {/* Title */}
          <div className="field">
            <label>Blog Title *</label>
            <input
              type="text"
              placeholder="Enter a compelling title..."
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Slug */}
          <div className="field">
            <label>Blog Slug *</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">/blog/</span>
              <input
                type="text"
                placeholder="my-blog-post-slug"
                {...register('slug')}
                className={errors.slug ? 'border-red-500 flex-1' : 'flex-1'}
              />
            </div>
            {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
          </div>

          {/* Date & Author row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="field">
              <label>Blog Date *</label>
              <input type="datetime-local" {...register('publishedAt')} />
            </div>
            <div className="field">
              <label>Author Name</label>
              <input type="text" placeholder="Author name" {...register('author')} />
              {errors.author && <p className="text-red-400 text-xs mt-1">{errors.author.message}</p>}
            </div>
            <div className="field">
              <label>Author Image URL</label>
              <input type="url" placeholder="https://..." {...register('authorImage')} />
            </div>
          </div>

          {/* Short Description */}
          <div className="field">
            <label>Short Description</label>
            <textarea
              rows={2}
              placeholder="Brief summary for cards and previews..."
              {...register('shortDescription')}
            />
          </div>

          {/* Excerpt */}
          <div className="field">
            <label>Excerpt (shown in preview cards)</label>
            <textarea
              rows={2}
              placeholder="Excerpt for SEO and feed displays..."
              {...register('excerpt')}
            />
            {errors.excerpt && <p className="text-red-400 text-xs mt-1">{errors.excerpt.message}</p>}
          </div>
        </div>
      </div>

      {/* =========== BLOG FEATURED IMAGE =========== */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-purple-500 rounded-full inline-block" />
          Featured Image
        </h3>
        <div>
          {featuredImageData ? (
            <div className="relative group rounded-xl overflow-hidden border border-slate-600 bg-slate-900 max-w-md">
              <img
                src={featuredImageData.url}
                alt="Featured"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="btn btn-ghost text-xs"
                  onClick={handleFeaturedImageUpload}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className="btn btn-danger text-xs"
                  onClick={removeFeaturedImage}
                >
                  Delete
                </button>
              </div>
              <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-700 text-xs text-slate-400 truncate">
                {featuredImageData.publicId}
              </div>
            </div>
          ) : (
            <div
              onClick={handleFeaturedImageUpload}
              className="border-2 border-dashed border-slate-600 rounded-xl h-44 max-w-md flex flex-col items-center justify-center cursor-pointer hover:border-sky-500 hover:bg-slate-800/50 transition-colors"
            >
              {featuredImageUploading ? (
                <span className="spinner" />
              ) : (
                <>
                  <Image size={32} className="text-slate-500 mb-2" />
                  <span className="text-xs text-slate-500">Click to upload featured image</span>
                  <span className="text-xs text-slate-600 mt-1">JPG, PNG, WebP • Max 5MB</span>
                </>
              )}
            </div>
          )}
          <div className="field mt-3 max-w-md">
            <label>SEO Alt Tag</label>
            <input
              type="text"
              placeholder="Descriptive alt text for the featured image..."
              {...register('seoAltTag')}
            />
          </div>
        </div>
      </div>

      {/* =========== CATEGORIES & TAGS =========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categories */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 block">
            Categories *
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => {
              const isSelected = (watch('categories') || []).includes(cat._id)
              return (
                <span
                  key={cat._id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-sky-500'
                  }`}
                  onClick={() => toggleCategory(cat._id)}
                >
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: cat.color || '#4F46E5',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  {cat.name}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id, cat.name) }}
                    className="ml-0.5 hover:text-red-400 transition-colors"
                    title={`Delete ${cat.name}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              )
            })}
            {categories.length === 0 && (
              <p className="text-xs text-slate-500">No categories yet. Add one below.</p>
            )}
          </div>
          {/* Add category form */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name..."
              className="flex-1 min-w-[120px] bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() } }}
            />
            <div className="flex items-center gap-1">
              {colorOptionsCat.slice(0, 4).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCategoryColor(c)}
                  style={{
                    width: 18, height: 18, borderRadius: 4, background: c,
                    border: newCategoryColor === c ? '2px solid white' : '1px solid transparent',
                    outline: newCategoryColor === c ? '1.5px solid ' + c : 'none',
                  }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                style={{ width: 20, height: 20, borderRadius: 4, cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 }}
                title="Custom color"
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddCategory}
              disabled={addingCategory || !newCategoryName.trim()}
              style={{ padding: '4px 10px', fontSize: 11 }}
            >
              {addingCategory ? <span className="spinner" /> : <Plus size={12} />}
              Add
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 block">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => {
              const isSelected = (watch('tags') || []).includes(tag._id)
              return (
                <span
                  key={tag._id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-violet-600 text-white border-violet-500'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-violet-500'
                  }`}
                  onClick={() => toggleTag(tag._id)}
                >
                  #{tag.name}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag._id, tag.name) }}
                    className="ml-0.5 hover:text-red-400 transition-colors"
                    title={`Delete ${tag.name}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              )
            })}
            {tags.length === 0 && (
              <p className="text-xs text-slate-500">No tags yet. Add one below.</p>
            )}
          </div>
          {/* Add tag form */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name..."
              className="flex-1 min-w-[100px] bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddTag}
              disabled={addingTag || !newTagName.trim()}
              style={{ padding: '4px 10px', fontSize: 11 }}
            >
              {addingTag ? <span className="spinner" /> : <Plus size={12} />}
              Add
            </button>
          </div>
        </div>
      </div>

      {/* =========== STATUS SECTION =========== */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block" />
          Status & Visibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="field">
            <label>Status</label>
            <select {...register('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div className="field">
            <label>Featured Post</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                {...register('featured')}
                className="w-5 h-5 rounded border-slate-600 bg-slate-800"
              />
              <span className="text-sm text-slate-400">
                {watch('featured') ? 'Featured (appears first)' : 'Not featured'}
              </span>
            </div>
          </div>
          <div className="field">
            <label>Active</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-5 h-5 rounded border-slate-600 bg-slate-800"
              />
              <span className="text-sm text-slate-400">
                {watch('isActive') ? 'Post is visible' : 'Post is hidden'}
              </span>
            </div>
          </div>
          {/* Scheduled date - only show when status is 'scheduled' */}
          {status === 'scheduled' && (
            <div className="field md:col-span-3">
              <label>Scheduled Publish Date *</label>
              <input type="datetime-local" {...register('scheduledAt')} />
            </div>
          )}
        </div>
      </div>

      {/* =========== CONTENT =========== */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-amber-500 rounded-full inline-block" />
          Content
        </h3>
        <div className="field">
          <TipTapEditor content={content} onChange={setContent} />
        </div>
      </div>

      {/* =========== SEO SECTION =========== */}
      <details className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 group" open={!!initialData?.seoTitle}>
        <summary className="text-sm font-semibold text-slate-300 uppercase tracking-wider cursor-pointer flex items-center gap-2">
          <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
          SEO Settings
          <span className="text-slate-500 font-normal normal-case ml-auto group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-5 space-y-5">
          {/* Basic SEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="field">
              <label>SEO Title</label>
              <input type="text" placeholder="Meta title (defaults to post title)" {...register('seoTitle')} />
            </div>
            <div className="field">
              <label>SEO Keywords</label>
              <input type="text" placeholder="keyword1, keyword2, keyword3" {...register('seoKeywords')} />
              <p className="text-xs text-slate-500 mt-1">Separate keywords with commas</p>
            </div>
          </div>
          <div className="field">
            <label>SEO Description</label>
            <textarea
              rows={2}
              placeholder="Meta description for search engines..."
              {...register('seoDescription')}
            />
          </div>
          <div className="field">
            <label>Canonical URL</label>
            <input type="url" placeholder="https://yoursite.com/blog/..." {...register('canonicalUrl')} />
          </div>

          {/* Meta Robots & Follow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="field">
              <label>Meta Robots</label>
              <select {...register('metaRobots')}>
                <option value="index">Index</option>
                <option value="noindex">Noindex</option>
              </select>
            </div>
            <div className="field">
              <label>Meta Follow</label>
              <select {...register('metaFollow')}>
                <option value="follow">Follow</option>
                <option value="nofollow">Nofollow</option>
              </select>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="field">
            <label>Breadcrumb Title</label>
            <input type="text" placeholder="Breadcrumb navigation title" {...register('breadcrumbTitle')} />
          </div>

          <div className="field">
            <label>Schema Type</label>
            <select {...register('schemaType')}>
              <option value="BlogPosting">BlogPosting</option>
              <option value="Article">Article</option>
              <option value="NewsArticle">NewsArticle</option>
              <option value="TechArticle">TechArticle</option>
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Open Graph</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label>OG Title</label>
                <input type="text" placeholder="Open Graph title" {...register('ogTitle')} />
              </div>
              <div className="field">
                <label>OG Image URL</label>
                <input type="url" placeholder="https://..." {...register('ogImage')} />
              </div>
            </div>
            <div className="field">
              <label>OG Description</label>
              <textarea rows={2} placeholder="Open Graph description..." {...register('ogDescription')} />
            </div>
          </div>

          {/* Twitter Card */}
          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Twitter Card</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label>Twitter Title</label>
                <input type="text" placeholder="Twitter card title" {...register('twitterTitle')} />
              </div>
              <div className="field">
                <label>Twitter Image URL</label>
                <input type="url" placeholder="https://..." {...register('twitterImage')} />
              </div>
            </div>
            <div className="field">
              <label>Twitter Description</label>
              <textarea rows={2} placeholder="Twitter card description..." {...register('twitterDescription')} />
            </div>
          </div>
        </div>
      </details>

      {/* =========== ACTIONS =========== */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="spinner" /> : null}
          {isEditing ? 'Update Post' : status === 'published' || status === 'featured' || status === 'active' ? 'Publish Post' : 'Save as Draft'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.push('/admin/blog')}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
