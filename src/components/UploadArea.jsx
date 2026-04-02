import { useRef, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function UploadArea({ fileName, previewUrl, onFileSelected, error }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSelectedFile = (fileList) => {
    const file = fileList?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => handleSelectedFile(event.target.files)}
        data-testid="story-upload-input"
      />

      <button
        type="button"
        className={`group relative block w-full overflow-hidden rounded-[30px] border border-dashed p-5 text-left transition duration-300 sm:p-6 ${
          isDragging
            ? "border-[#7fffd4]/70 bg-[#7fffd4]/10 shadow-[0_0_60px_rgba(127,255,212,0.15)]"
            : "border-white/[0.14] bg-white/5 hover:border-white/[0.22] hover:bg-white/[0.07]"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleSelectedFile(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        data-testid="story-upload-dropzone"
      >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(127,255,212,0.12),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(255,179,106,0.14),_transparent_36%)] opacity-80" />
        <div className="relative space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/[0.18] p-3 text-[#7fffd4] backdrop-blur-lg">
              <UploadCloud className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/[0.55]">
              Drag & drop supported
            </span>
          </div>

          {previewUrl ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/30 p-2" data-testid="uploaded-image-preview-card">
                <div className="aspect-[4/5] overflow-hidden rounded-[20px] bg-black/[0.35]">
                  <img
                    src={previewUrl}
                    alt="Uploaded story preview"
                    className="h-full w-full object-contain"
                    data-testid="uploaded-image-preview"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/[0.24] px-4 py-3 text-sm text-white/[0.72]">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/[0.45]">Ready to analyze</p>
                  <p className="truncate font-medium text-white" data-testid="uploaded-file-name">
                    {fileName}
                  </p>
                </div>
                <ImagePlus className="h-4 w-4 shrink-0 text-white/[0.45]" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="aspect-[4/5] rounded-[24px] border border-white/10 bg-black/[0.26] p-6">
                <div className="flex h-full flex-col items-center justify-center rounded-[18px] border border-dashed border-white/10 bg-white/[0.03] text-center">
                  <p className="font-display text-2xl text-white" data-testid="upload-area-title">
                    Drop your story here
                  </p>
                  <p className="mt-3 max-w-xs text-sm text-white/[0.62]" data-testid="upload-area-description">
                    Upload a selfie, cafe snap, mirror pic, or any post you want scored.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/[0.55]" data-testid="upload-guidance-text">
          Best results come from clear photos with faces, outfits, or visible mood.
        </p>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-white/[0.12] bg-white/[0.06] px-5 text-white hover:bg-white/[0.12] hover:text-white"
          onClick={() => inputRef.current?.click()}
          data-testid="upload-file-picker-button"
        >
          Choose photo
        </Button>
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-[#ff8b7b]/30 bg-[#ff8b7b]/10 px-4 py-3 text-sm text-[#ffd1c8]"
          data-testid="upload-error-message"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}