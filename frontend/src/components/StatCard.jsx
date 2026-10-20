import React from 'react';

export const StatCard = ({ icon: Icon, title, value, subtitle, color }) => {
  return (
    <div className="stat-card">
      <div
        className="stat-icon-wrapper"
        style={color ? { color, backgroundColor: `${color}15` } : {}}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtitle && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
