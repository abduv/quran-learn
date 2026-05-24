import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getLesson, getQuizForLesson, saveAttempt } from "../lib/data";
import type { Lesson, Quiz } from "../lib/types";
import VideoPlayer from "../components/VideoPlayer";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage ?? "kk") as "kk" | "ru";
  const { user } = useAuth();
  const nav = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [phase, setPhase] = useState<"watch" | "quiz">("watch");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    void Promise.all([getLesson(id), getQuizForLesson(id)]).then(([l, q]) => {
      if (!alive) return;
      setLesson(l);
      setQuiz(q);
      setAnswers(q ? new Array(q.questions.length).fill(-1) : []);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (!lesson)
    return (
      <div className="max-w-3xl mx-auto px-6 py-6">{t("common.loading")}</div>
    );

  async function finish(final: number[]) {
    if (!user || !quiz || !lesson) return;
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (final[i] === q.correctIndex) score += 1;
    });
    await saveAttempt({
      userId: user.uid,
      lessonId: lesson.id,
      quizId: quiz.id,
      answers: final,
      score,
      total: quiz.questions.length,
      completedAt: Date.now(),
    });
    nav(`/results/${lesson.id}?s=${score}&t=${quiz.questions.length}`);
  }

  if (phase === "quiz" && quiz) {
    const q = quiz.questions[step];
    const total = quiz.questions.length;
    return (
      <div className="max-w-2xl mx-auto px-6 py-6 w-full">
        <div className="text-ink-500 mb-2 font-bold">
          {t("lesson.question", { n: step + 1, total })}
        </div>
        <div className="card">
          <h2 className="text-xl font-extrabold mb-5">{q.text[lang]}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const selected = answers[step] === i;
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    const next = [...answers];
                    next[step] = i;
                    setAnswers(next);
                  }}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-bold transition ${
                    selected
                      ? "bg-mint-500 text-white border-mint-500"
                      : "bg-white text-ink-800 border-ink-800/10 hover:border-mint-300"
                  }`}
                >
                  {opt[lang]}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={answers[step] === -1}
              onClick={() => {
                if (step < total - 1) setStep(step + 1);
                else void finish(answers);
              }}
              className="btn-primary"
            >
              {step < total - 1 ? t("lesson.next") : t("lesson.finish")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 w-full">
      <Link to="/" className="inline-flex items-center gap-1 text-ink-500 mb-4">
        <ArrowLeft size={18} /> {t("lesson.back")}
      </Link>
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-4">
        {lesson.title[lang]}
      </h1>

      {lesson.video && (
        <div className="mb-6">
          <VideoPlayer source={lesson.video} />
        </div>
      )}

      <div className="card mb-6">
        <h3 className="font-extrabold mb-2">{t("lesson.description")}</h3>
        <p className="whitespace-pre-wrap text-ink-800/90 leading-relaxed">
          {lesson.description[lang]}
        </p>
      </div>

      {quiz ? (
        <button
          type="button"
          onClick={() => setPhase("quiz")}
          className="btn-sun w-full text-lg"
        >
          <Play size={20} /> {t("lesson.startQuiz")}
        </button>
      ) : (
        <div className="card text-center text-ink-500">{t("lesson.noQuiz")}</div>
      )}
    </div>
  );
}
