'use client'

import { useEffect, useState } from 'react'

const THEMES = [
  { id: 'slate', color: '#10B981', label: 'Slate' },
  { id: 'indigo', color: '#4F46E5', label: 'Indigo' },
  { id: 'ocean', color: '#1D4ED8', label: 'Ocean' },
  { id: 'forest', color: '#16A34A', label: 'Forest' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export function applyTheme(id: ThemeId) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', id)
  try { localStorage.setItem('encyclo-theme', id) } catch {}
}

export function ThemeSwitcher() {
  const [active, setActive] = useState<ThemeId>('slate')

  useEffect(() => {
    const stored = typeof localStorage !== 'undefined'
      ? localStorage.getItem('encyclo-theme') as ThemeId | null
      : null
    const initial = stored && THEMES.some(t => t.id === stored) ? stored : 'slate'
    setActive(initial)
    applyTheme(initial)
  }, [])

  return (
    <div className="flex items-center gap-1.5 rounded-full px-2 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
      {THEMES.map(t => (
        <button
          key={t.id}
          aria-label={`${t.label} teması`}
          onClick={() => { setActive(t.id); applyTheme(t.id) }}
          className="h-[18px] w-[18px] rounded-full transition-all btn-press"
          style={{
            backgroundColor: t.color,
            outline: active === t.id ? '2px solid white' : 'none',
            outlineOffset: '2px',
            opacity: active === t.id ? 1 : 0.75,
          }}
        />
      ))}
    </div>
  )
}
