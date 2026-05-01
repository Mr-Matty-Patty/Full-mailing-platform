export default function FolderCounts({ folders, counts, activeFolder, onFolderChange }) {
  return (
    <div className="card" style={{ padding: 10 }}>
      <h4 style={{ marginTop: 0, marginBottom: 10 }}>Folders</h4>
      <div style={{ display: "grid", gap: 8 }}>
        {folders.map((f) => (
          <button key={f} className="btn" onClick={() => onFolderChange(f)} style={{ display: "flex", justifyContent: "space-between", borderColor: activeFolder === f ? "var(--primary)" : "var(--border)" }}>
            <span>{f}</span><span className="badge">{counts[f] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
