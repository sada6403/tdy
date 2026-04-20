import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, ChevronRight, UserCheck, 
  Phone, Mail, MapPin, Building2, UserCog, UserMinus, 
  Trash2, Edit3, MoreVertical, LayoutGrid, List,
  TrendingUp, Star, Award, ShieldCheck, MapPinIcon, Loader2
} from 'lucide-react';
import { agentsService } from '../services/api/adminAgents';
import { branchesService } from '../services/api/adminBranches';

const Agents = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'assignment'
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  
  const [agents, setAgents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [agentsRes, branchesRes] = await Promise.all([
          agentsService.getAllAgents(),
          branchesService.getAllBranches()
        ]);
        
        if (agentsRes.success) setAgents(agentsRes.data);
        if (branchesRes.success) setBranches(branchesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const unassignedCustomers = [
    { id: 'CUST-1042', name: 'Dilshan Madushanka', branch: 'Colombo-03', registered: '2026-04-01' },
    { id: 'CUST-1045', name: 'Priyantha De Silva', branch: 'Gampaha', registered: '2026-04-03' },
    { id: 'CUST-1048', name: 'Nuwan Perera', branch: 'Colombo-03', registered: '2026-04-04' },
    { id: 'CUST-1051', name: 'Ishara Jayasiri', branch: 'Kandy', registered: '2026-04-05' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Field Agents</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage agency staff and optimize customer portfolio assignments.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '10px', padding: '4px', border: '1px solid var(--border)' }}>
             <button onClick={() => setActiveTab('list')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: activeTab === 'list' ? 'var(--primary)' : 'transparent', color: activeTab === 'list' ? 'white' : '#64748b', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' }}>
                Agent Directory
             </button>
             <button onClick={() => setActiveTab('assignment')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: activeTab === 'assignment' ? 'var(--primary)' : 'transparent', color: activeTab === 'assignment' ? 'white' : '#64748b', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' }}>
                Portfolios Assignment
             </button>
          </div>
          <button className="btn-primary">
            <Plus size={18} /> New Agent
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Agent Directory Filters */}
          <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search agents by name or ID..." 
                className="input-field"
                style={{ width: '100%', paddingLeft: '48px' }}
              />
            </div>
            <select className="input-field" style={{ width: '200px' }} value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              <option value="All Branches">All Branches</option>
              {branches.map(br => <option key={br._id} value={br._id}>{br.name}</option>)}
            </select>
            <button className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
              <Filter size={18} /> Filters
            </button>
          </div>

          {/* Agents Management Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
             {loading ? <Loader2 className="animate-spin text-primary" /> : agents.filter(a => selectedBranch === 'All Branches' || a.branchId?._id === selectedBranch).map((agent, i) => (
               <div key={agent._id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                     <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                           <Users size={28} />
                        </div>
                        <div>
                           <h3 style={{ fontSize: '16px', fontWeight: '800' }}>{agent.name}</h3>
                           <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>{agent.contact}</p>
                        </div>
                     </div>
                     <span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '30px', backgroundColor: agent.isActive ? '#ecfdf5' : '#fef2f2', color: agent.isActive ? '#059669' : '#dc2626' }}>
                       {agent.isActive ? 'Active' : 'Inactive'}
                     </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                     <div className="card" style={{ padding: '12px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Portfolio</p>
                        <p style={{ fontSize: '18px', fontWeight: '800' }}>{agent.assignedCustomers?.length || 0}</p>
                     </div>
                     <div className="card" style={{ padding: '12px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Rating</p>
                        <p style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                           <Star size={16} fill="#f59e0b" color="#f59e0b" /> {agent.rating || 4.5}
                        </p>
                     </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={14} /> {agent.branchId ? agent.branchId.name : 'Unassigned'} Center
                     </div>
                     <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} /> {agent.contact}
                     </div>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                     <button style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#1e293b', fontWeight: '800', fontSize: '12px' }}>Edit Profile</button>
                     <button style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800', fontSize: '12px' }}>View Ledger</button>
                  </div>
               </div>
             ))}
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
           
           {/* Unassigned Customers List */}
           <div className="card">
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <UserCog size={24} style={{ color: 'var(--primary)' }} />
                 Pending Agent Assignments
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                       <tr>
                          <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '800', color: '#94a3b8' }}>CUSTOMER</th>
                          <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '800', color: '#94a3b8' }}>BRANCH</th>
                          <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '800', color: '#94a3b8' }}>REG. DATE</th>
                          <th style={{ textAlign: 'center', padding: '16px', fontSize: '12px', fontWeight: '800', color: '#94a3b8' }}>ACTION</th>
                       </tr>
                    </thead>
                    <tbody>
                       {unassignedCustomers.map((cust, i) => (
                         <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px' }}>
                               <p style={{ fontSize: '14px', fontWeight: '700' }}>{cust.name}</p>
                               <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>#{cust.id}</p>
                            </td>
                            <td style={{ padding: '16px' }}>
                               <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{cust.branch}</span>
                            </td>
                            <td style={{ padding: '16px' }}>
                               <span style={{ fontSize: '13px', color: '#94a3b8' }}>{cust.registered}</span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                               <button style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '12px', fontWeight: '800' }}>Click to Map</button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Quick Map Action Panel */}
           <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px dashed var(--primary)30' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Assignment Control</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target Customer</label>
                    <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid var(--border)', fontWeight: '700', fontSize: '14px' }}>
                       Select from table...
                    </div>
                 </div>

                 <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Select Field Agent</label>
                    <select className="input-field" style={{ width: '100%', height: '44px' }}>
                       <option>Auto-suggest Best Rated</option>
                       {agents.map(a => <option key={a._id} value={a._id}>{a.name} ({a.branchId?.name || 'Unknown'})</option>)}
                    </select>
                 </div>

                 <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1px solid #bbf7d0' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#065f46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Award size={16} /> Intelligent Mapping
                    </h4>
                    <p style={{ fontSize: '11px', color: '#065f46', opacity: 0.8 }}>
                       Assigning an agent within the same branch ensures faster physical KYC verification and personalized customer service.
                    </p>
                 </div>

                 <button disabled className="btn-primary" style={{ width: '100%', height: '48px', justifyContent: 'center', opacity: 0.5 }}>
                    Confirm Assignment
                 </button>
              </div>
           </div>

        </div>
      )}

    </div>
  );
};

export default Agents;
