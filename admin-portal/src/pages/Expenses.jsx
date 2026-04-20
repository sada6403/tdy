import { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Loader2, RefreshCw, TrendingDown, CheckCircle2, X } from 'lucide-react';
import { expensesService } from '../services/api/adminExpenses';

const CATEGORIES = ['Operations', 'Marketing', 'Salaries', 'Infrastructure', 'Maintenance', 'Other'];

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: 'Operations',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [expRes, distRes] = await Promise.all([
                expensesService.getAll(),
                expensesService.getDistribution().catch(() => ({ success: true, data: [] }))
            ]);
            if (expRes.success) setExpenses(expRes.data || []);
            if (distRes.success) setDistribution(distRes.data || []);
        } catch (err) {
            console.error('Failed to fetch expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.amount) {
            setErrorMsg('Title and amount are required.');
            return;
        }
        setAdding(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const res = await expensesService.create({
                title: form.title,
                amount: parseFloat(form.amount),
                category: form.category,
                date: form.date,
                notes: form.notes
            });
            if (res.success) {
                setSuccessMsg('Expense recorded successfully.');
                setForm({ title: '', amount: '', category: 'Operations', date: new Date().toISOString().split('T')[0], notes: '' });
                setShowForm(false);
                fetchData();
            }
        } catch (err) {
            setErrorMsg(err.message || 'Failed to add expense.');
        } finally {
            setAdding(false);
        }
    };

    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const filtered = expenses.filter(exp => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (exp.title || '').toLowerCase().includes(q) || (exp.category || '').toLowerCase().includes(q);
    });

    const categoryColors = {
        Operations: '#3b82f6', Marketing: '#8b5cf6', Salaries: '#10b981',
        Infrastructure: '#f59e0b', Maintenance: '#ef4444', Other: '#64748b'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Expense Tracking</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Record and monitor operational expenses.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={fetchData} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={16} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Total Expenses</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>LKR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Total Records</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{expenses.length}</h3>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Categories Used</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{distribution.length || CATEGORIES.length}</h3>
                </div>
            </div>

            {/* Add Expense Form (collapsible) */}
            {showForm && (
                <div className="card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800' }}>New Expense Entry</h3>
                        <button onClick={() => setShowForm(false)} style={{ color: '#94a3b8', padding: '4px' }}><X size={20} /></button>
                    </div>

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

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Title *</label>
                                <input type="text" className="input-field" style={{ width: '100%' }} placeholder="Expense description..." value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Amount (LKR) *</label>
                                <input type="number" className="input-field" style={{ width: '100%' }} placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Category</label>
                                <select className="input-field" style={{ width: '100%' }} value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Date</label>
                                <input type="date" className="input-field" style={{ width: '100%' }} value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Notes (Optional)</label>
                            <textarea className="input-field" style={{ width: '100%', resize: 'vertical', minHeight: '80px' }} placeholder="Additional details..." value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" onClick={() => setShowForm(false)} className="card" style={{ padding: '10px 24px', fontWeight: '700', fontSize: '14px', color: '#64748b' }}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={adding} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                {adding ? 'Saving...' : 'Save Expense'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Main Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input type="text" className="input-field" style={{ width: '100%', paddingLeft: '40px' }} placeholder="Search expenses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Title</th>
                            <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                            <th style={{ textAlign: 'right', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '60px', textAlign: 'center' }}>
                                    <TrendingDown size={40} style={{ margin: '0 auto 16px', color: '#e2e8f0' }} />
                                    <p style={{ color: '#94a3b8', fontWeight: '700' }}>No expenses recorded yet.</p>
                                </td>
                            </tr>
                        ) : filtered.map((exp, i) => (
                            <tr key={exp._id || i} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row">
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{exp.title}</div>
                                    {exp.notes && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{exp.notes}</div>}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
                                        backgroundColor: `${categoryColors[exp.category] || '#64748b'}18`,
                                        color: categoryColors[exp.category] || '#64748b'
                                    }}>
                                        {exp.category || 'Other'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                                    {exp.date ? new Date(exp.date).toLocaleDateString() : '—'}
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '15px', fontWeight: '800', color: '#ef4444' }}>
                                    LKR {(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Expenses;
