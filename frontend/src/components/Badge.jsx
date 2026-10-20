import React from 'react';

export const Badge = ({ status, variant, children }) => {
  const text = children || status;

  let badgeClass = 'badge-secondary';

  const val = String(status || variant || '').toLowerCase();

  if (['active', 'present', 'passed', 'a+', 'a', 'high'].includes(val)) {
    badgeClass = 'badge-success';
  } else if (['inactive', 'absent', 'failed', 'f', 'urgent', 'suspended'].includes(val)) {
    badgeClass = 'badge-danger';
  } else if (['late', 'on leave', 'pending', 'warning', 'b', 'c', 'normal'].includes(val)) {
    badgeClass = 'badge-warning';
  } else if (['info', 'low', 'graduated', 'd'].includes(val)) {
    badgeClass = 'badge-info';
  }

  return <span className={`badge ${badgeClass}`}>{text}</span>;
};

export default Badge;
