const statusMap = {
  OK: 'bg-okBg text-okText border border-okText/20',
  LOW: 'bg-warnBg text-warnText border border-warnText/20',
  QUEUED: 'bg-app text-muted border border-border',
  'IN PROGRESS': 'bg-primary text-white border border-primary',
  PAUSED: 'bg-border text-text border border-border',
  CRAFTED: 'bg-okBg text-okText border border-okText/20',
  CANCELLED: 'bg-dangerBg text-dangerText border border-dangerText/20',
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${
        statusMap[status] || 'bg-app text-muted border border-border'
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
