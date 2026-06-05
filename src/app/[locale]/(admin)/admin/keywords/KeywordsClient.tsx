"use client"

import { useState } from "react"
import { toast } from "sonner"
import { addKeyword, removeKeyword, addCategory, generateKeywordsAI, deleteCategory } from "./actions"
import { X, AlertTriangle, Plus, Sparkles } from "lucide-react"

type CategoryKeyword = {
  id: string
  keyword: string
  weight: number
}

type Category = {
  id: string
  name: string
  slug: string
  categoryKeywords: CategoryKeyword[]
}

const generateSlug = (name: string) => {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim()
}

export default function KeywordsClient({ categories }: { categories: Category[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatSlug, setNewCatSlug] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emptyCategories = categories.filter(c => c.categoryKeywords.length === 0)

  const sortedCategories = [...categories].sort((a, b) => {
    return a.categoryKeywords.length - b.categoryKeywords.length
  })

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim() || !newCatSlug.trim()) return

    try {
      setIsSubmitting(true)
      await addCategory(newCatName.trim(), newCatSlug.trim())
      setIsModalOpen(false)
      setNewCatName("")
      setNewCatSlug("")
      toast.success("Kateqoriya əlavə edildi")
    } catch (err: any) {
      toast.error(err.message || "Xəta baş verdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>Keyword İdarəsi</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)',
            borderRadius: '12px', padding: '8px 16px', fontSize: '13px',
            fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={16} /> Yeni Kateqoriya
        </button>
      </div>

      {emptyCategories.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: 'oklch(0.97 0.05 80)', border: '0.5px solid oklch(0.85 0.1 80)', color: 'oklch(0.45 0.12 70)', borderRadius: '12px', padding: '12px 16px' }}>
          <AlertTriangle size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '14px' }}>
            <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>⚠️ Bu kateqoriyaların keyword-i yoxdur:</p>
            <p style={{ margin: '0 0 4px 0' }}>{emptyCategories.map(c => c.name).join(', ')}</p>
            <p style={{ margin: 0 }}>Widget bu kateqoriyalarda məhsul tapa bilməyəcək.</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {sortedCategories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--foreground)' }}>Yeni Kateqoriya</h3>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Ad</label>
                <input 
                  value={newCatName} 
                  onChange={e => {
                    setNewCatName(e.target.value)
                    setNewCatSlug(generateSlug(e.target.value))
                  }} 
                  placeholder="məs: Texnologiya" 
                  required 
                  style={{ width: '100%', borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Slug</label>
                <input 
                  value={newCatSlug} 
                  onChange={e => setNewCatSlug(e.target.value)} 
                  placeholder="məs: texnologiya" 
                  required 
                  style={{ width: '100%', borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)}
                  style={{ borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'transparent', color: 'var(--foreground)', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Ləğv et
                </button>
                <button type="submit" disabled={isSubmitting}
                  style={{ borderRadius: '12px', backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)', padding: '8px 16px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = '1' }}
                >
                  {isSubmitting ? "Əlavə edilir..." : "Əlavə et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const [keyword, setKeyword] = useState("")
  const [weight, setWeight] = useState("1")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [suggestions, setSuggestions] = useState<{keyword: string, weight: number}[]>([])

  const keywordCount = category.categoryKeywords.length

  const handleDeleteCategory = async () => {
    if (!confirm("Bu kateqoriyanı silmək istədiyinizə əminsiniz?")) return;
    try {
      await deleteCategory(category.id);
      toast.success("Kateqoriya silindi");
    } catch (err: any) {
      toast.error(err.message || "Xəta baş verdi");
    }
  }

  const handleGenerateAI = async () => {
    try {
      setIsLoadingAI(true)
      const existing = category.categoryKeywords.map(k => k.keyword)
      const results = await generateKeywordsAI(category.name, existing)
      setSuggestions(results)
    } catch (err: any) {
      toast.error(err.message || "AI cavab vermədi")
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleAddSuggestion = async (sg: {keyword: string, weight: number}) => {
    try {
      await addKeyword(category.id, sg.keyword, sg.weight)
      setSuggestions(prev => prev.filter(s => s.keyword !== sg.keyword))
      toast.success("Keyword əlavə edildi")
    } catch (err: any) {
      toast.error(err.message || "Xəta baş verdi")
    }
  }

  const handleAddAllSuggestions = async () => {
    for (const sg of suggestions) {
      await handleAddSuggestion(sg)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return

    try {
      setIsSubmitting(true)
      await addKeyword(category.id, keyword.trim(), parseInt(weight))
      setKeyword("")
      toast.success("Keyword əlavə edildi")
    } catch (err: any) {
      toast.error(err.message || "Xəta baş verdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeKeyword(id)
      toast.success("Keyword silindi")
    } catch (err: any) {
      toast.error(err.message || "Xəta baş verdi")
    }
  }

  const getCountBadge = (count: number) => {
    let bg = 'var(--badge-bg)';
    let color = 'var(--badge-fg)';
    let label = 'Boş';

    if (count === 0) {
      bg = 'oklch(0.96 0.05 25)';
      color = 'oklch(0.5 0.18 25)';
      label = 'Boş';
    } else if (count <= 3) {
      bg = 'oklch(0.95 0.07 80)';
      color = 'oklch(0.5 0.15 60)';
      label = 'Az';
    } else {
      bg = 'oklch(0.94 0.06 150)';
      color = 'oklch(0.42 0.14 150)';
      label = 'Yaxşı';
    }

    return (
      <span style={{ backgroundColor: bg, color: color, borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 500, display: 'inline-block' }}>
        {label}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid var(--border)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>{category.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleDeleteCategory}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '0.5px solid var(--border)', backgroundColor: 'transparent', color: 'oklch(0.5 0.18 25)', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.96 0.05 25)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Sil
          </button>
          <button
            onClick={handleGenerateAI}
            disabled={isLoadingAI}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '0.5px solid var(--border)', backgroundColor: 'transparent', color: 'var(--foreground)', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', cursor: isLoadingAI ? 'not-allowed' : 'pointer', opacity: isLoadingAI ? 0.7 : 1, transition: 'background-color 0.2s', marginLeft: '4px' }}
            onMouseEnter={(e) => { if (!isLoadingAI) e.currentTarget.style.backgroundColor = 'var(--muted)' }}
            onMouseLeave={(e) => { if (!isLoadingAI) e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Sparkles size={12} /> {isLoadingAI ? "Yüklənir..." : "AI ilə təklif et"}
          </button>
          {getCountBadge(keywordCount)}
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {keywordCount === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', textAlign: 'center', margin: 0, padding: '16px 0' }}>Keyword yoxdur — aşağıdan əlavə edin</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {category.categoryKeywords.sort((a, b) => b.weight - a.weight).map(k => (
              <KeywordPill key={k.id} keyword={k} onRemove={() => handleRemove(k.id)} />
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '8px' }}>AI təklifləri:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {suggestions.map((sg, idx) => (
                <SuggestionPill key={idx} suggestion={sg} onAdd={() => handleAddSuggestion(sg)} />
              ))}
            </div>
            <div style={{ marginTop: '12px', textAlign: 'right' }}>
              <button
                onClick={handleAddAllSuggestions}
                style={{ borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'transparent', color: 'var(--foreground)', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Hamısını əlavə et
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--muted)', borderTop: '0.5px solid var(--border)', padding: '12px 16px' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="məs: ipoteka"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ flex: 1, borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            disabled={isSubmitting}
          />
          <select
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            disabled={isSubmitting}
          >
            <option value="1">1-Normal</option>
            <option value="2">2-Güclü</option>
            <option value="3">3-Dəqiq</option>
          </select>
          <button
            type="submit"
            disabled={isSubmitting || !keyword.trim()}
            style={{ borderRadius: '12px', backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)', padding: '8px 16px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: (isSubmitting || !keyword.trim()) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !keyword.trim()) ? 0.5 : 1, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '1' }}
          >
            {isSubmitting ? "..." : "Əlavə et"}
          </button>
        </form>
      </div>
    </div>
  )
}

function KeywordPill({ keyword, onRemove }: { keyword: CategoryKeyword, onRemove: () => void }) {
  let bg = 'var(--badge-bg)';
  let color = 'var(--badge-fg)';
  
  if (keyword.weight === 2) {
    bg = 'oklch(0.93 0.04 240)';
    color = 'oklch(0.4 0.12 240)';
  } else if (keyword.weight >= 3) {
    bg = 'oklch(0.94 0.06 150)';
    color = 'oklch(0.42 0.14 150)';
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 500, backgroundColor: bg, color: color }}>
      {keyword.keyword} <span style={{ opacity: 0.5 }}>·</span> {keyword.weight}
      <button
        type="button"
        onClick={onRemove}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent', color: 'inherit', opacity: 0.6, cursor: 'pointer', padding: 0, margin: '0 0 0 4px', transition: 'opacity 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      >
        <X size={12} />
      </button>
    </span>
  )
}

function SuggestionPill({ suggestion, onAdd }: { suggestion: {keyword: string, weight: number}, onAdd: () => void }) {
  let bg = 'var(--badge-bg)';
  let color = 'var(--badge-fg)';
  
  if (suggestion.weight === 2) {
    bg = 'oklch(0.93 0.04 240)';
    color = 'oklch(0.4 0.12 240)';
  } else if (suggestion.weight >= 3) {
    bg = 'oklch(0.94 0.06 150)';
    color = 'oklch(0.42 0.14 150)';
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 500, backgroundColor: bg, color: color, opacity: 0.9 }}>
      {suggestion.keyword} <span style={{ opacity: 0.5 }}>·</span> {suggestion.weight}
      <button
        type="button"
        onClick={onAdd}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent', color: 'inherit', opacity: 0.6, cursor: 'pointer', padding: 0, margin: '0 0 0 4px', transition: 'opacity 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      >
        <Plus size={12} />
      </button>
    </span>
  )
}
