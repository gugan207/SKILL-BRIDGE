import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { Settings, Trash2, AlertTriangle, User, Mail, Calendar, FileText, BarChart3 } from 'lucide-react';

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await api.deleteMyData();
      await signOut();
      navigate('/');
    } catch (err) {
      alert('Failed to delete data: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-3 mb-8">
        <Settings className="w-7 h-7 text-indigo-500" />
        Account Settings
      </h1>

      {/* Profile Info */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg p-6 mb-6 space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)]">Your Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
            <Mail className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-xs text-[var(--text-muted)]">Email</span>
              <p className="font-medium text-[var(--text-primary)]">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
            <User className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-xs text-[var(--text-muted)]">Name</span>
              <p className="font-medium text-[var(--text-primary)]">
                {profile?.profile?.full_name || user?.user_metadata?.full_name || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-xs text-[var(--text-muted)]">Member Since</span>
              <p className="font-medium text-[var(--text-primary)]">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-xs text-[var(--text-muted)]">Analyses</span>
              <p className="font-medium text-[var(--text-primary)]">
                {profile?.stats?.total_reports ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Consent */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg p-6 mb-6">
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-2">Privacy & Data</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Your resume data is stored in private encrypted buckets. You can delete all your data at any time.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Consent given at: {profile?.profile?.consent_given_at
            ? new Date(profile.profile.consent_given_at).toLocaleString()
            : 'Not recorded'}
        </p>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6">
        <h2 className="text-base font-bold text-rose-500 flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          This will <strong>permanently delete</strong> all your data: resumes, job descriptions, analysis reports, and your account.
          This action cannot be undone.
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-rose-500 border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4 inline mr-1.5" />
            Delete All My Data
          </button>
        ) : (
          <div className="space-y-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
            <p className="text-sm font-semibold text-rose-500">
              Type <code className="px-1.5 py-0.5 rounded bg-rose-500/10 font-mono">DELETE</code> to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-2 rounded-xl border border-rose-500/30 bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || deleting}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete Everything'}
              </button>
              <button
                onClick={() => { setShowConfirm(false); setConfirmText(''); }}
                className="px-5 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
