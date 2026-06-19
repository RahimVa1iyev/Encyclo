import { Upload, Sparkles, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  logoPreview: string | null;
  isDragOver: boolean;
  setIsDragOver: (v: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleLogoUpload: (f: File) => void;
  logoUploadError: string | null;
  isSaving: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

export default function Step3Logo({
  logoPreview, isDragOver, setIsDragOver, fileInputRef, handleLogoUpload, logoUploadError, isSaving, onNext, onBack, onSkip
}: Props) {
  return (
    <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-8 duration-500">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleLogoUpload(file);
        }}
        className={cn(
          "relative border border-dashed rounded-3xl p-8 transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center min-h-[240px] bg-background/50",
          isDragOver
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-border/60 hover:border-border hover:bg-secondary/30"
        )}
      >
        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleLogoUpload(file);
          }}
        />

        {logoPreview ? (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-200 relative z-10">
            <img
              src={logoPreview}
              alt="Logo preview"
              className="h-32 w-32 object-contain rounded-2xl mb-4 shadow-sm bg-background border border-border/50"
            />
            <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Loqonu dəyişmək üçün klikləyin
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center relative z-10">
            <div className="h-16 w-16 bg-background rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 shadow-sm border border-border/40 group-hover:-translate-y-1">
              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
            </div>
            <h3 className="text-base text-foreground font-semibold mb-1">
              Logo yükləyin
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              və ya faylı bura sürükləyin
            </p>
            <span className="text-[11px] font-medium text-muted-foreground/60">
              PNG, JPG, WEBP • Max 5MB
            </span>
          </div>
        )}
      </div>

      {logoUploadError && (
        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" /> {logoUploadError}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-none w-14 bg-secondary text-foreground py-3.5 rounded-xl font-medium hover:bg-secondary/80 transition-all text-sm flex justify-center items-center"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onSkip}
          className="flex-[1.5] text-muted-foreground py-3.5 rounded-xl font-medium hover:bg-secondary hover:text-foreground transition-all text-sm"
        >
          Sonraya saxla
        </button>
        <button
          onClick={onNext}
          disabled={isSaving}
          className="flex-[2] justify-center rounded-xl px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>Növbəti <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
