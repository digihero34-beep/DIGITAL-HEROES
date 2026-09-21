'use client';

import React, { useState, useCallback } from 'react';
import { AdminVerificationItem } from '@/modules/admin/admin-types';
import {
  approveVerificationAction,
  rejectVerificationAction,
  adminDeleteVerificationAction,
  adminCreateVerificationAction,
} from '@/modules/winners/verification-actions';
import { getAdminVerificationQueueAction } from '@/modules/admin/admin-actions';
import { useRealtimeTable } from '@/hooks/use-realtime-table';
import AdminDialog, { useAdminDialog } from './AdminDialog';
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
  const [syncing, setSyncing] = useState(false);
  const { dialog, showAlert, showConfirm } = useAdminDialog();

  const refresh = useCallback(async () => {
    setSyncing(true);
    const res = await getAdminVerificationQueueAction();
    if (res.success && res.data) {
      setItems(res.data);
    }
    setSyncing(false);
  }, []);

  // Live: new submissions from subscribers appear immediately
  useRealtimeTable({
    table: 'winner_verifications',
    channelName: 'admin-verification-queue',
    onData: refresh,
  });

  // Live: winner status transitions (e.g. pending_proof → submitted)
  useRealtimeTable({
    table: 'winners',
    channelName: 'admin-winners-status',
    onData: refresh,
  });

  const filteredItems = items.filter((item) => {
    if (filterTier === 'all') return true;
    return item.matchTier === filterTier;
  });

  const resolveProofUrl = (path?: string, filename?: string): string => {
    if (!path && !filename) return '/images/fairway_futures.jpg';
    const target = path || filename || '';
    if (
      target.startsWith('data:') ||
      target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('/')
    ) {
      return target;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !target.includes(' ')) {
      return `${supabaseUrl}/storage/v1/object/public/proofs/${target}`;
    }
    return `/${target}`;
  };

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
      await refresh();
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
    const notesToUse = adminNotes.trim() || 'Scorecard verification rejected by compliance inspection.';

    setIsProcessing(true);
    setFeedback(null);

    const res = await rejectVerificationAction({
      verificationId: selectedItem.id,
      adminNotes: notesToUse,
    });

    setIsProcessing(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Verification rejected. Defect notes recorded for patron.' });
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, status: 'rejected' } : i))
      );
      await refresh();
      setTimeout(() => {
        setSelectedItem(null);
        setAdminNotes('');
      }, 800);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to reject verification.' });
    }
  };
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [createData, setCreateData] = useState({
    winnerId: '',
    proofFilename: 'scorecard_attestation.png',
    proofStoragePath: '',
    status: 'submitted' as 'submitted' | 'under_review' | 'approved' | 'rejected',
    adminNotes: 'Attestation entry attached by Sovereign Trustee.',
  });

  const handleDeleteVerification = async (verificationId: string) => {
    showConfirm(
      'Delete Verification Record',
      'This will permanently remove the verification record and reset the winner status to pending proof.',
      async () => {
        setIsProcessing(true);
        const res = await adminDeleteVerificationAction({ verificationId });
        setIsProcessing(false);

        if (res.success) {
          setItems((prev) => prev.filter((i) => i.id !== verificationId));
          if (selectedItem?.id === verificationId) setSelectedItem(null);
          await refresh();
        } else {
          showAlert('error', 'Delete Failed', `Unable to remove verification record: ${res.error}`);
        }
      },
      'Delete Record',
      'Cancel'
    );
  };

  const handleCreateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.winnerId || !createData.proofFilename) return;

    setIsProcessing(true);
    const res = await adminCreateVerificationAction({
      winnerId: createData.winnerId.trim(),
      proofFilename: createData.proofFilename.trim(),
      proofStoragePath: createData.proofStoragePath.trim() || undefined,
      status: createData.status,
      adminNotes: createData.adminNotes.trim() || undefined,
    });
    setIsProcessing(false);

    if (res.success) {
      setIsAddOpen(false);
      await refresh();
    } else {
      showAlert('error', 'Creation Failed', `Unable to create verification record: ${res.error}`);
    }
  };

  return (
    <>
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Winner Verification &amp; Attestation Queue</h2>
            <span className={styles.countBadge}>
              {filteredItems.length} DOSSIERS
              {syncing && <span style={{ marginLeft: '0.5rem', opacity: 0.6, fontWeight: 400 }}>· SYNCING</span>}
            </span>
          </div>
          <p className={styles.sectionSubtitle}>
            Dual-custody handicap validation protocol. All grand-tier payouts require verified marker scorecards.
          </p>
        </div>
        <div className={styles.filterRow}>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className={styles.approveBtn}
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
          >
            ➕ Attach New Verification
          </button>
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
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
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
                      <button
                        type="button"
                        onClick={() => handleDeleteVerification(item.id)}
                        className={styles.rejectBtn}
                        style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                        title="Purge verification record"
                      >
                        🗑️
                      </button>
                    </div>
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

              <div className={styles.documentPreviewCard} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className={styles.documentIcon} style={{ fontSize: '1.75rem' }}>📄</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className={styles.documentName} style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {selectedItem.proofFilename}
                    </p>
                    <p className={styles.documentPath} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, wordBreak: 'break-all' }}>
                      Storage Path: {selectedItem.proofStoragePath.slice(0, 80)}{selectedItem.proofStoragePath.length > 80 ? '...' : ''}
                    </p>
                  </div>
                </div>

                {/* Inline Image / Visual Document Artifact Preview */}
                <div style={{ textAlign: 'center', background: '#0b1320', padding: '0.75rem', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.15)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-mint)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🖼️ Scorecard Verification Visual Artifact Preview
                  </p>
                  {(
                    selectedItem.proofMimeType?.includes('pdf') ||
                    selectedItem.proofFilename?.toLowerCase().endsWith('.pdf') ||
                    selectedItem.proofStoragePath?.startsWith('data:application/pdf')
                  ) ? (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>📄</div>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                        Official Scorecard PDF Attached
                      </p>
                      {resolveProofUrl(selectedItem.proofStoragePath, selectedItem.proofFilename).startsWith('data:') || resolveProofUrl(selectedItem.proofStoragePath, selectedItem.proofFilename).startsWith('http') ? (
                        <iframe
                          src={resolveProofUrl(selectedItem.proofStoragePath, selectedItem.proofFilename)}
                          style={{ width: '100%', height: '260px', border: 'none', borderRadius: '4px', marginTop: '0.5rem' }}
                          title="Scorecard PDF Preview"
                        />
                      ) : null}
                    </div>
                  ) : (
                    <img
                      src={resolveProofUrl(selectedItem.proofStoragePath, selectedItem.proofFilename)}
                      alt={selectedItem.proofFilename}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/fairway_futures.jpg';
                      }}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '280px',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      }}
                    />
                  )}
                </div>

                {/* Download Action Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                  <a
                    href={resolveProofUrl(selectedItem.proofStoragePath, selectedItem.proofFilename)}
                    download={selectedItem.proofFilename}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      const proofUrl = resolveProofUrl(selectedItem.proofStoragePath, selectedItem.proofFilename);
                      if (!proofUrl.startsWith('data:') && !proofUrl.startsWith('http')) {
                        e.preventDefault();
                        const blob = new Blob([`Digital Heroes Verification Record\nFilename: ${selectedItem.proofFilename}\nPath: ${selectedItem.proofStoragePath}\nStatus: ${selectedItem.status}`], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = selectedItem.proofFilename;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    className={styles.actionBtnGold}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 1rem',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    📥 Download Proof Document
                  </a>
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

            <div className={styles.modalFooter} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <button
                type="button"
                onClick={() => handleDeleteVerification(selectedItem.id)}
                disabled={isProcessing}
                className={styles.rejectBtn}
                style={{ background: '#7f1d1d', borderColor: '#ef4444' }}
              >
                🗑️ Purge Entry
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
        </div>
      )}

      {/* CREATE VERIFICATION ENTRY MODAL */}
      {isAddOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddOpen(false)}>
          <div className={styles.modalCard} style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>➕ Attach New Verification Entry</h2>
              <button type="button" onClick={() => setIsAddOpen(false)} className={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCreateVerification} className={styles.modalBody}>
              <div>
                <label className={styles.inputLabel}>Winner Record ID *</label>
                <input
                  type="text"
                  required
                  value={createData.winnerId}
                  onChange={(e) => setCreateData({ ...createData, winnerId: e.target.value })}
                  className={styles.textInput}
                  placeholder="Paste Winner UUID or select patron"
                />
              </div>

              <div className={styles.formRowGrid}>
                <div>
                  <label className={styles.inputLabel}>Proof Document Filename *</label>
                  <input
                    type="text"
                    required
                    value={createData.proofFilename}
                    onChange={(e) => setCreateData({ ...createData, proofFilename: e.target.value })}
                    className={styles.textInput}
                    placeholder="e.g. scorecard_signed.png"
                  />
                </div>
                <div>
                  <label className={styles.inputLabel}>Verification Status *</label>
                  <select
                    value={createData.status}
                    onChange={(e) => setCreateData({ ...createData, status: e.target.value as any })}
                    className={styles.selectInput}
                  >
                    <option value="submitted">Submitted (Pending Review)</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved (Provision Payout)</option>
                    <option value="rejected">Rejected (Defect Note)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Audit Notes / Trustee Findings</label>
                <textarea
                  rows={3}
                  value={createData.adminNotes}
                  onChange={(e) => setCreateData({ ...createData, adminNotes: e.target.value })}
                  className={styles.textInput}
                  placeholder="Record marker sign-off or compliance verification notes..."
                />
              </div>

              <div>
                <label className={styles.inputLabel}>Proof Image URL / Data Path (Optional)</label>
                <input
                  type="text"
                  value={createData.proofStoragePath}
                  onChange={(e) => setCreateData({ ...createData, proofStoragePath: e.target.value })}
                  className={styles.textInput}
                  placeholder="e.g. /images/fairway_futures.jpg or data:image/png..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsAddOpen(false)} className={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className={styles.approveBtn}>
                  {isProcessing ? 'Saving...' : 'Create Verification Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    <AdminDialog options={dialog} />
    </>
  );
}
