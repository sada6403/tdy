import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedAdminRoute from './components/routing/ProtectedAdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Customers from './pages/Customers';
import CustomerApprovals from './pages/CustomerApprovals';
import ApprovalReview from './pages/ApprovalReview';
import CustomerDetail from './pages/CustomerDetail';
import Deposits from './pages/Deposits';
import DepositDetail from './pages/DepositDetail';
import PlanActivations from './pages/PlanActivations';
import PlanActivationDetail from './pages/PlanActivationDetail';
import Withdrawals from './pages/Withdrawals';
import PayoutList from './pages/PayoutList';
import WithdrawalDetail from './pages/WithdrawalDetail';
import PayoutExecution from './pages/PayoutExecution';
import MonthlyProfit from './pages/MonthlyProfit';
import ProfitDetail from './pages/ProfitDetail';
import Branches from './pages/Branches';
import Agents from './pages/Agents';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import RolesPermissions from './pages/RolesPermissions';
import CustomerReport from './pages/CustomerReport';
import HeroManagement from './pages/HeroManagement';
import InvestmentPlans from './pages/InvestmentPlans';
import Notifications from './pages/Notifications';
import WebsiteSettings from './pages/WebsiteSettings';
import EventsManagement from './pages/EventsManagement';
import CustomerSupport from './pages/CustomerSupport';
import BranchAdmins from './pages/BranchAdmins';
import Splash from './pages/Splash';

const Placeholder = ({ title }) => (
  <div className="card" style={{ textAlign: 'center', padding: '100px 20px' }}>
    <h2 style={{ color: 'var(--text-muted)' }}>{title} Module</h2>
    <p style={{ marginTop: '10px', color: '#94a3b8' }}>This feature is currently under active development.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/splash" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedAdminRoute />}>
            {/* Standard Dashboard Layout */}
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/customer-approvals" element={<CustomerApprovals />} />
              <Route path="/customer-approvals/:id" element={<ApprovalReview />} />
              <Route path="/deposits" element={<Deposits />} />
              <Route path="/deposits/:id" element={<DepositDetail />} />
              <Route path="/plan-activations" element={<PlanActivations />} />
              <Route path="/plan-activations/:id" element={<PlanActivationDetail />} />
              <Route path="/customers/:customerId/:id" element={<PlanActivationDetail />} />
              <Route path="/investment-plans" element={<InvestmentPlans />} />
              <Route path="/investments" element={<PlanActivations />} />
              <Route path="/withdrawals" element={<Withdrawals />} />
              <Route path="/withdrawals/:id" element={<WithdrawalDetail />} />
              <Route path="/payout" element={<PayoutList />} />
              <Route path="/payout/:id" element={<PayoutExecution />} />
              <Route path="/payout-list" element={<PayoutList />} />
              <Route path="/monthly-profit" element={<MonthlyProfit />} />
              <Route path="/monthly-profit/:id" element={<ProfitDetail />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/branch-admins" element={<BranchAdmins />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/roles-permissions" element={<RolesPermissions />} />
              <Route path="/hero-management" element={<HeroManagement />} />
              <Route path="/website-settings" element={<WebsiteSettings />} />
              <Route path="/events-management" element={<EventsManagement />} />
              <Route path="/customer-support" element={<CustomerSupport />} />
            </Route>

            {/* Print Friendly Reports (Full Width) */}
            <Route path="/customers/:id/report/:category" element={<CustomerReport />} />
          </Route>

          <Route path="*" element={<Navigate to="/splash" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
