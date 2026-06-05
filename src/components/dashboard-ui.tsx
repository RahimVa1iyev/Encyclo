import React from 'react';

export const inputClass = "h-10 w-full rounded-xl border bg-transparent px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)]";
export const inputStyle: React.CSSProperties = { borderColor: "var(--border)" };

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-surface p-5 ${className}`} style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}

export function CardHeader({ icon: Icon, title, subtitle, right }: { icon: any; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: "var(--border)" }}>
      <div className="flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "var(--badge-bg)", color: "var(--badge-fg)" }}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-bold leading-tight text-[var(--foreground)]">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function getHintColor(current: number, limit: number): string {
  const ratio = current / limit;
  if (ratio >= 1)    return "oklch(0.5 0.15 25)";   // red
  if (ratio >= 0.8)  return "oklch(0.5 0.15 60)";   // amber
  return "var(--muted-foreground)";                   // normal
}

export function Field({
  label,
  hint,
  hintColor,
  children,
}: {
  label: string;
  hint?: string;
  hintColor?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
          {label}
        </span>
        {hint ? (
          <span
            className="text-[11px] font-medium tabular-nums"
            style={{ color: hintColor || "var(--muted-foreground)" }}
          >
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </label>
  );
}

export function PrimaryButton({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-transparent px-4 text-sm font-semibold transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
      {children}
    </button>
  );
}
