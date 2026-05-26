function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primaryDark',
    secondary: 'border border-border bg-surface text-text hover:border-primary',
    ghost: 'bg-app text-text hover:bg-border',
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
