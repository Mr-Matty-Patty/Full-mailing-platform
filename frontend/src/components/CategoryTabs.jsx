import { FaUser, FaTag, FaBell, FaInbox } from "react-icons/fa";

const TAB_ORDER = ["All", "Personal", "Promotional", "Notification"];

const ICONS = {
  All: <FaInbox />,
  Personal: <FaUser />,
  Promotional: <FaTag />,
  Notification: <FaBell />,
};

export default function CategoryTabs({ active, onChange, counts = {} }) {
  return (
    <div className="cat-tabs" role="tablist" aria-label="Filter by AI category">
      {TAB_ORDER.map((tab) => {
        const isActive = active === tab;
        const count = counts[tab];
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`cat-tab ${isActive ? "active" : ""}`}
            onClick={() => onChange(tab)}
          >
            <span className="cat-tab-icon">{ICONS[tab]}</span>
            <span>{tab}</span>
            {count > 0 && <span className="cat-tab-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
