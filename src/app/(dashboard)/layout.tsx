"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Sparkles,
  Share2,
  BookOpen,
  MessageSquare,
  BarChart3,
  CreditCard,
  Menu,
  X,
  LogOut,
  Building2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Məzmun əlavə et", href: "/dashboard/add-content", icon: PlusCircle },
  { name: "Məhsullarım", href: "/dashboard/products", icon: Package },
  { name: "AI Məzmun", href: "/dashboard/ai-content", icon: Sparkles },
  { name: "Yayım", href: "/dashboard/distribution", icon: Share2 },
  { name: "Şirkət Profili", href: "/dashboard/company", icon: Building2 },
  { name: "Ensiklopediya", href: "/dashboard/encyclopedia", icon: BookOpen },
  { name: "Forum", href: "/dashboard/forum", icon: MessageSquare },
  { name: "Hesabatlar", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Ödənişlər", href: "/dashboard/billing", icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState('...');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchCompany() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('company_translations')
        .select('name')
        .eq('locale', 'az')
        .limit(1)
        .single()
      if (data) setCompanyName(data.name)
    }
    fetchCompany()
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Encyclo
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
              Çıxış
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b lg:px-8">
          <button
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
              {companyName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">{companyName}</span>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
