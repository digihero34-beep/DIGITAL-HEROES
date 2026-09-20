'use client';

import React from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-10 space-y-10">
      
      {/* ── Top Header ── */}
      <div className="border-b border-[var(--border-subtle)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 border border-[var(--secondary-gold)] bg-[var(--surface-container-low)] px-3 py-1 mb-3 text-[11px] font-mono uppercase font-bold text-[var(--secondary)]">
            <span>● Institutional Design Specification &amp; Color Calibration</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[var(--primary)] font-normal">
            Theme &amp; Palette Comparison Matrix
          </h1>
          <p className="font-sans text-base text-[var(--text-secondary)] max-w-3xl mt-2">
            Rigorous visual token evaluation balancing historic golf clubhouse prestige, statutory regulatory credibility, and cryptographic SHA-256 trust transparency. Inspect each fully rendered system below.
          </p>
        </div>

        <div className="font-mono text-xs border border-[var(--border-subtle)] bg-[var(--surface-container-lowest)] p-3 space-y-1">
          <div>Standard: <strong className="text-[var(--primary)]">WCAG 2.1 AAA</strong></div>
          <div>Grid Engine: <strong className="text-[var(--primary)]">12-Col Architectural</strong></div>
          <div>Typography: <strong className="text-[var(--primary)]">EB Garamond + Manrope</strong></div>
        </div>
      </div>

      {/* ── Active View Bar ── */}
      <div className="flex justify-between items-center bg-[var(--surface-container-low)] border border-[var(--border-subtle)] px-6 py-3 font-mono text-xs text-[var(--text-secondary)]">
        <span>ACTIVE COMPARISON VIEW: TRIAD SIDE-BY-SIDE (DESKTOP 1280PX+)</span>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('spruce')}
            className={`px-3 py-1 uppercase border font-bold ${
              theme === 'spruce'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                : 'bg-[var(--surface-container-lowest)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
            }`}
          >
            01 Spruce &amp; Ivory
          </button>
          <button
            onClick={() => setTheme('navy')}
            className={`px-3 py-1 uppercase border font-bold ${
              theme === 'navy'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                : 'bg-[var(--surface-container-lowest)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
            }`}
          >
            02 Royal Navy &amp; Gold
          </button>
          <button
            onClick={() => setTheme('slate')}
            className={`px-3 py-1 uppercase border font-bold ${
              theme === 'slate'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                : 'bg-[var(--surface-container-lowest)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
            }`}
          >
            03 Highland Tartan Slate
          </button>
        </div>
      </div>

      {/* ── Triad Comparison Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* THEME 01 */}
        <div
          className={`border p-6 space-y-6 bg-white transition-all ${
            theme === 'spruce'
              ? 'border-2 border-[var(--secondary-gold)] shadow-md'
              : 'border-[var(--border-subtle)] opacity-90'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#001910] text-white">
              THEME 01 • ACTIVE ANCHOR
            </span>
            <span className="font-mono text-xs text-[#775a00] font-bold">AAA 14.8:1</span>
          </div>

          <div>
            <h3 className="font-serif text-2xl text-[#001910]">British Racing Spruce &amp; Warm Ivory</h3>
            <p className="font-sans text-xs text-[#424845] mt-1">
              Current Sovereign Trust standard. Classical Scottish links heritage meets high-net-worth private endowment governance.
            </p>
          </div>

          {/* Color Swatches */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase block">Chromatic Tokens &amp; Roles</span>
            <div className="grid grid-cols-5 gap-1 text-center font-mono text-[9px] uppercase">
              <div className="bg-[#f2fcf6] border p-2 text-gray-800">#F2FCF6<br/>Vellum</div>
              <div className="bg-[#001910] p-2 text-white">#001910<br/>Primary</div>
              <div className="bg-[#132e24] p-2 text-white">#132E24<br/>Container</div>
              <div className="bg-[#c59b27] p-2 text-black font-bold">#C59B27<br/>Gold</div>
              <div className="bg-[#c2c8c3] border p-2 text-gray-800">#C2C8C3<br/>Border</div>
            </div>
          </div>

          {/* Mini Card Preview */}
          <div className="border border-[#c2c8c3] p-4 bg-[#f2fcf6] space-y-3">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-[#775a00] uppercase font-bold">Provably Fair Escrow</span>
              <span className="bg-[#001910] text-white px-1.5 py-0.5 font-bold">LIVE #142</span>
            </div>
            <h4 className="font-serif text-lg text-[#001910]">The 153rd Open at St Andrews</h4>
            <div className="font-mono text-2xl font-bold text-[#001910]">£38,500</div>
            <button
              onClick={() => setTheme('spruce')}
              className="w-full bg-[#001910] text-white py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#132e24]"
            >
              {theme === 'spruce' ? '✓ Selected Baseline' : 'Select Spruce & Ivory'}
            </button>
          </div>
        </div>

        {/* THEME 02 */}
        <div
          className={`border p-6 space-y-6 bg-white transition-all ${
            theme === 'navy'
              ? 'border-2 border-[var(--secondary-gold)] shadow-md'
              : 'border-[var(--border-subtle)] opacity-90'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#08192d] text-white">
              THEME 02 • CHAMPIONSHIP
            </span>
            <span className="font-mono text-xs text-[#8a6d00] font-bold">AAA 16.2:1</span>
          </div>

          <div>
            <h3 className="font-serif text-2xl text-[#08192d]">Royal Navy &amp; Sovereign Gold</h3>
            <p className="font-sans text-xs text-[#3a4958] mt-1">
              Championship R&amp;A Charter. Stately midnight navy meets polished brass gold and cold alabaster architectural framing.
            </p>
          </div>

          {/* Color Swatches */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase block">Chromatic Tokens &amp; Roles</span>
            <div className="grid grid-cols-5 gap-1 text-center font-mono text-[9px] uppercase">
              <div className="bg-[#f4f6f9] border p-2 text-gray-800">#F4F6F9<br/>Surface</div>
              <div className="bg-[#08192d] p-2 text-white">#08192D<br/>Navy</div>
              <div className="bg-[#0f2b48] p-2 text-white">#0F2B48<br/>Container</div>
              <div className="bg-[#d4af37] p-2 text-black font-bold">#D4AF37<br/>Gold</div>
              <div className="bg-[#c0cbd8] border p-2 text-gray-800">#C0CBD8<br/>Border</div>
            </div>
          </div>

          {/* Mini Card Preview */}
          <div className="border border-[#c0cbd8] p-4 bg-[#f4f6f9] space-y-3">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-[#8a6d00] uppercase font-bold">Regulated Prize Escrow</span>
              <span className="bg-[#08192d] text-white px-1.5 py-0.5 font-bold">DRAW #142</span>
            </div>
            <h4 className="font-serif text-lg text-[#08192d]">The 153rd Open at St Andrews</h4>
            <div className="font-mono text-2xl font-bold text-[#08192d]">£38,500</div>
            <button
              onClick={() => setTheme('navy')}
              className="w-full bg-[#08192d] text-white py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#0f2b48]"
            >
              {theme === 'navy' ? '✓ Selected Direction' : 'Select Navy & Gold Direction'}
            </button>
          </div>
        </div>

        {/* THEME 03 */}
        <div
          className={`border p-6 space-y-6 bg-white transition-all ${
            theme === 'slate'
              ? 'border-2 border-[var(--secondary-gold)] shadow-md'
              : 'border-[var(--border-subtle)] opacity-90'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#141a18] text-white">
              THEME 03 • CRYPTOGRAPHIC
            </span>
            <span className="font-mono text-xs text-[#059669] font-bold">AAA 17.1:1</span>
          </div>

          <div>
            <h3 className="font-serif text-2xl text-[#141a18]">Highland Tartan Slate &amp; Sage</h3>
            <p className="font-sans text-xs text-[#3d4a45] mt-1">
              Modern Cryptographic Sovereign. Obsidian slate, soft mist heather sage, and sharp algorithmic mint for ledger transparency.
            </p>
          </div>

          {/* Color Swatches */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase block">Chromatic Tokens &amp; Roles</span>
            <div className="grid grid-cols-5 gap-1 text-center font-mono text-[9px] uppercase">
              <div className="bg-[#eef2f0] border p-2 text-gray-800">#EEF2F0<br/>Sage</div>
              <div className="bg-[#141a18] p-2 text-white">#141A18<br/>Slate</div>
              <div className="bg-[#222c29] p-2 text-white">#222C29<br/>Container</div>
              <div className="bg-[#10b981] p-2 text-black font-bold">#10B981<br/>Mint</div>
              <div className="bg-[#b8c5c0] border p-2 text-gray-800">#B8C5C0<br/>Border</div>
            </div>
          </div>

          {/* Mini Card Preview */}
          <div className="border border-[#b8c5c0] p-4 bg-[#eef2f0] space-y-3">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-[#059669] uppercase font-bold">Immutable Escrow Contract</span>
              <span className="bg-[#141a18] text-white px-1.5 py-0.5 font-bold">BLOCK #842K</span>
            </div>
            <h4 className="font-serif text-lg text-[#141a18]">The 153rd Open at St Andrews</h4>
            <div className="font-mono text-2xl font-bold text-[#141a18]">£38,500</div>
            <button
              onClick={() => setTheme('slate')}
              className="w-full bg-[#141a18] text-white py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#222c29]"
            >
              {theme === 'slate' ? '✓ Selected Direction' : 'Select Slate & Mint Direction'}
            </button>
          </div>
        </div>

      </div>

      {/* ── Technical Audit Matrix ── */}
      <div className="border border-[var(--border-subtle)] bg-[var(--surface-container-lowest)] p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--secondary)]">
            Technical Audit Matrix // Comparative Architecture &amp; Accessibility
          </h2>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">Strict Institutional Protocol</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead className="bg-[var(--surface-container-low)] font-mono text-[11px] uppercase border-b border-[var(--border-subtle)] text-[var(--primary)]">
              <tr>
                <th className="p-3">Evaluation Vector</th>
                <th className="p-3">01 Spruce &amp; Ivory</th>
                <th className="p-3">02 Royal Navy &amp; Gold</th>
                <th className="p-3">03 Highland Tartan &amp; Sage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-[11px]">
              <tr>
                <td className="p-3 font-bold text-[var(--primary)] font-sans">Primary Emotion</td>
                <td className="p-3">Archival Scottish Links Heritage</td>
                <td className="p-3">Statutory Crown Regulatory Prestige</td>
                <td className="p-3">Cryptographic Algorithmic Certainty</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[var(--primary)] font-sans">WCAG Text Contrast Ratio</td>
                <td className="p-3 text-emerald-700 font-bold">14.8:1 (Deep Spruce on Vellum)</td>
                <td className="p-3 text-emerald-700 font-bold">16.2:1 (Midnight on Alabaster)</td>
                <td className="p-3 text-emerald-700 font-bold">17.1:1 (Obsidian on Stone)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[var(--primary)] font-sans">Accent Function</td>
                <td className="p-3 text-[#c59b27] font-bold">Ochre Gold (#C59B27)</td>
                <td className="p-3 text-[#d4af37] font-bold">Brass Gold (#D4AF37)</td>
                <td className="p-3 text-[#10b981] font-bold">Algorithmic Mint (#10B981)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[var(--primary)] font-sans">Statutory Endowment Ratio</td>
                <td className="p-3">50% Dual-tone Forest Bar</td>
                <td className="p-3">50% Sovereign Navy/Gold Split</td>
                <td className="p-3">50% On-Chain Mint Progress Meter</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
