import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllAttempts, getAllUsers, listLessons } from "../../lib/data";
import type { Lesson, QuizAttempt, UserDoc } from "../../lib/types";

interface Row {
  user: UserDoc;
  attempts: number;
  avg: number;
  completed: number;
}

export default function AdminStats() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void Promise.all([getAllUsers(), getAllAttempts(), listLessons()]).then(
      ([u, a, l]) => {
        if (!alive) return;
        setUsers(u);
        setAttempts(a);
        setLessons(l);
        setLoading(false);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  const rows: Row[] = useMemo(() => {
    const totalLessons = lessons.length || 1;
    return users.map((u) => {
      const mine = attempts.filter((a) => a.userId === u.uid);
      const best = new Map<string, number>();
      let sumPct = 0;
      for (const a of mine) {
        const pct = a.score / a.total;
        const cur = best.get(a.lessonId) ?? -1;
        if (pct > cur) best.set(a.lessonId, pct);
        sumPct += pct;
      }
      const avg = mine.length ? Math.round((sumPct / mine.length) * 100) : 0;
      const completed = Math.round((best.size / totalLessons) * 100);
      return { user: u, attempts: mine.length, avg, completed };
    });
  }, [users, attempts, lessons]);

  return (
    <div className="card overflow-x-auto">
      <h2 className="font-extrabold mb-4">{t("admin.statsHeader")}</h2>
      {loading ? (
        <p className="text-ink-500">{t("common.loading")}</p>
      ) : rows.length === 0 ? (
        <p className="text-ink-500">{t("admin.noUsers")}</p>
      ) : (
        <table className="w-full text-left">
          <thead className="text-sm text-ink-500">
            <tr>
              <th className="py-2 pr-3">{t("admin.user")}</th>
              <th className="py-2 pr-3">{t("admin.attempts")}</th>
              <th className="py-2 pr-3">{t("admin.avgScore")}</th>
              <th className="py-2 pr-3">{t("admin.completion")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user.uid} className="border-t border-ink-800/10">
                <td className="py-3 pr-3 font-bold">
                  {r.user.displayName ?? r.user.email ?? r.user.uid}
                </td>
                <td className="py-3 pr-3">{r.attempts}</td>
                <td className="py-3 pr-3">{r.avg}%</td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-ink-800/10 rounded-full overflow-hidden max-w-[180px]">
                      <div
                        className="h-full bg-mint-500"
                        style={{ width: `${r.completed}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-10">{r.completed}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
