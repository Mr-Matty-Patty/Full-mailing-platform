import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="app-shell" style={{ display: "grid", placeItems: "center", padding: 20 }}>
      <div className="card" style={{ width: "min(420px, 95vw)", padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Login to Demetri and Mahdi</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <input className="input" placeholder="Email address" />
          <input className="input" placeholder="Password" type="password" />
          <button className="btn primary" onClick={() => navigate("/mail")}>Login</button>
        </div>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>No account? <Link to="/register" style={{ color: "var(--primary)" }}>Create one</Link></p>
      </div>
    </div>
  );
}
