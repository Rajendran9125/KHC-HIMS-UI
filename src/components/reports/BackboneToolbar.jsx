import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  ListOrdered, 
  Search, 
  Check, 
  ChevronDown 
} from 'lucide-react';

export default function BackboneToolbar({
  onPrint,
  onCopy,
  onExcel,
  onPdf,
  columns = [],
  hiddenColumns = [],
  onToggleColumn,
  pageLength = 25,
  onChangePageLength,
  searchTerm = '',
  onSearchChange,
  showColumnView = true,
}) {
  const [copied, setCopied] = useState(false);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [lenMenuOpen, setLenMenuOpen] = useState(false);
  const colRef = useRef(null);
  const lenRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (colRef.current && !colRef.current.contains(e.target)) setColMenuOpen(false);
      if (lenRef.current && !lenRef.current.contains(e.target)) setLenMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyClick = async () => {
    if (onCopy) {
      await onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="backbone-toolbar-strip no-print">
      {/* Left button group */}
      <div className="backbone-toolbar-left">
        <button type="button" className="bb-btn" onClick={onPrint || (() => window.print())} title="Print Table">
          <Printer size={13} className="bb-btn-icon" />
          <span>Print</span>
        </button>

        <button type="button" className={`bb-btn ${copied ? 'bb-btn-success' : ''}`} onClick={handleCopyClick} title="Copy to Clipboard">
          {copied ? <Check size={13} className="bb-btn-icon" /> : <Copy size={13} className="bb-btn-icon" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <button type="button" className="bb-btn" onClick={onExcel} title="Export to Excel / CSV">
          <FileSpreadsheet size={13} className="bb-btn-icon" />
          <span>Excel</span>
        </button>

        <button type="button" className="bb-btn" onClick={onPdf || onPrint || (() => window.print())} title="Export to PDF">
          <FileText size={13} className="bb-btn-icon" />
          <span>PDF</span>
        </button>

        {showColumnView && columns.length > 0 && (
          <div className="bb-dropdown-wrap" ref={colRef}>
            <button 
              type="button" 
              className={`bb-btn ${colMenuOpen ? 'active' : ''}`} 
              onClick={() => setColMenuOpen(!colMenuOpen)}
              title="Toggle Columns"
            >
              <Eye size={13} className="bb-btn-icon" />
              <span>Column View</span>
              <ChevronDown size={11} />
            </button>
            {colMenuOpen && (
              <div className="bb-dropdown-popover">
                <div className="bb-popover-title">Show / Hide Columns</div>
                {columns.map(c => {
                  const isHidden = hiddenColumns.includes(c.key);
                  return (
                    <label key={c.key} className="bb-col-check-item">
                      <input 
                        type="checkbox" 
                        checked={!isHidden} 
                        onChange={() => onToggleColumn && onToggleColumn(c.key)}
                      />
                      <span>{c.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="bb-dropdown-wrap" ref={lenRef}>
          <button 
            type="button" 
            className={`bb-btn ${lenMenuOpen ? 'active' : ''}`} 
            onClick={() => setLenMenuOpen(!lenMenuOpen)}
            title="Rows Per Page"
          >
            <ListOrdered size={13} className="bb-btn-icon" />
            <span>Page Length ({pageLength === 999999 ? 'All' : pageLength})</span>
            <ChevronDown size={11} />
          </button>
          {lenMenuOpen && (
            <div className="bb-dropdown-popover small">
              {[10, 25, 50, 100, 999999].map(num => (
                <button
                  key={num}
                  type="button"
                  className={`bb-len-item ${pageLength === num ? 'active' : ''}`}
                  onClick={() => {
                    onChangePageLength && onChangePageLength(num);
                    setLenMenuOpen(false);
                  }}
                >
                  {num === 999999 ? 'All rows' : `${num} rows`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Search Input */}
      <div className="backbone-toolbar-right">
        <label className="bb-search-label">
          <span>Search:</span>
          <div className="bb-search-input-wrap">
            <input 
              type="text" 
              className="bb-search-input" 
              value={searchTerm} 
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder=""
            />
            <Search size={13} className="bb-search-icon" />
          </div>
        </label>
      </div>

      <style>{`
        .backbone-toolbar-strip {
          background: #ffffff;
          border-bottom: 1px solid #d0dbe5;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .backbone-toolbar-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }
        .bb-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 4px 10px;
          font-size: 0.76rem;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
          line-height: 1.2;
        }
        .bb-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }
        .bb-btn.active {
          background: #e2e8f0;
          border-color: #0284c7;
          color: #0284c7;
        }
        .bb-btn-success {
          background: #dcfce7 !important;
          border-color: #16a34a !important;
          color: #16a34a !important;
        }
        .bb-btn-icon {
          color: #0284c7;
        }
        .bb-dropdown-wrap {
          position: relative;
        }
        .bb-dropdown-popover {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          border-radius: 4px;
          padding: 8px 10px;
          z-index: 100;
          min-width: 170px;
          max-height: 280px;
          overflow-y: auto;
        }
        .bb-dropdown-popover.small {
          min-width: 110px;
          padding: 4px;
        }
        .bb-popover-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 4px;
        }
        .bb-col-check-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          color: #1e293b;
          padding: 3px 0;
          cursor: pointer;
        }
        .bb-col-check-item:hover {
          color: #0284c7;
        }
        .bb-len-item {
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 6px 10px;
          font-size: 0.78rem;
          color: #1e293b;
          cursor: pointer;
          border-radius: 3px;
        }
        .bb-len-item:hover {
          background: #f1f5f9;
          color: #0284c7;
        }
        .bb-len-item.active {
          background: #e0f2fe;
          color: #0284c7;
          font-weight: 700;
        }
        .backbone-toolbar-right {
          display: flex;
          align-items: center;
        }
        .bb-search-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
        }
        .bb-search-input-wrap {
          position: relative;
        }
        .bb-search-input {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 3px 22px 3px 8px;
          font-size: 0.78rem;
          width: 150px;
          outline: none;
          height: 26px;
        }
        .bb-search-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 2px rgba(2,132,199,0.15);
        }
        .bb-search-icon {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
