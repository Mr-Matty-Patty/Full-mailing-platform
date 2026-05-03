import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiSun, FiMoon, FiEye, FiEyeOff } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/mail";
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await login({ email, password, keepSignedIn });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell app-shell">
      <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
      </button>

      <aside className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <div className="login-logo-mark">D&amp;M</div>
            <span className="login-logo-text">Demetri &amp; Mahdi</span>
          </div>
          <h1 className="login-headline">
            Mail that <span className="grad-text">thinks</span> before you click.
          </h1>
          <p className="login-sub">
            Every message is scanned by our AI in real time — phishing flagged,
            categories sorted, your inbox stays clean.
          </p>
          <ul className="login-features">
            <li><span className="login-feat-dot" /> Real-time phishing detection</li>
            <li><span className="login-feat-dot" /> Smart category sorting</li>
            <li><span className="login-feat-dot" /> End-to-end account control</li>
          </ul>
        </div>
        <div className="login-brand-glow" aria-hidden="true" />
      </aside>

      <main className="login-form-wrap">
        <div className="login-form-inner">
          <header className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your inbox.</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span>Email address</span>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@demetriandmahdi.online"
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </label>

            <label className="login-field">
              <span className="login-field-label-row">
                Password
                <Link to="/forgot" className="login-tiny-link">Forgot?</Link>
              </span>
              <div className="login-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </label>

            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                disabled={loading}
              />
              <span>Keep me signed in</span>
            </label>

            {error && <div className="login-error" role="alert">{error}</div>}

            <button type="submit" className="btn primary login-submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="login-foot">
            Don't have an account?{" "}
            <Link to="/register" className="login-foot-link">Create one</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
