import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Upload, Share2, Users } from "lucide-react"
import { redirect } from "next/navigation"

export default async function DistributionPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch company
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!company) {
    return <div>Şirkət tapılmadı.</div>
  }

  // Fetch partner sites where this company is assigned
  const { data: assignedSites } = await supabase
    .from("partner_site_companies")
    .select(`
      partner_sites!inner(
        id,
        name,
        domain,
        status
      )
    `)
    .eq("company_id", company.id)

  const sites = assignedSites?.map(a => a.partner_sites) || []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Yayım</h1>
        <p className="text-muted-foreground mt-1">Məhsullarınızın hansı partner saytlarda göründüyünü izləyin</p>
      </div>

      <div className="grid gap-6">
        {/* Section 1 - Active Sites List */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" /> Göründüyünüz saytlar
            </CardTitle>
            <CardDescription>Məhsullarınızın nümayiş olunduğu platformalar</CardDescription>
          </CardHeader>
          <CardContent>
            {sites.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Hələ heç bir saytda görünmürsünüz</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sites.map((site: any) => (
                  <div key={site.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{site.name}</p>
                        <p className="text-xs text-muted-foreground">{site.domain}</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                        {site.status === 'active' ? 'Aktiv' : 'Qeyri-aktiv'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2 - How it works */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Necə işləyir?</CardTitle>
            <CardDescription>Encyclo vasitəsilə satışlarınızı necə artırırıq</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-sm mb-1">Addım 1</h3>
                <p className="text-xs text-muted-foreground">Siz məhsullarınızı Encyclo-ya əlavə edirsiniz</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <Share2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-sm mb-1">Addım 2</h3>
                <p className="text-xs text-muted-foreground">Biz uyğun saytlarda sizi göstəririk</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-sm mb-1">Addım 3</h3>
                <p className="text-xs text-muted-foreground">Oxucular məhsullarınızı kəşf edir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
