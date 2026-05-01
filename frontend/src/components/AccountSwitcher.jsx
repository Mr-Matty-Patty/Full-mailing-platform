import { FaUserCircle } from "react-icons/fa";

export default function AccountSwitcher({ accounts, activeAccountId, onSwitch }) {
  return (
    <div className="card" style={{ padding: 10 }}>
      <label htmlFor="account-switch" style={{ display: "block", marginBottom: 6, color: "var(--muted)" }}>Account</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FaUserCircle />
        <select id="account-switch" value={activeAccountId} onChange={(e) => onSwitch(e.target.value)}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
        </select>
      </div>
    </div>
  );
}
