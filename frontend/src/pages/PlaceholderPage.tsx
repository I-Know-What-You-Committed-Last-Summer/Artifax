function PlaceholderPage({ title }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-card">
      <h1 className="text-2xl font-semibold text-text">{title}</h1>
      <p className="mt-2 text-sm text-muted">
        This page is intentionally a placeholder for the next UI replication phase.
      </p>
    </div>
  );
}

export default PlaceholderPage;
