export default function PaginationBar({ currentPage, totalPages, onPrev, onNext, pageSize, setPageSize }) {
  return (
    <div className="card" style={{ padding: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <button className="btn" onClick={onPrev} disabled={currentPage <= 1}>Previous</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button className="btn" onClick={onNext} disabled={currentPage >= totalPages}>Next</button>
      <div style={{ marginLeft: "auto" }}>
        <label>Per page
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ marginLeft: 8, width: 90 }}>
            <option value={8}>8</option><option value={12}>12</option><option value={20}>20</option>
          </select>
        </label>
      </div>
    </div>
  );
}
