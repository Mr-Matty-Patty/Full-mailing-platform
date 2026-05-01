import { useEffect } from "react";

export default function useMailShortcuts({
  selectedId, paged, setSelectedId, setComposeOpen, setCommandOpen, moveFolder, toggleStar, focusSearch,
}) {
  useEffect(() => {
    function handler(e) {
      const key = e.key.toLowerCase();
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = ["input", "textarea", "select"].includes(tag);

      if ((e.metaKey || e.ctrlKey) && key === "k") {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }
      if (typing) return;

      if (key === "/") { e.preventDefault(); focusSearch(); }
      if (key === "c") setComposeOpen(true);
      if (key === "escape") setComposeOpen(false);

      if (key === "r" && selectedId) moveFolder(selectedId, "Spam");
      if (key === "s" && selectedId) toggleStar(selectedId);
      if (key === "delete" && selectedId) moveFolder(selectedId, "Trash");
      if (key === "a" && selectedId) moveFolder(selectedId, "Archive");

      if (key === "j" || key === "k") {
        if (!paged.length) return;
        const idx = paged.findIndex((m) => m.id === selectedId);
        const nextIdx = key === "j" ? Math.min((idx === -1 ? 0 : idx + 1), paged.length - 1) : Math.max((idx === -1 ? 0 : idx - 1), 0);
        setSelectedId(paged[nextIdx].id);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, paged, setSelectedId, setComposeOpen, setCommandOpen, moveFolder, toggleStar, focusSearch]);
}
