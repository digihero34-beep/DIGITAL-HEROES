'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminCharityItem } from '@/modules/admin/admin-types';
import { toggleCharityFeaturedAction } from '@/modules/admin/admin-actions';
import styles from './admin-components.module.css';

interface Props {
  initialCharities: AdminCharityItem[];
}

export default function CharityGovernanceTable({ initialCharities }: Props) {
  const [charities, setCharities] = useState<AdminCharityItem[]>(initialCharities);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleToggleFeatured = async (charityId: string, currentFeatured: boolean) => {
    const nextState = !currentFeatured;
    setUpdatingId(charityId);
    setMessage(null);

    const res = await toggleCharityFeaturedAction({
      charityId,
      isFeatured: nextState,
    });

    setUpdatingId(charityId);
    if (res.success) {
      setCharities((prev) =>
        prev.map((c) => ({
          ...c,
          isFeatured: c.id === charityId ? nextState : nextState ? false : c.isFeatured,
        }))
      );
      setMessage(`Featured spotlight updated successfully.`);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage(`Error: ${res.error}`);
    }
    setUpdatingId(null);
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Charity Governance & Philanthropic Allocation</h2>
            <span className={styles.countBadge}>{charities.length} ACCREDITED</span>
          </div>
          <p className={styles.sectionSubtitle}>
            UKGC-licensed charity partners, supporter enrollment tallies, and homepage spotlight administration.
          </p>
        </div>
      </div>

      {message && <div className={styles.inlineMessage}>{message}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.ledgerTable}>
          <thead>
            <tr>
              <th>Charity Partner</th>
              <th>Category</th>
              <th>Spotlight Status</th>
              <th>Enrolled Patrons</th>
              <th>Total Disbursed</th>
              <th>Active Events</th>
              <th>Governance Action</th>
            </tr>
          </thead>
          <tbody>
            {charities.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className={styles.patronCell}>
                    <strong>{c.name}</strong>
                    <Link
                      href={`/charities/${c.slug}`}
                      target="_blank"
                      className={styles.profileLink}
                    >
                      View Public Profile ↗
                    </Link>
                  </div>
                </td>
                <td>
                  <span className={styles.categoryBadge}>{c.category}</span>
                </td>
                <td>
                  {c.isFeatured ? (
                    <span className={styles.featuredBadge}>★ FEATURED SPOTLIGHT</span>
                  ) : (
                    <span className={styles.standardBadge}>Standard Partner</span>
                  )}
                </td>
                <td className={styles.numberCell}>{c.supporterCount} Patrons</td>
                <td className={styles.moneyCell}>
                  £{(c.totalRaisedCents / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </td>
                <td>{c.eventsCount} Upcoming</td>
                <td>
                  <button
                    onClick={() => handleToggleFeatured(c.id, c.isFeatured)}
                    disabled={updatingId === c.id}
                    className={
                      c.isFeatured ? styles.actionBtnSecondary : styles.actionBtnGold
                    }
                  >
                    {updatingId === c.id
                      ? 'Updating...'
                      : c.isFeatured
                      ? 'Remove Spotlight'
                      : 'Make Spotlight'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
