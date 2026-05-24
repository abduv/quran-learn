import type { ReactElement } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import LessonPage from "./pages/LessonPage";
import ResultsPage from "./pages/ResultsPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminLessonEdit from "./pages/admin/AdminLessonEdit";
import AdminStats from "./pages/admin/AdminStats";
import { useTranslation } from "react-i18next";

function RequireUser({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  const { t } = useTranslation();
  if (loading)
    return <div className="p-10 text-center text-ink-500">{t("common.loading")}</div>;
  if (!user) return <Navigate to="/auth" replace state={{ from: loc }} />;
  return children;
}

function UserShell({ children }: { children: ReactElement }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminLessons />} />
            <Route path="lessons/:id" element={<AdminLessonEdit />} />
            <Route path="stats" element={<AdminStats />} />
          </Route>

          <Route
            path="/"
            element={
              <RequireUser>
                <UserShell>
                  <Dashboard />
                </UserShell>
              </RequireUser>
            }
          />
          <Route
            path="/lesson/:id"
            element={
              <RequireUser>
                <UserShell>
                  <LessonPage />
                </UserShell>
              </RequireUser>
            }
          />
          <Route
            path="/results/:id"
            element={
              <RequireUser>
                <UserShell>
                  <ResultsPage />
                </UserShell>
              </RequireUser>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
