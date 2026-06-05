import { withTranslation } from "@/lib/prisma-locale";
import { prisma } from "@/lib/db"
import { Building, Activity, FileEdit, Ban } from "lucide-react"

export default async function AdminCompaniesPage() {
  const safeCompanies = await prisma.company.findMany({
    select: {
      id: true,
      slug: true,
      status: true,
      created_at: true,
      translations: { ...withTranslation("az"), select: { name: true } },
      subscriptions: { select: { plan: true, status: true } }
    },
    orderBy: { created_at: 'desc' }
  })

  // Compute stats
  const total = safeCompanies.length
  const active = safeCompanies.filter((c: any) => c.status === 'active').length
  const draft = safeCompanies.filter((c: any) => c.status === 'draft').length
  const suspended = safeCompanies.filter((c: any) => c.status === 'suspended').length

  const getStatusBadge = (status: string) => {
    let bg = 'var(--badge-bg)';
    let color = 'var(--badge-fg)';

    if (status === 'active') {
      bg = 'oklch(0.94 0.06 150)';
      color = 'oklch(0.42 0.14 150)';
    } else if (status === 'draft' || status === 'pending') {
      bg = 'oklch(0.95 0.07 80)';
      color = 'oklch(0.5 0.15 60)';
    } else if (status === 'suspended' || status === 'blocked') {
      bg = 'oklch(0.96 0.05 25)';
      color = 'oklch(0.5 0.18 25)';
    }

    return (
      <span style={{ backgroundColor: bg, color: color, borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 500, display: 'inline-block' }}>
        {status}
      </span>
    );
  }

  const getPlanBadge = (plan: string | undefined) => {
    const p = plan || 'starter'
    let bg = 'var(--badge-bg)';
    let color = 'var(--badge-fg)';

    if (p === 'growth') {
      bg = 'oklch(0.93 0.04 240)';
      color = 'oklch(0.4 0.12 240)';
    } else if (p === 'scale') {
      bg = 'oklch(0.94 0.05 290)';
      color = 'oklch(0.45 0.2 290)';
    }

    return (
      <span style={{ backgroundColor: bg, color: color, borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 500, display: 'inline-block', textTransform: 'capitalize' }}>
        {p}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--foreground)' }}>Şirkətlər</h1>
        <p style={{ fontSize: '14px', margin: 0, color: 'var(--muted-foreground)' }}>Platformada qeydiyyatdan keçmiş bütün şirkətlərin siyahısı.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Total Card */}
        <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Total</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--accent)' }}>{total}</div>
        </div>
        
        {/* Active Card */}
        <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Active</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--accent)' }}>{active}</div>
        </div>

        {/* Draft Card */}
        <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Draft</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileEdit size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--accent)' }}>{draft}</div>
        </div>

        {/* Suspended Card */}
        <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Suspended</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ban size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--accent)' }}>{suspended}</div>
        </div>
      </div>

      <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--muted)' }}>
              <tr>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Şirkət adı</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Slug</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Plan</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Tarix</th>
              </tr>
            </thead>
            <tbody>
              {safeCompanies.map((company: any) => {
                const compTrans = Array.isArray(company.translations) ? company.translations[0] : company.translations
                const name = compTrans?.name || 'Unknown'
                
                // Handle potentially array or object structure for subscriptions
                const sub = Array.isArray(company.subscriptions) ? company.subscriptions[0] : company.subscriptions
                const plan = sub?.plan

                return (
                  <tr key={company.id} className="hover:bg-[var(--muted)] transition-colors" style={{ borderBottom: '0.5px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)' }}>{name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--muted-foreground)' }}>{company.slug}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)' }}>{getPlanBadge(plan)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)' }}>{getStatusBadge(company.status)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
              {safeCompanies.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    Şirkət tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
