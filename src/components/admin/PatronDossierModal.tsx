'use client';

import React, { useState } from 'react';
import { AdminUserDetail } from '@/modules/admin/admin-types';
import {
  adminEditScoreAction,
  adminDeleteScoreAction,
  adminDeleteUserAction,
  adminDeclareWinnerAction,
} from '@/modules/admin/admin-actions';
import AdminDialog, { useAdminDialog } from './AdminDialog';
import styles from './admin-components.module.css';

interface Props {
  detail: AdminUserDetail;
  onClose: () => void;
  onRoleToggle: (userId: string, currentRole: 'public' | 'subscriber' | 'admin') => Promise<void>;
  isUpdatingRole: boolean;
  onRefresh?: () => void;
}

export default function PatronDossierModal({
  detail,
  onClose,
  onRoleToggle,
  isUpdatingRole,
  onRefresh,
}: Props) {
  const { profile, subscription, scores, charityPreference, winnings } = detail;

  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState<number>(36);
  const [editScoreDate, setEditScoreDate] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { dialog, showAlert, showConfirm } = useAdminDialog();

  const handleStartEditScore = (scoreId: string, currentScore: number, currentDate: string) => {
    setEditingScoreId(scoreId);
    setEditScoreValue(currentScore);
    setEditScoreDate(currentDate.split('T')[0]);
  };

  const handleSaveScoreEdit = async (scoreId: string) => {
    setIsProcessing(true);
    setActionMessage(null);
    const res = await adminEditScoreAction({
      scoreId,
      newScore: Number(editScoreValue),
      newDate: editScoreDate,
    });
    setIsProcessing(false);

    if (res.success) {
      setEditingScoreId(null);
      setActionMessage('Score record updated successfully.');
      if (onRefresh) onRefresh();
    } else {
      setActionMessage(`Failed to edit score: ${res.error}`);
    }
  };

  const handleDeleteScore = async (scoreId: string) => {
    showConfirm(
      'Delete Score Entry',
      'This will permanently remove this score and re-evaluate the rolling 5 active scores.',
      async () => {
        setIsProcessing(true);
        setActionMessage(null);
        const res = await adminDeleteScoreAction({ scoreId, userId: profile.id });
        setIsProcessing(false);

        if (res.success) {
          setActionMessage('Score deleted successfully.');
          if (onRefresh) onRefresh();
        } else {
          setActionMessage(`Failed to delete score: ${res.error}`);
        }
      },
      'Delete Score',
      'Cancel'
    );
  };

  const handlePurgeUser = () => {
    showConfirm(
      `Purge Patron Account`,
      `This will permanently delete '${profile.email}' and all associated scores, pledges, and claims. This action cannot be undone.`,
      async () => {
        setIsProcessing(true);
        setActionMessage(null);
        const res = await adminDeleteUserAction({ userId: profile.id });
        setIsProcessing(false);

        if (res.success) {
          onClose();
          if (onRefresh) onRefresh();
        } else {
          showAlert('error', 'Purge Failed', `Unable to purge patron: ${res.error}`);
          setActionMessage(`Purge failed: ${res.error}`);
        }
      },
      'Permanently Purge',
      'Cancel'
    );
  };

  const handleDeclareWinner = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    const res = await adminDeclareWinnerAction({
      userId: profile.id,
      matchTier: 'match_4',
      prizeAmountCents: 25000,
    });
    setIsProcessing(false);

    if (res.success) {
      setActionMessage('Winner entry assigned. Patron has a claimable reward.');
      if (onRefresh) onRefresh();
    } else {
      showAlert('error', 'Assignment Failed', `Unable to declare winner: ${res.error}`);
      setActionMessage(`Failed to assign winner: ${res.error}`);
    }
  };

  return (
    <>
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modalCard}
        style={{ maxWidth: '840px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.1rem' }}>👤</span>
              <h2 className={styles.modalTitle} style={{ fontSize: '1.25rem' }}>
                {profile.fullName || 'Patron Dossier'}
              </h2>
              <span
                className={`${styles.roleBadge} ${
                  profile.role === 'admin' ? styles.roleAdmin : styles.roleSubscriber
                }`}
              >
                {profile.role.toUpperCase()}
              </span>
            </div>
            <p className={styles.modalSubtitle} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {profile.email} • ID: {profile.id} • Registered: {new Date(profile.createdAt).toLocaleDateString('en-GB')}
            </p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
            ✕
          </button>
        </div>

        {actionMessage && <div className={styles.inlineMessage}>{actionMessage}</div>}

        {/* Scrollable Body */}
        <div className={styles.modalBody} style={{ overflowY: 'auto', padding: '1.5rem', gap: '1.5rem' }}>
          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              background: '#0a0f16',
              padding: '1rem',
              border: '1px solid rgba(242, 237, 228, 0.08)',
            }}
          >
            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: '#8E9BAE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Active Draw Balls
              </span>
              <strong style={{ fontSize: '1.25rem', color: scores.activeScores.length === 5 ? '#10B981' : '#C9A84C' }}>
                {scores.activeScores.length} / 5
              </strong>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: '#8E9BAE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Avg Stableford
              </span>
              <strong style={{ fontSize: '1.25rem', color: '#F2EDE4' }}>
                {scores.stats.averageScore.toFixed(1)} pts
              </strong>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: '#8E9BAE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Subscription
              </span>
              <strong
                style={{
                  fontSize: '1rem',
                  color: subscription?.status === 'active' ? '#10B981' : '#f87171',
                  textTransform: 'uppercase',
                }}
              >
                {subscription ? subscription.status : 'None'}
              </strong>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: '#8E9BAE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Charity Allocation
              </span>
              <strong style={{ fontSize: '1rem', color: '#C9A84C' }}>
                {charityPreference ? `${charityPreference.contributionPercentage}%` : '10% (Default)'}
              </strong>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: '#8E9BAE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total Prize Winnings
              </span>
              <strong style={{ fontSize: '1.1rem', color: '#C9A84C' }}>
                £{(winnings.reduce((sum, w) => sum + w.prizeAmountCents, 0) / 100).toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Section 1: Active 5-Ball Hand */}
          <div style={{ background: '#141C25', border: '1px solid rgba(242, 237, 228, 0.1)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem 0' }}>
              Active Monthly Draw Entry (Rolling 5 Stableford Hand)
            </h3>
            {scores.activeScores.length === 0 ? (
              <p style={{ color: '#8E9BAE', fontSize: '0.8125rem', margin: 0 }}>
                Patron has not logged any active rounds yet.
              </p>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {scores.activeScores.map((s, idx) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: '#0B1015',
                      border: '1px solid rgba(201, 168, 76, 0.4)',
                      padding: '0.75rem 1rem',
                      minWidth: '90px',
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', color: '#8E9BAE', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Ball #{idx + 1}
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C9A84C', fontFamily: 'monospace' }}>
                      {s.score}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#8E9BAE', marginTop: '0.2rem' }}>
                      {new Date(s.playedDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Full Scoring Ledger */}
          <div style={{ background: '#141C25', border: '1px solid rgba(242, 237, 228, 0.1)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#F2EDE4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Complete Rounds Ledger ({scores.totalSubmitted} Total Rounds)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#8E9BAE' }}>
                Hi: {scores.stats.highestScore} pts • Lo: {scores.stats.lowestScore} pts
              </span>
            </div>

            {scores.totalSubmitted === 0 ? (
              <p style={{ color: '#8E9BAE', fontSize: '0.8125rem', margin: 0 }}>No rounds on record.</p>
            ) : (
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(242, 237, 228, 0.1)', color: '#8E9BAE', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Date Played</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Stableford Score</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Status</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...scores.activeScores, ...scores.historicalScores].map((row) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid rgba(242, 237, 228, 0.05)' }}>
                        <td style={{ padding: '0.45rem 0.6rem', color: '#F2EDE4' }}>
                          {editingScoreId === row.id ? (
                            <input
                              type="date"
                              value={editScoreDate}
                              onChange={(e) => setEditScoreDate(e.target.value)}
                              className={styles.textInput}
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                            />
                          ) : (
                            new Date(row.playedDate).toLocaleDateString('en-GB')
                          )}
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem', fontWeight: 700, color: '#C9A84C' }}>
                          {editingScoreId === row.id ? (
                            <input
                              type="number"
                              min={1}
                              max={45}
                              value={editScoreValue}
                              onChange={(e) => setEditScoreValue(Number(e.target.value))}
                              className={styles.textInput}
                              style={{ width: '60px', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                            />
                          ) : (
                            `${row.score} pts`
                          )}
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem' }}>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.4rem',
                              background: scores.activeScores.some((a) => a.id === row.id)
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(142, 155, 174, 0.1)',
                              color: scores.activeScores.some((a) => a.id === row.id) ? '#10B981' : '#8E9BAE',
                              border: scores.activeScores.some((a) => a.id === row.id)
                                ? '1px solid rgba(16, 185, 129, 0.3)'
                                : '1px solid rgba(142, 155, 174, 0.2)',
                            }}
                          >
                            {scores.activeScores.some((a) => a.id === row.id) ? 'ACTIVE' : 'HISTORICAL'}
                          </span>
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {editingScoreId === row.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveScoreEdit(row.id)}
                                  disabled={isProcessing}
                                  className={styles.approveBtn}
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingScoreId(null)}
                                  className={styles.secondaryBtn}
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditScore(row.id, row.score, row.playedDate)}
                                  className={styles.actionBtnSecondary}
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteScore(row.id)}
                                  disabled={isProcessing}
                                  className={styles.rejectBtn}
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Subscription & Philanthropic Beneficiary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {/* Subscription Box */}
            <div style={{ background: '#141C25', border: '1px solid rgba(242, 237, 228, 0.1)', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#F2EDE4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem 0' }}>
                💳 Membership & Billing
              </h3>
              {subscription ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                  <div>Plan: <strong>{subscription.planName || subscription.planId}</strong></div>
                  <div>Status: <span style={{ color: subscription.status === 'active' ? '#10B981' : '#f87171', fontWeight: 700 }}>{subscription.status.toUpperCase()}</span></div>
                  <div>Period: <span>{subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart).toLocaleDateString('en-GB') : '—'} → {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB') : '—'}</span></div>
                  {subscription.stripeCustomerId && (
                    <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#8E9BAE' }}>
                      Stripe: {subscription.stripeCustomerId}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#8E9BAE', fontSize: '0.8125rem', margin: 0 }}>No membership on file.</p>
              )}
            </div>

            {/* Charity Box */}
            <div style={{ background: '#141C25', border: '1px solid rgba(242, 237, 228, 0.1)', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#F2EDE4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem 0' }}>
                🤝 Philanthropic Beneficiary
              </h3>
              {charityPreference ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                  <div>Charity: <strong>{charityPreference.charityName}</strong></div>
                  <div>Category: <span style={{ color: '#8E9BAE' }}>{charityPreference.category}</span></div>
                  <div>Pledge Percentage: <strong style={{ color: '#C9A84C' }}>{charityPreference.contributionPercentage}% of Membership</strong></div>
                </div>
              ) : (
                <p style={{ color: '#8E9BAE', fontSize: '0.8125rem', margin: 0 }}>Enrolled in default charity pool (10%).</p>
              )}
            </div>
          </div>

          {/* Section 4: Draw Participation & Winnings History */}
          <div style={{ background: '#141C25', border: '1px solid rgba(242, 237, 228, 0.1)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem 0' }}>
              🏆 Draw Winnings &amp; Prize Claims ({winnings.length})
            </h3>
            {winnings.length === 0 ? (
              <p style={{ color: '#8E9BAE', fontSize: '0.8125rem', margin: 0 }}>
                No winning claims recorded for this patron yet.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(242, 237, 228, 0.1)', color: '#8E9BAE', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Draw</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Match Tier</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Balls</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Prize Amount</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Verification</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winnings.map((w) => (
                      <tr key={w.id} style={{ borderBottom: '1px solid rgba(242, 237, 228, 0.05)' }}>
                        <td style={{ padding: '0.45rem 0.6rem', color: '#F2EDE4', fontWeight: 700 }}>
                          #{w.drawNumber}
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem', color: '#C9A84C' }}>
                          {w.matchTier.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>
                          {w.matchedNumbers.join(', ')}
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem', fontWeight: 700, color: '#C9A84C' }}>
                          £{(w.prizeAmountCents / 100).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem' }}>
                          <span className={styles.statusPill}>
                            {w.verificationStatus.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem', color: w.payoutStatus === 'paid' ? '#10B981' : '#8E9BAE' }}>
                          {w.payoutStatus ? w.payoutStatus.toUpperCase() : 'PENDING'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#0B1015',
            borderTop: '1px solid rgba(242, 237, 228, 0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => onRoleToggle(profile.id, profile.role)}
              disabled={isUpdatingRole}
              className={styles.actionBtnSecondary}
              style={{ padding: '0.5rem 1rem' }}
            >
              {isUpdatingRole
                ? 'Updating Clearance...'
                : profile.role === 'admin'
                ? 'Revoke Admin Privileges'
                : 'Promote to Sovereign Trustee (Admin)'}
            </button>

            <button
              type="button"
              onClick={handleDeclareWinner}
              disabled={isProcessing}
              className={styles.approveBtn}
              style={{ padding: '0.5rem 1rem' }}
            >
              🏆 Declare Winner (£250)
            </button>

            <button
              type="button"
              onClick={handlePurgeUser}
              disabled={isProcessing}
              className={styles.rejectBtn}
              style={{ padding: '0.5rem 1rem' }}
            >
              🗑️ Purge Patron Account
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={styles.actionBtnGold}
            style={{ padding: '0.5rem 1.5rem' }}
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>

    <AdminDialog options={dialog} />
    </>
  );
}
