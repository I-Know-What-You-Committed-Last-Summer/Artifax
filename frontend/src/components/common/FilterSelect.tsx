import { useEffect, useMemo, useRef, useState } from 'react';

// Shared custom dropdown used for filter controls.
// Props:
// - `value`: current selected value
// - `onChange`: called with the new value string
// - `options`: array of { label, value }
function FilterSelect({
  value,
  onChange,
  options,
  className = '',
  ariaLabel = 'Filter options',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || options[0],
    [options, value],
  );

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current || rootRef.current.contains(event.target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled]);

  const handleSelect = (nextValue) => {
    if (disabled) {
      return;
    }

    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className={`artifax-select-shell ${className}`.trim()}>
      <button
        type="button"
        className="artifax-select"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((previous) => !previous);
          }
        }}
      >
        <span className="artifax-select-value">{selectedOption?.label ?? ''}</span>
        <span className="artifax-select-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {isOpen && !disabled ? (
        <div className="artifax-select-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`artifax-select-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default FilterSelect;
