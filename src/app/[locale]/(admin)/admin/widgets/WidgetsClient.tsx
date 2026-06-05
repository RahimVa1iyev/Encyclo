"use client"

import { useState } from "react"
import { updateWidgetStatus, addWidgetDomain } from "./actions"
import { toast } from "sonner"
import { Plus, Check, Ban } from "lucide-react"

type Deployment = {
  id: string
  domain: string
  status: string
  created_at: string
  notes: string | null
  company_id: string
  companies: { company_translations: { name: string }[] } | null
}

type Company = {
  id: string
  company_translations: { name: string }[]
}

export function WidgetsClient({ deployments, companies }: { deployments: Deployment[], companies: Company[] }) {
  const [filter, setFilter] = useState<'All' | 'pending' | 'active' | 'blocked'>('All')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Form state
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [domain, setDomain] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredDeployments = filter === 'All' 
    ? deployments 
    : deployments.filter((d: any) => d.status === filter)

  const handleStatusChange = async (id: string, status: 'active' | 'blocked') => {
    try {
      await updateWidgetStatus(id, status)
      toast.success(`Widget status updated to ${status}`)
    } catch (e: any) {
      toast.error(e.message || "Failed to update status")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany || !domain) {
      toast.error("Company and Domain are required")
      return
    }

    setIsSubmitting(true)
    try {
      await addWidgetDomain(selectedCompany, domain, notes)
      toast.success("Widget domain added successfully")
      setIsDialogOpen(false)
      setSelectedCompany('')
      setDomain('')
      setNotes('')
    } catch (e: any) {
      toast.error(e.message || "Failed to add domain")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    let bg = 'var(--badge-bg)';
    let color = 'var(--badge-fg)';

    if (status === 'active') {
      bg = 'oklch(0.94 0.06 150)';
      color = 'oklch(0.42 0.14 150)';
    } else if (status === 'pending') {
      bg = 'oklch(0.95 0.07 80)';
      color = 'oklch(0.5 0.15 60)';
    } else if (status === 'blocked') {
      bg = 'oklch(0.96 0.05 25)';
      color = 'oklch(0.5 0.18 25)';
    }

    return (
      <span style={{ backgroundColor: bg, color: color, borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 500, display: 'inline-block' }}>
        {status}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>Widget Yerləşdirmələri</h2>
        <button 
          onClick={() => setIsDialogOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)',
            borderRadius: '12px', padding: '8px 16px', fontSize: '13px',
            fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={16} /> Domain Əlavə et
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '0.5px solid var(--border)', paddingBottom: '16px' }}>
        {['All', 'pending', 'active', 'blocked'].map((tab: any) => {
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              style={isActive ? {
                backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)',
                borderRadius: '99px', padding: '5px 14px', fontSize: '12px',
                fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s'
              } : {
                backgroundColor: 'transparent', color: 'var(--muted-foreground)',
                border: '0.5px solid var(--border)', borderRadius: '99px',
                padding: '5px 14px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        })}
      </div>

      <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--muted)' }}>
              <tr>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Şirkət</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Domain</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Tarix</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeployments.map((dep: any) => {
                const comp = Array.isArray(dep.companies) ? dep.companies[0] : dep.companies
                const companyName = comp?.company_translations?.[0]?.name || 'Unknown'
                return (
                  <tr key={dep.id} className="hover:bg-[var(--muted)] transition-colors" style={{ borderBottom: '0.5px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)' }}>{companyName}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)', fontWeight: 500 }}>{dep.domain}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)' }}>
                      {getStatusBadge(dep.status)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {new Date(dep.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {dep.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusChange(dep.id, 'active')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '0.5px solid oklch(0.7 0.1 150)', color: 'oklch(0.42 0.14 150)', backgroundColor: 'transparent', borderRadius: '12px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,255,0,0.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Check size={14} /> Aktivləşdir
                            </button>
                            <button onClick={() => handleStatusChange(dep.id, 'blocked')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '0.5px solid oklch(0.7 0.1 25)', color: 'oklch(0.5 0.18 25)', backgroundColor: 'transparent', borderRadius: '12px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Ban size={14} /> Blokla
                            </button>
                          </>
                        )}
                        {dep.status === 'active' && (
                          <button onClick={() => handleStatusChange(dep.id, 'blocked')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '0.5px solid oklch(0.7 0.1 25)', color: 'oklch(0.5 0.18 25)', backgroundColor: 'transparent', borderRadius: '12px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Ban size={14} /> Blokla
                          </button>
                        )}
                        {dep.status === 'blocked' && (
                          <button onClick={() => handleStatusChange(dep.id, 'active')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '0.5px solid oklch(0.7 0.1 150)', color: 'oklch(0.42 0.14 150)', backgroundColor: 'transparent', borderRadius: '12px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,255,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Check size={14} /> Aktivləşdir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredDeployments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    Widget tapılmadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--foreground)' }}>Domain Əlavə et</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Şirkət</label>
                <select 
                  value={selectedCompany} 
                  onChange={e => setSelectedCompany(e.target.value)}
                  style={{ width: '100%', borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <option value="" disabled>Şirkət seçin</option>
                  {companies.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.company_translations?.[0]?.name || c.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Domain</label>
                <input 
                  value={domain} 
                  onChange={e => setDomain(e.target.value)} 
                  placeholder="məs: example.az" 
                  required 
                  style={{ width: '100%', borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Qeyd (istəyə görə)</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Daxili qeydlər..." 
                  style={{ width: '100%', borderRadius: '12px', border: '0.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px', outline: 'none', minHeight: '80px', resize: 'vertical' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setIsDialogOpen(false)}
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
                  {isSubmitting ? "Əlavə edilir..." : "Domain Əlavə et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
