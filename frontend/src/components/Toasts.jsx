import { useUI } from "../context/UIContext";
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

const iconByType = {
  success: <FaCheckCircle />,
  info: <FaInfoCircle />,
  warning: <FaExclamationTriangle />,
};

export default function Toasts() {
  const { toasts } = useUI();
  return (
    <div style={{ position: "fixed", right: 14, bottom: 14, zIndex: 100, display: "grid", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} className="card toast-enter" style={{ padding: "10px 12px", minWidth: 240, display: "flex", alignItems: "center", gap: 8 }}>
          {iconByType[t.type] || iconByType.info}<span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
