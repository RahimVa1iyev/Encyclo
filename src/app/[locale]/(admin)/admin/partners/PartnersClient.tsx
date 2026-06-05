"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { Copy, Plus, Trash2, Link as LinkIcon, Settings2, X } from "lucide-react"

import { addPartnerSite, addCompanyToSite, removeCompanyFromSite, updatePartnerSiteStatus } from "./actions"

export default function PartnersClient({ initialSites, activeCompanies, categories }: {
  initialSites: any[],
  activeCompanies: any[],
  categories: any[]
}) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newSite, setNewSite] = useState({ name: "", domain: "", category_id: "" })
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  
  // local state for company assignment per site
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [priorityInput, setPriorityInput] = useState<number>(0)
  
  const [isPending, setIsPending] = useState(false)

  const handleAddSite = async () => {
    if (!newSite.name || !newSite.domain) {
      toast.error("Ad və domain tələb olunur")
      return
    }
    
    setIsPending(true)
    try {
      await addPartnerSite(newSite.name, newSite.domain, newSite.category_id || undefined)
      toast.success("Partner sayt əlavə edildi")
      setIsAddOpen(false)
      setNewSite({ name: "", domain: "", category_id: "" })
    } catch (e: any) {
      toast.error(e.message || "Failed to add site")
    } finally {
      setIsPending(false)
    }
  }

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    try {
      await updatePartnerSiteStatus(id, newStatus)
      toast.success(`Status dəyişdirildi: ${newStatus}`)
    } catch (e: any) {
      toast.error(e.message || "Failed to update status")
    }
  }

  const handleAddCompany = async (siteId: string) => {
    if (!selectedCompanyId) return
    
    setIsPending(true)
    try {
      await addCompanyToSite(siteId, selectedCompanyId, priorityInput)
      toast.success("Şirkət təyin edildi")
      setSelectedCompanyId("")
      setPriorityInput(0)
    } catch (e: any) {
      toast.error(e.message || "Failed to assign company")
    } finally {
      setIsPending(false)
    }
  }

  const handleRemoveCompany = async (siteId: string, companyId: string) => {
    try {
      await removeCompanyFromSite(siteId, companyId)
      toast.success("Şirkət silindi")
    } catch (e: any) {
      toast.error(e.message || "Failed to remove company")
    }
  }

  const handleCopyScript = (apiKey: string) => {
    const script = `<script src="https://encyclo-phi.vercel.app/widget.js" data-key="${apiKey}"></script>\n<div id="encyclo-widget"></div>`
    navigator.clipboard.writeText(script)
    toast.success("Kod kopyalandı!")
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--foreground)' }}>Partner Saytlar</h2>
          <p style={{ fontSize: '14px', margin: 0, color: 'var(--muted-foreground)' }}>
            Xarici partner widgetlərini və onlara təyin edilmiş şirkətləri idarə edin.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={16} />
          Yeni Partner
        </button>
      </div>

      {/* Main Card */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--muted)' }}>
              <tr>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Ad</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Domain</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Şirkət sayı</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {initialSites.map((site) => (
                <React.Fragment key={site.id}>
                  <tr 
                    style={{ borderBottom: '0.5px solid var(--border)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)', fontWeight: 600 }}>{site.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
                        <LinkIcon size={14} />
                        {site.domain}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)' }}>{site.partner_site_companies?.length || 0}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)' }}>
                      <span style={site.status === 'active' 
                        ? { backgroundColor: 'oklch(0.94 0.06 150)', color: 'oklch(0.42 0.14 150)', borderRadius: '99px', padding: '2px 10px', fontSize: '11px', display: 'inline-block', fontWeight: 600 }
                        : { backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)', borderRadius: '99px', padding: '2px 10px', fontSize: '11px', display: 'inline-block', fontWeight: 600 }
                      }>
                        {site.status === 'active' ? "Aktiv" : "Deaktiv"}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)', textAlign: 'right' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedRow(expandedRow === site.id ? null : site.id)
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '12px',
                          border: '0.5px solid var(--border)',
                          backgroundColor: 'transparent',
                          color: 'var(--foreground)',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Settings2 size={14} />
                        İdarə et
                      </button>
                    </td>
                  </tr>
                  
                  {expandedRow === site.id && (
                    <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                      <td colSpan={5} style={{ padding: '16px' }}>
                        <div style={{
                          backgroundColor: 'var(--background)',
                          border: '0.5px solid var(--border)',
                          borderRadius: '12px',
                          margin: '0 0 8px',
                          padding: '16px'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            {/* Left Col */}
                            <div>
                              <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 12px 0', color: 'var(--foreground)' }}>Təyin edilmiş şirkətlər</h4>
                              {site.partner_site_companies && site.partner_site_companies.length > 0 ? (
                                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {site.partner_site_companies.map((psc: any) => {
                                    const cName = psc.companies?.company_translations?.find((t: any) => t.locale === 'az')?.name 
                                        || psc.companies?.company_translations?.[0]?.name 
                                        || psc.companies?.slug 
                                        || 'Unknown'
                                    return (
                                      <li key={psc.company_id} style={{ 
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                        padding: '8px 12px', border: '0.5px solid var(--border)', 
                                        borderRadius: '12px', backgroundColor: 'var(--surface)' 
                                      }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{cName}</span>
                                          <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Prioritet: {psc.priority || 0}</span>
                                        </div>
                                        <button 
                                          onClick={() => handleRemoveCompany(site.id, psc.company_id)}
                                          style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: '50%', padding: '6px', border: 'none',
                                            backgroundColor: 'transparent', color: 'var(--muted-foreground)',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.1)'
                                            e.currentTarget.style.color = 'rgb(220,38,38)'
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                            e.currentTarget.style.color = 'var(--muted-foreground)'
                                          }}
                                        >
                                          <X size={16} />
                                        </button>
                                      </li>
                                    )
                                  })}
                                </ul>
                              ) : (
                                <div style={{ fontSize: '13px', padding: '16px', border: '0.5px dashed var(--border)', borderRadius: '12px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                  Şirkət yoxdur
                                </div>
                              )}
                            </div>
                            
                            {/* Right Col */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--foreground)' }}>Şirkət əlavə et</h4>
                                <button 
                                  onClick={() => handleStatusChange(site.id, site.status)}
                                  style={{
                                    fontSize: '11px', fontWeight: 600, textDecoration: 'underline',
                                    color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                                >
                                  Statusu {site.status === 'active' ? "Deaktiv" : "Aktiv"} et
                                </button>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Şirkət seçin</label>
                                  <select 
                                    value={selectedCompanyId}
                                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                                    style={{
                                      width: '100%', padding: '8px 12px', borderRadius: '12px',
                                      border: '0.5px solid var(--border)', backgroundColor: 'var(--background)',
                                      color: 'var(--foreground)', fontSize: '14px', outline: 'none'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                  >
                                    <option value="" disabled>Seçin...</option>
                                    {activeCompanies.map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Prioritet (rəqəm)</label>
                                  <input 
                                    type="number"
                                    value={priorityInput}
                                    onChange={(e) => setPriorityInput(parseInt(e.target.value) || 0)}
                                    style={{
                                      width: '100%', padding: '8px 12px', borderRadius: '12px',
                                      border: '0.5px solid var(--border)', backgroundColor: 'var(--background)',
                                      color: 'var(--foreground)', fontSize: '14px', outline: 'none'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                  />
                                </div>
                                <button 
                                  onClick={() => handleAddCompany(site.id)}
                                  disabled={!selectedCompanyId || isPending}
                                  style={{
                                    width: '100%', borderRadius: '12px', backgroundColor: 'var(--accent)',
                                    color: 'var(--accent-foreground)', padding: '8px 16px', fontSize: '13px',
                                    fontWeight: 600, border: 'none', cursor: (!selectedCompanyId || isPending) ? 'not-allowed' : 'pointer',
                                    opacity: (!selectedCompanyId || isPending) ? 0.5 : 1, transition: 'opacity 0.2s'
                                  }}
                                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9' }}
                                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '1' }}
                                >
                                  Əlavə et
                                </button>
                              </div>
                            </div>
                            
                          </div>

                          {/* Bottom: Widget Code */}
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Script kodu</label>
                            <div style={{ position: 'relative' }}>
                              <pre style={{
                                backgroundColor: 'var(--muted)',
                                borderRadius: '8px', padding: '12px',
                                fontFamily: 'monospace', fontSize: '12px',
                                color: 'var(--foreground)',
                                overflowX: 'auto', whiteSpace: 'pre',
                                margin: 0
                              }}>
{`<script src="https://encyclo-phi.vercel.app/widget.js" data-key="${site.api_key}"></script>
<div id="encyclo-widget"></div>`}
                              </pre>
                            </div>
                            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleCopyScript(site.api_key)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  borderRadius: '12px', border: '0.5px solid var(--border)',
                                  backgroundColor: 'transparent', color: 'var(--foreground)',
                                  padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                                  cursor: 'pointer', transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <Copy size={14} /> Kopyala
                              </button>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {initialSites.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    Heç bir partner saytı tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '0.5px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '480px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--foreground)' }}>Yeni Partner Əlavə Et</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Ad</label>
                <input 
                  type="text"
                  placeholder="məs: Xəbər1"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '12px',
                    border: '0.5px solid var(--border)', backgroundColor: 'var(--background)',
                    color: 'var(--foreground)', fontSize: '14px', outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Domain</label>
                <input 
                  type="text"
                  placeholder="xeber1.az"
                  value={newSite.domain}
                  onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '12px',
                    border: '0.5px solid var(--border)', backgroundColor: 'var(--background)',
                    color: 'var(--foreground)', fontSize: '14px', outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: '4px' }}>Default kateqoriya (Opsional)</label>
                <select 
                  value={newSite.category_id}
                  onChange={(e) => setNewSite({ ...newSite, category_id: e.target.value })}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '12px',
                    border: '0.5px solid var(--border)', backgroundColor: 'var(--background)',
                    color: 'var(--foreground)', fontSize: '14px', outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <option value="">Seçin...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setIsAddOpen(false)}
                style={{
                  borderRadius: '12px', border: '0.5px solid var(--border)',
                  backgroundColor: 'transparent', color: 'var(--foreground)',
                  padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Ləğv et
              </button>
              <button 
                onClick={handleAddSite}
                disabled={isPending}
                style={{
                  borderRadius: '12px', backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)', padding: '8px 16px',
                  fontSize: '13px', fontWeight: 600, border: 'none',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={(e) => { if (!isPending) e.currentTarget.style.opacity = '1' }}
              >
                Əlavə et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
