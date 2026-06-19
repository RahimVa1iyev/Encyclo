import { Check, ArrowRight, Loader2 } from "lucide-react";

type Props = {
  finishError: string | null;
  isSaving: boolean;
  onFinish: () => void;
};

export default function Step4Ready({ finishError, isSaving, onFinish }: Props) {
  return (
    <div className="space-y-6 text-center py-2 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex justify-center mb-4">
        <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center animate-in zoom-in-75 duration-300">
          <Check className="h-8 w-8 text-green-600 stroke-[2.5]" />
        </div>
      </div>

      <div className="text-left">
        <div className="rounded-2xl bg-amber-50/50 border border-amber-100/50 p-4">
          <h4 className="font-semibold text-amber-800 text-[13px] flex items-center gap-1.5 mb-1">
            <span className="text-base">⏳</span> Profiliniz nəzərdən keçirilir
          </h4>
          <p className="text-[13px] text-amber-800/80 leading-relaxed pl-6">
            Adətən 24 saat ərzində baxılır. Bu müddətdə dashboard-da məhsul əlavə edə,
            profili tamamlaya bilərsiniz.
          </p>
        </div>
      </div>

      {finishError && (
        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100/50 flex items-center justify-center">
          {finishError}
        </div>
      )}

      <button
        onClick={onFinish}
        disabled={isSaving}
        className="flex w-full justify-center rounded-xl px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed items-center gap-2 mt-4"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
      >
        {isSaving ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>Dashboarda keç <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </div>
  );
}
