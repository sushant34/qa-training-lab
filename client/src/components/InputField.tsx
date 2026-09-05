import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  maxLength?: number;
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, required, leftIcon, rightIcon, maxLength, className = '', value, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="form-group">
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            value={value}
            className={`input-field ${error ? 'input-error' : ''} ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
            maxLength={maxLength}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {rightIcon}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p id={`${props.id}-error`} className="form-error flex items-center gap-1" role="alert">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            {!error && hint && (
              <p id={`${props.id}-hint`} className="text-sm text-slate-500 dark:text-slate-400">
                {hint}
              </p>
            )}
          </div>
          {maxLength && (
            <span className={`text-xs tabular-nums ${currentLength >= maxLength ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, required, maxLength, rows = 3, className = '', value, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="form-group">
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          ref={ref}
          value={value}
          rows={rows}
          className={`input-field resize-none ${error ? 'input-error' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          maxLength={maxLength}
          {...props}
        />
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p id={`${props.id}-error`} className="form-error flex items-center gap-1" role="alert">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            {!error && hint && (
              <p id={`${props.id}-hint`} className="text-sm text-slate-500 dark:text-slate-400">
                {hint}
              </p>
            )}
          </div>
          {maxLength && (
            <span className={`text-xs tabular-nums ${currentLength >= maxLength ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';

export const SelectField = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}>(({ label, error, hint, required, options, placeholder, className = '', ...props }, ref) => {
  return (
    <div className="form-group">
      <label className="label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        ref={ref}
        className={`input-field appearance-none ${error ? 'input-error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="mt-1">
        {error && (
          <p id={`${props.id}-error`} className="form-error flex items-center gap-1" role="alert">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${props.id}-hint`} className="text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
});

SelectField.displayName = 'SelectField';
