'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

interface Post {
  id: string
  author_name: string | null
  content: string
  created_at: string
  parent_id: string | null
  replies?: Post[]
}

interface ReplyFormProps {
  parentId: string
  productId: string
  onSuccess: () => void
  onCancel: () => void
}

function ReplyForm({ parentId, productId, onSuccess, onCancel }: ReplyFormProps) {
  const supabase = useMemo(() => createClient(), [])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !content.trim()) {
      setError('Ad və cavab mütləqdir.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: insertError } = await supabase
        .from('forum_posts')
        .insert({
          product_id: productId,
          user_id: null,
          author_name: name.trim(),
          content: content.trim(),
          is_faq: false,
          parent_id: parentId,
        })
      if (insertError) throw insertError
      setName('')
      setContent('')
      onSuccess()
    } catch (err: unknown) {
      setError('Xəta baş verdi. Yenidən cəhd edin.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 pl-4 border-l-2" style={{ borderColor: 'var(--accent)' }}>
      <input
        type="text"
        placeholder="Adınız *"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
      />
      <textarea
        placeholder="Cavabınız..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={2}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent resize-none"
      />
      {error && (
        <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold btn-press disabled:opacity-60"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          {loading
            ? <><Loader2 className="w-3 h-3 animate-spin" /> Göndərilir...</>
            : <><Send className="w-3 h-3" /> Cavabla</>
          }
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ləğv et
        </button>
      </div>
    </form>
  )
}

interface PostItemProps {
  post: Post
  productId: string
  depth: number
  onRefresh: () => void
}

function PostItem({ post, productId, depth, onRefresh }: PostItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const hasReplies = post.replies && post.replies.length > 0
  const maxDepth = 3

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'indi'
    if (diffMins < 60) return `${diffMins} dəq əvvəl`
    if (diffHours < 24) return `${diffHours} saat əvvəl`
    if (diffDays < 7) return `${diffDays} gün əvvəl`
    return date.toLocaleDateString('az-AZ')
  }

  return (
    <div className={depth > 0 ? 'pl-4 border-l border-border' : ''}>
      <div className="py-3">
        {/* Post header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {(post.author_name || 'A').charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-bold">{post.author_name || 'Anonim'}</span>
          <span className="text-xs text-muted-foreground">· {formatDate(post.created_at)}</span>
        </div>

        {/* Post content */}
        <p className="text-sm leading-relaxed pl-9">{post.content}</p>

        {/* Action bar */}
        <div className="flex items-center gap-3 mt-2 pl-9">
          {hasReplies && (
            <button
              onClick={() => setShowReplies(v => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showReplies
                ? <><ChevronUp className="w-3 h-3" /> Gizlət ({post.replies!.length})</>
                : <><ChevronDown className="w-3 h-3" /> Cavablar ({post.replies!.length})</>
              }
            </button>
          )}
          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(v => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: showReplyForm ? 'var(--accent)' : undefined }}
            >
              <MessageSquare className="w-3 h-3" />
              {showReplyForm ? 'Bağla' : 'Cavabla'}
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="pl-9 mt-2">
            <ReplyForm
              parentId={post.id}
              productId={productId}
              onSuccess={() => {
                setShowReplyForm(false)
                setShowReplies(true)
                onRefresh()
              }}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {/* Nested replies */}
      {hasReplies && showReplies && (
        <div className="space-y-0">
          {post.replies!.map(reply => (
            <PostItem
              key={reply.id}
              post={reply}
              productId={productId}
              depth={depth + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface RedditForumProps {
  productId: string
  initialPosts: Post[]
}

export default function RedditForum({ productId, initialPosts }: RedditForumProps) {
  const supabase = useMemo(() => createClient(), [])
  const [posts, setPosts] = useState<Post[]>([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function buildTree(flatPosts: Post[]): Post[] {
    const map = new Map<string, Post>()
    const roots: Post[] = []

    flatPosts.forEach(p => {
      map.set(p.id, { ...p, replies: [] })
    })

    map.forEach(post => {
      if (post.parent_id && map.has(post.parent_id)) {
        map.get(post.parent_id)!.replies!.push(post)
      } else {
        roots.push(post)
      }
    })

    return roots
  }

  function processPosts(flat: Post[]) {
    const tree = buildTree(flat)
    setPosts(tree)
  }

  useEffect(() => {
    processPosts(initialPosts)
  }, [initialPosts])

  async function refresh() {
    const { data } = await supabase
      .from('forum_posts')
      .select('id, author_name, content, created_at, parent_id')
      .eq('product_id', productId)
      .eq('is_faq', false)
      .order('created_at', { ascending: true })

    if (data) processPosts(data as Post[])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !content.trim()) {
      setError('Ad və sual mütləqdir.')
      return
    }
    if (content.trim().length < 5) {
      setError('Sual minimum 5 simvol olmalıdır.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: insertError } = await supabase
        .from('forum_posts')
        .insert({
          product_id: productId,
          user_id: null,
          author_name: name.trim(),
          content: content.trim(),
          is_faq: false,
          parent_id: null,
        })
      if (insertError) throw insertError
      setSuccess(true)
      setName('')
      setContent('')
      setTimeout(() => setSuccess(false), 3000)
      await refresh()
    } catch (err: unknown) {
      setError('Xəta baş verdi. Yenidən cəhd edin.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalCount = (function count(p: Post[]): number {
    return p.reduce((acc, post) => acc + 1 + count(post.replies || []), 0)
  })(posts)

  return (
    <div className="space-y-6">
      {/* New question form */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
        <p className="text-sm font-bold">Sual ver və ya şərh yaz</p>
        {success && (
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)' }}
          >
            Göndərildi!
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Adınız *"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
          />
          <textarea
            placeholder="Sualınız və ya şərhiniz..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent resize-none"
          />
          {error && (
            <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold btn-press disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Göndərilir...</>
                : <><Send className="w-4 h-4" /> Göndər</>
              }
            </button>
          </div>
        </form>
      </div>

      {/* Posts list */}
      {posts.length > 0 ? (
        <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
          <div className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {totalCount} şərh
          </div>
          <div className="px-5">
            {posts.map(post => (
              <PostItem
                key={post.id}
                post={post}
                productId={productId}
                depth={0}
                onRefresh={refresh}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">
            Hələ müzakirə yoxdur. İlk siz başlayın.
          </p>
        </div>
      )}
    </div>
  )
}
