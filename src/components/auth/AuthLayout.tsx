import { Check, ArrowLeft } from "lucide-react";
import React from "react";
import { Link } from '@/lib/navigation';

interface AuthLayoutProps {
  title: React.ReactNode;
  description: React.ReactNode;
  features?: { title: string; description: string }[];
  children: React.ReactNode;
}

export function AuthLayout({ title, description, features = [], children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-1">
      
      {/* Left Column: Value Props - Dark/Brand colored panel */}
      <div className="hidden lg:flex flex-col justify-center flex-1 bg-zinc-950 dark:bg-zinc-950 text-white relative overflow-hidden px-12 xl:px-24 border-r border-border/10">
        
        {/* Back to Home Link (Desktop) */}
        <div className="absolute top-8 left-12 xl:left-24 z-20">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors group">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Ana səhifəyə qayıt
          </Link>
        </div>
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: 'var(--accent)' }} />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
           {/* Grid pattern mask */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        <div className="relative z-10 max-w-xl mx-auto w-full">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-[1.15] text-white">
            {title}
          </h1>
          <p className="text-base md:text-lg text-zinc-400 mb-12 leading-relaxed">
            {description}
          </p>
          {features && features.length > 0 && (
            <ul className="space-y-8">
              {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-5 group">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/20"
                  >
                    <Check className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-zinc-100 group-hover:text-white transition-colors">
                      {feat.title}
                    </h4>
                    <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Column: Auth Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 bg-background relative">
        {/* Back to Home Link (Mobile) */}
        <div className="absolute top-6 left-6 lg:hidden z-20">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Subtle background glow for the right side */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full sm:max-w-md shrink-0 relative z-10">
          <div className="flex justify-center mb-8 lg:hidden">
            <span className="text-3xl font-black tracking-tight mb-2">
              Encyclo
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
