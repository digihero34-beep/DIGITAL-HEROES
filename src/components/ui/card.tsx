import React, { forwardRef } from 'react';
import styles from './card.module.css';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'outline';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', interactive = false, children, className, ...props }, ref) => {
    const variantClass = {
      default: styles.variantDefault,
      elevated: styles.variantElevated,
      glass: styles.variantGlass,
      outline: styles.variantOutline,
    }[variant];

    return (
      <div
        ref={ref}
        className={`
          ${styles.card}
          ${variantClass}
          ${interactive ? styles.isInteractive : ''}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.cardHeader} ${className || ''}`}>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        {description && <p className={styles.cardDescription}>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${styles.cardContent} ${className || ''}`}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${styles.cardFooter} ${className || ''}`}>{children}</div>;
}
