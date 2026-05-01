import { NavLink } from "react-router-dom";
import { FaInbox, FaPaperPlane, FaFileAlt, FaShieldAlt, FaTrash, FaArchive, FaCog } from "react-icons/fa";

const iconMap = {
  Inbox: <FaInbox />,
  Sent: <FaPaperPlane />,
  Drafts: <FaFileAlt />,
  Spam: <FaShieldAlt />,
  Trash: <FaTrash />,
  Archive: <FaArchive />,
};

export default function Sidebar({ folders, activeFolder, onFolderChange, onCompose, counts = {} }) {
  return (
    <aside className="card" style={{ padding: 14 }}>
      <button className="btn primary" style={{ width: "100%", marginBottom: 12 }} onClick={onCompose}>Compose</button>
      {folders.map((f) => (
        <button key={f} className="btn" onClick={() => onFolderChange(f)} style={{ width: "100%", marginBottom: 8, display: "flex", justifyContent: "space-between", borderColor: activeFolder === f ? "var(--primary)" : "var(--border)" }}>
          <span><span style={{ marginRight: 8 }}>{iconMap[f]}</span>{f}</span>
          <span className="badge">{counts[f] || 0}</span>
        </button>
      ))}
      <NavLink to="/settings"><button className="btn" style={{ width: "100%", marginTop: 12, textAlign: "left" }}><FaCog style={{ marginRight: 8 }} />Settings</button></NavLink>
    </aside>
  );
}
