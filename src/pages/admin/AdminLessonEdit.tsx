import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ref as sref, uploadBytes } from "firebase/storage";
import { Save, Upload, Sparkles, Plus, Trash2 } from "lucide-react";
import { storage } from "../../lib/firebase";
import {
  createLesson,
  getLesson,
  getQuizForLesson,
  updateLesson,
  upsertQuiz,
} from "../../lib/data";
import type { Lesson, QuizQuestion, VideoSource } from "../../lib/types";
import { generateQuiz, getOpenAIKey, setOpenAIKey } from "../../lib/openai";

const emptyQ = (): QuizQuestion => ({
  id: `q${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  text: { kk: "", ru: "" },
  options: [
    { kk: "", ru: "" },
    { kk: "", ru: "" },
    { kk: "", ru: "" },
    { kk: "", ru: "" },
  ],
  correctIndex: 0,
});

export default function AdminLessonEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const { t } = useTranslation();
  const nav = useNavigate();

  const [order, setOrder] = useState(1);
  const [titleKk, setTitleKk] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [descKk, setDescKk] = useState("");
  const [descRu, setDescRu] = useState("");
  const [videoMode, setVideoMode] = useState<"youtube" | "upload">("youtube");
  const [ytUrl, setYtUrl] = useState("");
  const [storagePath, setStoragePath] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizMode, setQuizMode] = useState<"manual" | "agentic">("manual");
  const [generating, setGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(getOpenAIKey());

  const [savedLessonId, setSavedLessonId] = useState<string | null>(
    isNew ? null : (id ?? null),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew || !id) return;
    let alive = true;
    void Promise.all([getLesson(id), getQuizForLesson(id)]).then(([l, q]) => {
      if (!alive || !l) return;
      setOrder(l.order);
      setTitleKk(l.title.kk);
      setTitleRu(l.title.ru);
      setDescKk(l.description.kk);
      setDescRu(l.description.ru);
      if (l.video?.kind === "youtube") {
        setVideoMode("youtube");
        setYtUrl(l.video.url);
      } else if (l.video?.kind === "storage") {
        setVideoMode("upload");
        setStoragePath(l.video.path);
      }
      if (q) setQuestions(q.questions);
    });
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const path = `lessons/${Date.now()}_${file.name}`;
      await uploadBytes(sref(storage, path), file);
      setStoragePath(path);
    } finally {
      setUploading(false);
    }
  }

  async function saveLesson(): Promise<string> {
    const video: VideoSource | undefined =
      videoMode === "youtube" && ytUrl
        ? { kind: "youtube", url: ytUrl }
        : videoMode === "upload" && storagePath
          ? { kind: "storage", path: storagePath }
          : undefined;
    const payload: Omit<Lesson, "id" | "createdAt"> = {
      order,
      title: { kk: titleKk, ru: titleRu },
      description: { kk: descKk, ru: descRu },
      ...(video ? { video } : {}),
    };
    if (savedLessonId) {
      await updateLesson(savedLessonId, payload);
      return savedLessonId;
    }
    const newId = await createLesson(payload);
    setSavedLessonId(newId);
    return newId;
  }

  async function onSaveAll() {
    setSaving(true);
    try {
      const lessonId = await saveLesson();
      if (questions.length > 0) {
        await upsertQuiz({
          lessonId,
          questions,
          createdBy: quizMode,
        });
      }
      nav("/admin");
    } finally {
      setSaving(false);
    }
  }

  async function onGenerate() {
    setGenerating(true);
    try {
      const result = await generateQuiz({
        title: { kk: titleKk, ru: titleRu },
        description: { kk: descKk, ru: descRu },
      });
      setQuestions(result.questions);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-ink-500">Order</span>
            <input
              type="number"
              className="input mt-1"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value) || 1)}
            />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-ink-500">
              {t("admin.titleKk")}
            </span>
            <input
              className="input mt-1"
              value={titleKk}
              onChange={(e) => setTitleKk(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink-500">
              {t("admin.titleRu")}
            </span>
            <input
              className="input mt-1"
              value={titleRu}
              onChange={(e) => setTitleRu(e.target.value)}
            />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-ink-500">
              {t("admin.descKk")}
            </span>
            <textarea
              rows={5}
              className="input mt-1"
              value={descKk}
              onChange={(e) => setDescKk(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink-500">
              {t("admin.descRu")}
            </span>
            <textarea
              rows={5}
              className="input mt-1"
              value={descRu}
              onChange={(e) => setDescRu(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="card space-y-3">
        <h3 className="font-extrabold">{t("admin.videoSection")}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVideoMode("youtube")}
            className={
              videoMode === "youtube"
                ? "btn-primary"
                : "btn-ghost"
            }
          >
            YouTube
          </button>
          <button
            type="button"
            onClick={() => setVideoMode("upload")}
            className={
              videoMode === "upload" ? "btn-primary" : "btn-ghost"
            }
          >
            Upload
          </button>
        </div>
        {videoMode === "youtube" ? (
          <input
            className="input"
            placeholder="https://youtube.com/watch?v=..."
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
          />
        ) : (
          <div className="space-y-2">
            <label className="btn-sky cursor-pointer inline-flex">
              <Upload size={18} />
              {uploading ? "..." : t("admin.videoUpload")}
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
            </label>
            {storagePath && (
              <div className="text-sm text-ink-500 break-all">{storagePath}</div>
            )}
          </div>
        )}
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-extrabold mr-auto">{t("admin.quiz")}</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setQuizMode("manual")}
              className={
                quizMode === "manual" ? "btn-primary" : "btn-ghost"
              }
            >
              {t("admin.manualMode")}
            </button>
            <button
              type="button"
              onClick={() => setQuizMode("agentic")}
              className={
                quizMode === "agentic" ? "btn-primary" : "btn-ghost"
              }
            >
              <Sparkles size={16} /> {t("admin.agenticMode")}
            </button>
          </div>
        </div>

        {quizMode === "agentic" && (
          <div className="rounded-2xl bg-sun-100 border-2 border-sun-300 p-4 space-y-2">
            <label className="block text-sm font-bold">
              {t("admin.openaiKey")}
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                className="input flex-1"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setOpenAIKey(apiKey)}
                className="btn-ghost"
              >
                {t("admin.saveKey")}
              </button>
            </div>
            <p className="text-xs text-ink-500">{t("admin.openaiKeyHint")}</p>
            <button
              type="button"
              disabled={generating || !titleKk || !descKk}
              onClick={() => void onGenerate()}
              className="btn-sun"
            >
              <Sparkles size={16} />
              {generating ? t("admin.generating") : t("admin.generate")}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-3xl border-2 border-ink-800/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-ink-500">Q{qi + 1}</div>
                <button
                  type="button"
                  onClick={() =>
                    setQuestions(questions.filter((_, i) => i !== qi))
                  }
                  className="text-berry-500"
                  aria-label="remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mb-3">
                <input
                  className="input"
                  placeholder={`${t("admin.questionText")} (kk)`}
                  value={q.text.kk}
                  onChange={(e) => {
                    const next = [...questions];
                    next[qi] = { ...q, text: { ...q.text, kk: e.target.value } };
                    setQuestions(next);
                  }}
                />
                <input
                  className="input"
                  placeholder={`${t("admin.questionText")} (ru)`}
                  value={q.text.ru}
                  onChange={(e) => {
                    const next = [...questions];
                    next[qi] = { ...q, text: { ...q.text, ru: e.target.value } };
                    setQuestions(next);
                  }}
                />
              </div>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctIndex === oi}
                    onChange={() => {
                      const next = [...questions];
                      next[qi] = { ...q, correctIndex: oi };
                      setQuestions(next);
                    }}
                    aria-label={t("admin.correct")}
                  />
                  <input
                    className="input flex-1"
                    placeholder={`${t("admin.option", { n: oi + 1 })} (kk)`}
                    value={opt.kk}
                    onChange={(e) => {
                      const next = [...questions];
                      const newOpts = [...q.options];
                      newOpts[oi] = { ...opt, kk: e.target.value };
                      next[qi] = { ...q, options: newOpts };
                      setQuestions(next);
                    }}
                  />
                  <input
                    className="input flex-1"
                    placeholder={`${t("admin.option", { n: oi + 1 })} (ru)`}
                    value={opt.ru}
                    onChange={(e) => {
                      const next = [...questions];
                      const newOpts = [...q.options];
                      newOpts[oi] = { ...opt, ru: e.target.value };
                      next[qi] = { ...q, options: newOpts };
                      setQuestions(next);
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setQuestions([...questions, emptyQ()])}
            className="btn-ghost"
          >
            <Plus size={16} /> {t("admin.addQuestion")}
          </button>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void onSaveAll()}
          disabled={saving || !titleKk || !titleRu}
          className="btn-primary"
        >
          <Save size={18} /> {t("admin.save")}
        </button>
      </div>
    </div>
  );
}
