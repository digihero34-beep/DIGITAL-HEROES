'use client';

import React, { useState, useRef } from 'react';
import styles from './file-upload.module.css';

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFormats?: string[];
  maxSizeBytes?: number;
  label?: string;
  helperText?: string;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  label = 'Upload Scorecard Proof',
  helperText = 'JPG, PNG, WEBP, or PDF up to 10MB',
  className,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndSet(file: File) {
    setError(null);
    if (!acceptedFormats.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPG, PNG, WEBP, or PDF.');
      return;
    }
    if (file.size > maxSizeBytes) {
      setError(`File exceeds maximum size of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      validateAndSet(e.target.files[0]);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSet(e.dataTransfer.files[0]);
    }
  }

  function handleRemove() {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileSelect(null);
  }

  return (
    <div className={className}>
      {!selectedFile ? (
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
            className={styles.hiddenInput}
            aria-label={label}
          />
          <div className={styles.iconSlot}>📸</div>
          <span className={styles.title}>{label}</span>
          <span className={styles.subtitle}>{helperText}</span>
        </div>
      ) : (
        <div className={styles.filePreviewCard}>
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{selectedFile.name}</span>
            <span className={styles.fileMeta}>
              {(selectedFile.size / 1024).toFixed(0)} KB • {selectedFile.type || 'Document'}
            </span>
          </div>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemove}
            aria-label="Remove selected file"
          >
            ✕
          </button>
        </div>
      )}

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
