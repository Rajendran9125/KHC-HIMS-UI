import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function DobDatePicker({ value, onChange, placeholder = 'dd-mm-yyyy' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentRealYear = new Date().getFullYear();
  const currentRealMonth = new Date().getMonth();
  const currentRealDay = new Date().getDate();

  // Parse existing value or initialize
  const parseValue = () => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1,
        day: parseInt(parts[2], 10)
      };
    }
    return null;
  };

  const parsed = parseValue();

  // Year-first drill-down: 'year' -> 'month' -> 'day'
  // When opened, starts in 'year' view as requested
  const [view, setView] = useState('year'); 
  const [selectedYear, setSelectedYear] = useState(parsed ? parsed.year : 1995);
  const [selectedMonth, setSelectedMonth] = useState(parsed ? parsed.month : 0);
  const [selectedDay, setSelectedDay] = useState(parsed ? parsed.day : null);

  // Decade pagination for years (16 years per page)
  const [decadeStart, setDecadeStart] = useState(() => {
    const y = parsed ? parsed.year : 1990;
    return Math.floor(y / 16) * 16;
  });

  // Sync internal state when value prop changes externally
  useEffect(() => {
    const p = parseValue();
    if (p) {
      setSelectedYear(p.year);
      setSelectedMonth(p.month);
      setSelectedDay(p.day);
      setDecadeStart(Math.floor(p.year / 16) * 16);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openPicker = () => {
    setIsOpen(true);
    // When opened, show Year view first with bold years as requested
    setView('year');
    if (parsed) {
      setDecadeStart(Math.floor(parsed.year / 16) * 16);
    } else {
      setDecadeStart(1990);
    }
  };

  // Step 1: User selects Year -> Transitions to Month view
  const handleSelectYear = (year) => {
    setSelectedYear(year);
    setView('month');
  };

  // Step 2: User selects Month -> Transitions to Day view
  const handleSelectMonth = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setView('day');
  };

  // Step 3: User selects Day -> Sets Date & Closes
  const handleSelectDay = (day) => {
    setSelectedDay(day);
    const mStr = String(selectedMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const finalVal = `${selectedYear}-${mStr}-${dStr}`;
    onChange(finalVal);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSelectedDay(null);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const yStr = String(today.getFullYear());
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    onChange(`${yStr}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  // Generate 16 years for year view grid
  const years = [];
  for (let y = decadeStart; y < decadeStart + 16; y++) {
    if (y <= currentRealYear) {
      years.push(y);
    }
  }

  // Days in selected month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Day of week of 1st day of month (0 = Sun, convert to 0 = Mon)
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return (day === 0 ? 6 : day - 1);
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);

  // Display text in input box (DD/MM/YYYY)
  const formatDisplayDate = () => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  };

  return (
    <div className="dob-picker-container" ref={containerRef}>
      <div 
        className={`dob-input-wrapper ${isOpen ? 'active' : ''}`}
        onClick={openPicker}
      >
        <span className={`dob-display-text ${!value ? 'placeholder' : ''}`}>
          {formatDisplayDate() || placeholder}
        </span>
        <div className="dob-input-actions">
          {value && (
            <button 
              type="button" 
              className="dob-clear-btn" 
              onClick={handleClear}
              title="Clear date"
            >
              <X size={14} />
            </button>
          )}
          <Calendar size={18} className="dob-calendar-icon" />
        </div>
      </div>

      {isOpen && (
        <div className="dob-dropdown-card">
          {/* POPUP HEADER */}
          <div className="dob-pop-header">
            {view === 'year' && (
              <>
                <button 
                  type="button" 
                  className="dob-nav-arrow" 
                  onClick={() => setDecadeStart(d => d - 16)}
                  title="Previous Years"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="dob-header-title">
                  Select Birth Year ({decadeStart} – {decadeStart + 15})
                </span>
                <button 
                  type="button" 
                  className="dob-nav-arrow" 
                  onClick={() => setDecadeStart(d => Math.min(d + 16, Math.floor(currentRealYear / 16) * 16))}
                  disabled={decadeStart + 16 > currentRealYear}
                  title="Next Years"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {view === 'month' && (
              <>
                <button 
                  type="button" 
                  className="dob-header-breadcrumb"
                  onClick={() => setView('year')}
                  title="Click to change year"
                >
                  <strong className="bold-year-tag">{selectedYear}</strong>
                  <span className="breadcrumb-hint">▾ Change Year</span>
                </button>
                <span className="dob-header-title">Select Month</span>
              </>
            )}

            {view === 'day' && (
              <div className="dob-day-header-nav">
                <button 
                  type="button" 
                  className="dob-header-breadcrumb"
                  onClick={() => setView('month')}
                  title="Click to change month"
                >
                  <span className="month-name-bold">{MONTH_NAMES[selectedMonth]}</span>
                  <span className="breadcrumb-hint">▾</span>
                </button>
                <button 
                  type="button" 
                  className="dob-header-breadcrumb"
                  onClick={() => setView('year')}
                  title="Click to change year"
                >
                  <strong className="bold-year-tag">{selectedYear}</strong>
                  <span className="breadcrumb-hint">▾</span>
                </button>
              </div>
            )}
          </div>

          {/* VIEW 1: YEARS GRID (Bold, prominent year selection) */}
          {view === 'year' && (
            <div className="dob-view-body">
              <div className="dob-years-grid">
                {years.map(y => {
                  const isSelected = y === selectedYear;
                  return (
                    <button
                      key={y}
                      type="button"
                      className={`dob-year-cell ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectYear(y)}
                    >
                      <span className="year-bold-num">{y}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: MONTHS GRID (Select Month after Year) */}
          {view === 'month' && (
            <div className="dob-view-body">
              <div className="dob-months-grid">
                {MONTH_SHORT.map((mName, idx) => {
                  const isSelected = selectedMonth === idx;
                  const isFuture = selectedYear === currentRealYear && idx > currentRealMonth;
                  return (
                    <button
                      key={mName}
                      type="button"
                      disabled={isFuture}
                      className={`dob-month-cell ${isSelected ? 'selected' : ''} ${isFuture ? 'disabled' : ''}`}
                      onClick={() => !isFuture && handleSelectMonth(idx)}
                    >
                      <span className="month-name">{mName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: DAYS GRID */}
          {view === 'day' && (
            <div className="dob-view-body">
              <div className="dob-weekdays-row">
                {WEEK_DAYS.map(d => (
                  <span key={d} className="dob-weekday">{d}</span>
                ))}
              </div>

              <div className="dob-days-grid">
                {/* Empty padding cells for first day of month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <span key={`pad-${i}`} className="dob-day-cell pad"></span>
                ))}

                {/* Actual days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected = selectedDay === dayNum && 
                    parsed && parsed.year === selectedYear && parsed.month === selectedMonth;
                  const isToday = currentRealYear === selectedYear && 
                    currentRealMonth === selectedMonth && currentRealDay === dayNum;
                  const isFuture = selectedYear === currentRealYear && 
                    (selectedMonth > currentRealMonth || (selectedMonth === currentRealMonth && dayNum > currentRealDay));

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={isFuture}
                      className={`dob-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'disabled' : ''}`}
                      onClick={() => !isFuture && handleSelectDay(dayNum)}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="dob-pop-footer">
            <button 
              type="button" 
              className="dob-footer-btn clear" 
              onClick={handleClear}
            >
              Clear
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="dob-footer-btn today" 
                onClick={handleToday}
              >
                Today
              </button>
              <button 
                type="button" 
                className="dob-footer-btn close" 
                onClick={() => setIsOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dob-picker-container {
          position: relative;
          width: 100%;
        }

        .dob-input-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
          height: 42px;
          padding: 8px 14px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .dob-input-wrapper:hover {
          border-color: #93c5fd;
        }

        .dob-input-wrapper.active {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }

        .dob-display-text {
          font-size: 0.95rem;
          color: #0f172a;
          font-weight: 600;
        }

        .dob-display-text.placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .dob-input-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dob-calendar-icon {
          color: #2563eb;
        }

        .dob-clear-btn {
          background: #f1f5f9;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: background 0.12s;
        }

        .dob-clear-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        /* POPUP CARD */
        .dob-dropdown-card {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 320px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
          z-index: 9999;
          padding: 14px;
          animation: popFadeIn 0.14s ease-out;
        }

        @keyframes popFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dob-pop-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 10px;
          min-height: 36px;
        }

        .dob-header-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
        }

        .dob-nav-arrow {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.12s ease;
        }

        .dob-nav-arrow:hover:not(:disabled) {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
        }

        .dob-nav-arrow:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .dob-header-breadcrumb {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          padding: 4px 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.12s;
        }

        .dob-header-breadcrumb:hover {
          background: #dbeafe;
        }

        .bold-year-tag {
          font-size: 1rem;
          font-weight: 800;
          color: #1d4ed8;
        }

        .month-name-bold {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1e40af;
        }

        .breadcrumb-hint {
          font-size: 0.75rem;
          color: #2563eb;
        }

        .dob-day-header-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dob-view-body {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* 1. YEARS GRID (BOLD AND PROMINENT) */
        .dob-years-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .dob-year-cell {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 4px;
          text-align: center;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .year-bold-num {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .dob-year-cell:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          transform: scale(1.04);
        }

        .dob-year-cell:hover .year-bold-num {
          color: #2563eb;
        }

        .dob-year-cell.selected {
          background: #2563eb;
          border-color: #1d4ed8;
          box-shadow: 0 2px 8px rgba(37,99,235,0.35);
        }

        .dob-year-cell.selected .year-bold-num {
          color: #ffffff;
        }

        /* 2. MONTHS GRID */
        .dob-months-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .dob-month-cell {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 8px;
          text-align: center;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.92rem;
          color: #1e293b;
          transition: all 0.12s ease;
        }

        .dob-month-cell:hover:not(.disabled) {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #2563eb;
          transform: scale(1.03);
        }

        .dob-month-cell.selected {
          background: #2563eb;
          color: #ffffff;
          border-color: #1d4ed8;
        }

        .dob-month-cell.disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* 3. DAYS GRID */
        .dob-weekdays-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          margin-bottom: 6px;
        }

        .dob-weekday {
          font-size: 0.72rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .dob-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .dob-day-cell {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          background: #ffffff;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dob-day-cell.pad {
          cursor: default;
        }

        .dob-day-cell:hover:not(.pad):not(.disabled) {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
        }

        .dob-day-cell.today {
          border-color: #2563eb;
          color: #2563eb;
          font-weight: 800;
        }

        .dob-day-cell.selected {
          background: #2563eb !important;
          color: #ffffff !important;
          font-weight: 800;
        }

        .dob-day-cell.disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* FOOTER */
        .dob-pop-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          margin-top: 10px;
          border-top: 1px solid #f1f5f9;
        }

        .dob-footer-btn {
          background: none;
          border: none;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.12s;
        }

        .dob-footer-btn.clear {
          color: #ef4444;
        }
        .dob-footer-btn.clear:hover {
          background: #fee2e2;
        }

        .dob-footer-btn.today {
          color: #2563eb;
        }
        .dob-footer-btn.today:hover {
          background: #eff6ff;
        }

        .dob-footer-btn.close {
          background: #2563eb;
          color: #ffffff;
        }
        .dob-footer-btn.close:hover {
          background: #1d4ed8;
        }
      `}</style>
    </div>
  );
}
