import { Phone, MapPin, Mail, Calendar, FileText, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

type Props = {
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  foundingYear: string;
  setFoundingYear: (v: string) => void;
  taxId: string;
  setTaxId: (v: string) => void;
  stepError: string | null;
  isSaving: boolean;
  onNext: () => void;
  onBack: () => void;
};

export default function Step2Contact({
  phone, setPhone, address, setAddress, email, setEmail, foundingYear, setFoundingYear, taxId, setTaxId, stepError, isSaving, onNext, onBack
}: Props) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
      <div>
        <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 flex items-center gap-2">
          <Phone className="h-4 w-4" /> Telefon nömrəsi
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
          placeholder="+994"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Ünvan
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
          placeholder="Ünvanı daxil edin"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 flex items-center gap-2">
          <Mail className="h-4 w-4" /> Ümumi Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
          placeholder="Şirkətə aid email adresi"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Qurulma ili
        </label>
        <input
          type="number"
          min="1800"
          max={new Date().getFullYear()}
          value={foundingYear}
          onChange={(e) => setFoundingYear(e.target.value)}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
          placeholder="Məsələn: 2024"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 flex items-center gap-2">
          <FileText className="h-4 w-4" /> VÖEN (istəyə bağlı)
        </label>
        <input
          type="text"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
          placeholder="VÖEN"
        />
        <p className="text-[10px] text-muted-foreground mt-1.5">
          VÖEN əlavə etsəniz profiliniz Doğrulanmış statusunda daha sürətli baxılır
        </p>
      </div>

      {stepError && (
        <div className="text-red-500 text-sm bg-red-50/50 p-4 rounded-xl border border-red-100 flex items-center justify-center">
          {stepError}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-secondary text-foreground py-3.5 rounded-xl font-bold hover:bg-secondary/80 transition-all text-sm flex justify-center items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Geri
        </button>
        <button
          onClick={onNext}
          disabled={isSaving}
          className="flex-[2] flex justify-center rounded-xl px-4 py-3.5 text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed items-center gap-2"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>Növbəti addım <ArrowRight className="h-5 w-5" /></>
          )}
        </button>
      </div>
    </div>
  );
}
