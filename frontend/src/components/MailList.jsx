import { FaStar, FaRegStar, FaShieldAlt } from "react-icons/fa";
import StateView from "./StateView";

const CATEGORY_COLOR = {
  Personal: "var(--primary)",
  Promotional: "var(--warning)",
  Notification: "var(--muted)",
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "2-digit",
  });
}

function senderName(email = "") {
  // If `from` is "Name <email@x>", show Name; otherwise show email
  const match = email.match(/^([^<]+)<.+>/);
  if (match) return match[1].trim();
  return email;
}

export default function MailList({
  emails,
  selectedId,
  onSelect,
  onToggleStar,
  selectedSet,
  onToggleSelect,
  allSelected,
  onToggleSelectAll,
  loading,
  error,
}) {
  if (loading) {
    return (
      <section className="card list-panel" style={{ padding: 8 }}>
        <StateView type="loading" title="Loading messages" subtitle="Fetching your mailbox…" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="card list-panel" style={{ padding: 8 }}>
        <StateView
          type="error"
          title="Could not load messages"
          subtitle={error}
          action={
            <button className="btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          }
        />
      </section>
    );
  }

  return (
    <section className="card list-panel mail-list">
      <div className="mail-list-header">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          aria-label="Select all"
        />
        <span className="mail-list-header-meta">
          {selectedSet.size > 0
            ? `${selectedSet.size} selected`
            : `${emails.length} ${emails.length === 1 ? "email" : "emails"}`}
        </span>
      </div>

      {emails.length === 0 ? (
        <StateView
          type="empty"
          title="No emails here"
          subtitle="Try another folder or category."
        />
      ) : (
        <ul className="mail-list-rows">
          {emails.map((email) => {
            const active = selectedId === email.id;
            const isPhish = email.aiVerdict === "Phishing";
            return (
              <li
                key={email.id}
                onClick={() => onSelect(email.id)}
                className={`mail-row ${active ? "active" : ""} ${
                  email.unread ? "unread" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSet.has(email.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => onToggleSelect(email.id)}
                  aria-label="Select email"
                />

                <button
                  type="button"
                  className="mail-row-star"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(email.id);
                  }}
                  aria-label={email.starred ? "Unstar" : "Star"}
                >
                  {email.starred ? <FaStar color="gold" /> : <FaRegStar />}
                </button>

                <div className="mail-row-content">
                  <div className="mail-row-line1">
                    <span className="mail-row-sender">{senderName(email.from)}</span>
                    <span className="mail-row-date">{formatDate(email.receivedAt)}</span>
                  </div>
                  <div className="mail-row-subject">
                    {email.subject || <em style={{ color: "var(--muted)" }}>(no subject)</em>}
                  </div>
                  {email.snippet && (
                    <div className="mail-row-snippet">{email.snippet}</div>
                  )}
                  {(isPhish || email.aiCategory) && (
                    <div className="mail-row-badges">
                      {isPhish && (
                        <span
                          className="ai-badge ai-badge-phish"
                          title={`Phishing ${email.aiConfidence ?? "?"}%`}
                        >
                          <FaShieldAlt size={10} />
                          <span>Phishing</span>
                        </span>
                      )}
                      {email.aiCategory && !isPhish && (
                        <span
                          className="ai-badge"
                          style={{ color: CATEGORY_COLOR[email.aiCategory] || "var(--muted)" }}
                          title={`${email.aiCategory}${
                            email.aiCategoryConfidence
                              ? ` (${email.aiCategoryConfidence}%)`
                              : ""
                          }`}
                        >
                          {email.aiCategory}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
