import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-ios-textSecondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-[15px] text-ios-textPrimary placeholder:text-ios-textSecondary/60 focus:outline-none focus:border-ios-accent focus:bg-ios-surface transition-all duration-150 min-h-[44px]",
            error && "border-ios-danger focus:border-ios-danger",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-[12px] font-medium text-ios-danger">{error}</p>
        ) : helperText ? (
          <p className="text-[12px] text-ios-textSecondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-ios-textSecondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-[15px] text-ios-textPrimary placeholder:text-ios-textSecondary/60 focus:outline-none focus:border-ios-accent focus:bg-ios-surface transition-all duration-150 resize-y",
            error && "border-ios-danger focus:border-ios-danger",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-[12px] font-medium text-ios-danger">{error}</p>
        ) : helperText ? (
          <p className="text-[12px] text-ios-textSecondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-ios-textSecondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-btn bg-ios-surfaceSecondary border border-ios-border text-[15px] text-ios-textPrimary focus:outline-none focus:border-ios-accent focus:bg-ios-surface transition-all duration-150 min-h-[44px]",
            error && "border-ios-danger focus:border-ios-danger",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-[12px] font-medium text-ios-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
