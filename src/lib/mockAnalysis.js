const ANALYSIS_PRESETS = [
  {
    setting: "indoor cafe mirror selfie",
    lighting: "warm cafe lighting",
    confidence: 89,
    vibe: {
      normal: "clean cafe flex",
      roast: "accidentally iconic cafe flex",
      improve: "soft confident mirror vibe",
    },
    ratingBreakdown: { lighting: 2.7, poseExpression: 2.4, composition: 1.7, uniqueness: 1.6 },
    songs: ["After Dark — Mr.Kitty", "Pink + White — Frank Ocean", "Apocalypse — Cigarettes After Sex"],
    captions: {
      normal: ["light knew the assignment", "looked easy, landed clean"],
      roast: ["ordered coffee, served face", "casual act, loud result"],
      improve: ["clean light, cleaner crop", "soft frame, strong mood"],
    },
    improvements: [
      "crop a little tighter so the mirror shot lands faster",
      "soften any harsh hotspot if the light is too direct",
      "keep the frame clean so the vibe stays effortless",
    ],
  },
  {
    setting: "outdoor golden hour portrait",
    lighting: "golden hour sunlight",
    confidence: 91,
    vibe: {
      normal: "sunlit lowkey main character",
      roast: "walking like the trailer dropped",
      improve: "warm confident outdoor energy",
    },
    ratingBreakdown: { lighting: 2.8, poseExpression: 2.2, composition: 1.8, uniqueness: 1.5 },
    songs: ["Sunsetz — Cigarettes After Sex", "Space Song — Beach House", "Nights Like This — The Kid LAROI"],
    captions: {
      normal: ["sun stayed on my side", "outside and still composed"],
      roast: ["outside like it mattered", "street got one good take"],
      improve: ["better angle, bigger impact", "clean stride, cleaner frame"],
    },
    improvements: [
      "angle slightly toward the light for a cleaner face highlight",
      "leave a little more space around the subject for balance",
      "watch busy backgrounds so the mood stays clean",
    ],
  },
  {
    setting: "indoor bedroom fit check",
    lighting: "soft window daylight",
    confidence: 86,
    vibe: {
      normal: "lowkey aesthetic energy",
      roast: "fit check with elite confidence",
      improve: "clean room fit energy",
    },
    ratingBreakdown: { lighting: 2.3, poseExpression: 2.3, composition: 1.6, uniqueness: 1.5 },
    songs: ["I Wanna Be Yours — Arctic Monkeys", "Snooze — SZA", "telepatía — Kali Uchis"],
    captions: {
      normal: ["quiet flex, clear result", "low effort, good return"],
      roast: ["home turf, strong form", "bedroom but still editorial"],
      improve: ["tidier frame, better post", "clean room, clean result"],
    },
    improvements: [
      "clear a few background distractions so the fit stands out more",
      "raise the camera slightly for a cleaner body line",
      "add a little side light for more depth",
    ],
  },
  {
    setting: "outdoor night out story",
    lighting: "dim street lighting",
    confidence: 82,
    vibe: {
      normal: "late-night polished energy",
      roast: "posted like the night mattered",
      improve: "sharp nightlife story vibe",
    },
    ratingBreakdown: { lighting: 2.1, poseExpression: 2.5, composition: 1.6, uniqueness: 1.7 },
    songs: ["Do I Wanna Know? — Arctic Monkeys", "Too Sweet — Hozier", "Dark Red — Steve Lacy"],
    captions: {
      normal: ["late but worth posting", "night did what it had to"],
      roast: ["you knew this was posting", "camera roll knew the winner"],
      improve: ["cleaner frame, same night", "strong mood, less blur"],
    },
    improvements: [
      "step toward the strongest light source for a cleaner subject read",
      "hold the frame steadier so the mood looks intentional",
      "trim any dead space around the edges",
    ],
  },
];

const SONG_MOODS = [
  { keywords: ["after dark", "apocalypse", "dark red", "nightcall", "sweater weather"], mood: "moody" },
  { keywords: ["sunsetz", "space song", "pink + white", "telepatía", "snooze"], mood: "soft" },
  { keywords: ["espresso", "feather", "party rock", "levitating", "greedy"], mood: "bright" },
  { keywords: ["do i wanna know", "i wanna be yours", "too sweet", "lovefool"], mood: "cool" },
];

function hashString(value = "") {
  return Array.from(value).reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0);
}

async function getImageSignals(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const sampleWidth = 48;
    const sampleHeight = Math.max(1, Math.round((bitmap.height / bitmap.width) * sampleWidth));

    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    context.drawImage(bitmap, 0, 0, sampleWidth, sampleHeight);

    const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);
    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;
    let brightnessTotal = 0;

    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      redTotal += red;
      greenTotal += green;
      blueTotal += blue;
      brightnessTotal += (red + green + blue) / 3;
    }

    const pixelCount = data.length / 4 || 1;
    const averageRed = redTotal / pixelCount;
    const averageGreen = greenTotal / pixelCount;
    const averageBlue = blueTotal / pixelCount;

    return {
      brightness: brightnessTotal / pixelCount,
      warmth: averageRed - averageBlue,
      greenBias: averageGreen - averageBlue,
    };
  } catch {
    return null;
  }
}

function pickPreset(file, imageSignals) {
  const fileKey = `${file.name}-${file.size}-${file.lastModified}`.toLowerCase();
  const keywordMatch = ANALYSIS_PRESETS.find((preset) => fileKey.includes(preset.setting.split(" ")[0]));
  if (keywordMatch) {
    return keywordMatch;
  }

  if (imageSignals) {
    if (imageSignals.warmth > 28 && imageSignals.brightness < 170) {
      return ANALYSIS_PRESETS[0];
    }
    if (imageSignals.brightness > 165 && imageSignals.greenBias > 5) {
      return ANALYSIS_PRESETS[1];
    }
    if (imageSignals.brightness < 105) {
      return ANALYSIS_PRESETS[3];
    }
    if (imageSignals.brightness >= 105 && imageSignals.brightness < 165) {
      return ANALYSIS_PRESETS[2];
    }
  }

  return ANALYSIS_PRESETS[hashString(fileKey) % ANALYSIS_PRESETS.length];
}

function inferSongMood(songName = "") {
  const normalized = songName.toLowerCase();
  return SONG_MOODS.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)))?.mood || "unknown";
}

function inferPresetMood(preset) {
  const joinedSongs = preset.songs.join(" ").toLowerCase();
  return inferSongMood(joinedSongs);
}

function buildHighlightLine(rating) {
  if (rating >= 8.8) {
    return "main character approved";
  }
  if (rating >= 8.2) {
    return "story-ready without trying hard";
  }
  if (rating >= 7.5) {
    return "this hits the aesthetic perfectly";
  }
  if (rating >= 7.0) {
    return "clean post energy";
  }
  return "still looks good though";
}

function tweakBreakdown(baseBreakdown, seed) {
  const variance = ((seed % 5) - 2) * 0.1;
  return {
    lighting: Math.min(3, Math.max(1.8, Number((baseBreakdown.lighting + variance).toFixed(1)))),
    poseExpression: Math.min(3, Math.max(1.9, Number((baseBreakdown.poseExpression + variance).toFixed(1)))),
    composition: Math.min(2, Math.max(1.3, Number((baseBreakdown.composition + variance / 2).toFixed(1)))),
    uniqueness: Math.min(2, Math.max(1.2, Number((baseBreakdown.uniqueness + variance / 2).toFixed(1)))),
  };
}

function totalRating(breakdown) {
  const total = breakdown.lighting + breakdown.poseExpression + breakdown.composition + breakdown.uniqueness;
  return Number(Math.min(9.0, Math.max(7.2, total)).toFixed(1));
}

function buildSongFeedback(selectedSong, preset, mode) {
  if (!selectedSong?.trim()) {
    return { songs: preset.songs, songFeedback: null };
  }

  const chosenSong = selectedSong.trim();
  const selectedMood = inferSongMood(chosenSong);
  const presetMood = inferPresetMood(preset);
  const fitsVibe = selectedMood === "unknown" || presetMood === "unknown" || selectedMood === presetMood;

  if (fitsVibe) {
    return {
      songs: [chosenSong, ...preset.songs.filter((song) => song.toLowerCase() !== chosenSong.toLowerCase())].slice(0, 3),
      songFeedback: {
        providedSong: chosenSong,
        fitsVibe: true,
        message:
          mode === "roast"
            ? `${chosenSong} works — annoyingly good call.`
            : `${chosenSong} fits — same lane, same mood.`,
      },
    };
  }

  return {
    songs: preset.songs,
    songFeedback: {
      providedSong: chosenSong,
      fitsVibe: false,
      message:
        mode === "roast"
          ? `${chosenSong} is doing too much — these picks fit the photo better.`
          : `${chosenSong} feels off here — these fit the photo better.`,
    },
  };
}

function buildShareText({ vibe, setting, lighting, rating, confidence, songs, captions, highlightLine }) {
  return [
    `Vibe: ${vibe}`,
    `Setting: ${setting}`,
    `Lighting: ${lighting}`,
    `Rating: ${rating}/10`,
    `Confidence: ${confidence}%`,
    `Top Song: ${songs[0]}`,
    `Caption: ${captions[0]}`,
    `Highlight: ${highlightLine}`,
  ].join("\n");
}

function normalizeCaptions(captions, mode) {
  const genericCaptions = new Set(["caught a vibe", "just enough", "good vibes only"]);
  const cleaned = [];

  captions.forEach((caption, index) => {
    const trimmed = caption.trim();
    if (!trimmed) {
      return;
    }

    if (!genericCaptions.has(trimmed.toLowerCase()) && !cleaned.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      cleaned.push(trimmed);
    }
  });

  const defaults = ANALYSIS_PRESETS[0].captions[mode] || ANALYSIS_PRESETS[0].captions.normal;
  defaults.forEach((caption) => {
    if (cleaned.length < 2 && !cleaned.some((item) => item.toLowerCase() === caption.toLowerCase())) {
      cleaned.push(caption);
    }
  });

  return cleaned.slice(0, 2);
}

export async function createMockAnalysis({ file, mode, selectedSong }) {
  const imageSignals = await getImageSignals(file);
  const preset = pickPreset(file, imageSignals);
  const seed = hashString(`${file.name}-${mode}-${selectedSong || ""}`);
  const ratingBreakdown = tweakBreakdown(preset.ratingBreakdown, seed);
  const rating = totalRating(ratingBreakdown);
  const highlightLine = buildHighlightLine(rating);
  const { songs, songFeedback } = buildSongFeedback(selectedSong, preset, mode);
  const captions = normalizeCaptions(preset.captions[mode] || preset.captions.normal, mode);

  const result = {
    setting: preset.setting,
    lighting: preset.lighting,
    vibe: preset.vibe[mode] || preset.vibe.normal,
    rating,
    confidence: preset.confidence,
    ratingBreakdown,
    songs,
    captions,
    improvements: preset.improvements,
    highlightLine,
    songFeedback,
  };

  result.shareText = buildShareText(result);

  await new Promise((resolve) => window.setTimeout(resolve, 1200));
  return result;
}