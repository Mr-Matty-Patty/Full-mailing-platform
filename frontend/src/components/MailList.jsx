import { FaStar, FaRegStar } from "react-icons/fa";
import { useEffect, useRef } from "react";
import StateView from "./StateView";

export default function MailList({
  emails, selectedId, onSelect, onToggleStar, selectedSet, onToggleSelect, allSelected, onToggleSelectAll,
  loading, error, onLoadMore, hasMore,
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) onLoadMore();
    }, { threshold: 1 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore]);

  if (loading) return <section className="card list-panel" style={{ padding: 8 }}><StateView type="loading" title="Loading messages" subtitle="Fetching your mailbox preview..." /></section>;
  if (error) return <section className="card list-panel" style={{ padding: 8 }}><StateView type="error" title="Could not load messages" subtitle="UI-only error state." action={<button className="btn">Retry</button>} /></section>;

  return (
    <section className="card list-panel" style={{ padding: 8, overflow: "auto" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 8 }}>
        <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} />
        <small style={{ color: "var(--muted)" }}>{selectedSet.size} selected</small>
      </div>
      {emails.length === 0 ? <StateView type="empty" title="No emails here" subtitle="Try another folder or clear filters." /> : emails.map((email) => (
        <div key={email.id} className="mail-list-row" onClick={() => onSelect(email.id)} style={{ background: selectedId === email.id ? "rgba(109,60,240,0.1)" : "transparent" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={selectedSet.has(email.id)} onChange={(e) => { e.stopPropagation(); onToggleSelect(email.id); }} />
              <strong>{email.from}</strong>
            </div>
            <button className="btn" style={{ padding: "4px 8px" }} onClick={(e) => { e.stopPropagation(); onToggleStar(email.id); }}>
              {email.starred ? <FaStar color="gold" /> : <FaRegStar />}
            </button>
          </div>
          <div style={{ marginTop: 4 }}>{email.subject}</div>
          <small style={{ color: "var(--muted)" }}>{email.snippet}</small>
        </div>
      ))}
      <div ref={sentinelRef} style={{ height: 8 }} />
      {!hasMore && emails.length > 0 && <div className="state-wrap" style={{ paddingTop: 10 }}>End of page set.</div>}
    </section>
  );
}
