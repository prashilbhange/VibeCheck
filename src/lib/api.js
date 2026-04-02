import axios from "axios";

import { createMockAnalysis } from "@/lib/mockAnalysis";

const BUILD_TIME_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const ANALYSIS_TIMEOUT_MS = 30000;
const RUNTIME_CONFIG_PATH = "/runtime-config.json";

let runtimeConfigPromise;

async function getRuntimeConfig() {
  if (!runtimeConfigPromise) {
    runtimeConfigPromise = (async () => {
      try {
        const response = await fetch(RUNTIME_CONFIG_PATH, { cache: "no-store" });
        if (!response.ok) {
          return {};
        }

        return response.json();
      } catch {
        return {};
      }
    })();
  }

  return runtimeConfigPromise;
}

async function resolveBackendUrl() {
  const runtimeConfig = await getRuntimeConfig();
  const debugOverride = window.localStorage.getItem("vibecheck:backend-url")?.trim();
  return debugOverride || runtimeConfig.backendUrl || BUILD_TIME_BACKEND_URL || null;
}

function attachAnalysisMeta(analysis, meta) {
  return {
    ...analysis,
    analysisSource: meta.source,
    analysisDebugReason: meta.reason,
    analysisBackendUrl: meta.backendUrl,
  };
}

function isDebugEnabled() {
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

function logAnalysisSource(meta) {
  if (!isDebugEnabled()) {
    return;
  }

  console.info(`[VibeCheck] ${meta.source}`, {
    reason: meta.reason,
    backendUrl: meta.backendUrl,
  });
}

function shouldUseMockFallback(error) {
  if (!error) {
    return true;
  }

  if (!error.response) {
    return true;
  }

  return [404, 408, 429, 500, 502, 503, 504].includes(error.response.status);
}

async function requestRealAnalysis(apiBaseUrl, formData) {
  return axios.post(`${apiBaseUrl}/analyze`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: ANALYSIS_TIMEOUT_MS,
  });
}

export async function analyzeStoryImage({ file, mode, selectedSong }) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("mode", mode);
  if (selectedSong?.trim()) {
    formData.append("selected_song", selectedSong.trim());
  }

  const backendUrl = await resolveBackendUrl();
  const apiBaseUrl = backendUrl ? `${backendUrl}/api` : null;

  if (!apiBaseUrl) {
    const meta = {
      source: "fallback mode",
      reason: "missing backend URL",
      backendUrl: null,
    };
    logAnalysisSource(meta);
    return attachAnalysisMeta(await createMockAnalysis({ file, mode, selectedSong }), meta);
  }

  try {
    const response = await requestRealAnalysis(apiBaseUrl, formData);
    const meta = {
      source: "real AI",
      reason: "analysis service responded successfully",
      backendUrl,
    };
    logAnalysisSource(meta);
    return attachAnalysisMeta(response.data, meta);
  } catch (error) {
    if (shouldUseMockFallback(error)) {
      try {
        const retryResponse = await requestRealAnalysis(apiBaseUrl, formData);
        const meta = {
          source: "real AI",
          reason: "analysis service succeeded after retry",
          backendUrl,
        };
        logAnalysisSource(meta);
        return attachAnalysisMeta(retryResponse.data, meta);
      } catch (retryError) {
        const meta = {
          source: "fallback mode",
          reason: retryError.code || retryError.response?.status || "analysis request failed",
          backendUrl,
        };
        logAnalysisSource(meta);
        return attachAnalysisMeta(await createMockAnalysis({ file, mode, selectedSong }), meta);
      }
    }

    throw error;
  }
}

export { BUILD_TIME_BACKEND_URL };