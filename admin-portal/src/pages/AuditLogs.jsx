import { useState, useEffect, useCallback } from 'react';
import {
  Search, History, User, Shield, Eye, Download, Calendar,
  ShieldCheck, AlertCircle, CheckCircle2, Activity, Loader2,
  ChevronLeft, ChevronRight, LogIn, LogOut, RefreshCw
} from 'lucide-react';
import apiClient from '../services/api/client';

const SEVERITY_STYLE = {
  INFO:     { color: '#3b82f6', bg: '#eff6ff', label: 'Info' },
  WARN:     { color: '#f59e0b', bg: '#fffbeb', label: 'Warn' },
  CRITICAL: { color: '#ef4444', bg: '#fef2f2', label: 'Critical' },
};

const ACTION_ICON = {
  ADMIN_LOGIN:  <LogIn size={14} />,
  ADMIN_LOGOUT: <LogOut size={14} />,
};

const formatAction = (a) => a?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || '—';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchLogs = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = { page: p, limit: 25 };
      if (adminFilter) params.userId = adminFilter;
      const [logsRes, onlineRes] = await Promise.all([
        apiClient.get('/admin/activity-log', { params }),
        apiClient.get('/admin/online-admins')
      ]);
      if (logsRes.success) {
        setLogs(logsRes.data);
        setPagination(logsRes.pagination);
        setPage(p);
        // Collect unique admin users from logs for filter dropdown
        const seen = new Set();
        const users = [];
        logsRes.data.forEach(l => {
          if (l.userId && !seen.has(l.userId._id)) {
            seen.add(l.userId._id);
            users.push(l.userId);
          }
        });
        setAdminUsers(prev => {
          const merged = [...prev];
          users.forEach(u => { if (!merged.find(x => x._id === u._id)) merged.push(u); });
          return merged;
        });
      }
      if (onlineRes.success) setOnlineAdmins(onlineRes.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [adminFilter]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (severityFilter && log.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.action?.toLowerCase().includes(q) ||
        log.userId?.name?.toLowerCase().includes(q) ||
        log.userId?.userId?.toLowerCase().includes(q) ||
        log.description?.toLowerCase().includes(q) ||
        log.target?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>System Audit Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Transparent lifecycle tracking of every administrative action for regulatory compliance.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Online Admins indicator */}
          {onlineAdmins.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', backgroundColor: '#ecfdf5', border: '1px solid #bbf7d0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#065f46' }}>{onlineAdmins.length} Online Now</span>
            </div>
          )}
          <button onClick={() => fetchLogs(page)} className="card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}>
            <RefreshCw size={15} /> Refresh
          </button>
          <div className="card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #10b98130' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>Security Integrity</p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#064e3b' }}>IMMUTABLE</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Online Admins Panel */}
      {onlineAdmins.length > 0 && (
        <div className="card" style={{ padding: '16px 20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Currently Online</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {onlineAdmins.map(admin => (
              <div key={admin._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#065f46' }}>{admin.name}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', padding: '2px 6px', backgroundColor: 'white', borderRadius: '6px' }}>
                  {admin.role === 'ADMIN' ? 'Super Admin' : `${admin.branchId?.name || 'Branch'} Admin`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px 20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Search by action, admin name, or description..." className="input-field" style={{ width: '100%', paddingLeft: '44px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="input-field" style={{ width: '180px' }} value={adminFilter} onChange={e => { setAdminFilter(e.target.value); setPage(1); }}>
          <option value="">All Admins</option>
          {adminUsers.map(u => (
            <option key={u._id} value={u._id}>{u.name} ({u.role === 'ADMIN' ? 'Super Admin' : 'Branch Admin'})</option>
          ))}
        </select>
        <select className="input-field" style={{ width: '160px' }} value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          <option value="">All Severity</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warning</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', whiteSpace: 'nowrap' }}>
          {pagination.total} total records
        </span>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '13px' }}>Loading audit records...</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ADMINISTRATOR</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ACTION</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>DESCRIPTION</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>SEVERITY</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>DATE / TIME</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontWeight: '700' }}>No audit records found</td></tr>
              ) : filteredLogs.map((log, i) => {
                const sev = SEVERITY_STYLE[log.severity] || SEVERITY_STYLE.INFO;
                const ts = new Date(log.createdAt);
                const actor = log.userId?.name || 'System';
                const actorRole = log.userId?.role === 'ADMIN' ? 'Super Admin' : log.userId?.role === 'BRANCH_ADMIN' ? 'Branch Admin' : 'System';
                const isLoginEvent = log.action === 'ADMIN_LOGIN' || log.action === 'ADMIN_LOGOUT';
                return (
                  <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', color: '#475569' }}>
                          {actor.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{actor}</div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)' }}>{actorRole}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isLoginEvent && (
                          <span style={{ color: log.action === 'ADMIN_LOGIN' ? '#10b981' : '#f59e0b' }}>
                            {ACTION_ICON[log.action]}
                          </span>
                        )}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{formatAction(log.action)}</div>
                          {log.target && <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Target: {log.target}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '340px' }}>
                      <p style={{ fontSize: '12px', color: '#475569', fontWeight: '600', lineHeight: 1.5 }}>{log.description || '—'}</p>
                      {log.ipAddress && log.ipAddress !== 'UNKNOWN' && (
                        <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>IP: {log.ipAddress}</p>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', backgroundColor: sev.bg, color: sev.color }}>
                        {sev.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                        {ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => fetchLogs(page - 1)} disabled={page <= 1} className="card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', opacity: page <= 1 ? 0.4 : 1 }}>
            <ChevronLeft size={16} /> Prev
          </button>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Page {page} of {pagination.pages}</span>
          <button onClick={() => fetchLogs(page + 1)} disabled={page >= pagination.pages} className="card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', opacity: page >= pagination.pages ? 0.4 : 1 }}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Compliance Notice */}
      <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Activity size={24} color="#0369a1" />
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0c4a6e' }}>Regulatory Data Integrity</h4>
          <p style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
            Audit logs are immutable and linked to each database transaction. Deleting or modifying logs is prohibited by corporate finance policy. Includes all admin login/logout events.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
