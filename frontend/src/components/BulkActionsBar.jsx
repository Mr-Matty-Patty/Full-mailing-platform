import { FaArchive, FaTrash, FaShieldAlt, FaEnvelopeOpen } from "react-icons/fa";

export default function BulkActionsBar({ count, onAction, clearSelection }) {
  if (!count) return null;
  return (
    <div className="card" style={{ padding: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <strong>{count} selected</strong>
      <button className="btn" onClick={() => onAction("Archive")}><FaArchive /> Archive</button>
      <button className="btn danger" onClick={() => onAction("Trash")}><FaTrash /> Trash</button>
      <button className="btn" onClick={() => onAction("Spam")}><FaShieldAlt /> Report Scam</button>
      <button className="btn" onClick={() => onAction("read")}><FaEnvelopeOpen /> Mark Read</button>
      <button className="btn ghost" onClick={clearSelection}>Clear</button>
    </div>
  );
}
