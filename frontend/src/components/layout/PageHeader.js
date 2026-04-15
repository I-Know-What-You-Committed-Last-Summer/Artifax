function PageHeader({ title, subtitle, rightSlot }) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-border pb-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-[28px]">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
    </div>
  );
}

export default PageHeader;
