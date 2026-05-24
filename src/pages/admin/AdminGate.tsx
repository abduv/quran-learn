import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAdminOk, promptAdmin } from "../../lib/adminAuth";

export default function AdminGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [ok, setOk] = useState<boolean>(() => isAdminOk());

  useEffect(() => {
    if (ok) return;
    const granted = promptAdmin();
    if (granted) setOk(true);
    else nav("/", { replace: true });
  }, [ok, nav]);

  if (!ok)
    return (
      <div className="max-w-md mx-auto px-6 py-10 text-center text-ink-500">
        {t("admin.loginPrompt")}
      </div>
    );
  return <>{children}</>;
}
