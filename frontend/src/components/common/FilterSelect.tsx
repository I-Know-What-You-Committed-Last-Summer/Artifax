// Lightweight select used for small filter controls.
// Props:
// - `value`: current selected value
// - `onChange`: called with the new value string
// - `options`: array of { label, value }
function FilterSelect({ value, onChange, options }) {
  return (
    <select
      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default FilterSelect;
