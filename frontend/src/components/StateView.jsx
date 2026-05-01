import { FaExclamationCircle, FaInbox, FaSpinner } from "react-icons/fa";

export default function StateView({ type = "empty", title, subtitle, action }) {
  const map = {
    empty: <FaInbox size={24} />,
    loading: <FaSpinner size={24} className="spin" />,
    error: <FaExclamationCircle size={24} />,
  };

  return (
    <div className="state-wrap">
      <div style={{ marginBottom: 10 }}>{map[type]}</div>
      <h3 style={{ margin: "0 0 6px 0" }}>{title}</h3>
      {subtitle && <p style={{ margin: "0 0 12px 0" }}>{subtitle}</p>}
      {action}
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
