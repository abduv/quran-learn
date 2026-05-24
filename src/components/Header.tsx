import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, BookOpen } from "lucide-react";
import LangSwitch from "./LangSwitch";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { t } = useTranslation();
  const { user, signOutUser } = useAuth();
  const nav = useNavigate();

  return (
    <header className="px-6 py-4 flex items-center justify-between gap-4 max-w-6xl mx-auto w-full">
      <Link to="/" className="flex items-center gap-2 text-ink-800">
        <span className="w-10 h-10 rounded-2xl bg-mint-500 text-white grid place-items-center shadow-kid">
          <BookOpen size={22} />
        </span>
        <span className="font-extrabold text-lg">{t("app.name")}</span>
      </Link>
      <div className="flex items-center gap-3">
        <LangSwitch />
        {user && (
          <button
            type="button"
            onClick={async () => {
              await signOutUser();
              nav("/auth");
            }}
            className="btn-ghost"
            aria-label={t("nav.signOut")}
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">{t("nav.signOut")}</span>
          </button>
        )}
      </div>
    </header>
  );
}
