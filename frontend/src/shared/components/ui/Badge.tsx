import React from "react";
import { cn } from "@/shared/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variants = {
    default: "bg-slate-800 text-slate-300 border border-slate-700",
    success: "bg-emerald-950/70 text-emerald-300 border border-emerald-600/40",
    warning: "bg-amber-950/70 text-amber-300 border border-amber-600/40",
    danger: "bg-rose-950/70 text-rose-300 border border-rose-600/40",
    info: "bg-blue-950/70 text-blue-300 border border-blue-600/40",
    outline: "bg-transparent text-slate-400 border border-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

