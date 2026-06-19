"use client"

import { useState } from "react";
import { approveCompanyAction, requestChangesAction, rejectCompanyAction } from "./actions";
import { toast } from "sonner";
import { Check, AlertCircle, X, ExternalLink } from "lucide-react";

export default function PendingReviewClient({ companies }: { companies: any[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<"changes" | "reject" | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async (id: string) => {
    setIsPending(true);
    try {
      await approveCompanyAction(id);
      toast.success("Şirkət təsdiqləndi və artıq public görünür");
    } catch (e: any) {
      toast.error(e.message || "Xəta baş verdi");
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmitNotes = async () => {
    if (!activeId || !mode) return;
    setIsPending(true);
    try {
      if (mode === "changes") await requestChangesAction(activeId, notes);
      else await rejectCompanyAction(activeId, notes);
      toast.success(mode === "changes" ? "Dəyişiklik tələbi göndərildi" : "Şirkət rədd edildi");
      setActiveId(null);
      setMode(null);
      setNotes("");
    } catch (e: any) {
      toast.error(e.message || "Xəta baş verdi");
    } finally {
      setIsPending(false);
    }
  };

  if (companies.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "14px" }}>
        Gözləyən profil yoxdur 🎉
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {companies.map((c) => {
        const name = c.translations?.[0]?.name || c.slug;
        return (
          <div key={c.id} style={{
            border: "0.5px solid var(--border)", borderRadius: "12px",
            padding: "16px", backgroundColor: "var(--surface)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: "14px", margin: "0 0 4px 0", color: "var(--foreground)" }}>{name}</p>
                <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                  {c.category?.name || "Kateqoriya yoxdur"} ·{" "}
                  {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString("az-AZ") : ""}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <a href={`/admin/companies/${c.id}`}
                  style={{ fontSize: "12px", color: "var(--foreground)", fontWeight: 500, textDecoration: "none" }}>
                  Detallı bax →
                </a>
                <a href={`/companies/${c.slug}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "var(--accent)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                  Bax <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {activeId === c.id && mode ? (
              <div style={{ marginTop: "12px" }}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={mode === "changes" ? "Hansı dəyişiklik tələb olunur?" : "Rədd səbəbi"}
                  style={{
                    width: "100%", borderRadius: "8px", border: "0.5px solid var(--border)",
                    padding: "8px", fontSize: "13px", outline: "none", resize: "vertical"
                  }}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
                  <button onClick={() => { setActiveId(null); setMode(null); setNotes(""); }}
                    style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer" }}>
                    Ləğv et
                  </button>
                  <button onClick={handleSubmitNotes} disabled={isPending || notes.trim().length < 5}
                    style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: "none", backgroundColor: "var(--accent)", color: "var(--accent-foreground)", cursor: "pointer", opacity: notes.trim().length < 5 ? 0.5 : 1 }}>
                    Göndər
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => handleApprove(c.id)} disabled={isPending}
                  style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: "0.5px solid oklch(0.7 0.1 150)", color: "oklch(0.42 0.14 150)", background: "transparent", cursor: "pointer" }}>
                  <Check size={13} /> Təsdiqlə
                </button>
                <button onClick={() => { setActiveId(c.id); setMode("changes"); }} disabled={isPending}
                  style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: "0.5px solid oklch(0.7 0.1 80)", color: "oklch(0.5 0.15 60)", background: "transparent", cursor: "pointer" }}>
                  <AlertCircle size={13} /> Dəyişiklik tələb et
                </button>
                <button onClick={() => { setActiveId(c.id); setMode("reject"); }} disabled={isPending}
                  style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: "0.5px solid oklch(0.7 0.1 25)", color: "oklch(0.5 0.18 25)", background: "transparent", cursor: "pointer" }}>
                  <X size={13} /> Rədd et
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
