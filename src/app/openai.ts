import type { QuizQuestion, VocabWord } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

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
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: options?.temperature ?? 0.4,
      ...(options?.json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
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
}

export interface AdaptedMaterial {
  simplifiedText: string;
  summary: string;
  keyPoints: string[];
  vocabulary: VocabWord[];
  quiz: QuizQuestion[];
  teacherNotes: string;
  translation?: string;
}

const levelGuide: Record<number, string> = {
  1: "thjeshtësim i lehtë për nxënës me vështirësi leximi (fjali të shkurtra, fjalor bazë)",
  2: "thjeshtësim mesatar, i qartë dhe i kuptueshëm për klasën e mesme",
  3: "adaptim i avancuar: ruaj më shumë detaje, por mbaje gjuhën të qartë",
};

export async function adaptMaterialWithAI(opts: AdaptMaterialOptions): Promise<AdaptedMaterial> {
  const system = `Je një asistent pedagogjik për platformën LexoLehtë AI në Shqipëri/Kosovë.
Përgjigju GJITHMONË në shqip.
Kthen VETËM JSON të vlefshëm sipas skemës së kërkuar.
Mos shto markdown, komente apo tekst jashtë JSON.`;

  const user = `Adapto këtë material mësimor për nxënës.

Titulli: ${opts.title}
Lënda: ${opts.subject}
Niveli i thjeshtësimit: ${levelGuide[opts.level] ?? levelGuide[2]}
Gjatësia e dëshiruar: ${opts.length}
Numri i pyetjeve të kuizit: ${opts.numQuestions}

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
  "translation": ${opts.includeTranslation ? '"përkthim i shkurtër i përmbledhjes në anglisht"' : '""'}
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

  return {
    simplifiedText: parsed.simplifiedText?.trim() || opts.text,
    summary: parsed.summary?.trim() || "",
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.filter(Boolean) : [],
    vocabulary,
    quiz,
    teacherNotes: parsed.teacherNotes?.trim() || "",
    translation: parsed.translation?.trim() || undefined,
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
  return chat(
    "Je përkthyes. Kthe vetëm tekstin e përkthyer, pa shpjegime.",
    `Përkthe në ${lang}:\n\n${text.slice(0, 4000)}`,
    { temperature: 0.2 }
  );
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

