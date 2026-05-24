import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3, BookOpen, LogOut } from "lucide-react";
import AdminGate from "./AdminGate";
import { logoutAdmin } from "../../lib/adminAuth";
import LangSwitch from "../../components/LangSwitch";

export default function AdminLayout() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const tab = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold transition ${
      isActive ? "bg-ink-800 text-white" : "bg-white text-ink-800 shadow-kid"
    }`;
  return (
    <AdminGate>
      <div className="max-w-6xl mx-auto px-6 py-6 w-full">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-extrabold">{t("admin.title")}</h1>
          <div className="flex items-center gap-2">
            <LangSwitch />
            <button
              type="button"
              onClick={() => {
                logoutAdmin();
                nav("/");
              }}
              className="btn-ghost"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <nav className="flex gap-2 mb-6 flex-wrap">
          <NavLink to="/admin" end className={tab}>
            <BookOpen size={18} /> {t("admin.lessons")}
          </NavLink>
          <NavLink to="/admin/stats" className={tab}>
            <BarChart3 size={18} /> {t("admin.stats")}
          </NavLink>
        </nav>
        <Outlet />
      </div>
    </AdminGate>
  );
}
