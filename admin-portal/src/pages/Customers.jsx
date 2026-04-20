import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Eye, ShieldCheck, 
  Mail, Phone, ArrowUpDown, TrendingUp, UserMinus, 
  Calendar, Download, LayoutGrid, List, ChevronRight,
  TrendingDown, Activity, Wallet, Briefcase, PlusCircle, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminCustomersService } from '../services/api/adminCustomers';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisWeek: 0
  });

  useEffect(() => {
    fetchCustomers();
    fetchSummary();
  }, [searchQuery, filterStatus]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminCustomersService.getList({
        search: searchQuery,
        status: filterStatus !== 'ALL' ? filterStatus : undefined
      });
      if (res.success) {
        setCustomers(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await adminCustomersService.getSummary();
      if (res.success) {
        setStats({
          total: res.data.totalCustomers,
          active: res.data.activeCustomers,
          inactive: res.data.inactiveCustomers,
          newThisWeek: res.data.newToday // simplified mapping for now
        });
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const getStatusBadge = (c) => {
    const isApproved = ['ACTIVE', 'APPROVED', 'VERIFIED'].includes(c.status);
    if (isApproved && c.activePlansCount > 0) {
      return <span className="badge badge-success" style={{ padding: '4px 12px', fontSize: '11px' }}>Active Investor</span>;
    }
    if (isApproved) {
      return <span className="badge badge-info" style={{ padding: '4px 12px', fontSize: '11px' }}>{c.status}</span>;
    }
    return <span className="badge badge-secondary" style={{ padding: '4px 12px', fontSize: '11px', backgroundColor: '#f1f5f9', color: '#64748b' }}>{c.status || 'No Status'}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>
            <span>NF Plantation</span>
            <ChevronRight size={12} />
            <span>Admin</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--primary)' }}>Customers</span>
          </nav>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>Customers</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>
            View and manage all registered customers, their financial status, wallet details, plans, and transaction activity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="card" onClick={() => { fetchCustomers(); fetchSummary(); }} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> Refresh List
          </button>
          <button className="btn-primary" style={{ padding: '10px 24px' }}>
            <PlusCircle size={18} /> Onboard New
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { label: 'Total Customers', value: stats.total, icon: <Users size={24} />, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Active Investors', value: stats.active, icon: <TrendingUp size={24} />, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Inactive / Leads', value: stats.inactive, icon: <TrendingDown size={24} />, color: '#f59e0b', bg: '#fff7ed' },
          { label: 'Joined Today', value: stats.newThisWeek, icon: <Calendar size={24} />, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((card, i) => (
          <div key={i} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{card.label}</p>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Customer Name, Email, or User ID..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '52px', height: '48px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            className="input-field" 
            style={{ height: '48px', width: '180px', fontWeight: '700', fontSize: '14px', color: '#475569' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Investors</option>
            <option value="INACTIVE">Inactive Plans</option>
          </select>
          <button className="card" style={{ height: '48px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '700' }}>
            <Filter size={18} /> Advanced Filter
          </button>
          <button className="card" style={{ height: '48px', width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Global Customer Registry</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>Showing {customers.length} results</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>User ID</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Customer Identity</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Contact Info</th>
                <th style={{ textAlign: 'right', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Wallet Balance</th>
                <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Plans</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Loader2 size={32} className="animate-spin text-slate-300" />
                      <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>Synchronizing Customer Database...</p>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Search size={32} style={{ color: '#cbd5e1' }} />
                      <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>No customers found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="table-row" style={{ borderBottom: '1px solid #f8fafc', transition: 'all 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '6px' }}>
                      {c.userId || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '20px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' }}>
                        {c.name ? c.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{c.name || 'Anonymous'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Joined {new Date(c.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 16px' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}><Mail size={12} /> {c.email}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', marginTop: '2px' }}><Phone size={12} /> {c.phone}</div>
                  </td>
                  <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>LKR {(c.walletBalance || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '800' }}>WALLET SYSTEM</div>
                  </td>
                  <td style={{ padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '30px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: '800' }}>
                      <Briefcase size={12} /> {c.activePlansCount || 0} Active
                    </div>
                  </td>
                  <td style={{ padding: '20px 16px' }}>
                    {getStatusBadge(c)}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => navigate(`/customers/${c.id}`)}
                      style={{ 
                        padding: '8px 16px', borderRadius: '10px', backgroundColor: 'var(--primary)', 
                        color: 'white', border: 'none', fontSize: '12px', fontWeight: '800',
                        display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      View Profile <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
