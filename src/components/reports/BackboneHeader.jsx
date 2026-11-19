import React from 'react';
import { Home, ChevronUp, ChevronDown } from 'lucide-react';

export default function BackboneHeader({ title, collapsed = false, onToggleCollapse }) {
  return (
    <div className="backbone-title-bar">
      <div className="backbone-title-left">
        <Home size={15} className="backbone-home-icon" />
        <span className="backbone-main-title">{title}</span>
        <span className="backbone-builder-tag">Backbone Report Builder</span>
      </div>
      {onToggleCollapse && (
        <button 
          type="button" 
          className="backbone-collapse-btn" 
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Filters' : 'Collapse Filters'}
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      )}

      <style>{`
        .backbone-title-bar {
          background: #1c4474;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          border-radius: 4px 4px 0 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .backbone-title-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .backbone-home-icon {
          color: #93c5fd;
        }
        .backbone-main-title {
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .backbone-builder-tag {
          font-size: 0.72rem;
          color: #94a3b8;
          font-style: italic;
          font-weight: 400;
          margin-left: 4px;
        }
        .backbone-collapse-btn {
          background: none;
          border: none;
          color: #93c5fd;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          border-radius: 3px;
        }
        .backbone-collapse-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
