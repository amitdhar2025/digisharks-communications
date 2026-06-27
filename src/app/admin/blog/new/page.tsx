'use client'

import BlogForm from '@/components/admin/BlogForm'

export default function NewBlogPostPage() {
  return (
    <div style={{ maxWidth: 820 }}>
      <div className="admin-topbar">
        <div>
          <h1>New Blog Post</h1>
          <div className="sub">Write a new article for the Digisharks blog.</div>
        </div>
      </div>
      <BlogForm />
    </div>
  )
}
