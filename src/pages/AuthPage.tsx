import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { firebaseReady } from "../lib/firebase";

export default function AuthPage() {
  const { t } = useTranslation();
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") await signInEmail(email, password);
      else await signUpEmail(email, password);
      nav("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.errorGeneric");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setError(null);
    setLoading(true);
    try {
      await signInGoogle();
      nav("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.errorGeneric");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="card w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-3xl bg-sun-300 grid place-items-center shadow-kid">
            <Sparkles size={28} />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-center mb-1">
          {mode === "login" ? t("auth.loginTitle") : t("auth.signupTitle")}
        </h1>
        <p className="text-center text-ink-500 mb-6">{t("app.tagline")}</p>

        {!firebaseReady && (
          <div className="mb-4 text-sm bg-sun-100 border-2 border-sun-300 rounded-2xl p-3">
            Firebase env vars are missing — set them in <code>.env.local</code>.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              type="email"
              required
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-11"
            />
          </div>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-11"
            />
          </div>

          {error && (
            <p className="text-sm text-berry-500 bg-berry-300/20 rounded-2xl px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {mode === "login" ? t("auth.login") : t("auth.signup")}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2 text-ink-500 text-sm">
          <div className="flex-1 h-px bg-ink-800/10" />
          <span>or</span>
          <div className="flex-1 h-px bg-ink-800/10" />
        </div>

        <button
          type="button"
          onClick={google}
          disabled={loading}
          className="btn-sky w-full"
        >
          {t("auth.google")}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full mt-4 text-sm text-ink-500 hover:text-ink-800"
        >
          {mode === "login" ? t("auth.switchToSignup") : t("auth.switchToLogin")}
        </button>
      </div>
    </div>
  );
}
