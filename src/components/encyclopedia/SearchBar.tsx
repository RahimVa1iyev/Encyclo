"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Building2, Package, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ companies: any[]; products: any[] }>({ companies: [], products: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) {
      setResults({ companies: [], products: [] });
      setIsOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = results.companies.length > 0 || results.products.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center gap-3 rounded-full bg-white pl-5 pr-2 py-2 shadow-lg border border-border" style={{ color: 'var(--foreground)' }}>
        {isLoading
          ? <Loader2 className="text-indigo-400 w-5 h-5 animate-spin flex-shrink-0" />
          : <Search className="text-muted-foreground w-5 h-5 flex-shrink-0" />
        }
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setIsOpen(true)}
          placeholder="Şirkət, məhsul və ya xidmət axtar..."
          className="w-full text-base outline-none bg-transparent"
        />
        <button
          className="rounded-full px-5 py-2 text-sm font-semibold btn-press transition-colors flex-shrink-0 text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Axtar
        </button>
      </div>

      {/* Dropdown Results */}
      {isOpen && (hasResults || (query.length >= 2 && !isLoading)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">

          {/* Companies */}
          {results.companies.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                Şirkətlər
              </div>
              {results.companies.map((item: any) => (
                <Link
                  key={item.company_id}
                  href={`/companies/${(item.companies as any)?.slug}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {(item.companies as any)?.logo_url
                      ? <img src={(item.companies as any).logo_url} className="w-full h-full object-cover" alt={item.name} />
                      : <Building2 className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div>
              <div className={`px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 ${results.companies.length > 0 ? 'border-t border-t-slate-100' : ''}`}>
                Məhsullar
              </div>
              {results.products.map((item: any) => (
                <Link
                  key={item.product_id}
                  href={`/products/${(item.products as any)?.slug}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {(item.products as any)?.images?.[0]
                      ? <img src={(item.products as any).images[0]} className="w-full h-full object-cover" alt={item.name} />
                      : <Package className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {(item.products as any)?.company?.translations?.[0]?.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !isLoading && !hasResults && (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">
              Heç bir nəticə tapılmadı
            </div>
          )}
        </div>
      )}
    </div>
  );
}
