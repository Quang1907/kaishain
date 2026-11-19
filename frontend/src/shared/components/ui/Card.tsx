import React from "react";
import { cn } from "@/shared/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-factory-card border border-factory-border rounded-xl p-4 shadow-sm",
        hoverEffect && "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

