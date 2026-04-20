import { useState, useEffect } from 'react';
import { 
  Building2, Search, Filter, Plus, ChevronRight, MapPin, 
  Phone, Users, Wallet, CheckCircle2, XCircle, MoreVertical,
  UserCheck, Landmark, TrendingUp, LayoutGrid, List, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { branchesService } from '../services/api/adminBranches';

const Branches = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await branchesService.getAllBranches();
      if (res.success) setBranches(res.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Branch Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Monitor operational performance and administrative staffing across your physical branch network.</p>
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
          <button className="btn-primary">
            <Plus size={18} /> Add New Branch
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
         {[
           { label: 'Total Branches', value: '12', icon: <Building2 />, color: 'var(--primary)' },
           { label: 'Active Network', value: '10', icon: <CheckCircle2 />, color: '#10b981' },
           { label: 'Total Customers', value: '4,821', icon: <Users />, color: '#3b82f6' },
           { label: 'Network Value', value: 'LKR 214M', icon: <TrendingUp />, color: '#8b5cf6' },
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

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Branch Name, Code, or Admin..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }}
          />
        </div>
        <select className="input-field" style={{ width: '180px' }}>
          <option>All Statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Branch Table */}
      {viewMode === 'table' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH NAME</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CODE</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>ADMINISTRATOR</th>
                <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CUSTOMERS</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>NETWORK VALUE</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin text-primary mx-auto" /></td></tr>
              ) : branches.map((br, i) => (
                <tr key={br._id} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{br.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                       <MapPin size={10} /> {br.address}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', fontWeight: '800', color: 'var(--primary)', fontFamily: 'monospace' }}>{br.contactNumber || br.phone}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UserCheck size={16} color="#64748b" />
                       </div>
                       <div style={{ fontSize: '13px', fontWeight: '700' }}>Admin Default</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                     <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{br.customers || 0}</span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', fontWeight: '800', color: '#166534' }}>{br.investments || 'LKR 0.00'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      backgroundColor: '#ecfdf5', 
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => navigate(`/branches/${br._id}`)} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      Operational View <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
           {loading ? <Loader2 className="animate-spin text-primary" /> : branches.map((br) => (
             <div key={br._id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Building2 size={24} />
                   </div>
                   <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 12px', borderRadius: '30px' }}>Active</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>{br.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{br.address}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Network Value</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#166534' }}>{br.investments || 'LKR 0.00'}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Active Customers</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{br.customers || 0}</span>
                   </div>
                </div>
                
                <button onClick={() => navigate(`/branches/${br._id}`)} style={{ width: '100%', marginTop: '24px', padding: '12px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800', fontSize: '13px' }}>
                   Manage Branch Details
                </button>
             </div>
           ))}
        </div>
      )}

    </div>
  );
};

export default Branches;
