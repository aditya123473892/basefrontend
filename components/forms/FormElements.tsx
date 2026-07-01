'use client';

import {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

// ---------------------------------------------------------------------------
// Global form building blocks.
//
// Import these wherever a form is built — login, signup, profile edit,
// settings, vehicle/driver create dialogs, etc. — instead of re-writing
// input/checkbox/button markup each time. Theme (colors, focus ring,
// radius, spacing) lives here once, so a future re-theme is a one-file
// change instead of a find-and-replace across every form in the app.
//
//   import { FormInput, FormCheckbox, FormButton } from '@/components/forms/FormElements';
// ---------------------------------------------------------------------------

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div>
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-900 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all
            ${error ? 'border-red-400' : 'border-slate-300'}
            ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div>
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={`min-h-[96px] w-full px-4 py-3 bg-white border rounded-lg text-slate-900 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all
            ${error ? 'border-red-400' : 'border-slate-300'}
            ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
FormTextarea.displayName = 'FormTextarea';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, id, className = '', children, ...props }, ref) => {
    const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 bg-white border rounded-lg text-slate-900
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all
            ${error ? 'border-red-400' : 'border-slate-300'}
            ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
FormSelect.displayName = 'FormSelect';

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, id, className = '', ...props }, ref) => {
    const inputId = id ?? 'checkbox-' + Math.random().toString(36).slice(2, 8);

    return (
      <label
        htmlFor={inputId}
        className="flex items-start text-slate-500 cursor-pointer group text-sm"
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={`mr-2 mt-0.5 w-4 h-4 flex-shrink-0 rounded border-slate-300 text-emerald-600
            checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer
            focus:ring-2 focus:ring-emerald-500 ${className}`}
          {...props}
        />
        <span className="group-hover:text-slate-900 transition-colors">{label}</span>
      </label>
    );
  }
);
FormCheckbox.displayName = 'FormCheckbox';

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary';
}

export const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  (
    { loading, loadingText, variant = 'primary', children, className = '', disabled, ...props },
    ref
  ) => {
    const variants = {
      primary:
        'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20',
      secondary:
        'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`w-full py-3.5 rounded-lg font-semibold transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]} ${className}`}
        {...props}
      >
        {loading ? loadingText ?? 'Please wait...' : children}
      </button>
    );
  }
);
FormButton.displayName = 'FormButton';