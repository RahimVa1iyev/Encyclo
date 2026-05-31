"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Tag, 
  Building,
  LogOut,
  Bell,
  Menu,
  X,
  Search
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

type Item = { 
  to: string; 
  label: string; 
  icon: any; 
  badge?: number; 
  disabled?: boolean;
};

const groups: { label: string; items: Item[] }[] = [
  { label: "Əsas", items: [
    { to: "/admin", label: "İdarə paneli", icon: LayoutDashboard },
  ]},
  { label: "İdarəetmə", items: [
    { to: "/admin/partners", label: "Partner Saytlar", icon: Users },
    { to: "/admin/keywords", label: "Keyword İdarəsi", icon: Tag },
    { to: "/admin/companies", label: "Şirkətlər", icon: Building },
  ]}
];

function AdminSidebar({ 
  pathname, 
  onNavigate, 
  handleSignOut 
}: { 
  pathname: string; 
  onNavigate?: () => void; 
  handleSignOut: () => void; 
}) {
  return (
    <div className="flex h-full w-full flex-col" style={{ backgroundColor: "var(--nav-bg)", color: "var(--nav-fg)" }}>
      <div className="px-6 pt-6 pb-5">
        <Link href="/" onClick={onNavigate} className="flex items-center">
          <svg
            width="110"
            height="28"
            viewBox="0 0 110 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Encyclo"
          >
            <text
              x="0"
              y="22"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="22"
              fontWeight="700"
              fontStyle="italic"
              fill="var(--nav-fg)"
              letterSpacing="-0.4"
            >
              Encyclo
            </text>
          </svg>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--nav-fg)", opacity: 0.45 }}>
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link 
                      href={item.to} 
                      onClick={onNavigate}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                      style={active ? { color: "var(--accent)", backgroundColor: "color-mix(in oklab, var(--accent) 18%, transparent)" } : { color: "var(--nav-fg)", opacity: 0.7 }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.opacity = "0.7"; }}
                    >
                      <Icon size={17} />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t px-3 py-3" style={{ borderColor: "color-mix(in oklab, var(--nav-fg) 12%, transparent)" }}>
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div 
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold flex-shrink-0" 
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
          >
            A
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold" style={{ color: "var(--nav-fg)" }}>
              Admin
            </div>
            <div className="text-[10px]" style={{ color: "var(--nav-fg)", opacity: 0.5 }}>Superadmin</div>
          </div>
          <button 
            onClick={handleSignOut}
            className="rounded-md p-1.5 transition-colors hover:bg-white/10" 
            style={{ color: "var(--nav-fg)", opacity: 0.6 }} 
            aria-label="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

const titles: Record<string, { title: string }> = {
  "/admin": { title: "İdarə paneli" },
  "/admin/partners": { title: "Partner Saytlar" },
  "/admin/keywords": { title: "Keyword İdarəsi" },
  "/admin/companies": { title: "Şirkətlər" },
};

function AdminTopbar({ 
  pathname, 
  onOpenSidebar
}: { 
  pathname: string; 
  onOpenSidebar: () => void; 
}) {
  const meta = titles[pathname] ?? { title: "İdarə paneli" };
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 md:px-6"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <button onClick={onOpenSidebar} className="rounded-lg p-2 text-[var(--foreground)] hover:bg-[var(--muted)] lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Encyclo</span><span>/</span>
          <span className="text-[var(--foreground)]">{meta.title}</span>
        </div>
        <h1 className="truncate text-[15px] font-semibold leading-tight text-[var(--foreground)]">{meta.title}</h1>
      </div>
      <div className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 md:flex md:w-72"
        style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
        <Search size={14} className="text-muted-foreground" />
        <input placeholder="Axtar..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-[var(--foreground)]" />
        <kbd className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground" style={{ borderColor: "var(--border)" }}>⌘K</kbd>
      </div>
      <button className="relative rounded-lg border p-2 transition-colors hover:bg-[var(--muted)]" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} aria-label="Notifications">
        <Bell size={16} />
      </button>
      <div 
        className="hidden h-9 w-9 items-center justify-center rounded-full text-xs font-bold md:flex select-none"
        style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}
        title="Admin"
      >
        A
      </div>
    </header>
  );
}

export default function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState<boolean | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (profile?.role !== "superadmin") {
        router.push("/login");
      } else {
        setIsSuperadmin(true);
      }
    }
    checkAuth();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (isSuperadmin === null) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <aside className="hidden lg:block lg:w-[240px] lg:flex-shrink-0">
        <div className="fixed inset-y-0 left-0 w-[240px]">
          <AdminSidebar 
            pathname={pathname} 
            handleSignOut={handleSignOut} 
          />
        </div>
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[260px]">
            <AdminSidebar 
              pathname={pathname} 
              onNavigate={() => setOpen(false)} 
              handleSignOut={handleSignOut} 
            />
            <button 
              onClick={() => setOpen(false)} 
              className="absolute right-3 top-3 rounded-md p-1.5" 
              style={{ color: "var(--nav-fg)" }} 
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar 
          pathname={pathname} 
          onOpenSidebar={() => setOpen(true)} 
        />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
