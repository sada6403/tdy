import { useState, useEffect } from 'react';
import { Headset, Search, RefreshCw, Loader2, CheckCircle2, Clock, MessageSquare, Eye, X, ChevronDown, AlertCircle, User } from 'lucide-react';
import { supportService } from '../services/api/adminSupport';

const STATUS_CONFIG = {
    NEW:         { label: 'New',         color: '#ef4444', bg: '#fef2f2' },
    READ:        { label: 'Read',        color: '#3b82f6', bg: '#eff6ff' },
    IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
    RESOLVED:    { label: 'Resolved',    color: '#10b981', bg: '#f0fdf4' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NEW;
    return (
        <span style={{
            fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
            backgroundColor: cfg.bg, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>{cfg.label}</span>
    );
};

const CustomerSupport = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [adminNote, setAdminNote] = useState('');

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await supportService.getRequests({ status: filterStatus || undefined });
            if (res.success) {
                setRequests(res.data || []);
                setTotal(res.total || 0);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch (err) {
            console.error('Failed to fetch support requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, [filterStatus]);

    const openRequest = async (req) => {
        setSelected(req);
        setAdminNote(req.adminNote || '');
        if (!req.isRead) {
            try {
                await supportService.markRead(req._id);
                setRequests(prev => prev.map(r => r._id === req._id ? { ...r, isRead: true, status: r.status === 'NEW' ? 'READ' : r.status } : r));
                setUnreadCount(c => Math.max(0, c - 1));
            } catch {}
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const res = await supportService.updateStatus(id, { status: newStatus, adminNote });
            if (res.success) {
                setRequests(prev => prev.map(r => r._id === id ? { ...r, ...res.data } : r));
                if (selected?._id === id) setSelected(prev => ({ ...prev, ...res.data }));
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = requests.filter(r => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (r.customerName || '').toLowerCase().includes(q)
            || (r.subject || '').toLowerCase().includes(q)
            || (r.message || '').toLowerCase().includes(q)
            || (r.customerEmail || '').toLowerCase().includes(q);
    });

    const stats = [
        { label: 'Total Requests',  value: total,       icon: MessageSquare, color: '#6366f1', bg: '#eef2ff' },
        { label: 'Unread / New',    value: unreadCount,  icon: AlertCircle,   color: '#ef4444', bg: '#fef2f2' },
        { label: 'In Progress',     value: requests.filter(r => r.status === 'IN_PROGRESS').length, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Resolved',        value: requests.filter(r => r.status === 'RESOLVED').length,    icon: CheckCircle2, color: '#10b981', bg: '#f0fdf4' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                        Customer Support
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        View and manage service requests submitted by customers.
                    </p>
                </div>
                <button onClick={fetchRequests} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {stats.map((s, i) => (
                    <div key={i} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by name, subject, message..."
                        className="input-field"
                        style={{ width: '100%', paddingLeft: '40px' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <select
                        className="input-field"
                        style={{ paddingRight: '36px', minWidth: '160px', appearance: 'none' }}
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="NEW">New</option>
                        <option value="READ">Read</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                </div>
            </div>

            {/* Request List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '64px', textAlign: 'center' }}>
                        <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                        <p style={{ marginTop: '12px', color: '#94a3b8', fontSize: '13px' }}>Loading requests...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '64px', textAlign: 'center' }}>
                        <Headset size={44} style={{ margin: '0 auto 16px', color: '#e2e8f0' }} />
                        <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>No support requests found.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                {['Customer', 'Subject', 'Message', 'Status', 'Date', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#f8fafc' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(req => (
                                <tr key={req._id} style={{ borderBottom: '1px solid #f8fafc', backgroundColor: req.isRead ? 'white' : '#fffbeb' }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = req.isRead ? 'white' : '#fffbeb'}
                                >
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {!req.isRead && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />}
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{req.customerName || 'Unknown'}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{req.customerEmail || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{req.subject}</span>
                                    </td>
                                    <td style={{ padding: '16px 20px', maxWidth: '280px' }}>
                                        <p style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {req.message}
                                        </p>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <button
                                            onClick={() => openRequest(req)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }} onClick={() => setSelected(null)} />
                    <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '560px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                    <StatusBadge status={selected.status} />
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        {new Date(selected.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{selected.subject}</h3>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ color: '#94a3b8', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div style={{ padding: '20px 28px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
                                <User size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{selected.customerName || 'Unknown'}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                    {selected.customerEmail || ''}
                                    {selected.customerPhone ? ` · ${selected.customerPhone}` : ''}
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Customer Message</p>
                            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7' }}>{selected.message}</p>
                        </div>

                        {/* Admin Note */}
                        <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Internal Note (Optional)</p>
                            <textarea
                                rows={3}
                                placeholder="Add a note for your team..."
                                className="input-field"
                                style={{ width: '100%', resize: 'none' }}
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '20px 28px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {['READ', 'IN_PROGRESS', 'RESOLVED'].map(st => {
                                const cfg = STATUS_CONFIG[st];
                                const isActive = selected.status === st;
                                return (
                                    <button
                                        key={st}
                                        disabled={updatingId === selected._id}
                                        onClick={() => handleStatusChange(selected._id, st)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            borderRadius: '10px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            cursor: updatingId ? 'not-allowed' : 'pointer',
                                            backgroundColor: isActive ? cfg.color : cfg.bg,
                                            color: isActive ? 'white' : cfg.color,
                                            border: `1px solid ${cfg.color}22`,
                                            opacity: updatingId === selected._id ? 0.6 : 1,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {updatingId === selected._id ? '...' : cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSupport;
