import { useEffect, useState } from "react";
import { ArrowUpRight, Music4, Sparkles, Stars } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import ModeSelector from "@/components/ModeSelector";
import UploadArea from "@/components/UploadArea";
import { Button } from "@/components/ui/button";
import { analyzeStoryImage } from "@/lib/api";
import { saveAnalysisSession } from "@/lib/resultStorage";
import { toast } from "@/components/ui/sonner";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not preview this image."));
    reader.readAsDataURL(file);
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState("normal");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSong, setSelectedSong] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    document.title = "VibeCheck — Rate your story";
  }, []);

  const handleFileSelected = async (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Use a JPG, PNG, or WEBP photo for the cleanest read.");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage("Keep the file under 12MB so the analysis stays quick.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setSelectedFile(file);
      setPreviewUrl(dataUrl);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Could not read that image. Try another one.");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage("Pick a photo first so VibeCheck has something to score.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage("");

    try {
      const analysis = await analyzeStoryImage({
        file: selectedFile,
        mode: selectedMode,
        selectedSong,
      });

      saveAnalysisSession({
        analysis,
        previewUrl,
        fileName: selectedFile.name,
        mode: selectedMode,
        selectedSong: selectedSong.trim(),
        analyzedAt: new Date().toISOString(),
      });

      if (new URLSearchParams(window.location.search).get("debug") === "1") {
        console.info("[VibeCheck] Final result source", {
          source: analysis.analysisSource,
          reason: analysis.analysisDebugReason,
        });
      }

      navigate(`/results${window.location.search}`);
    } catch (error) {
      const detail = error.response?.data?.detail || "Analysis failed. Try another photo in a sec.";
      setErrorMessage(detail);
      toast.error(detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-10 pt-2 sm:px-6 lg:px-8">
        <section className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/[0.58]" data-testid="hero-highlight-pill">
              <Sparkles className="h-4 w-4 text-[#7fffd4]" />
              Rate your story. Match the vibe.
            </div>

            <div className="space-y-5">
              <h1 className="font-display text-4xl text-white sm:text-5xl lg:text-6xl" data-testid="home-main-heading">
                Your photo,
                <span className="block bg-[linear-gradient(135deg,#ffffff_0%,#7fffd4_45%,#ffb36a_100%)] bg-clip-text text-transparent">
                  fully vibe checked.
                </span>
              </h1>
              <p className="max-w-2xl text-base text-white/[0.68] sm:text-lg" data-testid="home-description-text">
                Upload a photo and get a vibe rating, song suggestions, captions, and tips.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Stars, label: "Real AI analysis" },
                { icon: Music4, label: "3 song picks" },
                { icon: ArrowUpRight, label: "Share-ready results" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="glass-card rounded-[26px] border border-white/10 bg-white/[0.05] px-4 py-4" data-testid={`feature-pill-${label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <Icon className="h-4 w-4 text-[#ffb36a]" />
                  <p className="mt-3 text-sm text-white/[0.72]">{label}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-[34px] border border-white/10 bg-white/[0.05] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/[0.42]">Choose your lens</p>
                  <h2 className="mt-2 font-display text-2xl text-white" data-testid="mode-selector-heading">
                    Pick the vibe mode
                  </h2>
                </div>
              </div>
              <ModeSelector selectedMode={selectedMode} onChange={setSelectedMode} />
            </div>
          </div>

          <div className="glass-card rounded-[34px] border border-white/[0.12] bg-white/[0.06] p-5 shadow-[0_0_80px_rgba(10,16,30,0.24)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/[0.42]">Upload studio</p>
                <h2 className="mt-2 font-display text-2xl text-white" data-testid="upload-section-heading">
                  Drop a photo. Get the full read.
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/[0.55]" data-testid="selected-mode-pill">
                {selectedMode} mode
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <UploadArea
                fileName={selectedFile?.name}
                previewUrl={previewUrl}
                onFileSelected={handleFileSelected}
                error={errorMessage}
              />

              <div className="rounded-[26px] border border-white/10 bg-black/[0.2] p-4" data-testid="selected-song-section">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white" htmlFor="selected-song-input">
                    Optional song check
                  </label>
                  <p className="text-sm text-white/[0.6]" data-testid="selected-song-description">
                    Already have a track in mind? Drop it here and we’ll tell you if it really matches the photo.
                  </p>
                </div>
                <input
                  id="selected-song-input"
                  type="text"
                  value={selectedSong}
                  onChange={(event) => setSelectedSong(event.target.value)}
                  placeholder="e.g. After Dark — Mr.Kitty"
                  className="mt-4 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition focus:border-[#7fffd4]/40 focus:bg-white/[0.08]"
                  data-testid="selected-song-input"
                />
              </div>

              <Button
                type="button"
                className="h-14 w-full rounded-full border border-[#7fffd4]/30 bg-[linear-gradient(135deg,#7fffd4_0%,#83b9ff_55%,#ffb36a_100%)] px-6 font-semibold text-[#071015] shadow-[0_20px_45px_rgba(127,255,212,0.16)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
                onClick={handleAnalyze}
                data-testid="analyze-story-button"
              >
                Analyze Story
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      {isAnalyzing ? <LoadingScreen /> : null}
    </div>
  );
}