import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-card border border-border rounded-3xl shadow-lg shadow-black/20 ${className}`}
      {...props}
    />
  );
}
