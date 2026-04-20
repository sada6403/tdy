import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Users2
} from 'lucide-react';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newBranch, setNewBranch] = useState({ name: '', location: '', address: '', contactNumber: '', email: '' });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.get('/api/admin/branches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setBranches(res.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching branches:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.post('/api/admin/branches', newBranch, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setShowForm(false);
                setNewBranch({ name: '', location: '', address: '', contactNumber: '', email: '' });
                fetchBranches();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create branch');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to decommission this branch? This action is permanent.')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`/api/admin/branches/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBranches();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete branch');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Branch Network Architecture</h2>
                   <p style={{ color: '#64748b', fontSize: '14px' }}>Manage physical infrastructure and localized operations</p>
                </div>
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    {showForm ? 'Cancel Creation' : 'Register New Branch'}
                </button>
            </div>

            {showForm && (
                <div className="premium-card">
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Branch Registration Protocol</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600' }}>Branch Public Name</label>
                            <input 
                              required
                              value={newBranch.name} 
                              onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                              placeholder="e.g. Colombo Central Hub" 
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600' }}>Province/Location</label>
                            <input 
                              required
                              value={newBranch.location} 
                              onChange={(e) => setNewBranch({...newBranch, location: e.target.value})}
                              placeholder="e.g. Western Province" 
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600' }}>Physical Headquarters Address</label>
                            <input 
                              required
                              value={newBranch.address} 
                              onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                              placeholder="Full registered address" 
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600' }}>Primary Contact Hotline</label>
                            <input 
                              required
                              value={newBranch.contactNumber} 
                              onChange={(e) => setNewBranch({...newBranch, contactNumber: e.target.value})}
                              placeholder="+94 11 2XXX XXX" 
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600' }}>Operational Email</label>
                            <input 
                              required
                              type="email"
                              value={newBranch.email} 
                              onChange={(e) => setNewBranch({...newBranch, email: e.target.value})}
                              placeholder="branch@nfplantation.com" 
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '12px' }}>Initialize Branch Records</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                {loading ? (
                    <div style={{ gridColumn: 'span 12', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Syncing physical network topology...</div>
                ) : branches.length === 0 ? (
                    <div style={{ gridColumn: 'span 12', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No branches registered yet. Start by adding one.</div>
                ) : branches.map((branch) => (
                    <div key={branch._id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '800' }}>{branch.name}</h4>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={10} /> {branch.location}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(branch._id)} style={{ color: '#ef4444', padding: '8px' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '13px' }}>
                                <Phone size={14} style={{ color: '#94a3b8' }} />
                                <span>{branch.contactNumber}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '13px' }}>
                                <ShieldCheck size={14} style={{ color: '#10b981' }} />
                                <span>{branch.email}</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', paddingLeft: '26px' }}>
                                {branch.address}
                            </div>
                        </div>

                        <div style={{ 
                            marginTop: '12px', 
                            paddingTop: '20px', 
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Users2 size={16} style={{ color: '#94a3b8' }} />
                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>12 Agents Managed</span>
                            </div>
                            <button style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Manage Ops <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BranchManagement;
