import React, { forwardRef, useId } from 'react';
import styles from './input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      className,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={styles.wrapper}>
        {label && (
          <div className={styles.labelRow}>
            <label htmlFor={inputId} className={styles.label}>
              {label}
              {required && <span className={styles.requiredStar}>*</span>}
            </label>
          </div>
        )}

        <div className={styles.inputContainer}>
          {leftIcon && <span className={`${styles.iconSlot} ${styles.leftIconSlot}`}>{leftIcon}</span>}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
            className={`
              ${styles.input}
              ${error ? styles.inputError : ''}
              ${leftIcon ? styles.hasLeftIcon : ''}
              ${rightIcon ? styles.hasRightIcon : ''}
              ${className || ''}
            `}
            {...props}
          />

          {rightIcon && <span className={`${styles.iconSlot} ${styles.rightIconSlot}`}>{rightIcon}</span>}
        </div>

        {error && (
          <p id={`${inputId}-error`} className={styles.errorText} role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-help`} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
