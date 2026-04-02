import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Music2, RefreshCw, Share2, Sparkles, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MODE_OPTIONS } from "@/components/ModeSelector";
import ResultCard from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { clearAnalysisSession, readAnalysisSession } from "@/lib/resultStorage";
import { toast } from "@/components/ui/sonner";

const BREAKDOWN_LABELS = [
  { key: "lighting", label: "Lighting", max: 3 },
  { key: "poseExpression", label: "Pose / Expression", max: 3 },
  { key: "composition", label: "Composition", max: 2 },
  { key: "uniqueness", label: "Uniqueness", max: 2 },
];

export default function ResultsPage() {
  const navigate = useNavigate();
  const [resultSession] = useState(() => readAnalysisSession());
  const animationKeyRef = useRef(null);
  const [animatedRating, setAnimatedRating] = useState(0);
  const debugEnabled = useMemo(() => new URLSearchParams(window.location.search).get("debug") === "1", []);

  const analysisReady = useMemo(() => {
    const analysis = resultSession?.analysis;
    return Boolean(
      resultSession &&
        analysis &&
        typeof analysis.vibe === "string" &&
        typeof analysis.setting === "string" &&
        typeof analysis.lighting === "string" &&
        Number.isFinite(analysis.rating) &&
        Number.isFinite(analysis.confidence) &&
        Array.isArray(analysis.songs) &&
        analysis.songs.length > 0 &&
        Array.isArray(analysis.captions) &&
        analysis.captions.length > 0
    );
  }, [resultSession]);

  const analysis = analysisReady ? resultSession.analysis : null;
  const previewUrl = analysisReady ? resultSession.previewUrl : "";
  const resultKey = analysisReady
    ? resultSession.analyzedAt || `${resultSession.fileName || "result"}-${analysis.rating}-${analysis.vibe}`
    : null;
  const targetRating = analysisReady ? Number(analysis.rating) : 0;
  const modeLabel = MODE_OPTIONS.find((option) => option.id === resultSession?.mode)?.label || "Normal";

  useEffect(() => {
    document.title = "VibeCheck — Your result";
  }, []);

  useEffect(() => {
    if (!analysisReady) {
      navigate(`/${window.location.search}`);
    }
  }, [analysisReady, navigate]);

  useEffect(() => {
    if (!analysisReady || !resultKey || animationKeyRef.current === resultKey) {
      if (analysisReady && animationKeyRef.current === resultKey) {
        setAnimatedRating(targetRating);
      }
      return undefined;
    }

    let isCancelled = false;
    let animationFrame;
    let startTime;

    const animate = (timestamp) => {
      if (isCancelled) {
        return;
      }

      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / 900, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextRating = Number((targetRating * easedProgress).toFixed(1));
      setAnimatedRating(nextRating);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      } else {
        animationKeyRef.current = resultKey;
        setAnimatedRating(targetRating);
      }
    };

    setAnimatedRating(0);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrame);
    };
  }, [analysisReady, resultKey, targetRating]);

  if (!analysisReady || !analysis) {
    return null;
  }

  const songFeedback = analysis.songFeedback;
  const songsEyebrow = songFeedback ? "Your pick vs the photo" : "Mood match";
  const songsListLabel = songFeedback
    ? songFeedback.fitsVibe
      ? "Similar picks"
      : "Better matches"
    : "Track";

  const legacyCopyText = (value) => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };

  const copyText = async (value, successMessage) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        legacyCopyText(value);
      }
      toast.success(successMessage);
    } catch {
      try {
        legacyCopyText(value);
        toast.success(successMessage);
      } catch {
        toast.error("Copy failed. Try again.");
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My VibeCheck result",
          text: analysis.shareText,
        });
        toast.success("Your vibe is ready to post.");
        return;
      } catch {
        // fall through to clipboard copy
      }
    }

    copyText(analysis.shareText, "Share text copied — ready to drop anywhere.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="ambient ambient-three" />
      <Header />

      {debugEnabled ? (
        <div className="fixed right-4 top-20 z-50 rounded-full border border-white/12 bg-black/[0.65] px-4 py-2 text-xs uppercase tracking-[0.24em] text-white backdrop-blur-lg" data-testid="analysis-debug-flag">
          {analysis.analysisSource || "unknown mode"}
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-2 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="result-entrance" style={{ animationDelay: "60ms" }}>
            <ResultCard title="Image Preview" eyebrow="Your shot" testId="image-preview-card">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/[0.28] p-2">
                <div className="aspect-[4/5] overflow-hidden rounded-[24px] bg-black/[0.35]">
                  <img
                    src={previewUrl}
                    alt="Uploaded story"
                    className="h-full w-full object-contain"
                    data-testid="results-image-preview"
                  />
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/[0.22] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.28em] text-white/[0.42]">Mode used</p>
                <div className="mt-3 flex items-center gap-2 text-white" data-testid="analysis-mode-label">
                  <Sparkles className="h-4 w-4 text-[#7fffd4]" />
                  <span className="font-medium">{modeLabel}</span>
                </div>
              </div>
            </div>
            </ResultCard>
          </div>

          <div className="grid gap-6">
            <div className="result-entrance" style={{ animationDelay: "140ms" }}>
              <ResultCard title={analysis.vibe} eyebrow="Vibe result" testId="vibe-result-card">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#7fffd4]/20 bg-[#7fffd4]/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#9cffde]" data-testid="analysis-setting-pill">
                    {analysis.setting}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/[0.7]" data-testid="analysis-lighting-pill">
                    {analysis.lighting}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/[0.7]" data-testid="analysis-confidence-pill">
                    Confidence {analysis.confidence}%
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/[0.58]">
                    Screenshot worthy
                  </span>
                </div>
                <p className="text-base text-white/[0.72]" data-testid="analysis-share-text-preview">
                  {analysis.shareText}
                </p>
              </div>
              </ResultCard>
            </div>

            <div className="result-entrance" style={{ animationDelay: "220ms" }}>
              <ResultCard title="Rating" eyebrow="Out of 10" testId="rating-card">
              <div className="grid gap-5 lg:grid-cols-[0.5fr_0.5fr]">
                <div className="rating-glow rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(127,255,212,0.12),rgba(255,179,106,0.08))] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/[0.42]">Final score</p>
                  <p className="mt-3 font-display text-6xl text-white" data-testid="analysis-rating-value">
                    {animatedRating.toFixed(1)}
                    <span className="text-2xl text-white/[0.45]">/10</span>
                  </p>
                  <p className="mt-4 text-sm text-[#9cffde]" data-testid="analysis-highlight-line">
                    {analysis.highlightLine}
                  </p>
                  <p className="mt-2 text-sm text-white/[0.62]" data-testid="analysis-confidence-text">
                    Confidence: {analysis.confidence}%
                  </p>
                </div>
                <div className="space-y-3">
                  {BREAKDOWN_LABELS.map(({ key, label, max }) => {
                    const value = analysis.ratingBreakdown[key];
                    const width = `${Math.max((value / max) * 100, 8)}%`;
                    return (
                      <div key={key} className="space-y-2" data-testid={`rating-breakdown-${key}`}>
                        <div className="flex items-center justify-between text-sm text-white/[0.72]">
                          <span>{label}</span>
                          <span>{value.toFixed(1)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[linear-gradient(90deg,#7fffd4_0%,#ffb36a_100%)]" style={{ width }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              </ResultCard>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="result-entrance" style={{ animationDelay: "300ms" }}>
            <ResultCard title="Songs" eyebrow={songsEyebrow} testId="songs-card">
            <div className="space-y-3">
              {songFeedback ? (
                <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(135deg,rgba(127,255,212,0.12),rgba(255,179,106,0.08))] p-4" data-testid="song-feedback-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-black/[0.22] px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/[0.62]" data-testid="song-feedback-provided-song">
                      Your pick: {songFeedback.providedSong}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] ${
                        songFeedback.fitsVibe
                          ? "border border-[#7fffd4]/20 bg-[#7fffd4]/10 text-[#9cffde]"
                          : "border border-[#ffb36a]/20 bg-[#ffb36a]/10 text-[#ffd2a1]"
                      }`}
                      data-testid="song-feedback-verdict"
                    >
                      {songFeedback.fitsVibe ? "Fits the vibe" : "Doesn’t fit"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/[0.74]" data-testid="song-feedback-message">
                    {songFeedback.message}
                  </p>
                </div>
              ) : null}

              {analysis.songs.map((song, index) => (
                <div key={song} className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-black/[0.22] px-4 py-4" data-testid={`song-suggestion-${index + 1}`}>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-[#ffb36a]">
                    <Music2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/[0.4]">{songsListLabel} {index + 1}</p>
                    <p className="mt-1 text-base text-white">{song}</p>
                  </div>
                </div>
              ))}
            </div>
            </ResultCard>
          </div>

          <div className="result-entrance" style={{ animationDelay: "380ms" }}>
            <ResultCard title="Captions" eyebrow="Post-ready lines" testId="captions-card">
            <div className="space-y-3">
              {analysis.captions.map((caption, index) => (
                <div key={caption} className="rounded-[22px] border border-white/10 bg-black/[0.22] p-4" data-testid={`caption-suggestion-${index + 1}`}>
                  <p className="text-base text-white">{caption}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 rounded-full border-white/[0.12] bg-white/[0.06] text-white hover:bg-white/[0.12] hover:text-white"
                    onClick={() => copyText(caption, "Caption copied.")}
                    data-testid={`caption-copy-button-${index + 1}`}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy caption
                  </Button>
                </div>
              ))}
            </div>
            </ResultCard>
          </div>

          <div className="result-entrance" style={{ animationDelay: "460ms" }}>
            <ResultCard title="Improvements" eyebrow="Glow-up tips" testId="improvements-card">
            <div className="space-y-3">
              {analysis.improvements.map((tip, index) => (
                <div key={tip} className="flex gap-3 rounded-[22px] border border-white/10 bg-black/[0.22] px-4 py-4" data-testid={`improvement-tip-${index + 1}`}>
                  <div className="mt-1 rounded-full bg-[#7fffd4]/12 p-2 text-[#7fffd4]">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-white/[0.78]">{tip}</p>
                </div>
              ))}
            </div>
            </ResultCard>
          </div>
        </section>

        <div className="result-entrance" style={{ animationDelay: "540ms" }}>
          <ResultCard title="Share My Vibe" eyebrow="Postable summary" testId="share-card" className="overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(127,255,212,0.22),rgba(131,185,255,0.18),rgba(255,179,106,0.2))] p-5 sm:p-7" data-testid="share-summary-block">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(5,6,11,0.28),transparent_36%)]" />
              <div className="absolute -right-10 top-6 h-28 w-28 rounded-full bg-white/[0.16] blur-3xl" />
              <div className="absolute -left-8 bottom-4 h-24 w-24 rounded-full bg-[#7fffd4]/20 blur-3xl" />

              <div className="relative flex flex-col items-center gap-6 text-center">
                <div className="inline-flex items-center rounded-full border border-white/15 bg-black/[0.16] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/[0.62]">
                  VibeCheck result
                </div>

                <div className="grid w-full gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                  <div className="space-y-3 rounded-[28px] border border-white/12 bg-black/[0.18] px-5 py-6 sm:px-7">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/[0.55]">Vibe</p>
                    <h3 className="font-display text-4xl leading-tight text-white sm:text-5xl" data-testid="share-summary-vibe">
                      {analysis.vibe}
                    </h3>
                    <p className="text-sm text-white/[0.7]">{analysis.setting} • {analysis.lighting}</p>
                  </div>

                  <div className="space-y-3 rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.15))] px-5 py-6 sm:px-7">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/[0.55]">Rating</p>
                    <div className="font-display text-7xl text-white sm:text-8xl" data-testid="share-summary-rating">
                      {analysis.rating.toFixed(1)}
                      <span className="text-2xl text-white/[0.58] sm:text-3xl">/10</span>
                    </div>
                    <p className="rounded-full border border-white/12 bg-black/[0.16] px-4 py-2 text-sm text-white" data-testid="share-summary-highlight">
                      {analysis.highlightLine}
                    </p>
                  </div>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/12 bg-black/[0.16] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/[0.5]">Setting</p>
                    <p className="mt-2 text-sm text-white" data-testid="share-summary-setting">{analysis.setting}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/12 bg-black/[0.16] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/[0.5]">Lighting</p>
                    <p className="mt-2 text-sm text-white" data-testid="share-summary-lighting">{analysis.lighting}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/12 bg-black/[0.16] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/[0.5]">Confidence</p>
                    <p className="mt-2 text-sm text-white" data-testid="share-summary-confidence">{analysis.confidence}%</p>
                  </div>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/12 bg-black/[0.16] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/[0.5]">Top song</p>
                    <p className="mt-2 text-sm text-white" data-testid="share-summary-top-song">{analysis.songs[0]}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/12 bg-black/[0.16] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/[0.5]">Caption</p>
                    <p className="mt-2 text-sm text-white" data-testid="share-summary-caption">{analysis.captions[0]}</p>
                  </div>
                </div>

                <p className="max-w-2xl text-sm text-white/[0.72]" data-testid="share-summary-text">
                  {analysis.vibe} • {analysis.rating.toFixed(1)}/10 • {analysis.confidence}% confidence
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                type="button"
                className="rounded-full bg-[linear-gradient(135deg,#7fffd4_0%,#83b9ff_55%,#ffb36a_100%)] px-6 py-6 text-[#071015] hover:brightness-105"
                onClick={handleShare}
                data-testid="share-my-vibe-button"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share My Vibe
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-white/[0.12] bg-white/[0.06] px-6 py-6 text-white hover:bg-white/[0.12] hover:text-white"
                onClick={() => copyText(analysis.shareText, "Full result copied.")}
                data-testid="copy-results-button"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Results
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-white/[0.12] bg-white/[0.06] px-6 py-6 text-white hover:bg-white/[0.12] hover:text-white"
                onClick={() => {
                  clearAnalysisSession();
                  navigate(`/${window.location.search}`);
                }}
                data-testid="try-another-photo-button"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Another Photo
              </Button>
            </div>
          </div>
          </ResultCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}