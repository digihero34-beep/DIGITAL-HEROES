import React, { forwardRef, useId } from 'react';
import styles from './select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      children,
      className,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className={styles.wrapper}>
        {label && (
          <div className={styles.labelRow}>
            <label htmlFor={selectId} className={styles.label}>
              {label}
              {required && <span className={styles.requiredStar}>*</span>}
            </label>
          </div>
        )}

        <div className={styles.selectContainer}>
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-help` : undefined}
            className={`
              ${styles.select}
              ${error ? styles.selectError : ''}
              ${className || ''}
            `}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <span className={styles.chevron} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>

        {error && (
          <p id={`${selectId}-error`} className={styles.errorText} role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${selectId}-help`} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
