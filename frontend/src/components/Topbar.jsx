import { FaMoon, FaSun, FaSearch } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export default function Topbar({ query, setQuery, density, setDensity, title = "Demetri and Mahdi" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="card" style={{ padding: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <h2 style={{ margin: 0, minWidth: 210 }}>{title}</h2>
      <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
        <FaSearch style={{ position: "absolute", left: 10, top: 12, color: "var(--muted)" }} />
        <input id="mail-search-input" className="input" placeholder="Search mail... (press /)" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 32 }} />
      </div>
      <select value={density} onChange={(e) => setDensity(e.target.value)} style={{ width: 140 }}>
        <option value="comfortable">Comfortable</option>
        <option value="compact">Compact</option>
      </select>
      <button className="btn" onClick={toggleTheme} aria-label="Toggle theme">{theme === "light" ? <FaMoon /> : <FaSun />}</button>
    </header>
  );
}
