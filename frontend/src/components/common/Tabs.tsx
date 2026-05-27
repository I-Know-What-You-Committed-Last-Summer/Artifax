// Simple tab bar component.
// - `tabs`: array of { id, label }
// - `activeTab`: id of the currently active tab
// - `onChange`: callback when a tab is selected
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-3 py-1.5 text-xs font-medium nav-pill transition ${
            activeTab === tab.id
              ? 'rounded-full bg-primary text-white shadow-[0_6px_18px_rgba(15,23,42,0.08)] tracking-tight'
              : 'rounded-lg border border-border bg-surface text-muted hover:border-primary hover:text-text'
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
