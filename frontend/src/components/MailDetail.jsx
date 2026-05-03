import {
  FaTrash,
  FaExclamationTriangle,
  FaUndo,
  FaArchive,
  FaShieldAlt,
} from "react-icons/fa";
import StateView from "./StateView";

export default function MailDetail({ email, onMoveFolder, onDelete }) {
  if (!email) {
    return (
      <section className="card detail-panel" style={{ padding: 8 }}>
        <StateView
          type="empty"
          title="Select a message"
          subtitle="Use J/K to navigate."
        />
      </section>
    );
  }

  const isPhishing = email.aiVerdict === "Phishing";
  const verdictColor = isPhishing ? "var(--danger)" : "var(--success)";

  return (
    <section className="card detail-panel" style={{ padding: 18 }}>
      {/* Phishing warning banner */}
      {isPhishing && (
        <div
          style={{
            background: "color-mix(in srgb, var(--danger) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--danger) 40%, transparent)",
            color: "var(--danger)",
            padding: "12px 14px",
            borderRadius: 10,
            marginBottom: 16,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <FaShieldAlt style={{ marginTop: 2, flexShrink: 0 }} size={18} />
          <div>
            <strong>Phishing detected</strong>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.92 }}>
              Our AI flagged this message with{" "}
              {email.aiConfidence ?? "?"}% confidence. Don't click links, open
              attachments, or share information.
            </div>
          </div>
        </div>
      )}

      <h3 style={{ marginTop: 0 }}>{email.subject || "(No subject)"}</h3>
      <p>
        <strong>From:</strong> {email.from}
      </p>
      {email.receivedAt && (
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: -8 }}>
          {new Date(email.receivedAt).toLocaleString()}
        </p>
      )}

      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {email.aiVerdict && (
          <span
            className="badge"
            style={{ color: verdictColor, borderColor: verdictColor }}
          >
            AI: {email.aiVerdict}
            {email.aiConfidence ? ` (${email.aiConfidence}%)` : ""}
          </span>
        )}
        {email.aiCategory && (
          <span className="badge">
            Category: {email.aiCategory}
            {email.aiCategoryConfidence ? ` (${email.aiCategoryConfidence}%)` : ""}
          </span>
        )}
      </div>

      <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{email.body}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
        <button className="btn" onClick={() => onMoveFolder(email.id, "Archive")}>
          <FaArchive style={{ marginRight: 6 }} />
          Archive
        </button>
        <button
          className="btn danger"
          onClick={() => (onDelete ? onDelete(email.id) : onMoveFolder(email.id, "Trash"))}
        >
          <FaTrash style={{ marginRight: 6 }} />
          {email.folder === "Trash" ? "Delete forever" : "Move to Trash"}
        </button>
        <button className="btn" onClick={() => onMoveFolder(email.id, "Spam")}>
          <FaExclamationTriangle style={{ marginRight: 6 }} />
          Report Spam
        </button>
        {email.folder !== "Inbox" && (
          <button className="btn" onClick={() => onMoveFolder(email.id, "Inbox")}>
            <FaUndo style={{ marginRight: 6 }} />
            Move to Inbox
          </button>
        )}
      </div>
    </section>
  );
}
