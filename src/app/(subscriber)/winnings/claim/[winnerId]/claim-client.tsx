'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../winnings.module.css';
import { WinnerRecord } from '@/modules/winners/winner-types';
import { submitProofAction } from '@/modules/winners/verification-actions';
import { formatCurrencyGBP } from '@/modules/prizes/prize-engine';

interface ClaimClientProps {
  winner: WinnerRecord;
}

export function ClaimClient({ winner }: ClaimClientProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMessage('Selected file exceeds the 10MB limit.');
        return;
      }
      setFile(selected);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a scorecard image or PDF to upload.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;

        const result = await submitProofAction({
          winnerId: winner.id,
          proofStoragePath: dataUrl,
          proofFilename: file.name,
          proofFileSize: file.size,
          proofMimeType: file.type || 'image/png',
        });

        if (!result.success) {
          setErrorMessage(result.error);
          setSubmitting(false);
          return;
        }

        setSuccessMessage('Verification document submitted successfully! Our compliance team is reviewing it.');
        router.refresh();
      } catch {
        setErrorMessage('An unexpected error occurred during submission.');
      } finally {
        setSubmitting(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read selected file.');
      setSubmitting(false);
    };

    reader.readAsDataURL(file);
  }

  const isLocked = winner.verificationStatus === 'submitted' || winner.verificationStatus === 'approved';

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <Link href="/winnings" style={{ color: 'var(--accent-mint)', fontSize: '0.875rem', fontWeight: 600 }}>
          ← Back to All Winnings
        </Link>
      </div>

      <div className={styles.claimWrapper}>
        <div className={styles.claimCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <span className={styles.badge}>
                <span className={styles.badgeDot} />
                Prize Claim Verification
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 'var(--space-2)' }}>
                Claim {formatCurrencyGBP(winner.prizeAmountCents)}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Draw #{winner.drawNumber || 1} • {winner.matchTier?.toLowerCase() === 'match_5' ? '5-Number Jackpot' : `${winner.matchTier?.toLowerCase().replace('match_', '')}-Number Match`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
              <div style={{ marginTop: '4px' }}>
                {winner.verificationStatus === 'approved' && (
                  <span className={`${styles.statusBadge} ${styles.statusApproved}`}>✓ Approved</span>
                )}
                {winner.verificationStatus === 'submitted' && (
                  <span className={`${styles.statusBadge} ${styles.statusSubmitted}`}>⌛ Under Review</span>
                )}
                {winner.verificationStatus === 'rejected' && (
                  <span className={`${styles.statusBadge} ${styles.statusRejected}`}>⚠️ Rejected</span>
                )}
                {winner.verificationStatus === 'pending_proof' && (
                  <span className={`${styles.statusBadge} ${styles.statusPendingProof}`}>● Proof Required</span>
                )}
              </div>
            </div>
          </div>

          {/* Rejection Admin Notes Alert */}
          {winner.verificationStatus === 'rejected' && winner.verification?.adminNotes && (
            <div
              style={{
                padding: 'var(--space-4)',
                background: 'var(--status-danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--status-danger-text)',
                fontSize: '0.875rem',
              }}
            >
              <strong>Reviewer Feedback:</strong> {winner.verification.adminNotes}
              <p style={{ marginTop: '4px', fontSize: '0.8125rem' }}>
                Please review the guidelines below and upload a corrected document.
              </p>
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--status-danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--status-danger-text)',
                fontSize: '0.875rem',
              }}
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--status-active-bg)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--status-active-text)',
                fontSize: '0.875rem',
              }}
              role="status"
            >
              {successMessage}
            </div>
          )}

          {/* Verification Requirements */}
          <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Verification Requirements (PRD § 09)
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li>✓ Upload an official scorecard, club handicap app export (e.g. GolfNow, HowDidiDo), or signed club scorecard.</li>
              <li>✓ The played date must correspond to your recorded rounds for this draw period.</li>
              <li>✓ The Stableford point totals must be clearly legible.</li>
              <li>✓ Max file size: 10MB (JPG, PNG, WEBP, or PDF).</li>
            </ul>
          </div>

          {/* Upload Form */}
          {isLocked ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>
              <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                {winner.verificationStatus === 'approved'
                  ? 'Verification Approved'
                  : 'Document Under Review'}
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                {winner.verification?.proofFilename && `Submitted: ${winner.verification.proofFilename}`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <label
                htmlFor="proof-file-input"
                className={`${styles.dropZone} ${file ? styles.dropZoneActive : ''}`}
              >
                <span style={{ fontSize: '2rem' }}>📄</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  {file ? file.name : 'Click to browse scorecard proof document'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'JPG, PNG, WEBP, or PDF up to 10MB'}
                </span>
                <input
                  id="proof-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={submitting}
                />
              </label>

              <button
                type="submit"
                className={styles.claimBtn}
                disabled={submitting || !file}
                style={{ justifyContent: 'center', padding: '0.75rem 1rem', fontSize: '0.9375rem' }}
              >
                {submitting ? 'Uploading Proof...' : 'Submit Scorecard for Verification'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
