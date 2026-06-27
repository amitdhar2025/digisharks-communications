'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BlogForm from '@/components/admin/BlogForm'

export default function EditBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    setLoading(true)
    fetch(`/api/admin/blog/posts/${params.id}`, { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/admin/login?next=/admin/blog')
          return
        }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load post')
        setPost(data.post)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [params.id, router])

  if (loading) {
    return (
      <div style={{ maxWidth: 820 }}>
        <div className="admin-topbar">
          <div>
            <h1>Edit Post</h1>
            <div className="sub">
              <span className="spinner" /> Loading post…
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div style={{ maxWidth: 820 }}>
        <div className="admin-topbar">
          <div>
            <h1>Edit Post</h1>
            <div className="sub">Post not found or could not be loaded.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="admin-topbar">
        <div>
          <h1>Edit: {post.title}</h1>
          <div className="sub">
            /{post.slug} · {post.status}
          </div>
        </div>
      </div>
      <BlogForm initialData={post} isEditing />
    </div>
  )
}
