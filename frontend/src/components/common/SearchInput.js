function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type="text"
    />
  );
}

export default SearchInput;
