import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "red" | "blue" | "green" | "ghost" | "danger";
type Size = "md" | "lg" | "xl";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-blue text-white hover:bg-[#3a68e0] active:bg-[#3159c4] shadow-[0_4px_0_0_#2c4fb0]",
  red: "bg-brand-red text-white hover:bg-[#e64444] active:bg-[#cc3b3b] shadow-[0_4px_0_0_#b23030]",
  blue: "bg-brand-blue text-white hover:bg-[#3a68e0] active:bg-[#3159c4] shadow-[0_4px_0_0_#2c4fb0]",
  green:
    "bg-brand-green text-[#04241a] hover:bg-[#2ec292] active:bg-[#28ac81] shadow-[0_4px_0_0_#1f8a68]",
  ghost:
    "bg-card text-foreground hover:bg-card-hover border border-border shadow-none",
  danger:
    "bg-transparent text-brand-red border border-brand-red/50 hover:bg-brand-red/10 shadow-none",
};

const sizeClasses: Record<Size, string> = {
  md: "px-5 py-3 text-base rounded-xl",
  lg: "px-7 py-4 text-lg rounded-2xl",
  xl: "px-9 py-6 text-xl rounded-3xl",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button(
  { variant = "primary", size = "lg", className = "", disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`font-semibold tracking-wide transition-all active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
});
