import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Building, Globe, Tag } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch counts
  const [{ count: totalCompanies }, { count: activeSites }, { count: totalKeywords }] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("partner_sites").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("category_keywords").select("*", { count: "exact", head: true }),
  ]);

  // Fetch recent partner sites
  const { data: recentSites } = await supabase
    .from("partner_sites")
    .select("id, name, domain, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--foreground)' }}>Overview</h2>
        <p style={{ fontSize: '14px', margin: 0, color: 'var(--muted-foreground)' }}>Superadmin dashboard for platform metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Total Companies</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--accent)' }}>{totalCompanies || 0}</div>
        </div>
        
        <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Active Partner Sites</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--accent)' }}>{activeSites || 0}</div>
        </div>

        <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Total Keywords</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--badge-bg)', color: 'var(--badge-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={16} />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--accent)' }}>{totalKeywords || 0}</div>
        </div>
      </div>

      <div style={{ borderRadius: '16px', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '0.5px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--foreground)' }}>Recent Partner Sites</h3>
        </div>
        <div style={{ padding: '20px' }}>
          {recentSites && recentSites.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentSites.map((site: any) => {
                return (
                  <div key={site.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', border: '0.5px solid var(--border)', padding: '12px 16px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>{site.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-foreground)' }}>{site.domain}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={
                        site.status === 'active' 
                        ? { backgroundColor: 'oklch(0.94 0.06 150)', color: 'oklch(0.42 0.14 150)', borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 500 }
                        : { backgroundColor: 'oklch(0.95 0.07 80)', color: 'oklch(0.5 0.15 60)', borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 500 }
                      }>
                        {site.status === 'active' ? "Aktiv" : site.status}
                      </span>
                      <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                        {new Date(site.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: 'var(--muted-foreground)', padding: '16px 0', textAlign: 'center' }}>
              No recent partner sites.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
