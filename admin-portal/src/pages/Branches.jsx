import { useState, useEffect, useRef } from 'react';
import {
  Building2, Search, Filter, Plus, MapPin,
  Phone, Users, Wallet, CheckCircle2, XCircle, MoreVertical,
  UserCheck, TrendingUp, LayoutGrid, List, Loader2,
  ExternalLink, Camera, User, X
} from 'lucide-react';
import { branchesService } from '../services/api/adminBranches';

const fmtLKR = (n) => {
  if (!n) return 'LKR 0';
  if (n >= 1000000) return `LKR ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `LKR ${(n / 1000).toFixed(0)}K`;
  return `LKR ${new Intl.NumberFormat('en-LK').format(n)}`;
};

const EMPTY_FORM = {
  name: '', address: '', contactNumber: '', email: '',
  location: '', type: 'Branch', googleMapsUrl: '', managerName: '', photoUrl: ''
};

const Branches = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({ totalBranches: 0, totalCustomers: 0, networkValueFormatted: 'LKR 0' });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const photoInputRef = useRef(null);

  useEffect(() => { fetchBranches(); }, []);

  const fetchBranches = async () => {
    try {
      const [branchRes, statsRes] = await Promise.allSettled([
        branchesService.getAllBranches(),
        branchesService.getStats()
      ]);
      if (branchRes.status === 'fulfilled' && branchRes.value?.success) {
        setBranches(branchRes.value.data);
      } else {
        console.error('Branches load failed:', branchRes.reason);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name || '',
        address: branch.address || '',
        contactNumber: branch.contactNumber || '',
        email: branch.email || '',
        location: branch.location || '',
        type: branch.type || 'Branch',
        googleMapsUrl: branch.googleMapsUrl || '',
        managerName: branch.managerName || '',
        photoUrl: branch.photoUrl || ''
      });
      setPhotoPreview(branch.photoUrl || '');
    } else {
      setEditingBranch(null);
      setFormData(EMPTY_FORM);
      setPhotoPreview('');
    }
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBranch(null);
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let payload;
      if (photoFile) {
        payload = new FormData();
        Object.entries(formData).forEach(([k, v]) => { if (v) payload.append(k, v); });
        payload.append('photo', photoFile);
      } else {
        payload = formData;
      }

      if (editingBranch) {
        await branchesService.updateBranch(editingBranch._id, payload);
      } else {
        await branchesService.createBranch(payload);
      }
      handleCloseModal();
      fetchBranches();
    } catch (err) {
      alert('Failed to save branch');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await branchesService.deleteBranch(id);
        fetchBranches();
      } catch (err) {
        alert('Failed to delete branch');
      }
    }
  };

  const filtered = branches.filter(br =>
    !search || br.name?.toLowerCase().includes(search.toLowerCase()) ||
    br.location?.toLowerCase().includes(search.toLowerCase()) ||
    br.managerName?.toLowerCase().includes(search.toLowerCase())
  );

  const field = (label, key, opts = {}) => (
    <div>
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
        {label}{opts.optional && <span style={{ fontWeight: '400', color: '#94a3b8' }}> (Optional)</span>}
      </label>
      <input
        {...opts}
        className="input-field"
        value={formData[key]}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        style={{ width: '100%' }}
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Branch Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Monitor operational performance across your physical branch network.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '10px', padding: '4px', border: '1px solid var(--border)' }}>
            <button onClick={() => setViewMode('table')} style={{ padding: '8px', borderRadius: '6px', backgroundColor: viewMode === 'table' ? '#f1f5f9' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : '#64748b' }}>
              <List size={20} />
            </button>
            <button onClick={() => setViewMode('grid')} style={{ padding: '8px', borderRadius: '6px', backgroundColor: viewMode === 'grid' ? '#f1f5f9' : 'transparent', color: viewMode === 'grid' ? 'var(--primary)' : '#64748b' }}>
              <LayoutGrid size={20} />
            </button>
          </div>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add New Branch
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Branches', value: stats.totalBranches > 0 ? stats.totalBranches : (branches.length || '—'), icon: <Building2 />, color: 'var(--primary)' },
          { label: 'Active Network', value: stats.totalBranches > 0 ? stats.totalBranches : (branches.length || '—'), icon: <CheckCircle2 />, color: '#10b981' },
          { label: 'Total Customers', value: stats.totalCustomers != null ? stats.totalCustomers.toLocaleString() : '—', icon: <Users />, color: '#3b82f6' },
          { label: 'Network Value', value: stats.networkValueFormatted || 'LKR 0', icon: <TrendingUp />, color: '#8b5cf6' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>{stat.label}</p>
              <p style={{ fontSize: '18px', fontWeight: '800' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Search by Branch Name, City, or Manager..." className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {loading ? <Loader2 className="animate-spin text-primary" /> : filtered.map((br) => (
            <div key={br._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Branch Photo Banner */}
              <div style={{
                height: '120px', backgroundColor: '#f1f5f9', position: 'relative',
                backgroundImage: br.photoUrl ? `url(${br.photoUrl})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center'
              }}>
                {!br.photoUrl && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={36} color="#cbd5e1" />
                  </div>
                )}
                <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#059669', backgroundColor: 'white', padding: '4px 10px', borderRadius: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                  Active
                </span>
                {br.type === 'Main Office' && (
                  <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '10px', fontWeight: '800', color: '#7c3aed', backgroundColor: '#ede9fe', padding: '4px 10px', borderRadius: '20px' }}>
                    Head Office
                  </span>
                )}
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '3px' }}>{br.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '12px' }}>
                    <MapPin size={11} /> {br.address}
                  </div>
                  {br.managerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={12} color="#10b981" />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>{br.managerName}</span>
                    </div>
                  )}
                </div>

                {/* Investment Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', marginBottom: '14px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>Active Capital</p>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: '#059669' }}>{fmtLKR(br.totalInvestment)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>Investments</p>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{br.investmentCount || 0}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>Customers</p>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{br.customerCount || 0}</p>
                  </div>
                  {br.contactNumber && (
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>Contact</p>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{br.contactNumber}</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {br.googleMapsUrl && (
                    <a href={br.googleMapsUrl} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>
                      <MapPin size={13} /> Map
                    </a>
                  )}
                  <button onClick={() => handleOpenModal(br)} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800', fontSize: '13px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(br._id)} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: '800', fontSize: '13px' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>MANAGER</th>
                <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CUSTOMERS</th>
                <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>INVESTMENTS</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>ACTIVE CAPITAL</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin text-primary mx-auto" /></td></tr>
              ) : filtered.map((br) => (
                <tr key={br._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                        {br.photoUrl
                          ? <img src={br.photoUrl} alt={br.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={18} color="#94a3b8" /></div>
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{br.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={10} /> {br.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                    {br.managerName || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{br.customerCount || 0}</td>
                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{br.investmentCount || 0}</td>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '800', color: '#059669' }}>{fmtLKR(br.totalInvestment)}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {br.googleMapsUrl && (
                        <a href={br.googleMapsUrl} target="_blank" rel="noreferrer"
                          style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> Map
                        </a>
                      )}
                      <button onClick={() => handleOpenModal(br)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '12px', fontWeight: '700' }}>Edit</button>
                      <button onClick={() => handleDelete(br._id)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '12px', fontWeight: '700' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
              <button onClick={handleCloseModal} style={{ color: '#94a3b8', padding: '4px' }}><X size={22} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Photo Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                  Branch Photo <span style={{ fontWeight: '400', color: '#94a3b8' }}>(Optional)</span>
                </label>
                <div
                  onClick={() => photoInputRef.current?.click()}
                  style={{
                    height: '120px', borderRadius: '12px', border: '2px dashed #e2e8f0', cursor: 'pointer',
                    overflow: 'hidden', position: 'relative', backgroundColor: '#f8fafc',
                    backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  {!photoPreview && (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <Camera size={24} style={{ margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '12px', fontWeight: '600' }}>Click to upload branch photo</p>
                    </div>
                  )}
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPhotoPreview(''); setPhotoFile(null); setFormData(f => ({ ...f, photoUrl: '' })); }}
                      style={{ position: 'absolute', top: '8px', right: '8px', width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhotoChange} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {field('Branch Name *', 'name', { required: true, placeholder: 'e.g. Branch - Kandy' })}
                {field('Location / City', 'location', { placeholder: 'e.g. Kandy' })}
              </div>

              {field('Full Address *', 'address', { required: true, placeholder: '45 Peradeniya Rd, Kandy' })}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {field('Contact Number', 'contactNumber', { placeholder: '077 123 4567', optional: true })}
                {field('Email Address', 'email', { type: 'email', placeholder: 'branch@example.com', optional: true })}
              </div>

              {field('Branch Manager Name', 'managerName', { placeholder: 'Full name of branch manager', optional: true })}

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                  Google Maps URL <span style={{ fontWeight: '400', color: '#94a3b8' }}>(Optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    className="input-field"
                    value={formData.googleMapsUrl}
                    onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Paste the Google Maps share link for this branch location.</p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Branch Type</label>
                <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%' }}>
                  <option value="Branch">Branch</option>
                  <option value="Main Office">Main Office / Head Office</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={handleCloseModal} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px' }} disabled={saving}>
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : (editingBranch ? 'Update Branch' : 'Save Branch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
