import { Flame, Sparkles, Wand2 } from "lucide-react";

export const MODE_OPTIONS = [
  {
    id: "normal",
    label: "Normal",
    subtitle: "Balanced and realistic",
    detail: "Clean feedback with songs, captions, and fair scoring.",
    icon: Sparkles,
    accent: "from-[#7fffd4]/50 to-[#7c8cff]/35",
  },
  {
    id: "roast",
    label: "Roast",
    subtitle: "Playful and lightly savage",
    detail: "Funny reads that stay entertaining instead of rude.",
    icon: Flame,
    accent: "from-[#ff8b7b]/55 to-[#ffcb74]/35",
  },
  {
    id: "improve",
    label: "Improve",
    subtitle: "Practical and direct",
    detail: "Specific advice for a cleaner, stronger post.",
    icon: Wand2,
    accent: "from-[#6ef2ff]/45 to-[#8fb5ff]/35",
  },
];

export default function ModeSelector({ selectedMode, onChange }) {
  return (
    <div className="grid gap-3" data-testid="mode-selector-group">
      {MODE_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = selectedMode === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`group relative overflow-hidden rounded-[26px] border px-4 py-4 text-left transition duration-300 ${
              isActive
                ? "border-white/20 bg-white/10 shadow-[0_0_40px_rgba(127,255,212,0.14)]"
                : "border-white/10 bg-white/5 hover:border-white/[0.16] hover:bg-white/10"
            }`}
            data-testid={`mode-select-${option.id}-button`}
            aria-pressed={isActive}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${option.accent} ${isActive ? "opacity-100" : "opacity-0"} transition duration-300 group-hover:opacity-100`} />
            <div className="relative flex items-start gap-4">
              <div className="mt-1 rounded-2xl border border-white/10 bg-black/20 p-3 text-white/[0.82] backdrop-blur-md">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg text-white" data-testid={`mode-${option.id}-label`}>
                    {option.label}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-white/[0.58]">
                    {option.subtitle}
                  </span>
                </div>
                <p className="max-w-md text-sm text-white/[0.68]" data-testid={`mode-${option.id}-detail`}>
                  {option.detail}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}