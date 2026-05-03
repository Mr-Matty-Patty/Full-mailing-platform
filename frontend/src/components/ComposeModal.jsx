import { useEffect, useRef, useState } from "react";
import { FaPaperclip, FaBold, FaItalic, FaUnderline } from "react-icons/fa";

export default function ComposeModal({ open, onClose, onSend }) {
  const [form, setForm] = useState({ to: "", cc: "", subject: "", message: "" });
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    firstInputRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Reset form when the modal closes
  useEffect(() => {
    if (!open) {
      setForm({ to: "", cc: "", subject: "", message: "" });
      setAttachments([]);
      setError("");
      setSending(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSend() {
    setError("");
    if (!form.to.trim()) {
      setError("Please add at least one recipient.");
      return;
    }
    if (!form.subject.trim() && !form.message.trim()) {
      setError("Email needs a subject or body.");
      return;
    }
    if (!onSend) {
      // Fallback: just close (used as a UI-only modal in dev)
      onClose();
      return;
    }
    setSending(true);
    try {
      await onSend({
        to: form.to.trim(),
        subject: form.subject.trim(),
        body: form.message,
      });
      // onSend's caller will close us via setComposeOpen(false)
    } catch (e) {
      setError(e.message || "Failed to send");
      setSending(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
      onMouseDown={(e) => e.target === e.currentTarget && !sending && onClose()}
    >
      <div ref={dialogRef} className="card" style={{ width: "min(760px, 94vw)", padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Compose Email</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <input
            ref={firstInputRef}
            className="input"
            placeholder="To"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            disabled={sending}
          />
          <input
            className="input"
            placeholder="Cc (optional, not sent yet)"
            value={form.cc}
            onChange={(e) => setForm({ ...form, cc: e.target.value })}
            disabled={sending}
          />
          <input
            className="input"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            disabled={sending}
          />
          <div className="card" style={{ padding: 8, display: "flex", gap: 8 }}>
            <button className="btn" type="button" disabled={sending}>
              <FaBold />
            </button>
            <button className="btn" type="button" disabled={sending}>
              <FaItalic />
            </button>
            <button className="btn" type="button" disabled={sending}>
              <FaUnderline />
            </button>
            <button className="btn" type="button" disabled={sending}>
              <FaPaperclip style={{ marginRight: 6 }} />
              Attach
            </button>
          </div>
          {attachments.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {attachments.map((file) => (
                <span key={file} className="badge">
                  {file}
                  <button
                    className="btn ghost"
                    style={{ padding: "2px 6px" }}
                    onClick={() => setAttachments((p) => p.filter((f) => f !== file))}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
          <textarea
            className="input"
            rows={11}
            placeholder="Write your message..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            disabled={sending}
          />
          {error && (
            <div
              style={{
                background: "color-mix(in srgb, var(--danger) 12%, transparent)",
                color: "var(--danger)",
                border: "1px solid color-mix(in srgb, var(--danger) 30%, transparent)",
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="badge">AI scan runs on send</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={onClose} disabled={sending} type="button">
                Discard
              </button>
              <button
                className="btn primary"
                onClick={handleSend}
                disabled={sending}
                type="button"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
