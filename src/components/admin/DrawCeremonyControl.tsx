'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DrawMode, SimulationBreakdown, WinningNumbers, MatchResult } from '@/modules/draws/draw-types';
import {
  simulateDrawAction,
  publishDrawAction,
  createNextDrawAction,
  getPublishedDrawWinnersAction,
} from '@/modules/draws/draw-actions';
import { getAdminUserDetailAction, adminUpdateUserRoleAction } from '@/modules/admin/admin-actions';
import { AdminUserDetail } from '@/modules/admin/admin-types';
import PatronDossierModal from './PatronDossierModal';
import AdminDialog, { useAdminDialog } from './AdminDialog';
import styles from './admin-components.module.css';

interface Props {
  drawId: string;
  drawNumber: number;
  scheduledFor: string;
  initialStatus: string;
  totalPoolCents: number;
}

export default function DrawCeremonyControl({
  drawId,
  drawNumber,
  scheduledFor,
  initialStatus,
  totalPoolCents,
}: Props) {
  const [mainDrawMode, setMainDrawMode] = useState<'random' | 'algorithmic'>('random');
  const [randomSubMode, setRandomSubMode] = useState<'live' | 'guaranteed_test'>('live');

  const effectiveDrawMode: DrawMode =
    mainDrawMode === 'random'
      ? randomSubMode === 'guaranteed_test'
        ? 'guaranteed_test'
        : 'random'
      : 'algorithmic';

  const router = useRouter();
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCreatingNext, setIsCreatingNext] = useState(false);
  const [simulation, setSimulation] = useState<SimulationBreakdown | null>(null);
  const [publishedData, setPublishedData] = useState<{
    winningNumbers: WinningNumbers;
    winnersCount: number;
    publishedAt: string;
    winners?: MatchResult[];
  } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const { dialog, showAlert, showConfirm } = useAdminDialog();

  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState<string | null>(null);

  useEffect(() => {
    if (initialStatus === 'published' && !publishedData) {
      getPublishedDrawWinnersAction(drawId).then((res) => {
        if (res.success && res.data && res.data.winningNumbers) {
          setPublishedData({
            winningNumbers: res.data.winningNumbers,
            winnersCount: res.data.winnersCount,
            publishedAt: res.data.publishedAt || new Date().toISOString(),
            winners: res.data.winners,
          });
        }
      });
    }
  }, [drawId, initialStatus, publishedData]);

  const handleViewPatronDossier = async (userId: string) => {
    setIsLoadingUserDetail(userId);
    const res = await getAdminUserDetailAction(userId);
    setIsLoadingUserDetail(null);
    if (res.success && res.data) {
      setSelectedUserDetail(res.data);
    } else {
      showAlert('error', 'Profile Unavailable', !res.success ? res.error : 'User profile details could not be retrieved.');
    }
  };

  const handleCreateNextDraw = async () => {
    setIsCreatingNext(true);
    setFeedback(null);
    const res = await createNextDrawAction();
    setIsCreatingNext(false);
    if (res.success && res.data) {
      setFeedback({
        type: 'success',
        message: `Draw #${res.data.drawNumber} provisioned in Draft mode! Refreshing console...`,
      });
      setTimeout(() => {
        router.refresh();
        window.location.reload();
      }, 800);
    } else {
      setFeedback({ type: 'error', message: res.success ? 'Failed to create draw.' : res.error });
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    setFeedback(null);

    const res = await simulateDrawAction({
      drawMode: effectiveDrawMode,
    });

    setIsSimulating(false);
    if (res.success && res.data) {
      setSimulation(res.data);
      setFeedback({
        type: 'success',
        message: `Simulation completed (${effectiveDrawMode === 'guaranteed_test' ? '🎯 Evaluator Preset' : effectiveDrawMode.toUpperCase()}). Evaluated ${res.data.totalEligibleSubscribers} eligible patrons.`,
      });
    } else {
      setFeedback({ type: 'error', message: !res.success ? res.error : 'Simulation failed.' });
    }
  };

  const handlePublish = () => {
    showConfirm(
      `Publish Draw #${drawNumber}`,
      `This will cryptographically lock and publish the results. This operation is immutable and cannot be reversed.`,
      async () => {
        setIsPublishing(true);
        setFeedback(null);

        const res = await publishDrawAction({ drawId, drawMode: effectiveDrawMode });

        setIsPublishing(false);
        if (res.success && res.data) {
          setPublishedData(res.data);
          setStatus('published');
          setFeedback({
            type: 'success',
            message: `Draw #${drawNumber} officially published with ${res.data.winnersCount} winning patrons recorded!`,
          });
        } else {
          setFeedback({ type: 'error', message: !res.success ? res.error : 'Failed to publish draw.' });
        }
      },
      'Publish & Lock',
      'Cancel'
    );
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Dual-Key Draw Execution & Publication Ceremony</h2>
            <span
              className={`${styles.countBadge} ${
                status === 'published' ? styles.statusApproved : styles.statusPending
              }`}
            >
              {status.toUpperCase()}
            </span>
          </div>
          <p className={styles.sectionSubtitle}>
            Verifiable randomness governance. Cryptographically binds Stableford set intersections and allocates prize tiers.
          </p>
        </div>
      </div>

      <div className={styles.drawConsoleGrid}>
        {/* Draw Config & Execution */}
        <div className={styles.drawConfigPanel}>
          <div className={styles.drawMetaVitals}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Draw Identifier</span>
              <strong className={styles.metaValue}>Draw #{drawNumber}</strong>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Scheduled Date</span>
              <span className={styles.metaValue}>
                {new Date(scheduledFor).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Audited Prize Pool</span>
              <strong className={styles.goldText}>
                £{(totalPoolCents / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>Draw Randomness Mode</label>
            <div className={styles.radioGroup}>
              {/* Option 1: Random (PRNG Secure) */}
              <div
                className={`${styles.radioLabelCard} ${
                  mainDrawMode === 'random' ? styles.radioActive : ''
                }`}
              >
                <label
                  className={styles.radioLabelMain}
                  onClick={() => setMainDrawMode('random')}
                >
                  <input
                    type="radio"
                    name="mainDrawMode"
                    value="random"
                    checked={mainDrawMode === 'random'}
                    onChange={() => setMainDrawMode('random')}
                    disabled={status === 'published'}
                  />
                  <div>
                    <strong>Random (PRNG Secure)</strong>
                    <span>Uniform crypto distribution [1, 45]</span>
                  </div>
                </label>

                {/* Sub-mode selector under Random */}
                {mainDrawMode === 'random' && (
                  <div className={styles.subModeContainer}>
                    <div className={styles.subModeHeader}>Random Sub-Mode Preset:</div>
                    <div className={styles.subModeToggleRow}>
                      <button
                        type="button"
                        className={`${styles.subModeBtn} ${
                          randomSubMode === 'live' ? styles.subModeBtnActive : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRandomSubMode('live');
                        }}
                        disabled={status === 'published'}
                      >
                        🌐 Live (PRNG)
                      </button>
                      <button
                        type="button"
                        className={`${styles.subModeBtn} ${
                          randomSubMode === 'guaranteed_test' ? styles.subModeBtnTestingActive : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRandomSubMode('guaranteed_test');
                        }}
                        disabled={status === 'published'}
                      >
                        🔑 Dual-Key Preset (Random User Win)
                      </button>
                    </div>
                    {randomSubMode === 'guaranteed_test' && (
                      <div className={styles.subModeNotice}>
                        <strong>🔑 Dual-Key Testing Preset Active:</strong> Randomly selects an active patron score set so any user wins during ceremony testing.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Option 2: Algorithmic (Laplace-Smoothed) */}
              <label
                className={`${styles.radioLabel} ${
                  mainDrawMode === 'algorithmic' ? styles.radioActive : ''
                }`}
              >
                <input
                  type="radio"
                  name="mainDrawMode"
                  value="algorithmic"
                  checked={mainDrawMode === 'algorithmic'}
                  onChange={() => setMainDrawMode('algorithmic')}
                  disabled={status === 'published'}
                />
                <div>
                  <strong>Algorithmic (Laplace-Smoothed)</strong>
                  <span>Weighted by patron score frequencies</span>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              onClick={handleSimulate}
              disabled={isSimulating || isPublishing || status === 'published'}
              className={styles.secondaryBtn}
            >
              {isSimulating ? 'Simulating...' : 'Run Monte Carlo Simulation'}
            </button>
            {status !== 'published' && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || isSimulating}
                className={styles.approveBtn}
              >
                {isPublishing ? 'Signing Ceremony...' : 'Commit & Publish Draw'}
              </button>
            )}
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

        {/* Live Simulation / Published Results Ledger */}
        <div className={styles.drawResultsPanel}>
          {publishedData ? (
            <div className={styles.publishedResultsCard}>
              <div className={styles.publishedHeader}>
                <span className={styles.ceremonyVerified}>✓ CRYPTOGRAPHICALLY COMMITTED</span>
                <span className={styles.publishedTimestamp} style={{ display: 'block', marginTop: '2px' }}>
                  {new Date(publishedData.publishedAt).toUTCString()}
                </span>
              </div>
              <p className={styles.resultsPrompt}>Official Winning Numbers Revealed:</p>
              <div className={styles.drawBallRow}>
                {publishedData.winningNumbers.map((num, i) => (
                  <div key={i} className={styles.drawBallGold}>
                    {num}
                  </div>
                ))}
              </div>
              <div className={styles.publishedStats}>
                <div>
                  <span>Total Winning Patrons</span>
                  <strong>{publishedData.winnersCount} Beneficiaries</strong>
                </div>
                <div>
                  <span>Prize Dispersal Status</span>
                  <strong className={styles.goldText}>Awaiting Verification</strong>
                </div>
              </div>

              {/* Published Winning Patrons Roster */}
              {publishedData.winners && publishedData.winners.length > 0 && (
                <div className={styles.winnersRosterSection}>
                  <h4 className={styles.winnersRosterTitle}>
                    🏆 Official Winning Patrons Roster ({publishedData.winners.length})
                  </h4>
                  <div className={styles.winnersList}>
                    {publishedData.winners.map((winner) => (
                      <div key={winner.userId} className={styles.winnerCard}>
                        <div className={styles.winnerInfo}>
                          <div className={styles.winnerNameRow}>
                            <strong>{winner.fullName || winner.userEmail.split('@')[0]}</strong>
                            <span
                              className={`${styles.tierBadge} ${
                                winner.matchTier === 'match_5'
                                  ? styles.tier5
                                  : winner.matchTier === 'match_4'
                                  ? styles.tier4
                                  : styles.tier3
                              }`}
                            >
                              {winner.matchTier === 'match_5'
                                ? 'TIER 5 (5 MATCHES)'
                                : winner.matchTier === 'match_4'
                                ? 'TIER 4 (4 MATCHES)'
                                : 'TIER 3 (3 MATCHES)'}
                            </span>
                          </div>
                          <div className={styles.winnerMetaRow}>
                            <span className={styles.winnerEmail}>{winner.userEmail}</span>
                            <span className={styles.matchedPillRow}>
                              Matched:{' '}
                              {winner.matchedNumbers.map((num) => (
                                <span key={num} className={styles.matchedNumberPill}>
                                  {num}
                                </span>
                              ))}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.actionBtnGold}
                          onClick={() => handleViewPatronDossier(winner.userId)}
                          disabled={isLoadingUserDetail === winner.userId}
                        >
                          {isLoadingUserDetail === winner.userId ? 'Loading...' : '👤 View Dossier'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Commit Action Bar */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Draw #{drawNumber} committed. Click to provision Draw #{drawNumber + 1} and open the next commitment cycle.
                </span>
                <button
                  type="button"
                  onClick={handleCreateNextDraw}
                  disabled={isCreatingNext}
                  className={styles.approveBtn}
                  style={{
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    borderColor: '#10b981',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {isCreatingNext ? 'Provisioning Next Draw...' : `⚡ Next Commit (Draw #${drawNumber + 1})`}
                </button>
              </div>
            </div>
          ) : simulation ? (
            <div className={styles.simulationCard}>
              <div className={styles.simHeader}>
                <span className={styles.simBadge}>MONTE CARLO PROJECTION</span>
                <span className={styles.simSubscribers}>
                  {simulation.totalEligibleSubscribers} Active Patrons Evaluated
                </span>
              </div>
              <p className={styles.resultsPrompt}>Simulated 5-Sphere Combination:</p>
              <div className={styles.drawBallRow}>
                {simulation.simulatedNumbers.map((num, i) => (
                  <div key={i} className={styles.drawBallSim}>
                    {num}
                  </div>
                ))}
              </div>

              <div className={styles.tierBreakdownGrid}>
                <div className={styles.tierStatBox}>
                  <span>Tier 5 (5 Matches)</span>
                  <strong>{simulation.match5Count} Winners</strong>
                  <small>{simulation.match5Count === 0 ? 'Jackpot Rolls Over' : 'Pool Divided'}</small>
                </div>
                <div className={styles.tierStatBox}>
                  <span>Tier 4 (4 Matches)</span>
                  <strong>{simulation.match4Count} Winners</strong>
                  <small>35% Pool Allocation</small>
                </div>
                <div className={styles.tierStatBox}>
                  <span>Tier 3 (3 Matches)</span>
                  <strong>{simulation.match3Count} Winners</strong>
                  <small>25% Pool Allocation</small>
                </div>
              </div>

              {/* Simulation Winning Patrons Roster */}
              {simulation.winners && simulation.winners.length > 0 ? (
                <div className={styles.winnersRosterSection}>
                  <h4 className={styles.winnersRosterTitle}>
                    🏆 Projected Winning Patrons ({simulation.winners.length})
                  </h4>
                  <div className={styles.winnersList}>
                    {simulation.winners.map((winner) => (
                      <div key={winner.userId} className={styles.winnerCard}>
                        <div className={styles.winnerInfo}>
                          <div className={styles.winnerNameRow}>
                            <strong>{winner.fullName || winner.userEmail.split('@')[0]}</strong>
                            <span
                              className={`${styles.tierBadge} ${
                                winner.matchTier === 'match_5'
                                  ? styles.tier5
                                  : winner.matchTier === 'match_4'
                                  ? styles.tier4
                                  : styles.tier3
                              }`}
                            >
                              {winner.matchTier === 'match_5'
                                ? 'TIER 5 (5 MATCHES)'
                                : winner.matchTier === 'match_4'
                                ? 'TIER 4 (4 MATCHES)'
                                : 'TIER 3 (3 MATCHES)'}
                            </span>
                          </div>
                          <div className={styles.winnerMetaRow}>
                            <span className={styles.winnerEmail}>{winner.userEmail}</span>
                            <span className={styles.matchedPillRow}>
                              Matched:{' '}
                              {winner.matchedNumbers.map((num) => (
                                <span key={num} className={styles.matchedNumberPill}>
                                  {num}
                                </span>
                              ))}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.actionBtnGold}
                          onClick={() => handleViewPatronDossier(winner.userId)}
                          disabled={isLoadingUserDetail === winner.userId}
                        >
                          {isLoadingUserDetail === winner.userId ? 'Loading...' : '👤 View Dossier'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.noWinnersNotice}>
                  <span>ℹ️ No active subscriber 5-score combinations matched 3+ numbers in this simulation run.</span>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.simPlaceholder}>
              <div className={styles.placeholderIcon}>⚖️</div>
              <h3>Ceremony Awaiting Execution</h3>
              <p>
                Run a simulation to project match distributions across active patron scores, or commit the dual-key publication to seal results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Patron Dossier Modal */}
      {selectedUserDetail && (
        <PatronDossierModal
          detail={selectedUserDetail}
          onClose={() => setSelectedUserDetail(null)}
          onRoleToggle={async (userId, currentRole) => {
            const newRole = currentRole === 'admin' ? 'subscriber' : 'admin';
            const res = await adminUpdateUserRoleAction({ userId, newRole });
            if (res.success) {
              handleViewPatronDossier(userId);
            } else {
              showAlert('error', 'Role Update Failed', `Unable to update patron role: ${res.error}`);
            }
          }}
          isUpdatingRole={false}
          onRefresh={() => {
            handleViewPatronDossier(selectedUserDetail.profile.id);
          }}
        />
      )}

      <AdminDialog options={dialog} />
    </div>
  );
}
