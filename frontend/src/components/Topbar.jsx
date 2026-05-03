import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiSun,
  FiMoon,
  FiHelpCircle,
  FiSettings,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";

function initialsOf(name = "", email = "") {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Topbar({ query, setQuery, title = "D&M Mail" }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const initials = initialsOf(user?.name, user?.email);

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo-mark">D&amp;M</div>
          <h2 className="topbar-title">{title}</h2>
        </div>

        <div className="topbar-search">
          <FiSearch size={16} className="topbar-search-icon" />
          <input
            id="mail-search-input"
            className="input"
            placeholder="Search mail…  (press /)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={() => setHelpOpen(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <FiHelpCircle size={18} />
          </button>
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark" : "Switch to light"}
          >
            {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>

          <div className="topbar-user" ref={menuRef}>
            <button
              type="button"
              className="topbar-avatar"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Account menu"
              title={user?.email || "Account"}
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="topbar-menu" role="menu">
                <div className="topbar-menu-header">
                  <div className="topbar-menu-name">{user?.name || "—"}</div>
                  <div className="topbar-menu-email">{user?.email || ""}</div>
                </div>
                <button
                  type="button"
                  className="topbar-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/settings");
                  }}
                  role="menuitem"
                >
                  <FiSettings size={15} />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  className="topbar-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/settings");
                  }}
                  role="menuitem"
                >
                  <FiUser size={15} />
                  <span>Profile</span>
                </button>
                <div className="topbar-menu-divider" />
                <button
                  type="button"
                  className="topbar-menu-item topbar-menu-item-danger"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <FiLogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <KeyboardShortcutsModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
