import React, { forwardRef } from 'react';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClass = {
      primary: styles.variantPrimary,
      secondary: styles.variantSecondary,
      tertiary: styles.variantTertiary,
      destructive: styles.variantDestructive,
      ghost: styles.variantGhost,
    }[variant];

    const sizeClass = {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${styles.button}
          ${variantClass}
          ${sizeClass}
          ${isLoading ? styles.loading : ''}
          ${disabled ? styles.disabled : ''}
          ${className || ''}
        `}
        {...props}
      >
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
