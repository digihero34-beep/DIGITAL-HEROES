'use client';

import React, { useState } from 'react';
import { AdminVerificationItem } from '@/modules/admin/admin-types';
import {
  approveVerificationAction,
  rejectVerificationAction,
} from '@/modules/winners/verification-actions';
import styles from './admin-components.module.css';

interface Props {
  initialItems: AdminVerificationItem[];
}

export default function VerificationQueueTable({ initialItems }: Props) {
  const [items, setItems] = useState<AdminVerificationItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<AdminVerificationItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterTier, setFilterTier] = useState<string>('all');

  const filteredItems = items.filter((item) => {
    if (filterTier === 'all') return true;
    return item.matchTier === filterTier;
  });

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    setFeedback(null);

    const res = await approveVerificationAction({
      verificationId: selectedItem.id,
      adminNotes: adminNotes || undefined,
    });

    setIsProcessing(false);
    if (res.success) {
      setFeedback({ type: 'success', message: `Verification approved. Payout provisioned in pending status.` });
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, status: 'approved' } : i))
      );
      setTimeout(() => {
        setSelectedItem(null);
        setAdminNotes('');
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to approve verification.' });
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    if (!adminNotes.trim()) {
      setFeedback({ type: 'error', message: 'Admin defect notes are required when rejecting proof.' });
      return;
    }
    setIsProcessing(true);
    setFeedback(null);

    const res = await rejectVerificationAction({
      verificationId: selectedItem.id,
      adminNotes: adminNotes.trim(),
    });

    setIsProcessing(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Verification rejected. Defect notes recorded for patron.' });
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, status: 'rejected' } : i))
      );
      setTimeout(() => {
        setSelectedItem(null);
        setAdminNotes('');
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to reject verification.' });
    }
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Winner Verification & Attestation Queue</h2>
            <span className={styles.countBadge}>{filteredItems.length} DOSSIERS</span>
          </div>
          <p className={styles.sectionSubtitle}>
            Dual-custody handicap validation protocol. All grand-tier payouts require verified marker scorecards.
          </p>
        </div>
        <div className={styles.filterRow}>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className={styles.selectInput}
          >
            <option value="all">All Match Tiers</option>
            <option value="MATCH_5">Match 5 (Jackpot)</option>
            <option value="MATCH_4">Match 4 Tier</option>
            <option value="MATCH_3">Match 3 Tier</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No winner proofs currently pending audit in this queue.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.ledgerTable}>
            <thead>
              <tr>
                <th>Dossier ID</th>
                <th>Patron Benefactor</th>
                <th>Draw</th>
                <th>Match Tier</th>
                <th>Prize Value</th>
                <th>Proof Filename</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className={styles.monoCell}>{item.id.slice(0, 8).toUpperCase()}</td>
                  <td>
                    <div className={styles.patronCell}>
                      <strong>{item.patronName}</strong>
                      <span>{item.patronEmail}</span>
                    </div>
                  </td>
                  <td>#{item.drawNumber}</td>
                  <td>
                    <span
                      className={`${styles.tierBadge} ${
                        item.matchTier === 'MATCH_5'
                          ? styles.tier5
                          : item.matchTier === 'MATCH_4'
                          ? styles.tier4
                          : styles.tier3
                      }`}
                    >
                      {item.matchTier.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={styles.moneyCell}>
                    £{(item.prizeAmountCents / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={styles.filenameCell}>{item.proofFilename}</td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        item.status === 'approved'
                          ? styles.statusApproved
                          : item.status === 'rejected'
                          ? styles.statusRejected
                          : styles.statusPending
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setAdminNotes(item.adminNotes || '');
                        setFeedback(null);
                      }}
                      className={styles.actionBtn}
                    >
                      Audit Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Modal */}
      {selectedItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Attestation Audit: Dossier #{selectedItem.id.slice(0, 8)}</h3>
                <p className={styles.modalSubtitle}>
                  Patron: {selectedItem.patronName} ({selectedItem.patronEmail})
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} className={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.proofMetaGrid}>
                <div>
                  <label>Draw Ref</label>
                  <span>Draw #{selectedItem.drawNumber}</span>
                </div>
                <div>
                  <label>Match Tier</label>
                  <span>{selectedItem.matchTier}</span>
                </div>
                <div>
                  <label>Dispersal Amount</label>
                  <strong className={styles.goldText}>
                    £{(selectedItem.prizeAmountCents / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div>
                  <label>Proof Document</label>
                  <span>{selectedItem.proofFilename} ({(selectedItem.proofFileSize / 1024).toFixed(1)} KB)</span>
                </div>
              </div>

              <div className={styles.documentPreviewCard}>
                <div className={styles.documentIcon}>📄</div>
                <div>
                  <p className={styles.documentName}>{selectedItem.proofFilename}</p>
                  <p className={styles.documentPath}>Storage Path: {selectedItem.proofStoragePath}</p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>
                  Trustee Audit Notes / Reason {selectedItem.status === 'rejected' && '(Required on Rejection)'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record verification findings, scorecard marker sign-off, or correction requirements..."
                  rows={3}
                  className={styles.textareaInput}
                />
              </div>

              {feedback && (
                <div
                  className={
                    feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError
                  }
                >
                  {feedback.message}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={handleReject}
                disabled={isProcessing}
                className={styles.rejectBtn}
              >
                Reject Proof
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className={styles.approveBtn}
              >
                {isProcessing ? 'Authorizing...' : 'Approve & Provision Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
