import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-primary border-t border-primary-container text-on-primary mt-16">
      <div className="w-full py-10 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-headline-md font-headline-md text-on-primary tracking-widest uppercase mb-1">
            DIGITAL HEROES
          </div>
          <p className="text-body-sm font-body-sm text-on-primary-container max-w-md">
            &copy; {new Date().getFullYear()} Digital Heroes Trust &amp; Philanthropic Archive. Regulated &amp; Cryptographically Verified.
          </p>
        </div>

        {/* Mandatory Governance & Legal Navigation */}
        <nav aria-label="Governance and Legal Navigation" className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-label-sm font-label-sm uppercase tracking-wider">
          <Link className="text-on-primary-container hover:text-secondary-fixed transition-colors" href="/how-it-works#audit">
            Audit Manifest
          </Link>
          <Link className="text-on-primary-container hover:text-secondary-fixed transition-colors" href="/how-it-works#charter">
            Charter &amp; Governance
          </Link>
          <Link className="text-on-primary-container hover:text-secondary-fixed transition-colors" href="/scores">
            Handicap Protocol
          </Link>
          <Link className="text-secondary-fixed font-semibold underline underline-offset-4" href="/charities">
            Charity Allocation Ledger
          </Link>
          <Link className="text-on-primary-container hover:text-secondary-fixed transition-colors" href="/pricing">
            Terms of Trust
          </Link>
        </nav>
      </div>
    </footer>
  );
}
