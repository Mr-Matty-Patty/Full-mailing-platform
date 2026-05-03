import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MailAppPage from "./pages/MailAppPage";
import SettingsPage from "./pages/SettingsPage";
import { RequireAuth, RequireGuest } from "./components/RouteGuards";
import { useAuth } from "./context/AuthContext";

export default function App() {
  return (
    <>
      {/* Neon glow top line — visible across every route */}
      <div className="neon-top-line" aria-hidden="true" />

      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route
          path="/register"
          element={
            <RequireGuest>
              <RegisterPage />
            </RequireGuest>
          }
        />

        <Route
          path="/mail"
          element={
            <RequireAuth>
              <MailAppPage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />

        {/* Anything else → bounce based on auth state */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/mail" : "/login"} replace />;
}
