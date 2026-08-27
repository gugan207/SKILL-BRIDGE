import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/ThemeContext';
import { AuthProvider } from './lib/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import JobDescription from './pages/JobDescription';
import Processing from './pages/Processing';
import ReportView from './pages/ReportView';
import History from './pages/History';
import AccountSettings from './pages/AccountSettings';
import Privacy from './pages/Privacy';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
            <Navbar />
            <main>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
                <Route path="/job-description" element={<ProtectedRoute><JobDescription /></ProtectedRoute>} />
                <Route path="/processing" element={<ProtectedRoute><Processing /></ProtectedRoute>} />
                <Route path="/report/:reportId" element={<ProtectedRoute><ReportView /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
