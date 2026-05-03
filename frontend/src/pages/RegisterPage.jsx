import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSun, FiMoon, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const rules = {
    length: form.password.length >= 8,
    upperLower: /[a-z]/.test(form.password) && /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
    match: form.password.length > 0 && form.password === form.confirm,
  };
  const allRulesPass = Object.values(rules).every(Boolean);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!allRulesPass) {
      setError("Please meet all password requirements.");
      return;
    }
    if (!agree) {
      setError("Please accept the terms to continue.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        keepSignedIn: true,
      });
      navigate("/mail", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed.");
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
            Join the <span className="grad-text">smarter</span> inbox.
          </h1>
          <p className="login-sub">
            Create your account in under a minute. Every email you receive will
            be scanned for phishing and sorted by category — automatically.
          </p>
          <ul className="login-features">
            <li><span className="login-feat-dot" /> Free for students</li>
            <li><span className="login-feat-dot" /> No ads, ever</li>
            <li><span className="login-feat-dot" /> Your data stays yours</li>
          </ul>
        </div>
        <div className="login-brand-glow" aria-hidden="true" />
      </aside>

      <main className="login-form-wrap">
        <div className="login-form-inner">
          <header className="login-form-header">
            <h2>Create account</h2>
            <p>Set up your inbox in a couple of clicks.</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span>Full name</span>
              <input
                type="text" className="input" value={form.name}
                onChange={update("name")} placeholder="Demetri Habib"
                autoComplete="name" autoFocus disabled={loading}
              />
            </label>

            <label className="login-field">
              <span>Email address</span>
              <input
                type="email" className="input" value={form.email}
                onChange={update("email")} placeholder="you@demetriandmahdi.online"
                autoComplete="email" disabled={loading}
              />
            </label>

            <label className="login-field">
              <span>Phone number <span className="login-optional">(optional)</span></span>
              <input
                type="tel" className="input" value={form.phone}
                onChange={update("phone")} placeholder="+961 71 234 567"
                autoComplete="tel" disabled={loading}
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="login-password-wrap">
                <input
                  type={showPw ? "text" : "password"} className="input"
                  value={form.password} onChange={update("password")}
                  placeholder="At least 8 characters"
                  autoComplete="new-password" disabled={loading}
                />
                <button type="button" className="login-eye-btn"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"} tabIndex={-1}>
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </label>

            <label className="login-field">
              <span>Confirm password</span>
              <div className="login-password-wrap">
                <input
                  type={showConfirm ? "text" : "password"} className="input"
                  value={form.confirm} onChange={update("confirm")}
                  placeholder="Type it again"
                  autoComplete="new-password" disabled={loading}
                />
                <button type="button" className="login-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"} tabIndex={-1}>
                  {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </label>

            {form.password.length > 0 && (
              <ul className="pw-rules">
                <Rule ok={rules.length} text="At least 8 characters" />
                <Rule ok={rules.upperLower} text="Upper and lowercase letters" />
                <Rule ok={rules.number} text="At least one number" />
                <Rule ok={rules.match} text="Passwords match" />
              </ul>
            )}

            <label className="login-checkbox">
              <input
                type="checkbox" checked={agree}
                onChange={(e) => setAgree(e.target.checked)} disabled={loading}
              />
              <span>
                I agree to the <Link to="/terms" className="login-tiny-link">Terms</Link>{" "}
                and <Link to="/privacy" className="login-tiny-link">Privacy Policy</Link>
              </span>
            </label>

            {error && <div className="login-error" role="alert">{error}</div>}

            <button type="submit" className="btn primary login-submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="login-foot">
            Already have an account?{" "}
            <Link to="/login" className="login-foot-link">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Rule({ ok, text }) {
  return (
    <li className={`pw-rule ${ok ? "ok" : ""}`}>
      <span className="pw-rule-icon">
        {ok ? <FiCheck size={14} /> : <FiX size={14} />}
      </span>
      <span>{text}</span>
    </li>
  );
}
