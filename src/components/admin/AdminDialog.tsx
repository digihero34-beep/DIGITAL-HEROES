'use client';

import React, { useEffect, useCallback } from 'react';
import styles from './admin-components.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type DialogVariant = 'info' | 'success' | 'error' | 'warning' | 'confirm';

export interface DialogOptions {
  variant: DialogVariant;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminDialog() {
  const [state, setState] = React.useState<DialogOptions | null>(null);

  const showAlert = useCallback(
    (
      variant: Exclude<DialogVariant, 'confirm'>,
      title: string,
      message: string | React.ReactNode
    ) => {
      setState({ variant, title, message, onClose: () => setState(null) });
    },
    []
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string | React.ReactNode,
      onConfirm: () => void,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel'
    ) => {
      setState({
        variant: 'confirm',
        title,
        message,
        confirmLabel,
        cancelLabel,
        onConfirm: () => {
          setState(null);
          onConfirm();
        },
        onCancel: () => setState(null),
      });
    },
    []
  );

  return { dialog: state, showAlert, showConfirm };
}

// ─── Component ────────────────────────────────────────────────────────────────

const VARIANT_META: Record<DialogVariant, { icon: string; accent: string }> = {
  info: { icon: 'ℹ', accent: '#60a5fa' },
  success: { icon: '✓', accent: '#10b981' },
  error: { icon: '✕', accent: '#ef4444' },
  warning: { icon: '⚠', accent: '#f59e0b' },
  confirm: { icon: '⚡', accent: '#C9A84C' },
};

export default function AdminDialog({ options }: { options: DialogOptions | null }) {
  useEffect(() => {
    if (!options) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (options.variant === 'confirm') options.onCancel?.();
        else options.onClose?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [options]);

  if (!options) return null;

  const { variant, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel' } = options;
  const { icon, accent } = VARIANT_META[variant];
  const isConfirm = variant === 'confirm';

  const handleOverlay = () => {
    if (isConfirm) options.onCancel?.();
    else options.onClose?.();
  };

  return (
    <div className={styles.dialogOverlay} onClick={handleOverlay}>
      <div
        className={styles.dialogCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
      >
        <div className={styles.dialogIconWrap} style={{ borderColor: accent }}>
          <span className={styles.dialogIcon} style={{ color: accent }}>
            {icon}
          </span>
        </div>

        <div className={styles.dialogBody}>
          <h3 id="admin-dialog-title" className={styles.dialogTitle}>
            {title}
          </h3>
          <div className={styles.dialogMessage}>{message}</div>
        </div>

        <div className={styles.dialogActions}>
          {isConfirm && (
            <button
              type="button"
              className={styles.dialogBtnSecondary}
              onClick={options.onCancel}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={styles.dialogBtnPrimary}
            style={{ background: accent }}
            onClick={isConfirm ? options.onConfirm : options.onClose}
            autoFocus
          >
            {isConfirm ? confirmLabel : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
}
