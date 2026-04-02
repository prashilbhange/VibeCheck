import { Sparkles, Star } from "lucide-react";

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pb-6 pt-5 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3" data-testid="app-header-brand">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/10 shadow-[0_0_40px_rgba(95,255,214,0.14)] backdrop-blur-xl">
          <Star className="h-5 w-5 text-[#7fffd4]" />
        </div>
        <div>
          <p className="font-display text-xl tracking-[0.22em] text-white" data-testid="app-logo-text">
            VibeCheck
          </p>
          <p className="text-xs uppercase tracking-[0.32em] text-white/[0.45]" data-testid="app-tagline-text">
            Rate your story. Match the vibe.
          </p>
        </div>
      </div>

      <div
        className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-white/[0.72] backdrop-blur-lg sm:flex"
        data-testid="header-status-pill"
      >
        <Sparkles className="h-4 w-4 text-[#ffb36a]" />
        Viral-ready photo reads
      </div>
    </header>
  );
}