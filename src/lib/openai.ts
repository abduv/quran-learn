import OpenAI from "openai";
import type { QuizQuestion } from "./types";

const KEY_STORAGE = "qln_openai_key";

export function getOpenAIKey(): string {
  return (
    localStorage.getItem(KEY_STORAGE) ||
    (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) ||
    ""
  );
}

export function setOpenAIKey(key: string) {
  if (key) localStorage.setItem(KEY_STORAGE, key);
  else localStorage.removeItem(KEY_STORAGE);
}

interface GenerateInput {
  title: { kk: string; ru: string };
  description: { kk: string; ru: string };
  numQuestions?: number;
}

interface GeneratedQuiz {
  questions: QuizQuestion[];
}

export async function generateQuiz(input: GenerateInput): Promise<GeneratedQuiz> {
  const key = getOpenAIKey();
  if (!key) throw new Error("OpenAI key is not set");

  const client = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
  const n = input.numQuestions ?? 5;

  const prompt = `You are creating a multiple-choice quiz for children (ages 6-12) learning the Quran. Generate ${n} kid-friendly questions in BOTH Kazakh (kk) and Russian (ru).

Lesson title (kk): ${input.title.kk}
Lesson title (ru): ${input.title.ru}
Lesson description (kk): ${input.description.kk}
Lesson description (ru): ${input.description.ru}

Return STRICT JSON of shape:
{"questions":[{"text":{"kk":"...","ru":"..."},"options":[{"kk":"...","ru":"..."},{"kk":"...","ru":"..."},{"kk":"...","ru":"..."},{"kk":"...","ru":"..."}],"correctIndex":0}]}

Rules: 4 options per question; exactly one correct; language simple; questions should be answerable from the description. Output ONLY JSON, no commentary.`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { questions: Array<Omit<QuizQuestion, "id">> };
  const questions: QuizQuestion[] = parsed.questions.map((q, i) => ({
    id: `q${Date.now()}_${i}`,
    text: q.text,
    options: q.options,
    correctIndex: q.correctIndex,
  }));
  return { questions };
}
