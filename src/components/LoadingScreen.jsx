import { useEffect, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

const LOADING_LINES = [
  "Reading the vibe...",
  "Analyzing your aura...",
  "Cooking your rating...",
  "Matching the mood...",
];

export default function LoadingScreen() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % LOADING_LINES.length);
    }, 1500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080911]/88 px-4 backdrop-blur-2xl" data-testid="analysis-loading-screen">
      <div className="loading-panel w-full max-w-md rounded-[34px] border border-white/[0.12] bg-white/[0.06] p-8 text-center shadow-[0_0_90px_rgba(11,246,196,0.12)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.12] bg-black/20 text-[#7fffd4]">
          <LoaderCircle className="loading-spin h-8 w-8" />
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.28em] text-white/[0.45]">
          <Sparkles className="h-4 w-4 text-[#ffb36a]" />
          Premium story analysis
        </div>
        <p className="mt-5 font-display text-3xl text-white" data-testid="loading-rotating-text">
          {LOADING_LINES[lineIndex]}
        </p>
        <p className="mt-3 text-sm text-white/[0.58]" data-testid="loading-support-text">
          Pulling the vibe, score, songs, captions, and glow-up tips together.
        </p>
      </div>
    </div>
  );
}