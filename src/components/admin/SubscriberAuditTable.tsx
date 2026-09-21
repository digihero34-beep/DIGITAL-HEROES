'use client';

import React, { useState } from 'react';
import styles from './admin-components.module.css';
import {
  AdminSubscriberRow,
  AdminUserDetail,
  adminCreateUserAction,
  adminUpdateUserAction,
  adminUpdateUserRoleAction,
  adminDeleteUserAction,
  getAdminUserDetailAction,
} from '@/modules/admin/admin-actions';
import PatronDossierModal from './PatronDossierModal';
import AdminDialog, { useAdminDialog } from './AdminDialog';

interface SubscriberAuditTableProps {
  initialSubscribers?: AdminSubscriberRow[];
  subscribers?: AdminSubscriberRow[];
  total?: number;
  onRefresh?: () => void;
}

export default function SubscriberAuditTable({
  initialSubscribers,
  subscribers: propSubscribers,
  onRefresh,
}: SubscriberAuditTableProps) {
  const { dialog, showConfirm, showAlert } = useAdminDialog();
  const [subscribers, setSubscribers] = useState<AdminSubscriberRow[]>(
    propSubscribers || initialSubscribers || []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Modal states for Create & Edit
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'subscriber' as 'subscriber' | 'admin',
  });

  const [editingUser, setEditingUser] = useState<AdminSubscriberRow | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    role: 'subscriber' as 'subscriber' | 'admin',
  });

  const refreshSubscribers = () => {
    if (onRefresh) onRefresh();
  };

  // CREATE PATRON
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.email || !createFormData.password) {
      showAlert('warning', 'Input Required', 'Email and password are required.');
      return;
    }
    setIsSubmittingCreate(true);
    setMessage(null);
    try {
      const res = await adminCreateUserAction(createFormData);
      if (res.success) {
        setIsAddUserOpen(false);
        setCreateFormData({ email: '', password: '', fullName: '', role: 'subscriber' });
        setMessage('Patron created successfully!');
        refreshSubscribers();
      } else {
        showAlert('error', 'Creation Failed', res.error || 'Failed to create user.');
      }
    } catch {
      showAlert('error', 'Creation Failed', 'An unexpected network error occurred.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // EDIT PATRON
  const handleOpenEdit = (s: AdminSubscriberRow) => {
    setEditingUser(s);
    setEditFormData({
      fullName: s.fullName || '',
      role: s.role === 'admin' ? 'admin' : 'subscriber',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmittingEdit(true);
    try {
      const res = await adminUpdateUserAction({
        userId: editingUser.id,
        fullName: editFormData.fullName,
        role: editFormData.role,
      });

      if (res.success) {
        setSubscribers((prev: AdminSubscriberRow[]) =>
          prev.map((sub) =>
            sub.id === editingUser.id
              ? { ...sub, fullName: editFormData.fullName, role: editFormData.role }
              : sub
          )
        );
        setEditingUser(null);
        setMessage('Patron profile updated successfully.');
        setTimeout(() => setMessage(null), 3000);
      } else {
        showAlert('error', 'Update Failed', res.error || 'Failed to update patron.');
      }
    } catch {
      showAlert('error', 'Update Failed', 'An unexpected network error occurred.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // DELETE PATRON
  const handleDeleteSubscriber = (s: AdminSubscriberRow) => {
    showConfirm(
      'Purge Patron Account',
      `Are you sure you want to permanently delete patron ${s.fullName || s.email}? This action cannot be undone.`,
      async () => {
        setUpdatingId(s.id);
        setMessage(null);
        try {
          const res = await adminDeleteUserAction({ userId: s.id });
          if (res.success) {
            setSubscribers((prev: AdminSubscriberRow[]) => prev.filter((item) => item.id !== s.id));
            setMessage(`Patron ${s.email} purged successfully.`);
            setTimeout(() => setMessage(null), 3000);
            refreshSubscribers();
          } else {
            showAlert('error', 'Purge Failed', res.error || 'Failed to delete subscriber.');
          }
        } catch {
          showAlert('error', 'Purge Failed', 'Network error while attempting to delete patron.');
        } finally {
          setUpdatingId(null);
        }
      },
      'Purge Patron Account',
      'Cancel'
    );
  };

  // READ & SEARCH
  const filtered = subscribers.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.email.toLowerCase().includes(q) ||
      (s.fullName && s.fullName.toLowerCase().includes(q))
    );
  });

  const handleInspectUser = async (userId: string) => {
    setLoadingDetailId(userId);
    setMessage(null);
    try {
      const res = await getAdminUserDetailAction(userId);
      if (res.success) {
        setSelectedUserDetail(res.data);
      } else {
        setMessage(`Failed to inspect user: ${res.error}`);
      }
    } catch {
      setMessage('Failed to load user dossier due to a network error.');
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: 'public' | 'subscriber' | 'admin'): Promise<void> => {
    const nextRole = currentRole === 'admin' ? 'subscriber' : 'admin';
    showConfirm(
      'Update Patron Clearance',
      `Change this patron's role to '${nextRole}'?`,
      async () => {
        setUpdatingId(userId);
        setMessage(null);

        const res = await adminUpdateUserRoleAction({ userId, newRole: nextRole });

        setUpdatingId(null);
        if (res.success) {
          setSubscribers((prev: AdminSubscriberRow[]) =>
            prev.map((s) => (s.id === userId ? { ...s, role: nextRole } : s))
          );
          if (selectedUserDetail && selectedUserDetail.profile.id === userId) {
            setSelectedUserDetail((prev) =>
              prev ? { ...prev, profile: { ...prev.profile, role: nextRole } } : null
            );
          }
          setMessage(`Clearance updated to ${nextRole.toUpperCase()}`);
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage(`Error: ${res.error}`);
        }
      },
      'Update Clearance',
      'Cancel'
    );
  };

  return (
    <>
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <div className={styles.sectionTitleRow}>
              <h2 className={styles.sectionTitle}>Subscriber &amp; Handicap Ledger Audit</h2>
              <span className={styles.countBadge}>{subscribers.length} ENROLLED</span>
            </div>
            <p className={styles.sectionSubtitle}>
              Full patron directory, membership standing, active 5-score combinations, and designated charities.
            </p>
          </div>

          <div className={styles.filterRow}>
            <button
              type="button"
              className={styles.approveBtn}
              onClick={() => setIsAddUserOpen(true)}
              style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
            >
              + Add New Patron / User
            </button>
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
                <th>Actions</th>
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
                        : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleInspectUser(s.id)}
                          disabled={loadingDetailId === s.id}
                          className={styles.actionBtnGold}
                          title="Inspect full scoring history, subscription, charity pledge, and winnings claims"
                        >
                          {loadingDetailId === s.id ? '...' : 'Inspect'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className={styles.actionBtnSecondary}
                          title="Edit patron name and system role"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoleToggle(s.id, s.role)}
                          disabled={updatingId === s.id}
                          className={styles.actionBtnSecondary}
                          style={{ opacity: updatingId === s.id ? 0.5 : 1 }}
                        >
                          {updatingId === s.id
                            ? '...'
                            : s.role === 'admin'
                            ? 'Revoke Admin'
                            : 'Grant Admin'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubscriber(s)}
                          disabled={updatingId === s.id}
                          className={styles.rejectBtn}
                          title="Permanently purge this patron account and all associated data"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedUserDetail && (
          <PatronDossierModal
            detail={selectedUserDetail}
            onClose={() => setSelectedUserDetail(null)}
            onRoleToggle={handleRoleToggle}
            isUpdatingRole={updatingId === selectedUserDetail.profile.id}
            onRefresh={refreshSubscribers}
          />
        )}

        {/* CREATE MODAL */}
        {isAddUserOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsAddUserOpen(false)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div>
                  <h3 className={styles.modalTitle}>Provision New Patron Account</h3>
                  <p className={styles.modalSubtitle}>
                    Create credentials and assign system clearance for a new member.
                  </p>
                </div>
                <button type="button" className={styles.closeBtn} onClick={() => setIsAddUserOpen(false)}>
                  X
                </button>
              </div>
              <form onSubmit={handleCreateUserSubmit}>
                <div className={styles.modalBody}>
                  <div>
                    <label className={styles.inputLabel}>Patron Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arthur Pendelton"
                      value={createFormData.fullName}
                      onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                      className={styles.textInput}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className={styles.inputLabel}>Account Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. arthur@golfclub.co.uk"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      className={styles.textInput}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className={styles.inputLabel}>Password * (Min 6 chars)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Enter password"
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      className={styles.textInput}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className={styles.inputLabel}>Clearance Authorization</label>
                    <select
                      value={createFormData.role}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          role: e.target.value as 'subscriber' | 'admin',
                        })
                      }
                      className={styles.textInput}
                      style={{ width: '100%' }}
                    >
                      <option value="subscriber">SUBSCRIBER (Standard Member)</option>
                      <option value="admin">ADMIN (Console Administrator)</option>
                    </select>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={() => setIsAddUserOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.approveBtn}
                    disabled={isSubmittingCreate}
                  >
                    {isSubmittingCreate ? 'Provisioning...' : 'Provision Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editingUser && (
          <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div>
                  <h3 className={styles.modalTitle}>Edit Patron Dossier</h3>
                  <p className={styles.modalSubtitle}>
                    Update member profile details and clearance authorization for {editingUser.email}.
                  </p>
                </div>
                <button type="button" className={styles.closeBtn} onClick={() => setEditingUser(null)}>
                  X
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className={styles.modalBody}>
                  <div>
                    <label className={styles.inputLabel}>Patron Full Name</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className={styles.textInput}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className={styles.inputLabel}>System Clearance</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          role: e.target.value as 'subscriber' | 'admin',
                        })
                      }
                      className={styles.textInput}
                      style={{ width: '100%' }}
                    >
                      <option value="subscriber">SUBSCRIBER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.approveBtn}
                    disabled={isSubmittingEdit}
                  >
                    {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
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
