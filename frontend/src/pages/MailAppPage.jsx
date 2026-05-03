import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MailList from "../components/MailList";
import MailDetail from "../components/MailDetail";
import ComposeModal from "../components/ComposeModal";
import BulkActionsBar from "../components/BulkActionsBar";
import PaginationBar from "../components/PaginationBar";
import CategoryTabs from "../components/CategoryTabs";
import CommandPalette from "../components/CommandPalette";
import Toasts from "../components/Toasts";
import { FOLDERS } from "../constants/folders";
import { APP_NAME, DEFAULT_PAGE_SIZE } from "../constants/app";
import { useTheme } from "../context/ThemeContext";
import { useUI } from "../context/UIContext";
import useMailShortcuts from "../hooks/useMailShortcuts";
import useEmails from "../hooks/useEmails";
import { api } from "../api/client";

export default function MailAppPage() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { pushToast, setCommandOpen } = useUI();

  const [activeFolder, setActiveFolder] = useState("Inbox");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(new Set());
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Reset page + selection when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedId(null);
    setSelectedSet(new Set());
  }, [activeFolder, activeCategory, query, pageSize]);

  // Reset category when leaving Inbox (categories only meaningful in Inbox)
  useEffect(() => {
    if (activeFolder !== "Inbox" && activeCategory !== "All") {
      setActiveCategory("All");
    }
  }, [activeFolder, activeCategory]);

  const {
    emails,
    pagination,
    counts: rawCounts,
    categoryCounts,
    loading,
    error,
    toggleStar,
    moveFolder,
    bulkMove,
    bulkMarkRead,
    deleteOne,
    send,
  } = useEmails({
    folder: activeFolder,
    category: activeCategory,
    query,
    page: currentPage,
    pageSize,
  });

  // Flat shapes for sidebar
  const folderTotals = useMemo(() => {
    const out = {};
    FOLDERS.forEach((f) => {
      out[f] = rawCounts[f]?.total ?? 0;
    });
    return out;
  }, [rawCounts]);

  const folderUnread = useMemo(() => {
    const out = {};
    FOLDERS.forEach((f) => {
      out[f] = rawCounts[f]?.unread ?? 0;
    });
    return out;
  }, [rawCounts]);

  // Fetch full email body when one is selected
  useEffect(() => {
    if (!selectedId) {
      setSelectedEmail(null);
      return;
    }
    let cancelled = false;
    api
      .getMail(selectedId)
      .then((data) => {
        if (!cancelled) setSelectedEmail(data.email);
      })
      .catch(() => {
        if (!cancelled) setSelectedEmail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const allSelected = emails.length > 0 && emails.every((e) => selectedSet.has(e.id));

  function toggleSelect(id) {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    setSelectedSet(() => (allSelected ? new Set() : new Set(emails.map((e) => e.id))));
  }

  // ---- mutation handlers ----

  async function handleToggleStar(id) {
    try {
      await toggleStar(id);
    } catch (err) {
      pushToast(err.message, "error");
    }
  }

  async function handleMoveFolder(id, newFolder) {
    try {
      await moveFolder(id, newFolder);
      pushToast(`Moved to ${newFolder}`, "success");
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      pushToast(err.message, "error");
    }
  }

  async function handleBulkAction(action) {
    const ids = Array.from(selectedSet);
    if (!ids.length) return;
    try {
      if (action === "read") {
        await bulkMarkRead(ids);
        pushToast(`Marked ${ids.length} as read`, "success");
      } else {
        await bulkMove(ids, action);
        pushToast(`Moved ${ids.length} to ${action}`, "success");
      }
      setSelectedSet(new Set());
    } catch (err) {
      pushToast(err.message, "error");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteOne(id);
      pushToast("Deleted", "success");
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      pushToast(err.message, "error");
    }
  }

  async function handleSend({ to, subject, body }) {
    try {
      const result = await send({ to, subject, body });
      const aiHint = result.ai?.verdict
        ? ` (AI: ${result.ai.verdict}, ${result.ai.category || "—"})`
        : "";
      pushToast(`Email sent${aiHint}`, "success");
      setComposeOpen(false);
    } catch (err) {
      pushToast(err.message || "Failed to send", "error");
    }
  }

  function nextPage() {
    setCurrentPage((p) => Math.min(pagination.totalPages, p + 1));
  }
  function prevPage() {
    setCurrentPage((p) => Math.max(1, p - 1));
  }

  useMailShortcuts({
    selectedId,
    paged: emails,
    setSelectedId,
    setComposeOpen,
    setCommandOpen,
    moveFolder: handleMoveFolder,
    toggleStar: handleToggleStar,
    focusSearch: () => document.getElementById("mail-search-input")?.focus(),
  });

  return (
    <div className="dash-shell app-fade-in">
      <Topbar query={query} setQuery={setQuery} title={APP_NAME} />

      <div className="dash-grid">
        <Sidebar
          folders={FOLDERS}
          activeFolder={activeFolder}
          onFolderChange={(f) => {
            setActiveFolder(f);
            setSelectedSet(new Set());
            setSelectedId(null);
          }}
          onCompose={() => setComposeOpen(true)}
          counts={folderTotals}
          unreadCounts={folderUnread}
        />

        <div className="dash-main">
          {/* Tabs only in Inbox — they don't make sense in Sent/Trash/etc */}
          {activeFolder === "Inbox" && (
            <CategoryTabs
              active={activeCategory}
              onChange={setActiveCategory}
              counts={categoryCounts}
            />
          )}

          {/* Bulk bar slides in only when something is selected */}
          {selectedSet.size > 0 && (
            <BulkActionsBar
              count={selectedSet.size}
              onAction={handleBulkAction}
              clearSelection={() => setSelectedSet(new Set())}
            />
          )}

          <MailList
            emails={emails}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggleStar={handleToggleStar}
            selectedSet={selectedSet}
            onToggleSelect={toggleSelect}
            allSelected={allSelected}
            onToggleSelectAll={toggleSelectAll}
            loading={loading}
            error={error}
          />

          <PaginationBar
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPrev={prevPage}
            onNext={nextPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        </div>

        <MailDetail
          email={selectedEmail}
          onMoveFolder={handleMoveFolder}
          onDelete={handleDelete}
        />
      </div>

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={handleSend}
      />

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
