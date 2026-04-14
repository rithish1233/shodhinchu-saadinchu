import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';

export default function HostDashboard() {
  const { t, language } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axios.get('/host/dashboard');
      setDashboard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const socket = io(SOCKET_URL || window.location.origin);;
    socket.emit('join-host');
    socket.on('team-completed', (data) => {
      toast.success(`🏆 ${data.teamName} completed in ${data.completionTimeMinutes} min!`);
      fetchDashboard();
    });
    socket.on('team-progress', () => fetchDashboard());
    return () => socket.disconnect();
  }, [fetchDashboard]);

  const resetAll = async () => {
    if (!window.confirm(language === 'te' ? 'అన్ని జట్ల పురోగతి రీసెట్ చేయాలా?' : 'Reset all teams progress?')) return;
    try {
      await axios.post('/host/reset-all');
      toast.success('All teams reset!');
      fetchDashboard();
    } catch (err) {
      toast.error('Reset failed');
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}><div className="spinner"></div></div>;
  if (!dashboard) return null;

  const { summary, leaderboard, activeTeams, paths } = dashboard;

  const colorMap = {
    Red: '#e74c3c', Blue: '#3498db', Green: '#2ecc71', Yellow: '#f1c40f',
    Orange: '#e67e22', Purple: '#9b59b6', Pink: '#e91e8c', Brown: '#795548',
    Black: '#546e7a', White: '#ecf0f1', Gold: '#f39c12', Silver: '#95a5a6'
  };

  return (
    <div className="page fade-in">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">👑 {t('hostDashboard')}</h1>
          <p className="text-sm text-muted telugu-text">
            {language === 'te' ? 'నిజ సమయ పురోగతి మరియు లీడర్‌బోర్డ్' : 'Real-time progress and leaderboard'}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={fetchDashboard} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>🔄 Refresh</button>
          <button onClick={resetAll} className="btn btn-danger" style={{ fontSize: '0.85rem' }}>↺ Reset All</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-4 mb-3">
        {[
          { label: t('totalTeams'), value: summary.totalTeams, icon: '👥', color: '#3498db' },
          { label: t('completed'), value: summary.completedTeams, icon: '🏆', color: '#2ecc71' },
          { label: t('active'), value: summary.activeTeams, icon: '🏃', color: '#f39c12' },
          { label: t('notStarted'), value: summary.notStartedTeams, icon: '⏳', color: '#95a5a6' }
        ].map((s, i) => (
          <div key={i} className="card text-center" style={{ borderColor: s.color + '44' }}>
            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div className="text-sm telugu-text text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'leaderboard', 'active', 'paths'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' ? (language === 'te' ? 'అవలోకనం' : 'Overview')
              : tab === 'leaderboard' ? t('leaderboard')
              : tab === 'active' ? t('active')
              : t('paths')}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="flex-between mb-2">
            <h3 className="text-gold telugu-text">{language === 'te' ? 'అన్ని జట్లు' : 'All Teams'}</h3>
            <Link to="/host/teams" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>+ {t('registerTeam')}</Link>
          </div>
          {dashboard.allTeams.length === 0 ? (
            <div className="card text-center text-muted telugu-text">{t('noTeamsYet')}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Team', 'Path', 'Status', 'Progress', 'Time'].map(h => (
                      <th key={h} style={{ padding: '0.7rem 0.5rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboard.allTeams.map(team => (
                    <tr key={team._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <div className="font-bold">{team.teamName}</div>
                        <div className="text-sm text-muted">PIN: {team.pincode}</div>
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <span style={{
                          background: (colorMap[team.pathColor] || '#666') + '33',
                          color: colorMap[team.pathColor] || '#fff',
                          border: `1px solid ${colorMap[team.pathColor] || '#666'}55`,
                          padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          {team.pathColor} #{team.pathNumber}
                        </span>
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        {team.hasCompleted
                          ? <span className="badge badge-success">✓ Done</span>
                          : team.hasStarted
                          ? <span className="badge badge-warning">🏃 Active</span>
                          : <span className="badge" style={{ background: 'rgba(150,150,150,0.2)', color: '#aaa', border: '1px solid #555' }}>⏳ Waiting</span>}
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="progress-bar" style={{ width: '80px' }}>
                            <div className="progress-fill" style={{ width: `${(team.currentPlaceIndex / 5) * 100}%` }}></div>
                          </div>
                          <span className="text-sm text-muted">{team.currentPlaceIndex}/5</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem', color: 'var(--accent-gold)' }}>
                        {team.completionTimeMinutes ? `${team.completionTimeMinutes} min` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard tab */}
      {activeTab === 'leaderboard' && (
        <div>
          <h3 className="text-gold telugu-text mb-2">🏆 {t('leaderboard')}</h3>
          {leaderboard.length === 0 ? (
            <div className="card text-center text-muted telugu-text">
              {language === 'te' ? 'ఇంకా ఏ జట్టూ పూర్తి చేయలేదు' : 'No team has completed yet'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {leaderboard.map((team, i) => (
                <div key={team._id} className="card" style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  borderColor: i === 0 ? 'var(--accent-gold)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--border)',
                  background: i === 0 ? 'rgba(212,168,67,0.08)' : undefined
                }}>
                  <div style={{ fontSize: '2rem', minWidth: '2.5rem', textAlign: 'center' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-bold">{team.teamName}</div>
                    <div className="text-sm text-muted">
                      {team.pathColor} Path • {team.teamMembers?.join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {team.completionTimeMinutes} {t('min')}
                    </div>
                    <div className="text-sm text-muted">{t('time')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active teams tab */}
      {activeTab === 'active' && (
        <div>
          <h3 className="text-gold telugu-text mb-2">🏃 {language === 'te' ? 'చురుకుగా ఉన్న జట్లు' : 'Active Teams'}</h3>
          {activeTeams.length === 0 ? (
            <div className="card text-center text-muted telugu-text">
              {language === 'te' ? 'ఇప్పుడు చురుకుగా ఉన్న జట్లు లేవు' : 'No active teams right now'}
            </div>
          ) : (
            <div className="grid-2">
              {activeTeams.map(team => (
                <div key={team._id} className="card" style={{ borderColor: 'rgba(255,152,0,0.4)' }}>
                  <div className="flex-between mb-1">
                    <span className="font-bold">{team.teamName}</span>
                    <span className="badge badge-warning">🏃 Active</span>
                  </div>
                  <div className="text-sm text-muted mb-1">
                    {team.pathColor} Path #{team.pathNumber}
                  </div>
                  <div className="progress-bar mb-1">
                    <div className="progress-fill" style={{ width: `${(team.currentPlaceIndex / 5) * 100}%` }}></div>
                  </div>
                  <div className="text-sm text-secondary">
                    {t('step')} {team.currentPlaceIndex} {t('of')} 5
                  </div>
                  {team.gameStartedAt && (
                    <div className="text-sm text-muted mt-1">
                      Started: {new Date(team.gameStartedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Paths tab */}
      {activeTab === 'paths' && (
        <div>
          <div className="flex-between mb-2">
            <h3 className="text-gold telugu-text">{t('paths')}</h3>
            <Link to="/host/paths" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>+ {t('createPath')}</Link>
          </div>
          {paths.length === 0 ? (
            <div className="card text-center text-muted telugu-text">{t('noPathsYet')}</div>
          ) : (
            <div className="grid-3">
              {paths.map(path => (
                <div key={path._id} className="card" style={{ borderColor: (colorMap[path.pathColor] || '#666') + '44' }}>
                  <div className="flex-between mb-1">
                    <span style={{ color: colorMap[path.pathColor] || '#fff', fontWeight: 700 }}>
                      ● {path.pathColor}
                    </span>
                    <span className="text-sm text-muted">#{path.pathNumber}</span>
                  </div>
                  <div className="text-sm text-secondary mb-1">{path.pathName}</div>
                  <div className="flex-between">
                    <span className={`badge ${path.isComplete ? 'badge-success' : 'badge-warning'}`}>
                      {path.placesCount}/5 places
                    </span>
                    <Link to={`/host/qr/${path._id}`} className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                      🖨️ QR
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
