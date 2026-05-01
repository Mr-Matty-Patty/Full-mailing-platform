import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState({
    desktopNotifications: true,
    suspiciousLinkWarning: true,
    autoMoveLikelyScam: false,
  });
  const update = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <div className="app-shell" style={{ padding: 20 }}>
      <div className="card" style={{ maxWidth: 860, margin: "0 auto", padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Settings</h2>
        <section className="card" style={{ padding: 14, marginBottom: 12 }}>
          <h4 style={{ marginTop: 0 }}>Appearance</h4>
          <p style={{ color: "var(--muted)" }}>Current theme: {theme}</p>
          <button className="btn primary" onClick={toggleTheme}>Toggle Theme</button>
        </section>
        <section className="card" style={{ padding: 14 }}>
          <h4 style={{ marginTop: 0 }}>Security and AI Spam (UI)</h4>
          <label style={{ display: "block", marginBottom: 8 }}><input type="checkbox" checked={prefs.suspiciousLinkWarning} onChange={(e) => update("suspiciousLinkWarning", e.target.checked)} /> Show suspicious-link warnings</label>
          <label style={{ display: "block", marginBottom: 8 }}><input type="checkbox" checked={prefs.autoMoveLikelyScam} onChange={(e) => update("autoMoveLikelyScam", e.target.checked)} /> Auto-move likely scams to Spam</label>
          <label style={{ display: "block", marginBottom: 8 }}><input type="checkbox" checked={prefs.desktopNotifications} onChange={(e) => update("desktopNotifications", e.target.checked)} /> Enable desktop notifications</label>
        </section>
        <div style={{ marginTop: 16 }}><Link to="/mail"><button className="btn">Back to Mail</button></Link></div>
      </div>
    </div>
  );
}
