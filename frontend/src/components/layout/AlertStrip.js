function AlertStrip({ label, items }) {
  return (
    <div className="mb-4 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted shadow-card sm:px-4 sm:text-sm">
      <span className="font-semibold text-text">{label}</span>
      <span className="ml-2 inline-flex flex-wrap gap-2 align-middle">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-app px-2 py-1 text-[11px] text-text sm:text-xs">
            {item}
          </span>
        ))}
      </span>
    </div>
  );
}

export default AlertStrip;
