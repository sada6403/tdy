import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, Search, Plus, Phone, Mail, Building2, UserCog,
  Trash2, Star, Award, Loader2, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { agentsService } from '../services/api/adminAgents';
import { branchesService } from '../services/api/adminBranches';

const Agents = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'list');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [searchQuery, setSearchQuery] = useState('');

  const [agents, setAgents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [unassignedCustomers, setUnassignedCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);

  // Agent form modal
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '', branchId: '', contact: '', email: '', employeeId: '', designation: 'Field Agent', department: '', nic: '', address: '', dob: '', gender: '', hireDate: '' });
  const [formErrors, setFormErrors] = useState({});

  // Assignment state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');

  const preselectedCustomerId = searchParams.get('customerId');
  const preselectedBranchId = searchParams.get('branchId');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [agentsRes, branchesRes, unassignedRes] = await Promise.all([
        agentsService.getAllAgents(),
        branchesService.getAllBranches(),
        agentsService.getUnassignedCustomers()
      ]);
      if (agentsRes.success) setAgents(agentsRes.data);
      if (branchesRes.success) setBranches(branchesRes.data);
      if (unassignedRes.success) setUnassignedCustomers(unassignedRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pre-select customer from URL params (coming from approval flow)
  useEffect(() => {
    if (preselectedCustomerId && unassignedCustomers.length > 0) {
      const cust = unassignedCustomers.find(c => c._id === preselectedCustomerId);
      if (cust) {
        setSelectedCustomer(cust);
        setActiveTab('assignment');
      }
    }
    if (preselectedBranchId) {
      setSelectedBranch(preselectedBranchId);
    }
  }, [preselectedCustomerId, preselectedBranchId, unassignedCustomers]);

  const validateForm = () => {
    const errs = {};
    if (!agentForm.name.trim() || agentForm.name.trim().length < 2) errs.name = 'Full name is required (min 2 characters)';
    const phone = agentForm.contact.replace(/\s+/g, '');
    if (!phone) {
      errs.contact = 'Mobile number is required';
    } else if (!/^(\+94|0094|0)?7\d{8}$/.test(phone)) {
      errs.contact = 'Enter a valid Sri Lankan mobile number (e.g. 0771234567)';
    }
    if (agentForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentForm.email)) errs.email = 'Enter a valid email address';
    if (agentForm.nic) {
      const nic = agentForm.nic.trim();
      if (!/^\d{9}[VvXx]$/.test(nic) && !/^\d{12}$/.test(nic)) errs.nic = 'NIC must be 9 digits + V/X or 12 digits (e.g. 991234567V or 199912345678)';
    }
    if (!agentForm.branchId) errs.branchId = 'Please select an assigned branch';
    if (!agentForm.gender) errs.gender = 'Please select a gender';
    if (agentForm.dob) {
      const age = (new Date() - new Date(agentForm.dob)) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) errs.dob = 'Agent must be at least 18 years old';
    }
    return errs;
  };

  const openModal = (agent = null) => {
    setFormErrors({});
    setEditingAgent(agent);
    setAgentForm(agent ? {
      name: agent.name, branchId: agent.branchId?._id || '', contact: agent.contact,
      email: agent.email || '', employeeId: agent.employeeId || '', designation: agent.designation || 'Field Agent',
      department: agent.department || '', nic: agent.nic || '', address: agent.address || '',
      dob: agent.dob ? agent.dob.substring(0, 10) : '', gender: agent.gender || '',
      hireDate: agent.hireDate ? agent.hireDate.substring(0, 10) : ''
    } : { name: '', branchId: '', contact: '', email: '', employeeId: '', designation: 'Field Agent', department: '', nic: '', address: '', dob: '', gender: '', hireDate: '' });
    setShowModal(true);
  };

  const handleSaveAgent = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    try {
      if (editingAgent) {
        await agentsService.updateAgent(editingAgent._id, agentForm);
      } else {
        await agentsService.createAgent(agentForm);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!window.confirm('Delete this agent?')) return;
    try {
      await agentsService.deleteAgent(id);
      fetchData();
    } catch {}
  };

  const handleAssign = async () => {
    if (!selectedCustomer || !selectedAgent) return;
    setAssignLoading(true);
    setAssignError('');
    setAssignSuccess('');
    try {
      const res = await agentsService.assignCustomer(selectedAgent, selectedCustomer._id);
      if (res.success) {
        setAssignSuccess(`${selectedCustomer.fullName} has been assigned. Emails sent to customer and agent.`);
        setSelectedCustomer(null);
        setSelectedAgent('');
        fetchData();
      }
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Assignment failed. Please try again.');
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredAgents = agents.filter(a => {
    const matchBranch = selectedBranch === 'All Branches' || a.branchId?._id === selectedBranch;
    const matchSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBranch && matchSearch;
  });

  // For assignment tab: show agents filtered by selected customer's branch
  const assignmentAgents = selectedCustomer?.branchId
    ? agents.filter(a => String(a.branchId?._id) === String(selectedCustomer.branchId._id))
    : agents;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Field Agents</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage agency staff and customer portfolio assignments.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '10px', padding: '4px', border: '1px solid var(--border)' }}>
            <button onClick={() => setActiveTab('list')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: activeTab === 'list' ? 'var(--primary)' : 'transparent', color: activeTab === 'list' ? 'white' : '#64748b', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' }}>
              Agent Directory
            </button>
            <button onClick={() => setActiveTab('assignment')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: activeTab === 'assignment' ? 'var(--primary)' : 'transparent', color: activeTab === 'assignment' ? 'white' : '#64748b', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Portfolios Assignment
              {unassignedCustomers.length > 0 && (
                <span style={{ minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '9px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unassignedCustomers.length}
                </span>
              )}
            </button>
          </div>
          <button className="btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> New Agent
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <>
          <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search agents by name..."
                className="input-field"
                style={{ width: '100%', paddingLeft: '48px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="input-field" style={{ width: '200px' }} value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
              <option value="All Branches">All Branches</option>
              {branches.map(br => <option key={br._id} value={br._id}>{br.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} /></div>
          ) : filteredAgents.length === 0 ? (
            <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
              <Users size={40} style={{ margin: '0 auto 16px', color: '#e2e8f0' }} />
              <p style={{ color: '#94a3b8', fontWeight: '700' }}>No agents found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {filteredAgents.map(agent => (
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
                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '30px', backgroundColor: agent.isActive ? '#ecfdf5' : '#fef2f2', color: agent.isActive ? '#059669' : '#dc2626', alignSelf: 'flex-start' }}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div className="card" style={{ padding: '10px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Portfolio</p>
                      <p style={{ fontSize: '18px', fontWeight: '800' }}>{agent.assignedCustomers?.length || 0}</p>
                    </div>
                    <div className="card" style={{ padding: '10px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Rating</p>
                      <p style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" /> {agent.rating || 4.5}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={14} /> {agent.branchId?.name || 'Unassigned'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} /> {agent.contact}
                    </div>
                    {agent.email && (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={14} /> {agent.email}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => openModal(agent)} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800', fontSize: '12px' }}>Edit Profile</button>
                    <button onClick={() => handleDeleteAgent(agent._id)} style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#ef4444', fontWeight: '800', fontSize: '12px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Assignment Tab */
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>

          {/* Unassigned Customers */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCog size={24} style={{ color: 'var(--primary)' }} />
              Pending Agent Assignments
              {unassignedCustomers.length > 0 && (
                <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: '#fef2f2', color: '#ef4444', padding: '2px 10px', borderRadius: '10px' }}>{unassignedCustomers.length}</span>
              )}
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px' }}><Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} /></div>
            ) : unassignedCustomers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 12px', color: '#10b981' }} />
                <p style={{ fontWeight: '700' }}>All customers have been assigned agents.</p>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>CUSTOMER</th>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>BRANCH</th>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>JOINED</th>
                      <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>SELECT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unassignedCustomers.map(cust => (
                      <tr key={cust._id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: selectedCustomer?._id === cust._id ? '#f0fdf4' : 'white' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '700' }}>{cust.fullName}</p>
                          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{cust.email}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{cust.branchId?.name || '—'}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {new Date(cust.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => { setSelectedCustomer(cust); setSelectedAgent(''); setAssignSuccess(''); setAssignError(''); }}
                            style={{
                              padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800',
                              backgroundColor: selectedCustomer?._id === cust._id ? 'var(--primary)' : '#f1f5f9',
                              color: selectedCustomer?._id === cust._id ? 'white' : '#475569',
                            }}
                          >
                            {selectedCustomer?._id === cust._id ? '✓ Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Assignment Panel */}
          <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px dashed rgba(37,168,94,0.3)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Assignment Control</h3>

            {assignSuccess && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '13px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {assignSuccess}
              </div>
            )}
            {assignError && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {assignError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target Customer</label>
                <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid var(--border)', fontWeight: '700', fontSize: '14px', color: selectedCustomer ? '#0f172a' : '#94a3b8' }}>
                  {selectedCustomer ? (
                    <div>
                      <div style={{ fontWeight: '800' }}>{selectedCustomer.fullName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{selectedCustomer.branchId?.name || 'No Branch'}</div>
                    </div>
                  ) : 'Select from table →'}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  Select Field Agent
                  {selectedCustomer?.branchId && <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', marginLeft: '8px', textTransform: 'none' }}>Filtered by {selectedCustomer.branchId.name}</span>}
                </label>
                <select
                  className="input-field"
                  style={{ width: '100%', height: '44px' }}
                  value={selectedAgent}
                  onChange={e => setSelectedAgent(e.target.value)}
                  disabled={!selectedCustomer}
                >
                  <option value="">— Select Agent —</option>
                  {assignmentAgents.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.branchId?.name || 'Unknown'}) — {a.assignedCustomers?.length || 0} clients
                    </option>
                  ))}
                </select>
                {selectedCustomer && assignmentAgents.length === 0 && (
                  <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '6px', fontWeight: '600' }}>No agents in this branch. All agents shown instead.</p>
                )}
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1px solid #bbf7d0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#065f46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} /> What happens on confirm?
                </h4>
                <ul style={{ fontSize: '12px', color: '#065f46', opacity: 0.9, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Agent assigned to customer profile</li>
                  <li>Official email sent to customer (agent details)</li>
                  <li>Email sent to agent (customer profile)</li>
                </ul>
              </div>

              <button
                onClick={handleAssign}
                disabled={!selectedCustomer || !selectedAgent || assignLoading}
                className="btn-primary"
                style={{ width: '100%', height: '48px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', opacity: (!selectedCustomer || !selectedAgent) ? 0.5 : 1 }}
              >
                {assignLoading ? <Loader2 size={18} className="animate-spin" /> : <UserCog size={18} />}
                {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Registration Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '680px', padding: '0', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1, borderRadius: '20px 20px 0 0' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{editingAgent ? 'Edit Agent Profile' : 'New Agent Registration'}</h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{editingAgent ? 'Update employee information' : 'Register a new field agent employee'}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: '#94a3b8', padding: '8px', borderRadius: '8px' }}><X size={22} /></button>
            </div>

            <form onSubmit={handleSaveAgent} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Section 1: Personal Details */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Personal Information</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Full Name *</label>
                    <input className="input-field" style={{ width: '100%', borderColor: formErrors.name ? '#ef4444' : '' }} value={agentForm.name} onChange={e => { setAgentForm(f => ({ ...f, name: e.target.value })); setFormErrors(fe => ({ ...fe, name: '' })); }} placeholder="Agent's full legal name" />
                    {formErrors.name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.name}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>NIC / Document ID</label>
                    <input className="input-field" style={{ width: '100%', borderColor: formErrors.nic ? '#ef4444' : '' }} value={agentForm.nic} onChange={e => { setAgentForm(f => ({ ...f, nic: e.target.value.toUpperCase() })); setFormErrors(fe => ({ ...fe, nic: '' })); }} placeholder="e.g. 991234567V" />
                    {formErrors.nic && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.nic}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Date of Birth</label>
                    <input type="date" className="input-field" style={{ width: '100%', borderColor: formErrors.dob ? '#ef4444' : '' }} value={agentForm.dob} onChange={e => { setAgentForm(f => ({ ...f, dob: e.target.value })); setFormErrors(fe => ({ ...fe, dob: '' })); }} />
                    {formErrors.dob && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.dob}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Gender *</label>
                    <select className="input-field" style={{ width: '100%', borderColor: formErrors.gender ? '#ef4444' : '' }} value={agentForm.gender} onChange={e => { setAgentForm(f => ({ ...f, gender: e.target.value })); setFormErrors(fe => ({ ...fe, gender: '' })); }}>
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.gender && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.gender}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Home Address</label>
                    <input className="input-field" style={{ width: '100%' }} value={agentForm.address} onChange={e => setAgentForm(f => ({ ...f, address: e.target.value }))} placeholder="Residential address" />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Details */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Contact Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Mobile Number *</label>
                    <input className="input-field" style={{ width: '100%', borderColor: formErrors.contact ? '#ef4444' : '' }} value={agentForm.contact} onChange={e => { setAgentForm(f => ({ ...f, contact: e.target.value })); setFormErrors(fe => ({ ...fe, contact: '' })); }} placeholder="+94 7X XXX XXXX" />
                    {formErrors.contact && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.contact}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Email Address</label>
                    <input type="text" className="input-field" style={{ width: '100%', borderColor: formErrors.email ? '#ef4444' : '' }} value={agentForm.email} onChange={e => { setAgentForm(f => ({ ...f, email: e.target.value })); setFormErrors(fe => ({ ...fe, email: '' })); }} placeholder="agent@email.com" />
                    {formErrors.email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Section 3: Employment Details */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Employment Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Employee ID</label>
                    <input className="input-field" style={{ width: '100%' }} value={agentForm.employeeId} onChange={e => setAgentForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="e.g. NFP-AG-001" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Designation</label>
                    <select className="input-field" style={{ width: '100%' }} value={agentForm.designation} onChange={e => setAgentForm(f => ({ ...f, designation: e.target.value }))}>
                      <option value="Field Agent">Field Agent</option>
                      <option value="Senior Field Agent">Senior Field Agent</option>
                      <option value="Team Leader">Team Leader</option>
                      <option value="Branch Coordinator">Branch Coordinator</option>
                      <option value="Regional Manager">Regional Manager</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Department</label>
                    <input className="input-field" style={{ width: '100%' }} value={agentForm.department} onChange={e => setAgentForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Client Relations" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Date of Joining</label>
                    <input type="date" className="input-field" style={{ width: '100%' }} value={agentForm.hireDate} onChange={e => setAgentForm(f => ({ ...f, hireDate: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Assigned Branch *</label>
                    <select className="input-field" style={{ width: '100%', borderColor: formErrors.branchId ? '#ef4444' : '' }} value={agentForm.branchId} onChange={e => { setAgentForm(f => ({ ...f, branchId: e.target.value })); setFormErrors(fe => ({ ...fe, branchId: '' })); }}>
                      <option value="">Select branch...</option>
                      {branches.map(br => <option key={br._id} value={br._id}>{br.name}</option>)}
                    </select>
                    {formErrors.branchId && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{formErrors.branchId}</p>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingAgent ? 'Save Changes' : 'Register Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
