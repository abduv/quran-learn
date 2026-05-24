import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PartyPopper } from "lucide-react";

export default function ResultsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();
  const score = Number(sp.get("s") ?? 0);
  const total = Number(sp.get("t") ?? 0);
  const pct = total ? Math.round((score / total) * 100) : 0;

  return (
    <div className="max-w-md mx-auto px-6 py-10 w-full text-center">
      <div className="card">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-4xl bg-sun-300 grid place-items-center shadow-kid">
            <PartyPopper size={36} />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold mb-2">{t("results.title")}</h1>
        <p className="text-ink-500 mb-4">
          {t("results.scored", { score, total })}
        </p>
        <div className="text-5xl font-extrabold text-mint-700 mb-6">
          {t("results.percent", { p: pct })}
        </div>
        <div className="flex gap-3 justify-center">
          <Link to={`/lesson/${id}`} className="btn-ghost">
            {t("results.again")}
          </Link>
          <Link to="/" className="btn-primary">
            {t("results.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
