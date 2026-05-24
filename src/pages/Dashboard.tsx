import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, Play, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getUserAttempts, listLessons } from "../lib/data";
import type { Lesson, QuizAttempt } from "../lib/types";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = (i18n.resolvedLanguage ?? "kk") as "kk" | "ru";
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void Promise.all([listLessons(), getUserAttempts(user.uid)]).then(
      ([ls, ats]) => {
        if (!alive) return;
        setLessons(ls);
        setAttempts(ats);
        setLoading(false);
      },
    );
    return () => {
      alive = false;
    };
  }, [user]);

  const bestByLesson = useMemo(() => {
    const m = new Map<string, QuizAttempt>();
    for (const a of attempts) {
      const cur = m.get(a.lessonId);
      if (!cur || a.score / a.total > cur.score / cur.total) m.set(a.lessonId, a);
    }
    return m;
  }, [attempts]);

  const completed = bestByLesson.size;
  const total = lessons.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const greetingName = user?.displayName ?? user?.email?.split("@")[0] ?? "👋";

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 w-full">
      <div className="card mb-6 bg-gradient-to-br from-mint-100 to-sky-100">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
          {t("dashboard.hi", { name: greetingName })}
        </h1>
        <p className="text-ink-500 mb-4">{t("dashboard.yourProgress")}</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-mint-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-extrabold text-lg whitespace-nowrap">
            {t("dashboard.lessonsCompleted", { done: completed, total })}
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-ink-500">{t("common.loading")}</p>
      ) : lessons.length === 0 ? (
        <div className="card text-center text-ink-500">
          {t("dashboard.noLessons")}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {lessons.map((lesson, i) => {
            const best = bestByLesson.get(lesson.id);
            const done = !!best;
            return (
              <Link
                key={lesson.id}
                to={`/lesson/${lesson.id}`}
                className="card hover:-translate-y-0.5 transition relative group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl grid place-items-center shadow-kid ${
                      done ? "bg-mint-500 text-white" : "bg-sun-300"
                    }`}
                  >
                    {done ? <CheckCircle2 size={22} /> : <Play size={22} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-ink-500">
                      #{i + 1} {done && <span>· {t("dashboard.completed")}</span>}
                    </div>
                    <h3 className="font-extrabold text-lg leading-snug">
                      {lesson.title[lang]}
                    </h3>
                    {best && (
                      <div className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-sun-500">
                        <Star size={14} fill="currentColor" />
                        {t("dashboard.score", {
                          score: best.score,
                          total: best.total,
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
