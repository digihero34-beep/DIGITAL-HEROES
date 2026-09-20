'use client';

import React, { useState } from 'react';
import { AdminSubscriberRow } from '@/modules/admin/admin-types';
import { adminUpdateUserRoleAction } from '@/modules/admin/admin-actions';
import styles from './admin-components.module.css';

interface Props {
  initialSubscribers: AdminSubscriberRow[];
  total: number;
}

export default function SubscriberAuditTable({ initialSubscribers, total }: Props) {
  const [subscribers, setSubscribers] = useState<AdminSubscriberRow[]>(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = subscribers.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.email.toLowerCase().includes(q) ||
      (s.fullName && s.fullName.toLowerCase().includes(q))
    );
  });

  const handleRoleToggle = async (userId: string, currentRole: 'public' | 'subscriber' | 'admin') => {
    const nextRole = currentRole === 'admin' ? 'subscriber' : 'admin';
    if (!window.confirm(`Update clearance for patron to '${nextRole}'?`)) return;

    setUpdatingId(userId);
    setMessage(null);

    const res = await adminUpdateUserRoleAction({
      userId,
      newRole: nextRole,
    });

    setUpdatingId(null);
    if (res.success) {
      setSubscribers((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, role: nextRole } : s))
      );
      setMessage(`Clearance updated to ${nextRole.toUpperCase()}`);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage(`Error: ${res.error}`);
    }
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Subscriber & Handicap Ledger Audit</h2>
            <span className={styles.countBadge}>{total} ENROLLED</span>
          </div>
          <p className={styles.sectionSubtitle}>
            Full patron directory, membership standing, active 5-score combinations, and designated charities.
          </p>
        </div>

        <div className={styles.filterRow}>
          <input
            type="text"
            placeholder="Search email or patron name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.textInput}
          />
        </div>
      </div>

      {message && <div className={styles.inlineMessage}>{message}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.ledgerTable}>
          <thead>
            <tr>
              <th>Patron Dossier</th>
              <th>Clearance</th>
              <th>Subscription Standing</th>
              <th>Designated Charity</th>
              <th>Active Scores</th>
              <th>Latest Entry</th>
              <th>Clearance Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  No patrons match query.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className={styles.patronCell}>
                      <strong>{s.fullName || 'Anonymous Patron'}</strong>
                      <span>{s.email}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.roleBadge} ${
                        s.role === 'admin' ? styles.roleAdmin : styles.roleSubscriber
                      }`}
                    >
                      {s.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        s.subscriptionStatus === 'active'
                          ? styles.statusApproved
                          : s.subscriptionStatus === 'past_due'
                          ? styles.statusPending
                          : styles.statusNone
                      }`}
                    >
                      {s.subscriptionStatus.toUpperCase()}
                      {s.planInterval ? ` (${s.planInterval.toUpperCase()})` : ''}
                    </span>
                  </td>
                  <td>
                    {s.charityName ? (
                      <span className={styles.charityTag}>
                        {s.charityName} ({s.charityContributionPct || 10}%)
                      </span>
                    ) : (
                      <span className={styles.dimText}>Default Pool</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`${styles.scoreCountBadge} ${
                        s.activeScoresCount === 5 ? styles.scoreFull : styles.scorePartial
                      }`}
                    >
                      {s.activeScoresCount} / 5 STABLEFORD
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    {s.lastScoreDate
                      ? new Date(s.lastScoreDate).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleRoleToggle(s.id, s.role)}
                      disabled={updatingId === s.id}
                      className={styles.actionBtnSecondary}
                    >
                      {updatingId === s.id
                        ? 'Updating...'
                        : s.role === 'admin'
                        ? 'Revoke Admin'
                        : 'Grant Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
