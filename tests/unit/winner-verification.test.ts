import { describe, it, expect } from 'vitest';
import {
  validateProofUpload,
  canSubmitProof,
  canReviewVerification,
  canCompletePayout,
  ALLOWED_PROOF_MIME_TYPES,
  MAX_PROOF_FILE_SIZE,
} from '@/modules/winners/verification-validation';

describe('Winner Verification & Payout State Machine (PRD § 09 & § 11)', () => {
  describe('Proof File Validation (Size and MIME constraints)', () => {
    it('should define allowed MIME types limited to JPG, PNG, WEBP, and PDF', () => {
      expect(ALLOWED_PROOF_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_PROOF_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_PROOF_MIME_TYPES).toContain('image/webp');
      expect(ALLOWED_PROOF_MIME_TYPES).toContain('application/pdf');
      expect(ALLOWED_PROOF_MIME_TYPES.length).toBe(4);
    });

    it('should enforce 10MB maximum file size limit (10485760 bytes)', () => {
      expect(MAX_PROOF_FILE_SIZE).toBe(10 * 1024 * 1024);
      expect(MAX_PROOF_FILE_SIZE).toBe(10485760);
    });

    it('should accept valid files within the size limit and approved MIME types', () => {
      expect(validateProofUpload(1024, 'image/jpeg').isValid).toBe(true);
      expect(validateProofUpload(5 * 1024 * 1024, 'image/png').isValid).toBe(true);
      expect(validateProofUpload(8 * 1024 * 1024, 'image/webp').isValid).toBe(true);
      expect(validateProofUpload(MAX_PROOF_FILE_SIZE, 'application/pdf').isValid).toBe(true);
    });

    it('should reject files exceeding 10MB limit by even 1 byte', () => {
      const res = validateProofUpload(MAX_PROOF_FILE_SIZE + 1, 'image/jpeg');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('File size exceeds the 10MB platform limit');
    });

    it('should reject files with 0 or negative size', () => {
      expect(validateProofUpload(0, 'image/jpeg').isValid).toBe(false);
      expect(validateProofUpload(-50, 'image/jpeg').isValid).toBe(false);
      expect(validateProofUpload(NaN, 'image/jpeg').isValid).toBe(false);
    });

    it('should reject unapproved MIME types (e.g. svg, exe, zip, html, text)', () => {
      expect(validateProofUpload(1024, 'image/svg+xml').isValid).toBe(false);
      expect(validateProofUpload(1024, 'application/x-msdownload').isValid).toBe(false);
      expect(validateProofUpload(1024, 'application/zip').isValid).toBe(false);
      expect(validateProofUpload(1024, 'text/plain').isValid).toBe(false);
      expect(validateProofUpload(1024, 'text/html').isValid).toBe(false);
    });
  });

  describe('Verification Proof Submission State Transitions', () => {
    it('should permit proof submission when status is pending_proof or rejected (re-submission)', () => {
      expect(canSubmitProof('pending_proof')).toBe(true);
      expect(canSubmitProof('rejected')).toBe(true);
    });

    it('should reject proof submission when verification is already submitted, under review, approved, or paid', () => {
      expect(canSubmitProof('submitted')).toBe(false);
      expect(canSubmitProof('under_review')).toBe(false);
      expect(canSubmitProof('approved')).toBe(false);
    });
  });

  describe('Admin Verification Review Transitions', () => {
    it('should permit admin review when status is submitted or under_review', () => {
      expect(canReviewVerification('submitted')).toBe(true);
      expect(canReviewVerification('under_review')).toBe(true);
    });

    it('should prohibit admin review when proof is pending, already approved, or already rejected', () => {
      expect(canReviewVerification('pending_proof')).toBe(false);
      expect(canReviewVerification('approved')).toBe(false);
      expect(canReviewVerification('rejected')).toBe(false);
    });
  });

  describe('Payout Completion Lifecycle Rules', () => {
    it('should permit completing payout when status is pending or processing', () => {
      expect(canCompletePayout('pending')).toBe(true);
      expect(canCompletePayout('processing')).toBe(true);
    });

    it('should prohibit completing payout when status is already paid or failed', () => {
      expect(canCompletePayout('paid')).toBe(false);
      expect(canCompletePayout('failed')).toBe(false);
    });
  });
});
