import { redirect } from 'next/navigation'

/**
 * /admin/blog/[id]
 *
 * Visiting a blog post by ID directly in the admin redirects to the
 * edit screen, which is where all editing/viewing actions live.
 * Without this file Next.js would 404 the /admin/blog/[id] route even
 * though /admin/blog/[id]/edit exists.
 *
 * NOTE: In Next.js 15+ `params` is a Promise and must be awaited.
 */
export const dynamic = 'force-dynamic'

export default async function AdminBlogEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/blog/${id}/edit`)
}
