export function filterEmails(emails, folder, query) {
  const q = query.trim().toLowerCase();
  return emails.filter((e) => e.folder === folder && `${e.from} ${e.subject} ${e.snippet}`.toLowerCase().includes(q));
}

export function getFolderCounts(emails, folders) {
  return folders.reduce((acc, f) => {
    acc[f] = emails.filter((e) => e.folder === f).length;
    return acc;
  }, {});
}

export function paginate(items, currentPage, pageSize, visibleCount) {
  const start = (currentPage - 1) * pageSize;
  return items.slice(start, start + visibleCount);
}

export function totalPages(totalItems, pageSize) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
