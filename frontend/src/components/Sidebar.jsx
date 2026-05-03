import { NavLink } from "react-router-dom";
import {
  FaInbox,
  FaPaperPlane,
  FaFileAlt,
  FaShieldAlt,
  FaTrash,
  FaArchive,
  FaCog,
  FaStar,
  FaEdit,
} from "react-icons/fa";

const iconMap = {
  Inbox: <FaInbox />,
  Sent: <FaPaperPlane />,
  Drafts: <FaFileAlt />,
  Starred: <FaStar />,
  Spam: <FaShieldAlt />,
  Trash: <FaTrash />,
  Archive: <FaArchive />,
};

export default function Sidebar({
  folders,
  activeFolder,
  onFolderChange,
  onCompose,
  counts = {},
  unreadCounts = {},
}) {
  return (
    <aside className="sidebar-card">
      <button
        type="button"
        className="sidebar-compose"
        onClick={onCompose}
        aria-label="Compose new email"
      >
        <FaEdit size={14} />
        <span>Compose</span>
      </button>

      <nav className="sidebar-folders" aria-label="Folders">
        {folders.map((f) => {
          const active = activeFolder === f;
          const total = counts[f] || 0;
          const unread = unreadCounts[f] || 0;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFolderChange(f)}
              className={`sidebar-folder ${active ? "active" : ""}`}
            >
              <span className="sidebar-folder-icon">{iconMap[f] || <FaInbox />}</span>
              <span className="sidebar-folder-name">{f}</span>
              {(unread > 0 && f === "Inbox") ? (
                <span className="sidebar-folder-count unread">{unread}</span>
              ) : total > 0 ? (
                <span className="sidebar-folder-count">{total}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-divider" />

      <NavLink to="/settings" className="sidebar-settings-link">
        <button type="button" className="sidebar-folder">
          <span className="sidebar-folder-icon"><FaCog /></span>
          <span className="sidebar-folder-name">Settings</span>
        </button>
      </NavLink>
    </aside>
  );
}
