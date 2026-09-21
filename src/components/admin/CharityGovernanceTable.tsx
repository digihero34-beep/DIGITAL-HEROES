'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminCharityItem } from '@/modules/admin/admin-types';
import {
  toggleCharityFeaturedAction,
  adminCreateCharityAction,
  adminUpdateCharityAction,
  adminDeleteCharityAction,
} from '@/modules/admin/admin-actions';
import AdminDialog, { useAdminDialog } from './AdminDialog';
import styles from './admin-components.module.css';

interface Props {
  initialCharities: AdminCharityItem[];
}

export default function CharityGovernanceTable({ initialCharities }: Props) {
  const [charities, setCharities] = useState<AdminCharityItem[]>(initialCharities);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { dialog, showConfirm } = useAdminDialog();

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<AdminCharityItem | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    category: 'Community & Sport',
    description: '',
    logoUrl: '',
    websiteUrl: '',
    isFeatured: false,
  });

  const handleToggleFeatured = async (charityId: string, currentFeatured: boolean) => {
    const nextState = !currentFeatured;
    setUpdatingId(charityId);
    setMessage(null);

    const res = await toggleCharityFeaturedAction({
      charityId,
      isFeatured: nextState,
    });

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

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      tagline: '',
      category: 'Community & Sport',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      isFeatured: false,
    });
    setIsAddOpen(true);
  };

  const handleOpenEditModal = (charity: AdminCharityItem) => {
    setEditingCharity(charity);
    setFormData({
      name: charity.name,
      tagline: charity.tagline || 'Empowering communities through sport and philanthropic impact',
      category: charity.category,
      description: charity.description || 'UKGC accredited charity partner supporting athletic and youth community development.',
      logoUrl: charity.logoUrl || '',
      websiteUrl: charity.websiteUrl || '',
      isFeatured: charity.isFeatured,
    });
  };

  const handleDeleteCharity = (charityId: string, charityName: string) => {
    showConfirm(
      'Remove Charity Partner',
      `This will permanently remove '${charityName}' from the registry. This action cannot be undone.`,
      async () => {
        setUpdatingId(charityId);
        const res = await adminDeleteCharityAction({ charityId });
        setUpdatingId(null);

        if (res.success) {
          setCharities((prev) => prev.filter((c) => c.id !== charityId));
          setMessage(`Charity '${charityName}' removed successfully.`);
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage(`Failed to delete charity: ${res.error}`);
        }
      },
      'Remove Partner',
      'Cancel'
    );
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;

    setUpdatingId('adding');
    const res = await adminCreateCharityAction({
      name: formData.name,
      tagline: formData.tagline || formData.description.slice(0, 150) || formData.name,
      description: formData.description,
      category: formData.category,
      logoUrl: formData.logoUrl,
      websiteUrl: formData.websiteUrl,
      isFeatured: formData.isFeatured,
    });
    setUpdatingId(null);

    if (res.success && res.data) {
      setCharities((prev) => [
        ...prev,
        {
          id: res.data.charityId,
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: formData.category,
          isFeatured: formData.isFeatured,
          isActive: true,
          supporterCount: 0,
          totalRaisedCents: 0,
          eventsCount: 0,
        },
      ]);
      setIsAddOpen(false);
      setMessage(`Charity '${formData.name}' created successfully.`);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage(`Failed to create charity: ${!res.success ? res.error : ''}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharity || !formData.name) return;

    setUpdatingId(editingCharity.id);
    const res = await adminUpdateCharityAction({
      charityId: editingCharity.id,
      name: formData.name,
      tagline: formData.tagline || formData.description.slice(0, 150) || formData.name,
      description: formData.description,
      category: formData.category,
      logoUrl: formData.logoUrl,
      websiteUrl: formData.websiteUrl,
      isFeatured: formData.isFeatured,
    });
    setUpdatingId(null);

    if (res.success) {
      setCharities((prev) =>
        prev.map((c) =>
          c.id === editingCharity.id
            ? {
                ...c,
                name: formData.name,
                category: formData.category,
                isFeatured: formData.isFeatured,
              }
            : c
        )
      );
      setEditingCharity(null);
      setMessage(`Charity updated successfully.`);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage(`Failed to update charity: ${!res.success ? res.error : ''}`);
    }
  };

  return (
    <>
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
        <button
          type="button"
          onClick={handleOpenAddModal}
          className={styles.approveBtn}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          ➕ Add New Partner
        </button>
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
              <th>Governance Actions</th>
            </tr>
          </thead>
          <tbody>
            {charities.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className={styles.patronCell}>
                    <strong>{c.name}</strong>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem' }}>
                      <Link
                        href={`/charities/${c.slug}`}
                        target="_blank"
                        className={styles.profileLink}
                      >
                        View Public Profile ↗
                      </Link>
                      {c.websiteUrl && (
                        <a
                          href={c.websiteUrl.startsWith('http') ? c.websiteUrl : `https://${c.websiteUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent-mint)', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          🔗 Website
                        </a>
                      )}
                    </div>
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
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(c.id, c.isFeatured)}
                      disabled={updatingId === c.id}
                      className={c.isFeatured ? styles.actionBtnSecondary : styles.actionBtnGold}
                      title="Toggle homepage spotlight position"
                    >
                      {c.isFeatured ? '★ Featured' : 'Spotlight'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(c)}
                      className={styles.actionBtnSecondary}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCharity(c.id, c.name)}
                      disabled={updatingId === c.id}
                      className={styles.rejectBtn}
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
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

      {/* ADD CHARITY MODAL */}
      {isAddOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddOpen(false)}>
          <div className={styles.modalCard} style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>➕ Register New Charity Partner</h2>
              <button type="button" onClick={() => setIsAddOpen(false)} className={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSaveAdd} className={styles.modalBody}>
              <div>
                <label className={styles.inputLabel}>Charity Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.textInput}
                  placeholder="e.g. Youth Golf Foundation UK"
                />
              </div>

              <div className={styles.formRowGrid}>
                <div>
                  <label className={styles.inputLabel}>Tagline / Short Summary *</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className={styles.textInput}
                    placeholder="e.g. Empowering UK youth"
                  />
                </div>
                <div>
                  <label className={styles.inputLabel}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={styles.selectInput}
                  >
                    <option value="Community & Sport">Community & Sport</option>
                    <option value="Healthcare & Research">Healthcare & Research</option>
                    <option value="Veteran Support">Veteran Support</option>
                    <option value="Youth & Education">Youth & Education</option>
                    <option value="Environmental Trust">Environmental Trust</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={styles.textInput}
                  placeholder="Official mission statement and philanthropic impact breakdown..."
                />
              </div>

              <div className={styles.formRowGrid}>
                <div>
                  <label className={styles.inputLabel}>Logo Image URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className={styles.textInput}
                    placeholder="e.g. /images/fairway_futures.jpg"
                  />
                </div>
                <div>
                  <label className={styles.inputLabel}>Official Website URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className={styles.textInput}
                    placeholder="e.g. https://fairwayfutures.org.uk"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="addIsFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <label htmlFor="addIsFeatured" style={{ color: '#F2EDE4', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  Set as Homepage Featured Spotlight
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddOpen(false)} className={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={updatingId === 'adding'} className={styles.approveBtn}>
                  {updatingId === 'adding' ? 'Saving...' : 'Create Charity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CHARITY MODAL */}
      {editingCharity && (
        <div className={styles.modalOverlay} onClick={() => setEditingCharity(null)}>
          <div className={styles.modalCard} style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>✏️ Edit Charity Partner Profile</h2>
              <button type="button" onClick={() => setEditingCharity(null)} className={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className={styles.modalBody}>
              <div>
                <label className={styles.inputLabel}>Charity Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formRowGrid}>
                <div>
                  <label className={styles.inputLabel}>Tagline / Short Summary</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className={styles.textInput}
                  />
                </div>
                <div>
                  <label className={styles.inputLabel}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={styles.selectInput}
                  >
                    <option value="Community & Sport">Community & Sport</option>
                    <option value="Healthcare & Research">Healthcare & Research</option>
                    <option value="Veteran Support">Veteran Support</option>
                    <option value="Youth & Education">Youth & Education</option>
                    <option value="Environmental Trust">Environmental Trust</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formRowGrid}>
                <div>
                  <label className={styles.inputLabel}>Logo Image URL</label>
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className={styles.textInput}
                  />
                </div>
                <div>
                  <label className={styles.inputLabel}>Official Website URL</label>
                  <input
                    type="text"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className={styles.textInput}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="editIsFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <label htmlFor="editIsFeatured" style={{ color: '#F2EDE4', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  Set as Homepage Featured Spotlight
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingCharity(null)} className={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={updatingId === editingCharity.id} className={styles.approveBtn}>
                  {updatingId === editingCharity.id ? 'Updating...' : 'Save Changes'}
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
