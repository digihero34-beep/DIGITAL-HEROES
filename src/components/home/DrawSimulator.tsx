'use client';

import React, { useState, useMemo } from 'react';
import styles from './draw-simulator.module.css';

function generateRandomScores(count: number, min: number, max: number): number[] {
  const nums = new Set<number>();
  while (nums.size < count) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    nums.add(n);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

export function DrawSimulator() {
  const [userScores, setUserScores] = useState<number[]>([36, 38, 40, 42, 44]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([38, 40, 42, 15, 29]);
  const [charityPercent, setCharityPercent] = useState<number>(10);
  const [isDrawing, setIsDrawing] = useState(false);

  const matchedNumbers = useMemo(() => {
    const drawnSet = new Set(drawnNumbers);
    return userScores.filter((score) => drawnSet.has(score));
  }, [userScores, drawnNumbers]);

  const matchCount = matchedNumbers.length;

  function handleSimulateDraw() {
    setIsDrawing(true);
    setTimeout(() => {
      const newDrawn = generateRandomScores(5, 1, 45);
      setDrawnNumbers(newDrawn);
      setIsDrawing(false);
    }, 350);
  }

  function handleRandomizeScores() {
    const newScores = generateRandomScores(5, 26, 45);
    setUserScores(newScores);
  }

  // Sample £50,000 monthly pool simulation
  const samplePoolCents = 5000000;
  const tier5Cents = Math.round(samplePoolCents * 0.40);
  const tier4Cents = Math.round(samplePoolCents * 0.35);
  const tier3Cents = Math.round(samplePoolCents * 0.25);
  const simulatedCharityCents = Math.round((samplePoolCents * charityPercent) / 100);

  function formatCurrency(cents: number): string {
    return `£${(cents / 100).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  return (
    <div className={styles.simulatorCard}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.badge}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-mint)' }} />
            Interactive Draw Simulation Engine
          </div>
          <h3 className={styles.cardTitle}>Test the 5-Ball Mathematical Engine</h3>
          <p className={styles.cardDesc}>
            See how your active Stableford scores match monthly drawn numbers to unlock guaranteed prize tiers and charitable funding.
          </p>
        </div>

        <div className={styles.controlsRow}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleRandomizeScores}
          >
            Shuffle Rounds
          </button>
          <button
            type="button"
            className={styles.drawBtn}
            onClick={handleSimulateDraw}
            disabled={isDrawing}
          >
            {isDrawing ? 'Simulating...' : 'Simulate Draw'}
          </button>
        </div>
      </div>

      {/* Balls Comparison Section */}
      <div className={styles.ballsSection}>
        <div>
          <div className={styles.groupTitle}>
            <span>Your Active 5 Scores (Stableford 1–45)</span>
            <span style={{ color: 'var(--accent-mint)' }}>{matchCount} Matched</span>
          </div>
          <div className={styles.ballsRow}>
            {userScores.map((score) => {
              const isMatch = drawnNumbers.includes(score);
              return (
                <div
                  key={`user-${score}`}
                  className={`${styles.ball} ${isMatch ? styles.ballMatched : ''}`}
                >
                  {score}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className={styles.groupTitle}>
            <span>Drawn Numbers (Monthly Result)</span>
            <span style={{ color: 'var(--accent-gold)' }}>5 CSPRNG Drawn</span>
          </div>
          <div className={styles.ballsRow}>
            {drawnNumbers.map((num) => {
              const isMatch = userScores.includes(num);
              return (
                <div
                  key={`drawn-${num}`}
                  className={`${styles.ball} ${isMatch ? styles.ballMatched : styles.ballDrawn}`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Status Banner */}
      <div className={styles.resultBanner}>
        <div>
          <div className={styles.resultTitle}>
            {matchCount === 5 && '🌟 JACKPOT MATCH (5/5) — Top Tier Allocation!'}
            {matchCount === 4 && '🎯 TIER 4 MATCH (4/5) — 35% Pool Share!'}
            {matchCount === 3 && '✨ TIER 3 MATCH (3/5) — 25% Pool Share!'}
            {matchCount < 3 && '⛳ Round Logged for Purpose — Charitable Impact Guaranteed'}
          </div>
          <p className={styles.resultDesc}>
            {matchCount >= 3
              ? `Congratulations! ${matchCount} of your rounds matched the official draw. Scorecard verification required before bank payout.`
              : 'Match 3, 4, or 5 numbers to win. If Tier 5 is unclaimed, the entire 40% rolls over to the next month.'}
          </p>
        </div>
      </div>

      {/* Prize Allocation Breakdown Grid */}
      <div className={styles.tierGrid}>
        <div className={`${styles.tierItem} ${matchCount === 5 ? styles.tierItemHighlighted : ''}`}>
          <span className={styles.tierLabel}>5 Matches (40%)</span>
          <span className={styles.tierPercent}>{formatCurrency(tier5Cents)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+ Rollover Jackpot</span>
        </div>

        <div className={`${styles.tierItem} ${matchCount === 4 ? styles.tierItemHighlighted : ''}`}>
          <span className={styles.tierLabel}>4 Matches (35%)</span>
          <span className={styles.tierPercent}>{formatCurrency(tier4Cents)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Split equally among winners</span>
        </div>

        <div className={`${styles.tierItem} ${matchCount === 3 ? styles.tierItemHighlighted : ''}`}>
          <span className={styles.tierLabel}>3 Matches (25%)</span>
          <span className={styles.tierPercent}>{formatCurrency(tier3Cents)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Split equally among winners</span>
        </div>

        <div className={`${styles.tierItem} ${styles.tierCharity}`}>
          <span className={styles.tierLabel}>Charity Lock ({charityPercent}%)</span>
          <span className={styles.tierPercent}>{formatCurrency(simulatedCharityCents)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Guaranteed min 10% lock</span>
        </div>
      </div>

      {/* Interactive Charity Scaling Slider */}
      <div className={styles.charitySliderArea}>
        <div className={styles.sliderRow}>
          <span>Simulate Custom Charitable Contribution Level:</span>
          <span className={styles.sliderVal}>{charityPercent}% to Partner Cause</span>
        </div>
        <input
          type="range"
          min="10"
          max="50"
          step="5"
          value={charityPercent}
          onChange={(e) => setCharityPercent(Number(e.target.value))}
          className={styles.slider}
          aria-label="Simulate charitable contribution percentage"
        />
      </div>
    </div>
  );
}
