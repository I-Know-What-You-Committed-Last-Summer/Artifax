function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-card">
      <p className="text-xs font-outfit text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold font-outfit tracking-tight text-text">{value}</p>
    </div>
  );
}

export default StatCard;
