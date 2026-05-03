// Centralized email state. One hook owns the email list, pagination,
// folder + category counts, and all the mutations.

import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export default function useEmails({ folder, category, query, page, pageSize }) {
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  });
  const [counts, setCounts] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listMail({
        folder,
        category: category && category !== "All" ? category : undefined,
        page,
        limit: pageSize,
        search: query || undefined,
      });
      setEmails(data.emails || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      setError(err.message || "Failed to load emails");
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, [folder, category, query, page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshCounts = useCallback(async () => {
    try {
      const data = await api.getCounts(folder);
      setCounts(data.counts || {});
      setCategoryCounts(data.categoryCounts || {});
    } catch {
      /* non-fatal */
    }
  }, [folder]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  function patchLocal(id, changes) {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }

  async function toggleStar(id) {
    const target = emails.find((e) => e.id === id);
    if (!target) return;
    const next = !target.starred;
    patchLocal(id, { starred: next });
    try {
      await api.patchMail(id, { isStarred: next });
      refreshCounts();
    } catch {
      patchLocal(id, { starred: target.starred });
      throw new Error("Couldn't update star");
    }
  }

  async function markRead(id, isRead = true) {
    patchLocal(id, { unread: !isRead });
    try {
      await api.patchMail(id, { isRead });
      refreshCounts();
    } catch {
      patchLocal(id, { unread: !!isRead });
    }
  }

  async function moveFolder(id, folderName) {
    setEmails((prev) => prev.filter((e) => e.id !== id));
    try {
      await api.patchMail(id, { folder: folderName });
      refreshCounts();
    } catch {
      refresh();
      throw new Error(`Couldn't move email to ${folderName}`);
    }
  }

  async function bulkMove(ids, folderName) {
    if (!ids.length) return;
    setEmails((prev) => prev.filter((e) => !ids.includes(e.id)));
    try {
      await Promise.all(ids.map((id) => api.patchMail(id, { folder: folderName })));
      refreshCounts();
    } catch {
      refresh();
      throw new Error("Some emails couldn't be moved");
    }
  }

  async function bulkMarkRead(ids) {
    if (!ids.length) return;
    setEmails((prev) =>
      prev.map((e) => (ids.includes(e.id) ? { ...e, unread: false } : e))
    );
    try {
      await Promise.all(ids.map((id) => api.patchMail(id, { isRead: true })));
      refreshCounts();
    } catch {
      refresh();
    }
  }

  async function deleteOne(id, permanent = false) {
    const previous = emails;
    setEmails((prev) => prev.filter((e) => e.id !== id));
    try {
      await api.deleteMail(id, permanent);
      refreshCounts();
    } catch {
      setEmails(previous);
      throw new Error("Couldn't delete email");
    }
  }

  async function send({ to, subject, body }) {
    const result = await api.sendMail({ to, subject, body });
    refresh();
    refreshCounts();
    return result;
  }

  return {
    emails,
    pagination,
    counts,
    categoryCounts,
    loading,
    error,
    refresh,
    refreshCounts,
    toggleStar,
    markRead,
    moveFolder,
    bulkMove,
    bulkMarkRead,
    deleteOne,
    send,
  };
}
