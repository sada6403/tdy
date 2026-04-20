import { useState, useEffect } from 'react';
import { Bell, Send, Search, CheckCircle2, Clock, Users, User, Loader2, RefreshCw, MessageSquare } from 'lucide-react';
import { notificationsService } from '../services/api/adminNotifications';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        title: '',
        message: '',
        targetType: 'ALL', // 'ALL' | 'CUSTOMER'
        targetId: ''
    });

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationsService.getAll();
            if (res.success) setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) {
            setErrorMsg('Title and message are required.');
            return;
        }
        setSending(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const payload = {
                title: form.title,
                message: form.message,
                targetType: form.targetType,
                ...(form.targetType === 'CUSTOMER' && form.targetId ? { targetId: form.targetId } : {})
            };
            const res = await notificationsService.send(payload);
            if (res.success) {
                setSuccessMsg(`Notification sent successfully to ${form.targetType === 'ALL' ? 'all customers' : 'customer'}.`);
                setForm({ title: '', message: '', targetType: 'ALL', targetId: '' });
                fetchNotifications();
            }
        } catch (err) {
            setErrorMsg(err.message || 'Failed to send notification.');
        } finally {
            setSending(false);
        }
    };

    const filtered = notifications.filter(n => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (n.title || '').toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q);
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Notifications</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Send alerts and announcements to customers.</p>
                </div>
                <button onClick={fetchNotifications} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px', alignItems: 'start' }}>

                {/* Left: Notification List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="card" style={{ padding: '16px 20px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                className="input-field"
                                style={{ width: '100%', paddingLeft: '40px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ padding: '48px', textAlign: 'center' }}>
                                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                                <p style={{ marginTop: '12px', color: '#94a3b8', fontSize: '13px' }}>Loading notifications...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <Bell size={40} style={{ margin: '0 auto 16px', color: '#e2e8f0' }} />
                                <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>No notifications found.</p>
                            </div>
                        ) : filtered.map((n, i) => (
                            <div key={n._id || i} style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                                    backgroundColor: '#f0fdf4', color: '#10b981',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <MessageSquare size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{n.title}</p>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{n.message}</p>
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
                                            backgroundColor: n.targetType === 'ALL' ? '#eff6ff' : '#f0fdf4',
                                            color: n.targetType === 'ALL' ? '#2563eb' : '#059669'
                                        }}>
                                            {n.targetType === 'ALL' ? 'All Customers' : 'Targeted'}
                                        </span>
                                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                                            By: {n.createdBy || 'Admin'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Send Notification Form */}
                <div className="card" style={{ padding: '28px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Send size={18} style={{ color: 'var(--primary)' }} /> Send Notification
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Broadcast a message to customers instantly.</p>

                    {successMsg && (
                        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '13px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={16} /> {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Audience</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['ALL', 'CUSTOMER'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, targetType: type }))}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                                            border: '1px solid',
                                            borderColor: form.targetType === type ? 'var(--primary)' : '#e2e8f0',
                                            backgroundColor: form.targetType === type ? 'var(--primary)' : 'white',
                                            color: form.targetType === type ? 'white' : '#64748b',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        {type === 'ALL' ? <Users size={14} /> : <User size={14} />}
                                        {type === 'ALL' ? 'All Customers' : 'Specific Customer'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.targetType === 'CUSTOMER' && (
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Customer ID</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    style={{ width: '100%' }}
                                    placeholder="Enter Customer MongoDB ID..."
                                    value={form.targetId}
                                    onChange={(e) => setForm(f => ({ ...f, targetId: e.target.value }))}
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Title</label>
                            <input
                                type="text"
                                className="input-field"
                                style={{ width: '100%' }}
                                placeholder="Notification headline..."
                                value={form.title}
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Message</label>
                            <textarea
                                className="input-field"
                                style={{ width: '100%', resize: 'vertical', minHeight: '120px' }}
                                placeholder="Write your message here..."
                                value={form.message}
                                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={sending}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {sending ? 'Sending...' : 'Send Notification'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
