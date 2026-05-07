"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Code2, Globe, Zap } from "lucide-react";

export default function DistributionPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);
  const supabase = createClient();
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    async function fetchCompany() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('companies')
        .select('*, translations:company_translations(*)')
        .eq('owner_id', user.id)
        .single();
      if (data) setCompany(data);
    }
    fetchCompany();
    setBaseUrl(window.location.origin);
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const iframeCode = `<iframe 
  src="${baseUrl}/widget/${company?.slug || 'your-company'}" 
  width="100%" 
  height="320" 
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #e5e7eb;">
</iframe>`;

  const apiEndpoint = `${baseUrl}/api/widget?type=products&limit=5`;
  const apiEndpointCompanies = `${baseUrl}/api/widget?limit=5`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Yayım</h1>
        <p className="text-muted-foreground mt-1">Məzmununuzu partner saytlara yerləşdirin</p>
      </div>

      {/* iFrame Embed */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Code2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">iFrame Embed</CardTitle>
              <p className="text-xs text-muted-foreground">Partner sayta yapışdırın</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-600 overflow-x-auto whitespace-pre border border-gray-100">
            {iframeCode}
          </div>
          <Button
            onClick={() => copyToClipboard(iframeCode, 'iframe')}
            variant="outline"
            className="rounded-xl border-gray-200 h-10"
          >
            {copied === 'iframe' 
              ? <><Check className="mr-2 h-4 w-4 text-green-500" /> Kopyalandı!</>
              : <><Copy className="mr-2 h-4 w-4" /> Kodu kopyala</>
            }
          </Button>

          <Separator className="bg-gray-100" />
          
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Canlı baxış</p>
            <iframe
              src={`/widget/${company?.slug || ''}`}
              width="100%"
              height="280"
              frameBorder="0"
              className="rounded-xl border border-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">API Endpoints</CardTitle>
              <p className="text-xs text-muted-foreground">REST API ilə inteqrasiya</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Məhsullar', endpoint: apiEndpoint, key: 'products' },
            { label: 'Şirkətlər', endpoint: apiEndpointCompanies, key: 'companies' },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Badge className="bg-green-100 text-green-700 border-none text-[10px] font-bold shrink-0">GET</Badge>
              <code className="text-xs text-gray-600 flex-1 truncate">{item.endpoint}</code>
              <Button
                onClick={() => copyToClipboard(item.endpoint, item.key)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg shrink-0"
              >
                {copied === item.key ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Partner Sites */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Partner Saytlar</CardTitle>
              <p className="text-xs text-muted-foreground">Məzmununuzun yayımlandığı saytlar</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-gray-400">
            <Globe className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium">Hələ partner sayt yoxdur</p>
            <p className="text-xs mt-1">iFrame kodu ilə ilk partneri əlavə edin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
