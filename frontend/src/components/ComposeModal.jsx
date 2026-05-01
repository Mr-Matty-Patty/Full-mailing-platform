import { useEffect, useRef, useState } from "react";
import { FaPaperclip, FaBold, FaItalic, FaUnderline } from "react-icons/fa";

export default function ComposeModal({ open, onClose }) {
  const [form, setForm] = useState({ to: "", cc: "", subject: "", message: "" });
  const [attachments, setAttachments] = useState(["Project-Brief.pdf"]);
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    firstInputRef.current?.focus();
    function onKeyDown(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "grid", placeItems: "center", zIndex: 50 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className="card" style={{ width: "min(760px, 94vw)", padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Compose Email</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <input ref={firstInputRef} className="input" placeholder="To" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
          <input className="input" placeholder="Cc" value={form.cc} onChange={(e) => setForm({ ...form, cc: e.target.value })} />
          <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <div className="card" style={{ padding: 8, display: "flex", gap: 8 }}>
            <button className="btn"><FaBold /></button>
            <button className="btn"><FaItalic /></button>
            <button className="btn"><FaUnderline /></button>
            <button className="btn"><FaPaperclip style={{ marginRight: 6 }} />Attach</button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {attachments.map((file) => (
              <span key={file} className="badge">{file}
                <button className="btn ghost" style={{ padding: "2px 6px" }} onClick={() => setAttachments((p) => p.filter((f) => f !== file))}>x</button>
              </span>
            ))}
          </div>
          <textarea className="input" rows={11} placeholder="Write your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="badge">Spam scan: pending AI integration</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={onClose}>Save Draft</button>
              <button className="btn primary" onClick={onClose}>Send (UI only)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
