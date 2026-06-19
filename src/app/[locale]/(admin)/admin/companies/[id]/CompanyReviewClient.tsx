"use client";

import { useState } from "react";
import { useRouter } from "@/lib/navigation";
import { approveCompanyAction, requestChangesAction, rejectCompanyAction, suspendCompanyAction } from "../actions";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Building2,
  Ban,
} from "lucide-react";

export function CompanyReviewClient({ data }: { data: any }) {
  const router = useRouter();
  const { company, owner, productCount } = data;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"changes" | "reject" | "suspend" | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const translation = company.translations?.[0] || {};
  const name = translation.name || "Adsız Şirkət";
  const description = translation.description || "Təsvir yoxdur";
  const address = translation.address;

  const signals = [
    { name: "Telefon", value: company.phone, icon: Phone },
    { name: "Email", value: company.email, icon: Mail },
    { name: "Ünvan", value: address, icon: MapPin },
    { name: "Vebsayt", value: company.website, icon: Globe },
    { name: "VÖEN", value: company.tax_id, icon: FileText, highlight: true },
    { name: "Qurulma ili", value: company.founding_year, icon: Calendar },
  ];

  const presentSignals = signals.filter(s => !!s.value).length;
  const scoreBadgeColor = presentSignals >= 5 ? "bg-green-100 text-green-800 border-green-200" 
    : presentSignals >= 3 ? "bg-amber-100 text-amber-800 border-amber-200" 
    : "bg-red-100 text-red-800 border-red-200";

  const handleActionClick = async (type: "approve" | "changes" | "reject" | "suspend") => {
    if (type === "approve") {
      setIsSubmitting(true);
      setError(null);
      try {
        await approveCompanyAction(company.id);
        router.push("/admin/companies");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Xəta baş verdi");
        setIsSubmitting(false);
      }
    } else {
      setActionType(type);
    }
  };

  const handleNotesSubmit = async () => {
    if (!actionType) return;
    if (notes.trim().length < 5) {
      setError("Səbəb ən azı 5 simvol olmalıdır");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (actionType === "changes") {
        await requestChangesAction(company.id, notes);
      } else if (actionType === "reject") {
        await rejectCompanyAction(company.id, notes);
      } else if (actionType === "suspend") {
        await suspendCompanyAction(company.id, notes);
      }
      
      router.push("/admin/companies");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Xəta baş verdi");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="flex items-start justify-between bg-background p-6 rounded-2xl border shadow-sm">
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => router.back()} 
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="h-16 w-16 bg-secondary/50 rounded-xl flex items-center justify-center border overflow-hidden shrink-0">
            {company.logo_url ? (
              <img src={company.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground/50" />
            )}
          </div>
          
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{name}</h1>
            <div className="flex gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
              <span className="bg-secondary px-2 py-0.5 rounded-md font-medium text-xs">
                {company.category?.name || "Kategoriyasız"}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {productCount} Məhsul
              </span>
            </div>
          </div>
        </div>
        
        <a 
          href={`/companies/${company.slug}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-accent hover:underline bg-accent/5 px-4 py-2 rounded-xl transition-colors hover:bg-accent/10"
        >
          <ExternalLink className="h-4 w-4" />
          Public görünüş
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Verification Signals */}
          <div className="bg-background p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Doğrulama Siqnalları</h2>
              <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", scoreBadgeColor)}>
                Skor: {presentSignals}/6
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {signals.map((sig, i) => {
                const Icon = sig.icon;
                const isPresent = !!sig.value;
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    isPresent ? "bg-background border-border" : "bg-secondary/20 border-transparent opacity-60 grayscale",
                    sig.highlight && isPresent ? "border-accent/50 bg-accent/5 shadow-sm" : ""
                  )}>
                    <div className={cn(
                      "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center",
                      isPresent ? "bg-secondary text-foreground" : "bg-secondary/50 text-muted-foreground"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{sig.name}</p>
                      <p className="text-sm font-medium truncate">
                        {isPresent ? sig.value : <span className="text-muted-foreground/50">Göstərilməyib</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="bg-background p-6 rounded-2xl border shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Təsvir</h2>
            {description ? (
               <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                 {description}
               </div>
            ) : (
               <div className="text-sm text-muted-foreground italic">Təsvir əlavə edilməyib.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Owner Card */}
          <div className="bg-background p-6 rounded-2xl border shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Hesab Sahibi</h2>
            {owner ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1"><Mail className="h-3 w-3"/> Email</p>
                  <p className="text-sm font-bold text-foreground truncate">{owner.email}</p>
                </div>
                {owner.name && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Ad</p>
                    <p className="text-sm font-bold text-foreground truncate">{owner.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1"><Calendar className="h-3 w-3"/> Qeydiyyat tarixi</p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(owner.created_at).toLocaleDateString("az-AZ")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sahib məlumatı tapılmadı</p>
            )}
          </div>

          {/* Actions Card */}
          <div className="bg-background p-6 rounded-2xl border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent/50 via-accent to-accent/50 opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                Əməliyyatlar
              </h2>
              
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl mb-5 border border-red-100 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
              )}

              {!actionType ? (
                <div className="space-y-3.5">
                  {company.status === "active" ? (
                    <button 
                      onClick={() => handleActionClick("suspend")}
                      disabled={isSubmitting}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-4 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 border border-red-200/50"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Ban className="h-5 w-5" />}
                      Fəaliyyətini Dayandır
                    </button>
                  ) : company.status === "suspended" ? (
                    <button 
                      onClick={() => handleActionClick("approve")}
                      disabled={isSubmitting}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(34,197,94,0.25)] hover:shadow-[0_4px_25px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 text-sm disabled:opacity-50 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 hover:opacity-0 transition-opacity" />
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : <CheckCircle2 className="h-5 w-5 relative z-10" />}
                      <span className="relative z-10">Yenidən Aktivləşdir</span>
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleActionClick("approve")}
                        disabled={isSubmitting}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(34,197,94,0.25)] hover:shadow-[0_4px_25px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 text-sm disabled:opacity-50 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 hover:opacity-0 transition-opacity" />
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : <CheckCircle2 className="h-5 w-5 relative z-10" />}
                        <span className="relative z-10">Təsdiqlə və Yayımla</span>
                      </button>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                          onClick={() => handleActionClick("changes")}
                          disabled={isSubmitting}
                          className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-[13px] disabled:opacity-50 border border-amber-200/50"
                        >
                          <AlertCircle className="h-4 w-4" /> Dəyişiklik
                        </button>
                        <button 
                          onClick={() => handleActionClick("reject")}
                          disabled={isSubmitting}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-[13px] disabled:opacity-50 border border-red-200/50"
                        >
                          <XCircle className="h-4 w-4" /> Rədd Et
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <button 
                      onClick={() => { setActionType(null); setNotes(""); setError(null); }}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h3 className={cn("font-bold text-sm", actionType === "changes" ? "text-amber-600" : "text-red-600")}>
                      {actionType === "changes" ? "Dəyişiklik tələb edilir" : actionType === "suspend" ? "Şirkət dayandırılır" : "Rədd edilir"}
                    </h3>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={actionType === "suspend" ? "Dayandırma səbəbini yazın..." : "Şirkət sahibinə göndəriləcək aydın və ətraflı mesajı yazın..."}
                      className={cn(
                        "w-full min-h-[140px] rounded-xl border bg-secondary/20 px-4 py-3.5 text-sm outline-none transition-all resize-none shadow-inner",
                        actionType === "changes" 
                          ? "focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 focus:bg-background border-border/50" 
                          : "focus:border-red-400 focus:ring-4 focus:ring-red-400/10 focus:bg-background border-border/50"
                      )}
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground font-medium">
                      {notes.length > 0 ? (notes.length < 5 ? `Ən az 5 simvol (${5 - notes.length} qaldı)` : "Hazırdır") : "Məcburidir"}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleNotesSubmit}
                    disabled={isSubmitting || notes.trim().length < 5}
                    className={cn(
                      "w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm",
                      actionType === "changes" 
                        ? "bg-amber-500 hover:bg-amber-600 shadow-[0_4px_15px_rgba(245,158,11,0.2)]" 
                        : "bg-red-600 hover:bg-red-700 shadow-[0_4px_15px_rgba(220,38,38,0.2)]",
                      (isSubmitting || notes.trim().length < 5) && "opacity-50 cursor-not-allowed shadow-none"
                    )}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Təsdiqlə və Göndər"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
