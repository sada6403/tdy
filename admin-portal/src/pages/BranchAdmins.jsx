import { useState, useEffect, useCallback } from 'react';
import {
  UserCog, Plus, Search, Building2, Mail, Phone, Loader2,
  X, CheckCircle2, AlertCircle, Trash2, Power, Edit3,
  ShieldCheck, ShieldOff, Circle
} from 'lucide-react';
import apiClient from '../services/api/client';
import { branchesService } from '../services/api/adminBranches';

const BranchAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [branches, setBranches] = useState([]);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', branchId: '' });
  const [formErrors, setFormErrors] = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [adminsRes, branchesRes, onlineRes] = await Promise.all([
        apiClient.get('/admin/branch-admins'),
        branchesService.getAllBranches(),
        apiClient.get('/admin/online-admins')
      ]);
      if (adminsRes.success) setAdmins(adminsRes.data);
      if (branchesRes.success) setBranches(branchesRes.data);
      if (onlineRes.success) setOnlineAdmins(onlineRes.data.map(u => u._id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Full name required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.branchId) errs.branchId = 'Branch selection required';
    return errs;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      const res = await apiClient.post('/admin/branch-admins', form);
      if (res.success) {
        showToast(`Branch admin created. Credentials sent to ${form.email}`);
        setShowModal(false);
        setForm({ name: '', email: '', phone: '', branchId: '' });
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create branch admin', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await apiClient.patch(`/admin/branch-admins/${id}/toggle`);
      showToast(isActive ? 'Account deactivated' : 'Account activated');
      fetchData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} as Branch Admin? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/admin/branch-admins/${id}`);
      showToast('Branch admin removed');
      fetchData();
    } catch (err) {
      showToast('Failed to remove', 'error');
    }
  };

  const filtered = admins.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.branchId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 9999, padding: '14px 20px', borderRadius: '12px', backgroundColor: toast.type === 'error' ? '#fef2f2' : '#f0fdf4', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`, color: toast.type === 'error' ? '#dc2626' : '#15803d', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Branch Admin Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Create and manage branch-level administrators. Credentials are emailed upon registration.
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ name: '', email: '', phone: '', branchId: '' }); setFormErrors({}); setShowModal(true); }}>
          <Plus size={18} /> Register Branch Admin
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Branch Admins', value: admins.length, color: '#2563eb' },
          { label: 'Active Accounts', value: admins.filter(a => a.isActive).length, color: '#10b981' },
          { label: 'Currently Online', value: onlineAdmins.filter(id => admins.some(a => a._id === id)).length, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCog size={24} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input-field" style={{ paddingLeft: '44px', width: '100%' }} placeholder="Search by name, email, or branch..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <UserCog size={40} style={{ color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>No branch admins found. Register the first one.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ADMIN</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>CONTACT</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>BRANCH</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>STATUS</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ONLINE</th>
                <th style={{ textAlign: 'right', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((admin) => {
                const isOnline = onlineAdmins.includes(admin._id);
                return (
                  <tr key={admin._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: '800', fontSize: '14px' }}>{admin.name}</p>
                          <p style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: '700' }}>{admin.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {admin.email}</span>
                        {admin.phone && <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {admin.phone}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                        <Building2 size={14} color="var(--primary)" /> {admin.branchId?.name || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', backgroundColor: admin.isActive ? '#ecfdf5' : '#f8fafc', color: admin.isActive ? '#059669' : '#94a3b8' }}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? '#10b981' : '#cbd5e1' }} />
                        <span style={{ fontSize: '11px', fontWeight: '700', color: isOnline ? '#10b981' : '#94a3b8' }}>{isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleToggle(admin._id, admin.isActive)}
                          style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', backgroundColor: admin.isActive ? '#fff7ed' : '#ecfdf5', color: admin.isActive ? '#ea580c' : '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {admin.isActive ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                          {admin.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(admin._id, admin.name)}
                          style={{ padding: '7px 10px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: 0, borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Register Branch Admin</h2>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>A unique User ID and password will be auto-generated and emailed.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: '#94a3b8', padding: '6px' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Full Name *</label>
                <input className="input-field" style={{ width: '100%', borderColor: formErrors.name ? '#ef4444' : '' }} value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(fe => ({ ...fe, name: '' })); }} placeholder="Administrator's full name" />
                {formErrors.name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.name}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Email Address *</label>
                  <input type="text" className="input-field" style={{ width: '100%', borderColor: formErrors.email ? '#ef4444' : '' }} value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setFormErrors(fe => ({ ...fe, email: '' })); }} placeholder="admin@email.com" />
                  {formErrors.email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.email}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Phone Number</label>
                  <input className="input-field" style={{ width: '100%' }} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07X XXX XXXX" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Assigned Branch *</label>
                <select className="input-field" style={{ width: '100%', borderColor: formErrors.branchId ? '#ef4444' : '' }} value={form.branchId} onChange={e => { setForm(f => ({ ...f, branchId: e.target.value })); setFormErrors(fe => ({ ...fe, branchId: '' })); }}>
                  <option value="">Select branch...</option>
                  {branches.map(br => <option key={br._id} value={br._id}>{br.name}</option>)}
                </select>
                {formErrors.branchId && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.branchId}</p>}
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '12px', color: '#1e40af', fontWeight: '600' }}>
                ℹ️ A secure User ID and password will be auto-generated and sent to the email address above.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: '11px 20px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '11px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? 'Creating...' : 'Create & Send Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchAdmins;
