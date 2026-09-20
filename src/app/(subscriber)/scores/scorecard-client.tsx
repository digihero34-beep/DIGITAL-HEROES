'use client';

import React, { useState } from 'react';
import styles from './scores.module.css';
import {
  addScoreAction,
  deleteScoreAction,
  getUserScoresAction,
} from '@/modules/scores/score-actions';
import { GolfScore, UserScoresSummary } from '@/modules/scores/score-types';

interface ScorecardClientProps {
  initialData: UserScoresSummary;
}

export function ScorecardClient({ initialData }: ScorecardClientProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [scoresData, setScoresData] = useState<UserScoresSummary>(initialData);
  const [playedDate, setPlayedDate] = useState(todayStr);
  const [score, setScore] = useState<number | ''>(36);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function refreshScores() {
    const result = await getUserScoresAction();
    if (result.success) {
      setScoresData(result.data);
    }
  }

  async function handleAddScore(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (score === '' || isNaN(Number(score))) {
      setErrorMessage('Please enter a valid Stableford score.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await addScoreAction({
        score: Number(score),
        playedDate,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        setSubmitting(false);
        return;
      }

      setSuccessMessage(`Round recorded! ${result.data.score} points on ${result.data.playedDate}.`);
      setScore(36);
      await refreshScores();
    } catch {
      setErrorMessage('Failed to record score due to a network error.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(scoreId: string) {
    if (!confirm('Are you sure you want to delete this recorded score?')) {
      return;
    }

    const result = await deleteScoreAction(scoreId);
    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    await refreshScores();
  }

  const activeCount = scoresData.activeScores.length;
  const isFullSet = activeCount >= 5;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Official Performance Engine
        </div>
        <h1 className={styles.title}>Stableford Scorecard</h1>
        <p className={styles.subtitle}>
          Record your individual Stableford rounds (1–45). Your 5 most recent rounds automatically form
          your entry set for the upcoming monthly transparent draw.
        </p>
      </header>

      {/* Active Draw Numbers Section */}
      <section className={styles.activeSetCard}>
        <div className={styles.activeSetHeader}>
          <div>
            <h2 className={styles.activeSetTitle}>Upcoming Draw Entry Set</h2>
            <p className={styles.activeSetSubtitle}>
              {isFullSet
                ? 'Your active 5-ball combination is complete and verified for the next monthly draw.'
                : `You currently have ${activeCount}/5 active rounds. Enter ${5 - activeCount} more to complete your 5-ball draw entry.`}
            </p>
          </div>
          <span
            className={`${styles.statusIndicator} ${
              isFullSet ? styles.statusComplete : styles.statusIncomplete
            }`}
          >
            {isFullSet ? '✓ Full 5-Ball Set Active' : `${activeCount} of 5 Rounds`}
          </span>
        </div>

        <div className={styles.ballsGrid}>
          {Array.from({ length: 5 }).map((_, index) => {
            const activeScore = scoresData.activeScores[index] as GolfScore | undefined;
            return (
              <div key={index} className={styles.ballSlot}>
                {activeScore ? (
                  <div className={styles.scoreBall}>
                    {activeScore.score}
                  </div>
                ) : (
                  <div className={styles.emptyBall}>
                    ?
                  </div>
                )}
                <div className={styles.ballMeta}>
                  <div className={styles.ballDate}>
                    {activeScore ? activeScore.playedDate : `Ball ${index + 1}`}
                  </div>
                  <div className={styles.ballOrder}>
                    {activeScore ? `Round #${index + 1}` : 'Pending Round'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Entry Form and Historical Rounds */}
      <div className={styles.contentGrid}>
        {/* Score Submission Card */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Record Round</h2>

          {errorMessage && (
            <div
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--status-danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-danger-text)',
                fontSize: '0.8125rem',
              }}
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--status-active-bg)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-active-text)',
                fontSize: '0.8125rem',
              }}
              role="status"
            >
              {successMessage}
            </div>
          )}

          <form onSubmit={handleAddScore} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className={styles.formGroup}>
              <label htmlFor="score-date" className={styles.label}>
                Date Played
              </label>
              <input
                id="score-date"
                type="date"
                required
                max={todayStr}
                value={playedDate}
                onChange={(e) => setPlayedDate(e.target.value)}
                className={styles.input}
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="score-points" className={styles.label}>
                Stableford Points (1–45)
              </label>
              <input
                id="score-points"
                type="number"
                min={1}
                max={45}
                required
                value={score}
                onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                className={styles.input}
                disabled={submitting}
              />

              <div className={styles.quickPillGroup}>
                {[28, 30, 32, 34, 36, 38, 40].map((quickVal) => (
                  <button
                    key={quickVal}
                    type="button"
                    className={styles.quickPill}
                    onClick={() => setScore(quickVal)}
                    disabled={submitting}
                  >
                    {quickVal} pts
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              id="score-submit-btn"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? 'Recording...' : 'Submit Round to Scorecard'}
            </button>
          </form>

          <div className={styles.ruleBox}>
            <span>ℹ️</span>
            <div>
              <strong>Rolling 5 Invariant:</strong> Only 1 score is allowed per date. Your latest 5 rounds
              are automatically assigned to the draw. Older rounds are archived for verification.
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className={styles.historyCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.historyTitle}>All Recorded Rounds</h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Avg: {scoresData.stats.averageScore} pts • Best: {scoresData.stats.highestScore} pts
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Points</th>
                <th className={styles.th}>Draw Allocation</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scoresData.activeScores.length === 0 && scoresData.historicalScores.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No rounds recorded yet. Enter your first Stableford score to enter the draw!
                  </td>
                </tr>
              ) : (
                [...scoresData.activeScores, ...scoresData.historicalScores].map((item) => (
                  <tr key={item.id}>
                    <td className={styles.td}>{item.playedDate}</td>
                    <td className={styles.td}>
                      <strong>{item.score}</strong> pts
                    </td>
                    <td className={styles.td}>
                      {item.isActive ? (
                        <span className={styles.activeTag}>● Active Draw Entry</span>
                      ) : (
                        <span className={styles.archiveTag}>○ Archived</span>
                      )}
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className={styles.actionBtn}
                        aria-label={`Delete score for ${item.playedDate}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
