"use client";

import { toast } from "sonner";

export default function CopyWidgetCode({ code }: { code: string }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(code);
        toast.success("Kod kopyalandı!");
      }}
      className="absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
    >
      Kopyala
    </button>
  );
}
