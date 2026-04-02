const STORAGE_KEY = "vibecheck:last-analysis";

function normalizeNumber(value, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function normalizeAnalysis(analysis) {
  if (!analysis || typeof analysis !== "object") {
    return null;
  }

  return {
    ...analysis,
    lighting: typeof analysis.lighting === "string" ? analysis.lighting : "",
    rating: normalizeNumber(analysis.rating),
    confidence: normalizeNumber(analysis.confidence),
    ratingBreakdown: {
      lighting: normalizeNumber(analysis.ratingBreakdown?.lighting),
      poseExpression: normalizeNumber(analysis.ratingBreakdown?.poseExpression),
      composition: normalizeNumber(analysis.ratingBreakdown?.composition),
      uniqueness: normalizeNumber(analysis.ratingBreakdown?.uniqueness),
    },
    songs: Array.isArray(analysis.songs) ? analysis.songs : [],
    captions: Array.isArray(analysis.captions) ? analysis.captions : [],
    improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
  };
}

function normalizeSession(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const normalizedAnalysis = normalizeAnalysis(payload.analysis);
  if (!normalizedAnalysis) {
    return null;
  }

  return {
    ...payload,
    analysis: normalizedAnalysis,
  };
}

export function saveAnalysisSession(payload) {
  const normalizedPayload = normalizeSession(payload);
  if (!normalizedPayload) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedPayload));
}

export function readAnalysisSession() {
  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return normalizeSession(JSON.parse(rawValue));
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearAnalysisSession() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}