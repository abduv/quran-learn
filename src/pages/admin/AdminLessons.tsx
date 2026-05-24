import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteLesson, listLessons } from "../../lib/data";
import type { Lesson } from "../../lib/types";

export default function AdminLessons() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage ?? "kk") as "kk" | "ru";
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLessons(await listLessons());
    setLoading(false);
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function onDelete(id: string) {
    if (!window.confirm("Delete this lesson?")) return;
    await deleteLesson(id);
    void refresh();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Link to="/admin/lessons/new" className="btn-primary">
          <Plus size={18} /> {t("admin.newLesson")}
        </Link>
      </div>
      {loading ? (
        <p className="text-ink-500">{t("common.loading")}</p>
      ) : lessons.length === 0 ? (
        <div className="card text-center text-ink-500">
          {t("dashboard.noLessons")}
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((l, i) => (
            <div key={l.id} className="card flex items-center gap-4">
              <div className="w-10 h-10 grid place-items-center rounded-2xl bg-sky-100 font-extrabold text-ink-800">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-extrabold">{l.title[lang]}</div>
                <div className="text-sm text-ink-500 line-clamp-1">
                  {l.description[lang]}
                </div>
              </div>
              <Link
                to={`/admin/lessons/${l.id}`}
                className="btn-ghost"
                aria-label={t("admin.edit")}
              >
                <Pencil size={16} />
              </Link>
              <button
                type="button"
                onClick={() => void onDelete(l.id)}
                className="btn-ghost text-berry-500"
                aria-label={t("admin.delete")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
