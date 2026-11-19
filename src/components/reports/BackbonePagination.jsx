import React from 'react';

export default function BackbonePagination({
  totalItems,
  pageLength,
  currentPage,
  onPageChange
}) {
  if (totalItems === 0) {
    return (
      <div className="bb-pagination-bar no-print">
        <div className="bb-pagination-info">Showing 0 to 0 of 0 entries</div>
      </div>
    );
  }

  const effectiveLength = pageLength === 999999 ? totalItems : pageLength;
  const totalPages = Math.ceil(totalItems / effectiveLength);
  const startIndex = (currentPage - 1) * effectiveLength + 1;
  const endIndex = Math.min(totalItems, currentPage * effectiveLength);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="bb-pagination-bar no-print">
      <div className="bb-pagination-info">
        Showing {startIndex} to {endIndex} of {totalItems} entries
      </div>

      {totalPages > 1 && (
        <div className="bb-pagination-controls">
          <button 
            type="button" 
            className="bb-page-btn" 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            &lt;
          </button>

          {getPageNumbers().map((p, idx) => (
            p === '...' ? (
              <span key={`dots-${idx}`} className="bb-page-dots">...</span>
            ) : (
              <button
                key={p}
                type="button"
                className={`bb-page-btn ${currentPage === p ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          ))}

          <button 
            type="button" 
            className="bb-page-btn" 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            &gt;
          </button>
        </div>
      )}

      <style>{`
        .bb-pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: #ffffff;
          border-top: 1px solid #d0dbe5;
          font-size: 0.74rem;
          color: #64748b;
          border-radius: 0 0 4px 4px;
        }
        .bb-pagination-info {
          font-weight: 500;
        }
        .bb-pagination-controls {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .bb-page-btn {
          min-width: 24px;
          height: 24px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: 3px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        .bb-page-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #0284c7;
          border-color: #0284c7;
        }
        .bb-page-btn.active {
          background: #0284c7;
          color: #ffffff;
          border-color: #0284c7;
        }
        .bb-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .bb-page-dots {
          padding: 0 4px;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
