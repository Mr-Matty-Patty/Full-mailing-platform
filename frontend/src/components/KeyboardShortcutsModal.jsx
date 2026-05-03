import { useEffect } from "react";
import { FiX } from "react-icons/fi";

const SHORTCUTS = [
  { keys: ["c"], description: "Compose new email" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["j"], description: "Next email in list" },
  { keys: ["k"], description: "Previous email in list" },
  { keys: ["s"], description: "Star / unstar" },
  { keys: ["e"], description: "Archive selected" },
  { keys: ["#"], description: "Move to Trash" },
  { keys: ["?"], description: "Show this help" },
  { keys: ["Esc"], description: "Close modals / menus" },
];

export default function KeyboardShortcutsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ksm-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="ksm-card">
        <div className="ksm-header">
          <h3>Keyboard shortcuts</h3>
          <button
            type="button"
            className="ksm-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        <ul className="ksm-list">
          {SHORTCUTS.map((s) => (
            <li key={s.description} className="ksm-row">
              <span>{s.description}</span>
              <span className="ksm-keys">
                {s.keys.map((k) => (
                  <kbd key={k} className="ksm-kbd">
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
