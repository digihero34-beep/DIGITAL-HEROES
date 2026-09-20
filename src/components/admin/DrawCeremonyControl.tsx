'use client';

import React, { useState } from 'react';
import { DrawMode, SimulationBreakdown, WinningNumbers } from '@/modules/draws/draw-types';
import { simulateDrawAction, publishDrawAction } from '@/modules/draws/draw-actions';
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
  const [drawMode, setDrawMode] = useState<DrawMode>('random');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [simulation, setSimulation] = useState<SimulationBreakdown | null>(null);
  const [publishedData, setPublishedData] = useState<{
    winningNumbers: WinningNumbers;
    winnersCount: number;
    publishedAt: string;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [status, setStatus] = useState(initialStatus);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setFeedback(null);

    const res = await simulateDrawAction({
      drawMode,
    });

    setIsSimulating(false);
    if (res.success && res.data) {
      setSimulation(res.data);
      setFeedback({
        type: 'success',
        message: `Simulation completed. Evaluated ${res.data.totalEligibleSubscribers} eligible patrons.`,
      });
    } else {
      setFeedback({ type: 'error', message: !res.success ? res.error : 'Simulation failed.' });
    }
  };

  const handlePublish = async () => {
    if (!window.confirm(`Are you certain you want to officially publish Draw #${drawNumber}? This operation is cryptographically locked and immutable.`)) {
      return;
    }

    setIsPublishing(true);
    setFeedback(null);

    const res = await publishDrawAction({
      drawId,
      drawMode,
    });

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
              <label className={`${styles.radioLabel} ${drawMode === 'random' ? styles.radioActive : ''}`}>
                <input
                  type="radio"
                  name="drawMode"
                  value="random"
                  checked={drawMode === 'random'}
                  onChange={() => setDrawMode('random')}
                  disabled={status === 'published'}
                />
                <div>
                  <strong>Random (PRNG Secure)</strong>
                  <span>Uniform crypto distribution [1, 45]</span>
                </div>
              </label>

              <label
                className={`${styles.radioLabel} ${
                  drawMode === 'algorithmic' ? styles.radioActive : ''
                }`}
              >
                <input
                  type="radio"
                  name="drawMode"
                  value="algorithmic"
                  checked={drawMode === 'algorithmic'}
                  onChange={() => setDrawMode('algorithmic')}
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
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || isSimulating || status === 'published'}
              className={styles.approveBtn}
            >
              {isPublishing ? 'Signing Ceremony...' : 'Commit & Publish Draw'}
            </button>
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
                <span className={styles.publishedTimestamp}>
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
    </div>
  );
}
