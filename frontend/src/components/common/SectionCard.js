function SectionCard({ title, subtitle, rightSlot, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5 ${className}`}>
      {(title || rightSlot) && (
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            {title ? <h2 className="text-base font-semibold text-text">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
          </div>
          {rightSlot ? <div>{rightSlot}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export default SectionCard;
