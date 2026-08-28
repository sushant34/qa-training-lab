import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusClasses: Record<string, string> = {
  PASS: 'badge-pass',
  FAIL: 'badge-fail',
  BLOCKED: 'badge-blocked',
  NOT_EXECUTED: 'badge-blocked',
  Open: 'badge-open',
  'Under Review': 'badge-blocked',
  Resolved: 'badge-resolved',
  Rejected: 'badge-rejected',
  Draft: 'badge-draft',
  Ready: 'badge-ready',
  Executed: 'badge-executed',
  Detected: 'badge-pass',
  'Not Detected': 'badge-fail',
  Pending: 'badge-blocked',
  Confirmed: 'badge-pass',
  Shipped: 'badge-ready',
  Delivered: 'badge-resolved',
  Critical: 'bg-red-100 text-red-800',
  High: 'badge-fail',
  Medium: 'badge-blocked',
  Low: 'badge-open',
  P0: 'bg-red-100 text-red-800',
  P1: 'badge-fail',
  P2: 'badge-blocked',
  P3: 'badge-open',
  Positive: 'badge-pass',
  Negative: 'badge-fail',
  Validation: 'badge-blocked',
  Boundary: 'badge-open',
  Functional: 'badge-ready',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const baseClass = statusClasses[status] || 'bg-slate-100 text-slate-800';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`badge ${baseClass} ${sizeClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
