// Simple reusable button component with three visual variants.
// - `variant`: chooses a CSS variant (primary/secondary/ghost)
// - `className` and `...props` are forwarded to the native <button>
function Button({ children, variant = 'primary', className = '', ...props }) {
  // shared base classes for spacing, sizing, and disabled state
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60';

  // visual variant mappings (uses CSS variables / tailwind tokens)
  const variants = {
    primary: 'bg-primary text-white hover:bg-primaryDark',
    secondary: 'border border-border bg-surface text-text hover:border-primary',
    ghost: 'bg-app text-text hover:bg-border',
  };

  // Render a native button so callers can pass onClick, disabled, etc.
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
