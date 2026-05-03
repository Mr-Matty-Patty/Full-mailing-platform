import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap protected routes. If the user isn't logged in, redirect to /login.
 * Remembers where they were going so we can bounce them back after login.
 */
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

/**
 * Wrap auth pages (login, register). If the user is already logged in,
 * redirect them to the inbox — they don't need to see these.
 */
export function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <FullPageLoader />;
  }
  if (user) {
    return <Navigate to="/mail" replace />;
  }
  return children;
}

function FullPageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
        color: "var(--muted)",
        fontSize: 14,
      }}
    >
      <div className="auth-spinner" aria-label="Loading" />
    </div>
  );
}
