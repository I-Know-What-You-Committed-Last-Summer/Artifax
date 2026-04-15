function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'border border-border bg-surface text-muted hover:border-primary hover:text-text'
          }`}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
