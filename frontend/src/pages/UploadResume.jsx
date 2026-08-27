import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Stepper } from '../components/Stepper';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Clipboard } from 'lucide-react';

export default function UploadResume() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleFile = (f) => {
    setError('');
    setResult(null);

    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      setError('Unsupported format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = await api.uploadResume(file);
      setResult(data);
      // Store for next step
      sessionStorage.setItem('sb_resume_id', data.resume_id);
      sessionStorage.setItem('sb_resume_name', file.name);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (pasteText.trim().length < 50) {
      setError('Please provide at least 50 characters of resume text.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const data = await api.pasteResume(pasteText.trim());
      setResult(data);
      sessionStorage.setItem('sb_resume_id', data.resume_id);
      sessionStorage.setItem('sb_resume_name', 'Pasted Resume');
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    navigate('/job-description');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Stepper currentStep={1} />

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Upload your resume</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">PDF, DOCX, or plain text — we'll extract every detail.</p>
      </div>

      {/* Success State */}
      {result && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-[var(--text-primary)]">Resume uploaded successfully!</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Extracted <strong>{result.text_length.toLocaleString()}</strong> characters from <strong>{result.file_name}</strong>.
          </p>
          {result.preview && (
            <div className="mt-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] max-h-32 overflow-y-auto font-mono">
              {result.preview}
            </div>
          )}
          <button
            onClick={handleContinue}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 shadow-md transition-all"
          >
            Continue → Paste Job Description
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!result && !pasteMode && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-3xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/5'
                : file
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-indigo-500/30 hover:bg-indigo-500/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-12 h-12 text-emerald-500" />
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{file.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">
                    {dragActive ? 'Drop your resume here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">PDF, DOCX, or TXT — max 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-sm text-rose-500">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Upload Button */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-5 w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? 'Uploading & parsing...' : 'Upload & Parse Resume'}
            </button>
          )}

          {/* Paste text fallback */}
          <div className="text-center mt-6">
            <button
              onClick={() => setPasteMode(true)}
              className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 flex items-center gap-1.5 mx-auto"
            >
              <Clipboard className="w-4 h-4" /> Or paste your resume text instead
            </button>
          </div>
        </>
      )}

      {/* Paste Mode */}
      {!result && pasteMode && (
        <div className="space-y-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your complete resume text here..."
            rows={12}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm resize-none"
          />
          <div className="flex items-center justify-between">
            <button onClick={() => setPasteMode(false)} className="text-sm text-[var(--text-secondary)] hover:underline">
              ← Back to file upload
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={uploading || pasteText.trim().length < 50}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? 'Processing...' : 'Submit Resume Text'}
            </button>
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-sm text-rose-500">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
