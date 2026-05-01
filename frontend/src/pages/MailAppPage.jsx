import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MailList from "../components/MailList";
import MailDetail from "../components/MailDetail";
import ComposeModal from "../components/ComposeModal";
import BulkActionsBar from "../components/BulkActionsBar";
import PaginationBar from "../components/PaginationBar";
import AccountSwitcher from "../components/AccountSwitcher";
import FolderCounts from "../components/FolderCounts";
import CommandPalette from "../components/CommandPalette";
import Toasts from "../components/Toasts";
import { accounts, mockEmails } from "../data/mockData";
import { FOLDERS } from "../constants/folders";
import { APP_NAME, DEFAULT_PAGE_SIZE, KEYBOARD_HINTS } from "../constants/app";
import { filterEmails, getFolderCounts, paginate, totalPages } from "../utils/mail";
import { useTheme } from "../context/ThemeContext";
import { useUI } from "../context/UIContext";
import useMailShortcuts from "../hooks/useMailShortcuts";

export default function MailAppPage() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { pushToast, setCommandOpen } = useUI();

  const [activeFolder, setActiveFolder] = useState("Inbox");
  const [emails, setEmails] = useState(mockEmails);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(new Set());
  const [density, setDensity] = useState("comfortable");
  const [loading] = useState(false);
  const [error] = useState(false);
  const [activeAccountId, setActiveAccountId] = useState(accounts[0].id);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE);

  const filteredAll = useMemo(() => filterEmails(emails, activeFolder, query), [emails, activeFolder, query]);
  const total = useMemo(() => totalPages(filteredAll.length, pageSize), [filteredAll.length, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(pageSize);
    setSelectedId(null);
  }, [activeFolder, query, pageSize]);

  const paged = useMemo(() => paginate(filteredAll, currentPage, pageSize, visibleCount), [filteredAll, currentPage, pageSize, visibleCount]);
  const hasMore = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return start + visibleCount < Math.min(start + pageSize, filteredAll.length);
  }, [filteredAll.length, currentPage, pageSize, visibleCount]);

  const selectedEmail = emails.find((e) => e.id === selectedId) || null;
  const allSelected = paged.length > 0 && paged.every((e) => selectedSet.has(e.id));
  const folderCounts = useMemo(() => getFolderCounts(emails, FOLDERS), [emails]);

  function moveFolder(id, newFolder) {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, folder: newFolder } : e)));
    setSelectedSet(new Set());
    pushToast(`Moved email to ${newFolder}`, "success");
  }

  function toggleStar(id) {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)));
    pushToast("Updated star status", "info");
  }

  function toggleSelect(id) {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedSet(() => allSelected ? new Set() : new Set(paged.map((e) => e.id)));
  }

  function runBulkAction(action) {
    setEmails((prev) => prev.map((e) => {
      if (!selectedSet.has(e.id)) return e;
      if (action === "read") return { ...e, unread: false };
      return { ...e, folder: action };
    }));
    pushToast(`Bulk action applied: ${action}`, "success");
    setSelectedSet(new Set());
  }

  function nextPage() { setCurrentPage((p) => Math.min(total, p + 1)); setVisibleCount(pageSize); }
  function prevPage() { setCurrentPage((p) => Math.max(1, p - 1)); setVisibleCount(pageSize); }
  function loadMoreWithinPage() { setVisibleCount((c) => Math.min(pageSize, c + 4)); }

  useMailShortcuts({
    selectedId, paged, setSelectedId, setComposeOpen, setCommandOpen, moveFolder, toggleStar,
    focusSearch: () => document.getElementById("mail-search-input")?.focus(),
  });

  return (
    <div className="app-shell app-fade-in" style={{ padding: 14 }}>
      <Topbar query={query} setQuery={setQuery} density={density} setDensity={setDensity} title={APP_NAME} />

      <div style={{ marginTop: 10, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
        <AccountSwitcher accounts={accounts} activeAccountId={activeAccountId} onSwitch={(id) => { setActiveAccountId(id); pushToast(`Switched account to ${id}`, "info"); }} />
        <FolderCounts folders={FOLDERS} counts={folderCounts} activeFolder={activeFolder} onFolderChange={setActiveFolder} />
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {KEYBOARD_HINTS.map((hint) => <span key={hint} className="kbd">{hint}</span>)}
      </div>

      <div style={{ marginTop: 10 }}>
        <BulkActionsBar count={selectedSet.size} onAction={runBulkAction} clearSelection={() => setSelectedSet(new Set())} />
      </div>

      <div style={{ marginTop: 10 }}>
        <PaginationBar currentPage={currentPage} totalPages={total} onPrev={prevPage} onNext={nextPage} pageSize={pageSize} setPageSize={setPageSize} />
      </div>

      <div className="layout-grid" style={{ fontSize: density === "compact" ? 13 : 15 }}>
        <div className="sidebar-panel">
          <Sidebar
            folders={FOLDERS}
            activeFolder={activeFolder}
            onFolderChange={(f) => { setActiveFolder(f); setCurrentPage(1); setVisibleCount(pageSize); setSelectedSet(new Set()); setSelectedId(null); }}
            onCompose={() => setComposeOpen(true)}
            counts={folderCounts}
          />
        </div>

        <MailList
          emails={paged}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onToggleStar={toggleStar}
          selectedSet={selectedSet}
          onToggleSelect={toggleSelect}
          allSelected={allSelected}
          onToggleSelectAll={toggleSelectAll}
          loading={loading}
          error={error}
          onLoadMore={loadMoreWithinPage}
          hasMore={hasMore}
        />

        <MailDetail email={selectedEmail} onMoveFolder={moveFolder} />
      </div>

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />

      <CommandPalette
        onCompose={() => setComposeOpen(true)}
        onFolderChange={setActiveFolder}
        folders={FOLDERS}
        onThemeToggle={toggleTheme}
        onGoSettings={() => navigate("/settings")}
      />

      <Toasts />
    </div>
  );
}
