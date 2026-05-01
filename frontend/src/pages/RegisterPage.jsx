import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="app-shell" style={{ display: "grid", placeItems: "center", padding: 20 }}>
      <div className="card" style={{ width: "min(500px, 95vw)", padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Create your email account</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <input className="input" placeholder="Full name" />
          <input className="input" placeholder="Desired email (example: yourname@demetrimahdi.com)" />
          <input className="input" placeholder="Password" type="password" />
          <input className="input" placeholder="Confirm password" type="password" />
          <button className="btn primary" onClick={() => navigate("/mail")}>Create account (UI only)</button>
        </div>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>Already registered? <Link to="/login" style={{ color: "var(--primary)" }}>Back to login</Link></p>
      </div>
    </div>
  );
}
