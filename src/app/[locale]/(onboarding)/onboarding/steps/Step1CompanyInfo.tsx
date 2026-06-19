import { Building2, Globe, FileText, ArrowRight } from "lucide-react";
import type { Category } from "@/types";

type Props = {
  name: string;
  setName: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  categories: Category[];
  onNext: () => void;
};

export default function Step1CompanyInfo({
  name, setName, categoryId, setCategoryId, website, setWebsite, description, setDescription, categories, onNext
}: Props) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
      <div>
        <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Şirkət adı
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
          placeholder="Şirkət adını daxil edin"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5">
          Kateqoriya
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm cursor-pointer"
        >
          <option value="">Kateqoriya seçin</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 flex items-center gap-2">
          <Globe className="h-4 w-4" /> Vebsayt (İstəyə bağlı)
        </label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <div className="mb-1.5">
          <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" /> Təsvir
          </label>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          rows={4}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm resize-none"
          placeholder="ChatGPT bu məlumatı oxuyur — şirkətinizin nə etdiyini, kimə xidmət etdiyini və niyə seçilməli olduğunu yazın."
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-[10px] text-muted-foreground mt-1">
            Bu mətni Dashboard-da &quot;AI Məzmun&quot; bölməsindən struktur suallar əsasında da yaradabilərsiniz.
          </p>
          <div className="text-right text-[10px] text-muted-foreground">
            {description.length} / 500
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!name || !categoryId}
        className="flex w-full justify-center rounded-xl px-4 py-3.5 text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed items-center gap-2 mt-4"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
      >
        Növbəti addım <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
