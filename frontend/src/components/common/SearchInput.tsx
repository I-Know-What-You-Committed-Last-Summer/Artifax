// Small controlled text input used for searching/filtering lists.
// - `value`: current text
// - `onChange`: receives new text value
// - `placeholder`: hint text
function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      className="w-full min-h-[3rem] rounded-[8px] border border-border bg-surface px-[0.95rem] py-[0.8rem] text-sm text-text outline-none placeholder:text-muted focus:border-primary"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type="text"
    />
  );
}

export default SearchInput;
