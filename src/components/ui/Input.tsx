import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`bg-background-elevated border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-2 focus:ring-brand-blue ${className}`}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`bg-background-elevated border border-border rounded-xl px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
