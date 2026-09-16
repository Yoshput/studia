import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export function Card({ children, className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-ios-surface border border-ios-border rounded-card p-4 sm:p-5 shadow-ios transition-all duration-200",
        interactive && "hover:shadow-iosHover active:scale-[0.99] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-[17px] font-semibold text-ios-textPrimary tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-[13px] font-medium text-ios-textSecondary", className)} {...props}>
      {children}
    </p>
  );
}
