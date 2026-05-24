import { useTranslation } from "react-i18next";

export default function LangSwitch() {
  const { i18n } = useTranslation();
  const set = (lng: "kk" | "ru") => {
    void i18n.changeLanguage(lng);
  };
  const cur = i18n.resolvedLanguage ?? "kk";
  const baseBtn =
    "px-3 py-1.5 rounded-full text-sm font-bold transition border-2";
  return (
    <div className="inline-flex items-center gap-1 bg-white rounded-full p-1 shadow-kid">
      <button
        type="button"
        onClick={() => set("kk")}
        className={`${baseBtn} ${cur === "kk" ? "bg-mint-500 text-white border-mint-500" : "bg-white text-ink-800 border-transparent"}`}
      >
        ҚАЗ
      </button>
      <button
        type="button"
        onClick={() => set("ru")}
        className={`${baseBtn} ${cur === "ru" ? "bg-mint-500 text-white border-mint-500" : "bg-white text-ink-800 border-transparent"}`}
      >
        РУС
      </button>
    </div>
  );
}
