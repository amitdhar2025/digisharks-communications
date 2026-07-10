'use client'

import { useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'

interface ProductVariation {
  name: string
  price: number
  compareAtPrice?: number
  isActive: boolean
}

async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.set('image', file)
  try {
    const res = await fetch('/api/content/admin/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    const data = await res.json()
    return res.ok ? data.url : null
  } catch {
    return null
  }
}

export default function AddProductPage() {
  const router = useRouter()

  // Form fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Digital')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [shortPitch, setShortPitch] = useState('')
  const [description, setDescription] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [featuredImage, setFeaturedImage] = useState('')
  const [demoVideo, setDemoVideo] = useState('')
  const [howToVideo, setHowToVideo] = useState('')
  const [rating, setRating] = useState('5')
  const [active, setActive] = useState(true)
  const [downloadUrl, setDownloadUrl] = useState('')

  // Dynamic tabs
  const [tabs, setTabs] = useState<{ label: string; content: string; order: number; helpBanner?: { text: string; textColor: string; bgColor: string } }[]>([])
  // Testimonials
  const [testimonials, setTestimonials] = useState<{ name: string; stars: number; text: string }[]>([])
  // FAQ
  const [faqItems, setFaqItems] = useState<{ q: string; a: string; order: number }[]>([])

  // Button display config
  const [demoVideoLabel, setDemoVideoLabel] = useState('')
  const [titleFontSize, setTitleFontSize] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [buyButtonText, setBuyButtonText] = useState('')
  const [buttonColor, setButtonColor] = useState('')
  const [cartButtonBg, setCartButtonBg] = useState('')
  const [cartButtonTextColor, setCartButtonTextColor] = useState('')
  const [cartButtonBorderColor, setCartButtonBorderColor] = useState('')
  const [cartButtonHoverBg, setCartButtonHoverBg] = useState('')
  const [cartButtonHoverTextColor, setCartButtonHoverTextColor] = useState('')
  const [buyButtonBg, setBuyButtonBg] = useState('')
  const [buyButtonTextColor, setBuyButtonTextColor] = useState('')
  const [buyButtonBorderColor, setBuyButtonBorderColor] = useState('')
  const [buyButtonHoverBg, setBuyButtonHoverBg] = useState('')
  const [buyButtonHoverTextColor, setBuyButtonHoverTextColor] = useState('')
  // Trust cards
  const [trustCards, setTrustCards] = useState<{ icon: string; title: string; description: string }[]>([])
  // Dynamic specs
  const [specs, setSpecs] = useState<{ icon: string; label: string; value: string }[]>([])
  // Dynamic whatsIncluded
  const [whatsIncluded, setWhatsIncluded] = useState<{ icon: string; title: string; description: string }[]>([])
  // Dynamic coverageStats
  const [coverageStats, setCoverageStats] = useState<{ number: string; label: string }[]>([])

  const [variations, setVariations] = useState<ProductVariation[]>([])
  const [uploadingImg, setUploadingImg] = useState<number | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState<'demo' | 'howToUse' | null>(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!price) { setError('Price is required'); return }
    setBusy(true)
    setError(null)

    const body = {
      title: title.trim(),
      category,
      price: Number(price),
      compareAtPrice: comparePrice ? Number(comparePrice) : Number(price),
      shortPitch: shortPitch.trim(),
      description: description.trim(),
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      images: images.filter(Boolean),
      featuredImage: featuredImage || '',
      demoVideo: demoVideo.trim(),
      howToUseVideo: howToVideo.trim(),
      rating: Math.min(5, Math.max(0, Number(rating) || 0)),
      isActive: active,
      downloadUrl: downloadUrl.trim(),
      variations: variations.filter((v) => v.name.trim() && v.price > 0),
      titleFontSize: titleFontSize.trim(),
      demoVideoLabel: demoVideoLabel.trim(),
      buttonText: buttonText.trim(),
      buyButtonText: buyButtonText.trim(),
      buttonColor: buttonColor.trim(),
      cartButtonBg: cartButtonBg.trim(),
      cartButtonTextColor: cartButtonTextColor.trim(),
      cartButtonBorderColor: cartButtonBorderColor.trim(),
      cartButtonHoverBg: cartButtonHoverBg.trim(),
      cartButtonHoverTextColor: cartButtonHoverTextColor.trim(),
      buyButtonBg: buyButtonBg.trim(),
      buyButtonTextColor: buyButtonTextColor.trim(),
      buyButtonBorderColor: buyButtonBorderColor.trim(),
      buyButtonHoverBg: buyButtonHoverBg.trim(),
      buyButtonHoverTextColor: buyButtonHoverTextColor.trim(),
      tabs: tabs.map((t, i) => ({ ...t, order: i })),
      testimonials: testimonials.filter((t) => t.name.trim() && t.text.trim()),
      faq: faqItems.map((f, i) => ({ ...f, order: i })),
      trustCards: trustCards.filter((c) => c.title.trim() && c.icon.trim()),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      whatsIncluded: whatsIncluded.filter((w) => w.title.trim()),
      coverageStats: coverageStats.filter((c) => c.number.trim() && c.label.trim()),
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setToast({ kind: 'success', text: 'Product created!' })
      setTimeout(() => router.push('/admin/store/products'), 800)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>＋ Add Product</h1>
          <div className="sub">
            <Link href="/admin/store/products" style={{ color: '#7dd3fc' }}>← Back to products</Link>
          </div>
        </div>
      </div>

      {toast && (
        <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status">
          {toast.text}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
        <form onSubmit={handleSave} autoComplete="off">
          <div className="field">
            <label>Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. PAN India Database 2025" required />
          </div>

          <div className="field">
            <label>Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Digital, Database, Template" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Price (₹) *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="299" min={0} required />
            </div>
            <div className="field">
              <label>Compare-at Price (₹)</label>
              <input type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="3999" min={0} />
            </div>
          </div>

          <div className="field">
            <label>Short Pitch</label>
            <textarea value={shortPitch} onChange={(e) => setShortPitch(e.target.value)} placeholder="Brief description..." rows={2} />
          </div>

          <div className="field">
            <label>Full Description</label>
            <p className="text-xs text-slate-500 mb-2">Rich content shown on the product detail page.</p>
            <RichTextEditor value={description} onChange={setDescription} placeholder="Start writing your product description…" minHeight={320} />
          </div>

          {/* ── SEO Section ── */}
          <details className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 mt-6 group" open={!!seoTitle}>
            <summary className="text-sm font-semibold text-slate-300 cursor-pointer list-none flex items-center gap-2 select-none">
              <span className="text-slate-500 group-open:text-sky-400 transition-colors">▶</span>
              Search Engine Optimisation (SEO)
            </summary>
            <div className="mt-4 space-y-3">
              <div className="field">
                <label>Meta Title</label>
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Defaults to product title" maxLength={200} className="bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 w-full" />
                <div className="text-[10px] text-slate-500 mt-1">{seoTitle.length}/200 characters</div>
              </div>
              <div className="field">
                <label>Meta Description</label>
                <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Brief description for search engine results…" maxLength={300} rows={2} className="bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 w-full" />
                <div className="text-[10px] text-slate-500 mt-1">{seoDescription.length}/300 characters</div>
              </div>
            </div>
          </details>

          <div className="field">
            <label>Product Images</label>
            <p className="text-xs text-slate-500 mb-2">Upload images or paste image URLs.</p>
            {images.map((url, i) => (
              <div key={i} className="flex gap-2 items-center mb-2" style={{ background: 'rgba(14,165,233,0.04)', borderRadius: 8, padding: '4px 6px', border: dragOverIndex === i && dragIndex !== null && dragOverIndex !== dragIndex ? '1.5px dashed #0ea5e9' : '1.5px solid transparent', transition: 'background 0.15s, border-color 0.15s' }}>
                <span className="flex-shrink-0 text-slate-500 select-none" style={{ fontSize: 16, cursor: 'grab' }} title="Drag to reorder">⠿</span>
                <button type="button" onClick={() => setFeaturedImage(url)} title="Set as featured image" className="flex-shrink-0 p-1 rounded text-sm leading-none transition-colors" style={{ color: featuredImage === url ? '#f59e0b' : '#475569', background: featuredImage === url ? 'rgba(245,158,11,0.15)' : 'transparent' }}>
                  {featuredImage === url ? '★' : '☆'}
                </button>
                {url && <img src={url} alt="" className="w-12 h-12 rounded object-cover border border-slate-600 flex-shrink-0" />}
                <input type="text" value={url} onChange={(e) => { const n = [...images]; n[i] = e.target.value; setImages(n) }} className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" placeholder="Image URL" />
                <label className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${uploadingImg === i ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
                  {uploadingImg === i ? '…' : '📷'}
                  <input type="file" accept="image/*" hidden disabled={uploadingImg !== null || bulkUploading} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploadingImg(i); const url = await uploadFile(file); if (url) { const n = [...images]; n[i] = url; setImages(n) } setUploadingImg(null); e.target.value = '' }} />
                </label>
                <button type="button" className="p-1 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0" onClick={() => setImages(images.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <button type="button" className="text-xs text-sky-400 hover:text-sky-300 transition-colors" onClick={() => setImages([...images, ''])} disabled={bulkUploading}>＋ Add Image</button>
              <label className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${bulkUploading ? 'bg-sky-500/20 text-sky-300' : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-600/30'}`}>
                {bulkUploading ? 'Uploading…' : '📤 Bulk Upload'}
                <input type="file" multiple accept="image/*" hidden disabled={bulkUploading} onChange={async (e) => { const files = Array.from(e.target.files || []); if (files.length === 0) return; setBulkUploading(true); const results: string[] = []; for (const f of files) { const url = await uploadFile(f); if (url) results.push(url) } if (results.length > 0) setImages([...images, ...results]); setBulkUploading(false); e.target.value = '' }} />
              </label>
              <span className="text-xs text-slate-600">{images.filter(Boolean).length} image(s)</span>
            </div>
          </div>

          <div className="field">
            <label>Demo Video URL</label>
            <div className="flex gap-2 items-center">
              <input type="text" value={demoVideo} onChange={(e) => setDemoVideo(e.target.value)} placeholder="https://..." className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
              <label className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${uploadingVideo === 'demo' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
                {uploadingVideo === 'demo' ? '…' : '🎬 Upload'}
                <input type="file" accept="video/*" hidden disabled={uploadingVideo !== null} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploadingVideo('demo'); const url = await uploadFile(file); if (url) setDemoVideo(url); setUploadingVideo(null); e.target.value = '' }} />
              </label>
              {demoVideo && <button type="button" className="p-1.5 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0" onClick={() => setDemoVideo('')}>✕</button>}
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label>▶ Demo Video Label</label>
              <input type="text" value={demoVideoLabel} onChange={(e) => setDemoVideoLabel(e.target.value)} placeholder='Defaults to "▶ Watch Demo"' className="bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 w-full" />
              <div className="text-[10px] text-slate-500 mt-1">Custom label shown above the demo video.</div>
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label>📐 Title Font Size</label>
              <input type="text" value={titleFontSize} onChange={(e) => setTitleFontSize(e.target.value)} placeholder='e.g. 22px, 28px, 32px (defaults to 22px)' className="bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 w-full" />
              <div className="text-[10px] text-slate-500 mt-1">Increase or decrease the product title H1 size on the detail page.</div>
            </div>
          </div>

          <div className="field">
            <label>How-to-Use Video URL</label>
            <div className="flex gap-2 items-center">
              <input type="text" value={howToVideo} onChange={(e) => setHowToVideo(e.target.value)} placeholder="https://..." className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
              <label className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${uploadingVideo === 'howToUse' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
                {uploadingVideo === 'howToUse' ? '…' : '🎬 Upload'}
                <input type="file" accept="video/*" hidden disabled={uploadingVideo !== null} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploadingVideo('howToUse'); const url = await uploadFile(file); if (url) setHowToVideo(url); setUploadingVideo(null); e.target.value = '' }} />
              </label>
              {howToVideo && <button type="button" className="p-1.5 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0" onClick={() => setHowToVideo('')}>✕</button>}
            </div>
          </div>

          {/* ── Testimonials / Reviews ── */}
          <div style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.12)', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>⭐ Customer Reviews / Testimonials</h3>
            <p className="text-xs text-slate-500 mb-3">Manage product reviews shown on the product detail page.</p>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => {
                      const n = [...testimonials]
                      n[i] = { ...n[i], name: e.target.value }
                      setTestimonials(n)
                    }}
                    placeholder="Reviewer name"
                    className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500"
                  />
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          const n = [...testimonials]
                          n[i] = { ...n[i], stars: star }
                          setTestimonials(n)
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: star <= t.stars ? '#f5a623' : '#475569', padding: 0, lineHeight: 1 }}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      >
                        {star <= t.stars ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0"
                    onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))}
                    title="Remove testimonial"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={t.text}
                  onChange={(e) => {
                    const n = [...testimonials]
                    n[i] = { ...n[i], text: e.target.value }
                    setTestimonials(n)
                  }}
                  placeholder="Review text…"
                  rows={2}
                  className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500 resize-vertical"
                />
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              onClick={() => setTestimonials([...testimonials, { name: '', stars: 5, text: '' }])}
            >
              ＋ Add Review
            </button>
            <span className="text-xs text-slate-600 ml-3">{testimonials.filter((t) => t.name.trim()).length} review(s)</span>
          </div>

          {/* ── FAQ / Questions ── */}
          <div style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>❓ Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500 mb-3">Add FAQ items shown in the accordion on the product detail page.</p>
            {faqItems.map((item, i) => (
              <div key={i} style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span className="flex-shrink-0 text-slate-500 select-none" style={{ fontSize: 16, cursor: 'grab' }} title="Drag to reorder">⠿</span>
                  <input
                    type="text"
                    value={item.q}
                    onChange={(e) => {
                      const n = [...faqItems]
                      n[i] = { ...n[i], q: e.target.value }
                      setFaqItems(n)
                    }}
                    placeholder="Question (e.g. When will I receive my product?)"
                    className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    className="p-1.5 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0"
                    onClick={() => setFaqItems(faqItems.filter((_, j) => j !== i))}
                    title="Remove FAQ"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={item.a}
                  onChange={(e) => {
                    const n = [...faqItems]
                    n[i] = { ...n[i], a: e.target.value }
                    setFaqItems(n)
                  }}
                  placeholder="Answer…"
                  rows={2}
                  className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500 resize-vertical"
                />
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              onClick={() => setFaqItems([...faqItems, { q: '', a: '', order: faqItems.length }])}
            >
              ＋ Add Question
            </button>
            <span className="text-xs text-slate-600 ml-3">{faqItems.filter((f) => f.q.trim()).length} question(s)</span>
          </div>

          {/* ── Dynamic Tab Content ── */}
          <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>📑 Dynamic Tabs</h3>
            <p className="text-xs text-slate-500 mb-3">Add custom tabs shown on the product detail page (e.g. Return Policy, Delivery Info, FAQ, etc.). The Description tab is always shown from the main description field above.</p>
            {tabs.map((tab, i) => (
              <div key={i} style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span className="flex-shrink-0 text-slate-500 select-none" style={{ fontSize: 16, cursor: 'grab' }} title="Drag to reorder">⠿</span>
                  <input
                    type="text"
                    value={tab.label}
                    onChange={(e) => {
                      const n = [...tabs]
                      n[i] = { ...n[i], label: e.target.value }
                      setTabs(n)
                    }}
                    placeholder="Tab label (e.g. Return Policy, Delivery Info)"
                    className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-green-500"
                  />
                  <button
                    type="button"
                    className="p-1.5 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0"
                    onClick={() => setTabs(tabs.filter((_, j) => j !== i))}
                    title="Remove tab"
                  >
                    ✕
                  </button>
                </div>
                <RichTextEditor
                  value={tab.content}
                  onChange={(val) => {
                    const n = [...tabs]
                    n[i] = { ...n[i], content: val }
                    setTabs(n)
                  }}
                  placeholder="Write tab content here…"
                  minHeight={180}
                />
                {/* Help banner config per tab */}
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>🎧 Help Banner (shown inside this tab)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                    <div className="field" style={{ margin: 0 }}>
                      <label style={{ fontSize: 11 }}>Banner Text</label>
                      <input
                        type="text"
                        value={tab.helpBanner?.text || ''}
                        onChange={(e) => {
                          const n = [...tabs]
                          n[i] = { ...n[i], helpBanner: { ...n[i].helpBanner, text: e.target.value, textColor: n[i].helpBanner?.textColor || '#e2e8f0', bgColor: n[i].helpBanner?.bgColor || '#0f172a' } }
                          setTabs(n)
                        }}
                        placeholder='e.g. Need help? Contact us at marketing@digisharkscommunications.com — we&#39;re here 24x7 to assist.'
                        className="bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-green-500 w-full"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div className="field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 11 }}>Text Color</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={tab.helpBanner?.textColor || '#e2e8f0'} onChange={(e) => {
                            const n = [...tabs]
                            n[i] = { ...n[i], helpBanner: { ...n[i].helpBanner || { text: '', bgColor: '#0f172a' }, textColor: e.target.value } }
                            setTabs(n)
                          }} style={{ width: 32, height: 28, padding: 1, cursor: 'pointer', borderRadius: 4, flexShrink: 0 }} />
                          <input type="text" value={tab.helpBanner?.textColor || ''} onChange={(e) => {
                            const n = [...tabs]
                            n[i] = { ...n[i], helpBanner: { ...n[i].helpBanner || { text: '', bgColor: '#0f172a' }, textColor: e.target.value } }
                            setTabs(n)
                          }} placeholder='#e2e8f0' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-green-500" />
                        </div>
                      </div>
                      <div className="field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 11 }}>Background Color</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={tab.helpBanner?.bgColor || '#0f172a'} onChange={(e) => {
                            const n = [...tabs]
                            n[i] = { ...n[i], helpBanner: { ...n[i].helpBanner || { text: '', textColor: '#e2e8f0' }, bgColor: e.target.value } }
                            setTabs(n)
                          }} style={{ width: 32, height: 28, padding: 1, cursor: 'pointer', borderRadius: 4, flexShrink: 0 }} />
                          <input type="text" value={tab.helpBanner?.bgColor || ''} onChange={(e) => {
                            const n = [...tabs]
                            n[i] = { ...n[i], helpBanner: { ...n[i].helpBanner || { text: '', textColor: '#e2e8f0' }, bgColor: e.target.value } }
                            setTabs(n)
                          }} placeholder='#0f172a' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-green-400 hover:text-green-300 transition-colors"
              onClick={() => setTabs([...tabs, { label: '', content: '', order: tabs.length }])}
            >
              ＋ Add Tab
            </button>
            <span className="text-xs text-slate-600 ml-3">{tabs.length} tab(s)</span>
          </div>

          {/* ── Delivery Trust Cards ── */}
          <div style={{ background: 'rgba(236,72,153,0.04)', border: '1px solid rgba(236,72,153,0.12)', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>📦 Delivery Trust Cards</h3>
            <p className="text-xs text-slate-500 mb-3">Cards shown below the product gallery (Instant Download, Email Delivery, etc.).</p>
            {trustCards.map((card, i) => (
              <div key={i} style={{ background: 'rgba(236,72,153,0.04)', border: '1px solid rgba(236,72,153,0.15)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    type="text"
                    value={card.icon}
                    onChange={(e) => {
                      const n = [...trustCards]
                      n[i] = { ...n[i], icon: e.target.value }
                      setTrustCards(n)
                    }}
                    placeholder="Emoji icon (e.g. ⚡)"
                    className="w-16 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-pink-500 text-center"
                  />
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => {
                      const n = [...trustCards]
                      n[i] = { ...n[i], title: e.target.value }
                      setTrustCards(n)
                    }}
                    placeholder="Title (e.g. Instant Download)"
                    className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    className="p-1.5 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0"
                    onClick={() => setTrustCards(trustCards.filter((_, j) => j !== i))}
                    title="Remove card"
                  >
                    ✕
                  </button>
                </div>
                <input
                  type="text"
                  value={card.description}
                  onChange={(e) => {
                    const n = [...trustCards]
                    n[i] = { ...n[i], description: e.target.value }
                    setTrustCards(n)
                  }}
                  placeholder="Short description..."
                  className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-pink-500"
                />
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
              onClick={() => setTrustCards([...trustCards, { icon: '', title: '', description: '' }])}
            >
              ＋ Add Card
            </button>
            <span className="text-xs text-slate-600 ml-3">{trustCards.filter((c) => c.title.trim()).length} card(s)</span>
          </div>

          {/* ── Key Specs ══ */}
          <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>📊 Key Specs</h3>
            <p className="text-xs text-slate-500 mb-3">Specifications shown in the purchase panel (icon + label + value).</p>
            {specs.map((spec, i) => (
              <div key={i} style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    type="text"
                    value={spec.icon}
                    onChange={(e) => { const n = [...specs]; n[i] = { ...n[i], icon: e.target.value }; setSpecs(n) }}
                    placeholder="Emoji (e.g. 📊)"
                    className="w-16 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 text-center"
                  />
                  <input
                    type="text"
                    value={spec.label}
                    onChange={(e) => { const n = [...specs]; n[i] = { ...n[i], label: e.target.value }; setSpecs(n) }}
                    placeholder="Label (e.g. Records:)"
                    className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => { const n = [...specs]; n[i] = { ...n[i], value: e.target.value }; setSpecs(n) }}
                    placeholder="Value (e.g. 500K+)"
                    className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                  <button type="button" className="p-1.5 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} title="Remove">✕</button>
                </div>
              </div>
            ))}
            <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors" onClick={() => setSpecs([...specs, { icon: '', label: '', value: '' }])}>＋ Add Spec</button>
            <span className="text-xs text-slate-600 ml-3">{specs.filter((s) => s.label.trim()).length} spec(s)</span>
          </div>

          {/* ── What's Included ══ */}
          <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>📦 What's Included</h3>
            <p className="text-xs text-slate-500 mb-3">Items shown in the "What's Included" grid below the tabs.</p>
            {whatsIncluded.map((item, i) => (
              <div key={i} style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input type="text" value={item.icon} onChange={(e) => { const n = [...whatsIncluded]; n[i] = { ...n[i], icon: e.target.value }; setWhatsIncluded(n) }} placeholder="Emoji (e.g. 📋)" className="w-16 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-green-500 text-center" />
                  <input type="text" value={item.title} onChange={(e) => { const n = [...whatsIncluded]; n[i] = { ...n[i], title: e.target.value }; setWhatsIncluded(n) }} placeholder="Title (e.g. Excel (.xls))" className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-green-500" />
                  <button type="button" className="p-1.5 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0" onClick={() => setWhatsIncluded(whatsIncluded.filter((_, j) => j !== i))}>✕</button>
                </div>
                <input type="text" value={item.description} onChange={(e) => { const n = [...whatsIncluded]; n[i] = { ...n[i], description: e.target.value }; setWhatsIncluded(n) }} placeholder="Description (e.g. Full database in spreadsheet format)" className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-green-500" />
              </div>
            ))}
            <button type="button" className="text-xs text-green-400 hover:text-green-300 transition-colors" onClick={() => setWhatsIncluded([...whatsIncluded, { icon: '', title: '', description: '' }])}>＋ Add Item</button>
            <span className="text-xs text-slate-600 ml-3">{whatsIncluded.filter((w) => w.title.trim()).length} item(s)</span>
          </div>

          {/* ── Coverage Stats ══ */}
          <div style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>🌍 Coverage Stats</h3>
            <p className="text-xs text-slate-500 mb-3">Statistics shown in the dark Coverage & Trust card.</p>
            {coverageStats.map((stat, i) => (
              <div key={i} style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="text" value={stat.number} onChange={(e) => { const n = [...coverageStats]; n[i] = { ...n[i], number: e.target.value }; setCoverageStats(n) }} placeholder="Number (e.g. 28)" className="w-24 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500" />
                  <input type="text" value={stat.label} onChange={(e) => { const n = [...coverageStats]; n[i] = { ...n[i], label: e.target.value }; setCoverageStats(n) }} placeholder="Label (e.g. States)" className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500" />
                  <button type="button" className="p-1.5 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0" onClick={() => setCoverageStats(coverageStats.filter((_, j) => j !== i))}>✕</button>
                </div>
              </div>
            ))}
            <button type="button" className="text-xs text-amber-400 hover:text-amber-300 transition-colors" onClick={() => setCoverageStats([...coverageStats, { number: '', label: '' }])}>＋ Add Stat</button>
            <span className="text-xs text-slate-600 ml-3">{coverageStats.filter((c) => c.number.trim()).length} stat(s)</span>
          </div>

          {/* ── Button Display Config ── */}
          <div style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.12)', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>🎨 Product Detail Page Buttons</h3>
            <p className="text-xs text-slate-500 mb-3">Configure the Add to Cart / Buy Now buttons on the storefront. Leave empty to use the default theme colors.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Add to Cart Button */}
              <div style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.12)', borderRadius: 10, padding: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', margin: '0 0 10px' }}>🛒 Add to Cart Button</h4>
                <div className="field" style={{ marginBottom: 8 }}>
                  <label>Button Text</label>
                  <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder='Defaults to "Add to cart"' />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div className="field">
                    <label>Background</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={cartButtonBg || '#ffffff'} onChange={(e) => setCartButtonBg(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={cartButtonBg} onChange={(e) => setCartButtonBg(e.target.value)} placeholder='#fff' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Text Color</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={cartButtonTextColor || '#FF5B2E'} onChange={(e) => setCartButtonTextColor(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={cartButtonTextColor} onChange={(e) => setCartButtonTextColor(e.target.value)} placeholder='#FF5B2E' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Border Color</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={cartButtonBorderColor || '#FF5B2E'} onChange={(e) => setCartButtonBorderColor(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={cartButtonBorderColor} onChange={(e) => setCartButtonBorderColor(e.target.value)} placeholder='#FF5B2E' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Hover Background</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={cartButtonHoverBg || '#FF5B2E'} onChange={(e) => setCartButtonHoverBg(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={cartButtonHoverBg} onChange={(e) => setCartButtonHoverBg(e.target.value)} placeholder='#FF5B2E' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Hover Text Color</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={cartButtonHoverTextColor || '#ffffff'} onChange={(e) => setCartButtonHoverTextColor(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={cartButtonHoverTextColor} onChange={(e) => setCartButtonHoverTextColor(e.target.value)} placeholder='#fff' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Buy Now Button */}
              <div style={{ background: 'rgba(255,91,46,0.04)', border: '1px solid rgba(255,91,46,0.12)', borderRadius: 10, padding: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', margin: '0 0 10px' }}>⚡ Buy Now Button</h4>
                <div className="field" style={{ marginBottom: 8 }}>
                  <label>Button Text</label>
                  <input type="text" value={buyButtonText} onChange={(e) => setBuyButtonText(e.target.value)} placeholder='Defaults to "Buy Now"' />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div className="field">
                    <label>Background</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={buyButtonBg || '#FF5B2E'} onChange={(e) => setBuyButtonBg(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={buyButtonBg} onChange={(e) => setBuyButtonBg(e.target.value)} placeholder='#FF5B2E' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Text Color</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={buyButtonTextColor || '#ffffff'} onChange={(e) => setBuyButtonTextColor(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={buyButtonTextColor} onChange={(e) => setBuyButtonTextColor(e.target.value)} placeholder='#fff' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Border Color</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={buyButtonBorderColor || '#FF5B2E'} onChange={(e) => setBuyButtonBorderColor(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={buyButtonBorderColor} onChange={(e) => setBuyButtonBorderColor(e.target.value)} placeholder='#FF5B2E' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Hover Background</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={buyButtonHoverBg || '#E04A1F'} onChange={(e) => setBuyButtonHoverBg(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={buyButtonHoverBg} onChange={(e) => setBuyButtonHoverBg(e.target.value)} placeholder='#E04A1F' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Hover Text Color</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={buyButtonHoverTextColor || '#ffffff'} onChange={(e) => setBuyButtonHoverTextColor(e.target.value)} style={{ width: 36, height: 32, padding: 1, cursor: 'pointer', borderRadius: 6 }} />
                      <input type="text" value={buyButtonHoverTextColor} onChange={(e) => setBuyButtonHoverTextColor(e.target.value)} placeholder='#fff' className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2">Note: A single Button Color value above can be used as the primary accent for both buttons. Individual per-button settings take priority when set.</div>
          </div>

          {/* ── Variations ── */}
          <div className="field" style={{ marginTop: 16 }}>
            <label>Product Variations</label>
            <p className="text-xs text-slate-500 mb-2">Add named variants with independent pricing.</p>
            {variations.map((v, i) => (
              <div key={i} className="flex gap-2 items-center mb-2" style={{ background: 'rgba(14,165,233,0.04)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(14,165,233,0.12)' }}>
                <input type="text" value={v.name} onChange={(e) => { const n = [...variations]; n[i] = { ...n[i], name: e.target.value }; setVariations(n) }} placeholder="e.g. North India" className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                <input type="number" value={v.price || ''} onChange={(e) => { const n = [...variations]; n[i] = { ...n[i], price: Number(e.target.value) }; setVariations(n) }} placeholder="₹ Price" min={0} className="w-24 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                <input type="number" value={v.compareAtPrice || ''} onChange={(e) => { const n = [...variations]; n[i] = { ...n[i], compareAtPrice: Number(e.target.value) || undefined }; setVariations(n) }} placeholder="Compare ₹" min={0} className="w-24 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer whitespace-nowrap" style={{ userSelect: 'none' }}>
                  <input type="checkbox" checked={v.isActive !== false} onChange={(e) => { const n = [...variations]; n[i] = { ...n[i], isActive: e.target.checked }; setVariations(n) }} style={{ accentColor: '#0ea5e9' }} /> Active
                </label>
                <button type="button" className="p-1 rounded text-red-400 hover:bg-red-600/15 transition-colors flex-shrink-0" onClick={() => setVariations(variations.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button type="button" className="text-xs text-sky-400 hover:text-sky-300 transition-colors" onClick={() => setVariations([...variations, { name: '', price: 0, isActive: true }])}>＋ Add Variation</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div className="field">
              <label>Rating (0–5)</label>
              <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} min={0} max={5} step={0.5} />
            </div>
            <div className="field">
              <label>Download URL</label>
              <input type="text" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="field" style={{ marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: '#0ea5e9', width: 18, height: 18 }} />
              Active (visible in storefront)
            </label>
          </div>

          <div className="row" style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Link href="/admin/store/products" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <><span className="spinner" /> Saving…</> : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
