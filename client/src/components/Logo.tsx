import { Sparkles } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Sparkles className="w-8 h-8 text-primary" />
        <div className="absolute inset-0 blur-xl bg-primary/30" />
      </div>
      <span className="font-display font-bold text-2xl tracking-tight">
        Vexura
      </span>
    </div>
  );
}
