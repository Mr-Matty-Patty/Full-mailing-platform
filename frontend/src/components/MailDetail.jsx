import { FaTrash, FaExclamationTriangle, FaUndo, FaArchive } from "react-icons/fa";
import StateView from "./StateView";

export default function MailDetail({ email, onMoveFolder }) {
  if (!email) return <section className="card detail-panel" style={{ padding: 8 }}><StateView type="empty" title="Select a message" subtitle="Use J/K to navigate." /></section>;

  const verdictColor = email.aiVerdict === "Likely Scam" ? "var(--danger)" : "var(--success)";

  return (
    <section className="card detail-panel" style={{ padding: 18 }}>
      <h3 style={{ marginTop: 0 }}>{email.subject}</h3>
      <p><strong>From:</strong> {email.from}</p>
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <span className="badge" style={{ color: verdictColor, borderColor: verdictColor }}>AI Verdict: {email.aiVerdict}</span>
        <span className="badge">Confidence: {email.aiConfidence}%</span>
      </div>
      <p style={{ lineHeight: 1.6 }}>{email.body}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
        <button className="btn" onClick={() => onMoveFolder(email.id, "Archive")}><FaArchive style={{ marginRight: 6 }} />Archive</button>
        <button className="btn danger" onClick={() => onMoveFolder(email.id, "Trash")}><FaTrash style={{ marginRight: 6 }} />Move to Trash</button>
        <button className="btn" onClick={() => onMoveFolder(email.id, "Spam")}><FaExclamationTriangle style={{ marginRight: 6 }} />Report Scam</button>
        <button className="btn" onClick={() => onMoveFolder(email.id, "Inbox")}><FaUndo style={{ marginRight: 6 }} />Restore to Inbox</button>
      </div>
    </section>
  );
}
