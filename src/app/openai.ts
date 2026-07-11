import type { QuizQuestion, VocabWord } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-5.6-sol";

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!key || key.includes("your-key-here")) {
    throw new Error("Mungon çelësi i OpenAI. Shto VITE_OPENAI_API_KEY në skedarin .env dhe ristarto serverin.");
  }
  return key;
}

async function chat(
  system: string,
  user: string,
  options?: { json?: boolean; temperature?: number }
): Promise<string> {
  // gpt-5.6 family only supports default temperature (1) — omit custom values
  const supportsCustomTemp = !MODEL.startsWith("gpt-5.6");
  const body: Record<string, unknown> = {
    model: MODEL,
    ...(supportsCustomTemp
      ? { temperature: options?.temperature ?? 0.4 }
      : {}),
    ...(options?.json ? { response_format: { type: "json_object" } } : {}),
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } })?.error?.message || res.statusText;
    throw new Error(`OpenAI: ${msg}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Përgjigja e AI ishte e zbrazët.");
  }
  return content.trim();
}

export interface AdaptMaterialOptions {
  text: string;
  title: string;
  subject: string;
  level: number; // 1 easy, 2 medium, 3 advanced
  length: string;
  numQuestions: number;
  includeSummary: boolean;
  includeKeyPoints: boolean;
  includeVocab: boolean;
  includeQuiz: boolean;
  includeTeacherNotes: boolean;
  includeTranslation: boolean;
  /** Generate illustration scene prompts for educational images. */
  includeVisualizations?: boolean;
  /** Pedagogical hints from student learning profiles (no diagnoses). */
  learnerHints?: string[];
}

export interface AdaptedMaterial {
  simplifiedText: string;
  summary: string;
  keyPoints: string[];
  vocabulary: VocabWord[];
  quiz: QuizQuestion[];
  teacherNotes: string;
  translation?: string;
  /** Short English scene prompts for DALL·E (when visualizations enabled). */
  visualPrompts?: string[];
}

const levelGuide: Record<number, string> = {
  1: "thjeshtësim i lehtë për nxënës me vështirësi leximi (fjali të shkurtra, fjalor bazë)",
  2: "thjeshtësim mesatar, i qartë dhe i kuptueshëm për klasën e mesme",
  3: "adaptim i avancuar: ruaj më shumë detaje, por mbaje gjuhën të qartë",
};

export async function adaptMaterialWithAI(opts: AdaptMaterialOptions): Promise<AdaptedMaterial> {
  const system = `Je një asistent pedagogjik për platformën MësoLehtë AI në Shqipëri/Kosovë.
Përgjigju GJITHMONË në shqip.
Kthen VETËM JSON të vlefshëm sipas skemës së kërkuar.
Mos shto markdown, komente apo tekst jashtë JSON.`;

  const user = `Adapto këtë material mësimor për nxënës.

Titulli: ${opts.title}
Lënda: ${opts.subject}
Niveli i thjeshtësimit: ${levelGuide[opts.level] ?? levelGuide[2]}
Gjatësia e dëshiruar: ${opts.length}
Numri i pyetjeve të kuizit: ${opts.numQuestions}
${
  opts.learnerHints?.length
    ? `\nUdhëzime nga profili mësimor i klasës (pedagogjike, JO diagnoza):\n- ${opts.learnerHints.join("\n- ")}\nPërshtat tekstin, fjalorin dhe kuizin sipas këtyre nevojave.\n`
    : ""
}
Teksti origjinal:
"""
${opts.text.slice(0, 12000)}
"""

Kthe JSON me këto fusha:
{
  "simplifiedText": "teksti i plotë i thjeshtësuar në shqip",
  "summary": ${opts.includeSummary ? '"përmbledhje e shkurtër (2-4 fjali)"' : '""'},
  "keyPoints": ${opts.includeKeyPoints ? '["pikë kryesore 1", "pikë kryesore 2", "..."] (3-6 pika)' : "[]"},
  "vocabulary": ${opts.includeVocab ? `[{
    "word": "fjala",
    "definition": "përkufizim i thjeshtë",
    "synonym": "sinonimi",
    "example": "shembull në fjali",
    "translation": "përkthim i shkurtër në anglisht"
  }] (5-8 fjalë të vështira nga teksti)` : "[]"},
  "quiz": ${opts.includeQuiz ? `[{
    "id": "q1",
    "type": "multiple",
    "question": "pyetja",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "hint": "ndihmë e shkurtër",
    "feedback": "shpjegim pas përgjigjes"
  }] (saktësisht ${opts.numQuestions} pyetje; type mund të jetë multiple, yesno, short ose mainidea; për multiple correct është indeksi 0-based; për yesno options ["Po","Jo"] dhe correct 0 ose 1; për short correct është string)` : "[]"},
  "teacherNotes": ${opts.includeTeacherNotes ? '"shënime praktike për mësuesen"' : '""'},
  "translation": ${opts.includeTranslation ? '"full English translation of simplifiedText, clear and suitable for children, no Albanian leftover"' : '""'},
  "visualPrompts": ${opts.includeVisualizations ? '["English scene description 1 for a simple educational illustration, no text in image", "English scene description 2"] (exactly 2 short prompts about the main ideas)' : "[]"}
}`;

  const raw = await chat(system, user, { json: true, temperature: 0.35 });
  let parsed: Partial<AdaptedMaterial>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI nuk ktheu JSON të vlefshëm. Provo sërish.");
  }

  const quiz: QuizQuestion[] = Array.isArray(parsed.quiz)
    ? parsed.quiz.map((q, i) => ({
        id: q.id || `q-${i + 1}`,
        type: (q.type as QuizQuestion["type"]) || "multiple",
        question: q.question || `Pyetja ${i + 1}`,
        options: q.options,
        correct: q.correct ?? 0,
        hint: q.hint,
        feedback: q.feedback || "Kontrollo përgjigjen në tekst.",
      }))
    : [];

  const vocabulary: VocabWord[] = Array.isArray(parsed.vocabulary)
    ? parsed.vocabulary.map(v => ({
        word: v.word || "",
        definition: v.definition || "",
        synonym: v.synonym || "",
        example: v.example || "",
        translation: v.translation || "",
      })).filter(v => v.word)
    : [];

  const visualPrompts = Array.isArray((parsed as { visualPrompts?: unknown }).visualPrompts)
    ? ((parsed as { visualPrompts: unknown[] }).visualPrompts
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .map(p => p.trim())
        .slice(0, 2))
    : [];

  return {
    simplifiedText: parsed.simplifiedText?.trim() || opts.text,
    summary: opts.includeSummary ? (parsed.summary?.trim() || "") : "",
    keyPoints: opts.includeKeyPoints
      ? (Array.isArray(parsed.keyPoints) ? parsed.keyPoints.filter(Boolean) : [])
      : [],
    vocabulary: opts.includeVocab ? vocabulary : [],
    quiz: opts.includeQuiz ? quiz : [],
    teacherNotes: opts.includeTeacherNotes ? (parsed.teacherNotes?.trim() || "") : "",
    translation: opts.includeTranslation ? (parsed.translation?.trim() || undefined) : undefined,
    visualPrompts: opts.includeVisualizations ? visualPrompts : [],
  };
}

export async function explainSentenceWithAI(sentence: string, action?: string): Promise<string> {
  const actionHint =
    action === "Thjeshtëso"
      ? "Thjeshtëso fjalinë me fjalë më të lehta."
      : action === "Shpjego"
      ? "Shpjego kuptimin e fjalisë me gjuhë të thjeshtë."
      : action === "Shembull"
      ? "Jep një shembull të ngjashëm që e bën kuptimin më të qartë."
      : "Shpjego ose thjeshtëso tekstin e zgjedhur.";

  return chat(
    "Je mësues ndihmës për nxënës me vështirësi leximi. Përgjigju në shqip, shkurt dhe qartë (2-4 fjali).",
    `${actionHint}\n\nTeksti: """${sentence.slice(0, 2000)}"""`,
    { temperature: 0.4 }
  );
}

export async function explainWordWithAI(word: string): Promise<{
  definition: string;
  synonym: string;
  example: string;
}> {
  const raw = await chat(
    "Je mësues ndihmës. Përgjigju në shqip. Kthe vetëm JSON.",
    `Shpjego fjalën "${word}" për nxënës. JSON: {"definition":"...","synonym":"...","example":"..."}`,
    { json: true, temperature: 0.3 }
  );
  try {
    const parsed = JSON.parse(raw);
    return {
      definition: parsed.definition || `Shpjegim për "${word}".`,
      synonym: parsed.synonym || "",
      example: parsed.example || "",
    };
  } catch {
    return {
      definition: raw,
      synonym: "",
      example: "",
    };
  }
}

export async function translateWithAI(text: string, lang: string): Promise<string> {
  const target = lang.toLowerCase().startsWith("en") ? "English" : lang;
  return chat(
    "You are a translator for children's educational materials. Return ONLY the translated text, no explanations, no quotes, no markdown.",
    `Translate the following Albanian educational text into clear ${target} suitable for ages 8-12:\n\n${text.slice(0, 8000)}`,
    { temperature: 0.2 }
  );
}

/**
 * Generate spoken audio for English text via OpenAI TTS.
 */
export async function synthesizeEnglishSpeech(text: string): Promise<Blob> {
  const input = text.trim().slice(0, MAX_TTS_CHARS);
  if (!input) throw new Error("No text for audio.");

  const key = getApiKey();
  const tryRequest = async (body: Record<string, unknown>) => {
    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = (err as { error?: { message?: string } })?.error?.message || res.statusText;
      throw new Error(msg);
    }
    return res.blob();
  };

  try {
    return await tryRequest({
      model: "gpt-4o-mini-tts",
      voice: "nova",
      input,
      instructions:
        "Speak clear, natural American English at a calm educational pace suitable for children ages 8-12.",
    });
  } catch {
    return tryRequest({
      model: "tts-1",
      voice: "nova",
      input,
    });
  }
}

const TTS_URL = "https://api.openai.com/v1/audio/speech";
const MAX_TTS_CHARS = 3500;

/** Split long Albanian text into TTS-sized chunks (prefer sentence boundaries). */
export function chunkTextForTTS(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= MAX_TTS_CHARS) return [clean];

  const sentences = clean.split(/(?<=[.!?…])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length <= MAX_TTS_CHARS) {
      current = (current + " " + sentence).trim();
    } else {
      if (current) chunks.push(current);
      if (sentence.length <= MAX_TTS_CHARS) {
        current = sentence;
      } else {
        // Hard-split very long sentences
        for (let i = 0; i < sentence.length; i += MAX_TTS_CHARS) {
          chunks.push(sentence.slice(i, i + MAX_TTS_CHARS));
        }
        current = "";
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Generate spoken audio for Albanian text via OpenAI TTS.
 * Uses gpt-4o-mini-tts with Albanian instructions when available; falls back to tts-1.
 */
export async function synthesizeAlbanianSpeech(text: string): Promise<Blob> {
  const input = text.trim().slice(0, MAX_TTS_CHARS);
  if (!input) throw new Error("Nuk ka tekst për audio.");

  const key = getApiKey();
  const tryRequest = async (body: Record<string, unknown>) => {
    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = (err as { error?: { message?: string } })?.error?.message || res.statusText;
      throw new Error(msg);
    }
    return res.blob();
  };

  try {
    return await tryRequest({
      model: "gpt-4o-mini-tts",
      voice: "nova",
      input,
      instructions:
        "Speak in clear, natural Albanian (Shqip). Use correct Albanian pronunciation. Do not use an English accent. Read at a calm, educational pace suitable for children.",
    });
  } catch {
    // Fallback for accounts without gpt-4o-mini-tts
    return tryRequest({
      model: "tts-1",
      voice: "nova",
      input,
    });
  }
}

const IMAGES_URL = "https://api.openai.com/v1/images/generations";

/** Shrink image data URLs so materials fit in localStorage (~5MB). */
async function compressIllustrationDataUrl(
  dataUrl: string,
  maxSide = 768,
  quality = 0.7
): Promise<string> {
  if (!dataUrl.startsWith("data:image/") || typeof document === "undefined") {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Simple educational illustration for children (no text in image).
 * Uses gpt-image-1 (current Images API). Falls back to dall-e-3 URL mode.
 */
export async function generateEducationalIllustration(prompt: string): Promise<string> {
  const key = getApiKey();
  const safePrompt = `Simple educational illustration for children ages 8-12, clear and friendly, soft colors, no text, no letters, no words, no watermark. Scene: ${prompt.slice(0, 400)}`;

  const parseImage = (data: {
    data?: Array<{ b64_json?: string; url?: string }>;
  }): string => {
    const b64 = data?.data?.[0]?.b64_json;
    const url = data?.data?.[0]?.url;
    if (b64) return `data:image/png;base64,${b64}`;
    if (url) return url;
    throw new Error("Nuk u kthye figurë.");
  };

  const tryRequest = async (body: Record<string, unknown>) => {
    const res = await fetch(IMAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = (err as { error?: { message?: string } })?.error?.message || res.statusText;
      throw new Error(msg);
    }
    return parseImage(await res.json());
  };

  let raw: string;
  try {
    raw = await tryRequest({
      model: "gpt-image-1",
      prompt: safePrompt,
      n: 1,
      size: "1024x1024",
      quality: "low",
    });
  } catch (firstErr) {
    try {
      raw = await tryRequest({
        model: "dall-e-3",
        prompt: safePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
    } catch {
      const msg = firstErr instanceof Error ? firstErr.message : "Gjenerimi i figurës dështoi.";
      throw new Error(msg);
    }
  }

  return compressIllustrationDataUrl(raw);
}

