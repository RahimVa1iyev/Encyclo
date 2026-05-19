'use client'

import { useEffect, useState } from 'react'

interface Tab {
  id: string
  label: string
}

interface ProductTabBarProps {
  tabs: Tab[]
}

export default function ProductTabBar({ tabs }: ProductTabBarProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    tabs.forEach(tab => {
      const el = document.getElementById(tab.id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveTab(tab.id)
          }
        },
        {
          rootMargin: '-20% 0px -70% 0px',
          threshold: 0,
        }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [tabs])

  function handleClick(id: string) {
    setActiveTab(id)
    const el = document.getElementById(id)
    if (el) {
      const offset = 80
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div
      className="sticky top-16 z-30 mt-4 -mx-4 sm:mx-0 border-b border-border"
      style={{
        backgroundColor: 'color-mix(in oklab, var(--background) 90%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex gap-1 overflow-x-auto px-4 sm:px-0 scrollbar-hide">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200"
              style={{
                borderColor: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
