import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function TeamManager() {
  const { t, language } = useLanguage();
  const [teams, setTeams] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [registeredCredentials, setRegisteredCredentials] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    teamName: '',
    teamMembers: ['', '', '', ''],
    assignedPathNumber: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, pathsRes] = await Promise.all([
        axios.get('/teams'),
        axios.get('/paths')
      ]);
      setTeams(teamsRes.data);
      setPaths(pathsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMemberChange = (index, value) => {
    const members = [...form.teamMembers];
    members[index] = value;
    setForm(f => ({ ...f, teamMembers: members }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.teamName || !form.assignedPathNumber) {
      return toast.error(language === 'te' ? 'జట్టు పేరు మరియు మార్గం నంబర్ అవసరం' : 'Team name and path number required');
    }
    setSaving(true);
    try {
      const members = form.teamMembers.filter(m => m.trim());
      const res = await axios.post('/teams/register', {
        teamName: form.teamName,
        teamMembers: members,
        assignedPathNumber: parseInt(form.assignedPathNumber)
      });
      setRegisteredCredentials(res.data);
      toast.success(language === 'te' ? 'జట్టు నమోదైంది!' : 'Team registered!');
      setForm({ teamName: '', teamMembers: ['', '', '', ''], assignedPathNumber: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (teamId, teamName) => {
    if (!window.confirm(`Remove team "${teamName}"?`)) return;
    try {
      await axios.delete(`/teams/${teamId}`);
      toast.success('Team removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove team');
    }
  };

  const handleReset = async (teamId, teamName) => {
    if (!window.confirm(`Reset progress for "${teamName}"?`)) return;
    try {
      await axios.post(`/teams/${teamId}/reset`);
      toast.success('Team progress reset');
      fetchData();
    } catch (err) {
      toast.error('Reset failed');
    }
  };

  const completePaths = paths.filter(p => p.places?.length === 5);

  const colorMap = {
    Red: '#e74c3c', Blue: '#3498db', Green: '#2ecc71', Yellow: '#f1c40f',
    Orange: '#e67e22', Purple: '#9b59b6', Pink: '#e91e8c', Brown: '#795548',
    Black: '#546e7a', White: '#ecf0f1', Gold: '#f39c12', Silver: '#95a5a6'
  };

  return (
    <div className="page fade-in">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">👥 {t('teams')}</h1>
          <p className="text-sm text-muted telugu-text">
            {language === 'te' ? 'జట్లను నమోదు చేయండి మరియు నిర్వహించండి' : 'Register and manage teams'}
          </p>
        </div>
        <div className="flex gap-1">
          <Link to="/host" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>← Dashboard</Link>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setRegisteredCredentials(null); }}>
              + {t('registerTeam')}
            </button>
          )}
        </div>
      </div>

      {/* Credentials display after registration */}
      {registeredCredentials && (
        <div className="card mb-3 glow" style={{ border: '2px solid var(--accent-gold)', background: 'rgba(212,168,67,0.08)' }}>
          <div className="flex-between mb-2">
            <h3 className="text-gold telugu-text">
              ✅ {language === 'te' ? 'జట్టు నమోదైంది!' : 'Team Registered!'}
            </h3>
            <button onClick={() => setRegisteredCredentials(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          <div className="grid-2">
            <div className="card" style={{ background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
              <div className="text-muted text-sm mb-1">{t('teamName')}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{registeredCredentials.team.teamName}</div>
            </div>
            <div className="card" style={{ background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
              <div className="text-muted text-sm mb-1">{t('yourPathColor')}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: colorMap[registeredCredentials.team.assignedPathColor] }}>
                ● {registeredCredentials.team.assignedPathColor}
                {registeredCredentials.team.pathColorInTelugu && ` (${registeredCredentials.team.pathColorInTelugu})`}
              </div>
            </div>
          </div>

          <div className="card mt-2" style={{ background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div className="text-muted text-sm mb-1">{t('yourPincode')}</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.3em', fontFamily: 'monospace' }}>
              {registeredCredentials.team.pincode}
            </div>
          </div>

          <div className="card mt-2" style={{ background: 'rgba(26,188,156,0.1)', border: '1px solid rgba(26,188,156,0.3)' }}>
            <p className="telugu-text" style={{ color: '#1abc9c', textAlign: 'center', fontSize: '1rem' }}>
              {language === 'te'
                ? `📋 జట్టు లాగిన్ వివరాలు: పిన్‌కోడ్: ${registeredCredentials.team.pincode} | రంగు: ${registeredCredentials.team.assignedPathColor}`
                : `📋 Login: PIN ${registeredCredentials.team.pincode} | Color: ${registeredCredentials.team.assignedPathColor}`}
            </p>
          </div>

          <button className="btn btn-primary mt-2" style={{ width: '100%' }} onClick={() => window.print()}>
            🖨️ {language === 'te' ? 'వివరాలు ముద్రించు' : 'Print Credentials'}
          </button>
        </div>
      )}

      {/* Registration Form */}
      {showForm && (
        <div className="card mb-3" style={{ border: '1px solid var(--accent-gold)' }}>
          <h2 className="modal-title">👥 {t('registerTeam')}</h2>

          {completePaths.length === 0 && (
            <div className="card mb-2" style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)' }}>
              <p className="text-error telugu-text">
                ⚠️ {language === 'te'
                  ? 'మొదట మార్గాలు సృష్టించండి. జట్టు నమోదుకు కనీసం 1 పూర్తి మార్గం అవసరం.'
                  : 'Create paths first. At least 1 complete path (5 places) is needed.'}
              </p>
              <Link to="/host/paths" className="btn btn-primary mt-1" style={{ fontSize: '0.85rem' }}>
                → {t('createPath')}
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>{t('teamName')}</label>
              <input type="text" value={form.teamName}
                onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))}
                placeholder={language === 'te' ? 'జట్టు పేరు' : 'Team name'} />
            </div>

            <div className="input-group">
              <label>{t('assignPath')}</label>
              <select value={form.assignedPathNumber}
                onChange={e => setForm(f => ({ ...f, assignedPathNumber: e.target.value }))}>
                <option value="">{language === 'te' ? 'మార్గం ఎంచుకోండి' : 'Select path'}</option>
                {completePaths.map(p => (
                  <option key={p._id} value={p.pathNumber}>
                    #{p.pathNumber} — {p.pathColor} {p.pathColorInTelugu ? `(${p.pathColorInTelugu})` : ''} {p.pathName ? `— ${p.pathName}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                {t('teamMembers')} ({language === 'te' ? 'ఐచ్ఛికం' : 'optional'})
              </label>
              <div className="grid-2">
                {form.teamMembers.map((m, i) => (
                  <input key={i} type="text" value={m}
                    onChange={e => handleMemberChange(i, e.target.value)}
                    placeholder={language === 'te' ? `సభ్యుడు ${i + 1}` : `Member ${i + 1}`}
                    style={{ marginBottom: '0.5rem' }} />
                ))}
              </div>
            </div>

            <div className="flex gap-1 mt-2">
              <button type="submit" className="btn btn-primary" disabled={saving || completePaths.length === 0}>
                {saving ? '...' : `✅ ${t('registerTeam')}`}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams list */}
      {loading ? (
        <div className="flex-center"><div className="spinner"></div></div>
      ) : teams.length === 0 ? (
        <div className="card text-center text-muted telugu-text" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <div>{t('noTeamsYet')}</div>
        </div>
      ) : (
        <div className="grid-2">
          {teams.map(team => (
            <div key={team._id} className="card" style={{ borderColor: (colorMap[team.assignedPathColor] || '#666') + '44' }}>
              <div className="flex-between mb-1">
                <div>
                  <div className="font-bold" style={{ fontSize: '1.05rem' }}>{team.teamName}</div>
                  {team.teamMembers?.length > 0 && (
                    <div className="text-sm text-muted">{team.teamMembers.join(', ')}</div>
                  )}
                </div>
                <div>
                  {team.hasCompleted
                    ? <span className="badge badge-success">🏆 Done</span>
                    : team.hasStarted
                    ? <span className="badge badge-warning">🏃 Active</span>
                    : <span className="badge" style={{ background: 'rgba(150,150,150,0.2)', color: '#aaa', border: '1px solid #555' }}>⏳ Waiting</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                <span style={{
                  background: (colorMap[team.assignedPathColor] || '#666') + '33',
                  color: colorMap[team.assignedPathColor] || '#fff',
                  border: `1px solid ${colorMap[team.assignedPathColor] || '#666'}55`,
                  padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                }}>
                  ● {team.assignedPathColor} #{team.assignedPathNumber}
                </span>
                <span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                  PIN: {team.pincode}
                </span>
              </div>

              <div className="progress-bar mb-1">
                <div className="progress-fill" style={{ width: `${(team.currentPlaceIndex / 5) * 100}%` }}></div>
              </div>
              <div className="text-sm text-muted mb-1">
                {t('step')} {team.currentPlaceIndex} {t('of')} 5
                {team.completionTimeMinutes && ` • ${team.completionTimeMinutes} min`}
              </div>

              <div className="flex gap-1 mt-1">
                <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => handleReset(team._id, team.teamName)}>↺ Reset</button>
                <button className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => handleDelete(team._id, team.teamName)}>🗑️ Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
