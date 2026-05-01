import { useEffect, useMemo, useState } from "react";
import { useUI } from "../context/UIContext";

export default function CommandPalette({ onCompose, onFolderChange, folders, onThemeToggle, onGoSettings }) {
  const { commandOpen, setCommandOpen } = useUI();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const commands = useMemo(() => [
    { label: "Compose new email", run: onCompose },
    { label: "Open Settings", run: onGoSettings },
    { label: "Toggle Theme", run: onThemeToggle },
    ...folders.map((f) => ({ label: `Go to folder: ${f}`, run: () => onFolderChange(f) })),
  ], [onCompose, onFolderChange, folders, onThemeToggle, onGoSettings]);

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => { if (!commandOpen) { setQ(""); setIdx(0); } }, [commandOpen]);

  useEffect(() => {
    function onKey(e) {
      if (!commandOpen) return;
      if (e.key === "Escape") setCommandOpen(false);
      if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0))); }
      if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && filtered[idx]) { filtered[idx].run(); setCommandOpen(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, filtered, idx, setCommandOpen]);

  if (!commandOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.38)", display: "grid", placeItems: "start center", paddingTop: "12vh", zIndex: 90 }} onMouseDown={(e) => e.target === e.currentTarget && setCommandOpen(false)}>
      <div className="card" style={{ width: "min(680px, 95vw)", padding: 10 }}>
        <input className="input" autoFocus placeholder="Type a command..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div style={{ marginTop: 8, maxHeight: 340, overflow: "auto" }}>
          {filtered.map((c, i) => (
            <button key={c.label} className="btn" onClick={() => { c.run(); setCommandOpen(false); }} style={{ width: "100%", textAlign: "left", marginBottom: 6, borderColor: i === idx ? "var(--primary)" : "var(--border)" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
