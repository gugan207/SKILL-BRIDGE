import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Authentication required');
  }
  return `Bearer ${session.access_token}`;
}

export const api = {
  async health() {
    const res = await fetch('/health');
    return res.json();
  },

  async uploadResume(file) {
    const authHeader = await getAuthHeader();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload/resume`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to upload resume');
    }
    return data;
  },

  async pasteResume(text) {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_BASE}/upload/paste-resume?text=${encodeURIComponent(text)}`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to paste resume');
    }
    return data;
  },

  async runAnalysisSync(payload) {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_BASE}/analysis/run-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Analysis failed');
    }
    return data;
  },

  streamAnalysis(payload, onUpdate, onError, onComplete) {
    getAuthHeader().then((authHeader) => {
      fetch(`${API_BASE}/analysis/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Stream request failed');
          }
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.stage === 'complete') {
                    onComplete(data.report);
                  } else if (data.stage === 'error') {
                    onError(new Error(data.message));
                  } else {
                    onUpdate(data);
                  }
                } catch (e) {
                  console.error('SSE parse error:', e);
                }
              }
            }
          }
        })
        .catch((err) => {
          onError(err);
        });
    }).catch(onError);
  },

  async getReports() {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_BASE}/reports/`, {
      headers: { Authorization: authHeader },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch reports');
    return data;
  },

  async getReport(reportId) {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_BASE}/reports/${reportId}`, {
      headers: { Authorization: authHeader },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch report');
    return data;
  },

  async downloadPdf(reportId, jdTitle = 'Job_Report') {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_BASE}/reports/${reportId}/pdf`, {
      headers: { Authorization: authHeader },
    });
    if (!res.ok) throw new Error('Failed to generate PDF');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkillBridge_${jdTitle.replace(/\s+/g, '_')}_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },

  async getProfile() {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_BASE}/account/profile`, {
      headers: { Authorization: authHeader },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch profile');
    return data;
  },

  async deleteMyData() {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_BASE}/account/delete-my-data`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to delete data');
    return data;
  },
};
