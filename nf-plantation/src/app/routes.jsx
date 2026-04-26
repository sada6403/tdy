import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ── Route-level lazy loading ─────────────────────────────────────────────────
// Each page is a separate chunk; only loads when the user navigates to it.
// Public pages
const Home             = lazy(() => import('./pages/Home'));
const About            = lazy(() => import('./pages/About'));
const Services         = lazy(() => import('./pages/Services'));
const Events           = lazy(() => import('./pages/Events'));
const InvestmentPlans  = lazy(() => import('./pages/InvestmentPlans'));
const Contact          = lazy(() => import('./pages/Contact'));
const SampleAgreement  = lazy(() => import('./pages/SampleAgreement'));

// Auth pages
const Login            = lazy(() => import('../features/auth/pages/Login'));
const Register         = lazy(() => import('../features/registration/pages/Register'));
const ForgotPassword   = lazy(() => import('../features/auth/pages/ForgotPassword'));
const ChangePassword   = lazy(() => import('../features/auth/pages/ChangePassword'));
const EditApplication  = lazy(() => import('../features/registration/pages/EditApplication'));

// Dashboard layout + pages
const DashboardLayout  = lazy(() => import('../layouts/DashboardLayout'));
const Dashboard        = lazy(() => import('../pages/nfplantation/dashboard/Dashboard'));
const Profile          = lazy(() => import('../features/settings/pages/Profile'));
const MyInvestment     = lazy(() => import('../features/plans/pages/MyInvestment'));
const PaymentProcess   = lazy(() => import('../features/deposits/pages/PaymentProcess'));
const Notifications    = lazy(() => import('../features/settings/pages/Notifications'));
const AddCash          = lazy(() => import('../features/deposits/pages/AddCash'));
const Withdraw         = lazy(() => import('../features/withdrawals/pages/Withdraw'));
const Calculator       = lazy(() => import('../features/plans/pages/Calculator'));
const Calendar         = lazy(() => import('../features/plans/pages/Calendar'));
const Branches         = lazy(() => import('../features/settings/pages/Branches'));
const Support          = lazy(() => import('../features/settings/pages/Support'));
const FDPlans          = lazy(() => import('../features/plans/pages/FDPlans'));
const FDActivation     = lazy(() => import('../features/plans/pages/FDActivation'));
const Wallet           = lazy(() => import('../features/wallet/WalletDashboard'));
const Transactions     = lazy(() => import('../features/wallet/pages/Transactions'));
const Settings         = lazy(() => import('../features/settings/SettingsPage'));

// ── Minimal route-level fallback ─────────────────────────────────────────────
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Loading...</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"                                          element={<Home />} />
        <Route path="/company/nf-plantation"                    element={<Home />} />
        <Route path="/company/nf-plantation/home"               element={<Home />} />
        <Route path="/company/nf-plantation/about"              element={<About />} />
        <Route path="/company/nf-plantation/events"             element={<Events />} />
        <Route path="/company/nf-plantation/services"           element={<Services />} />
        <Route path="/company/nf-plantation/investment-plans"   element={<InvestmentPlans />} />
        <Route path="/company/nf-plantation/contact"            element={<Contact />} />
        <Route path="/company/nf-plantation/sample-agreement"   element={<SampleAgreement />} />
        <Route path="/company/nf-plantation/login"              element={<Login />} />
        <Route path="/company/nf-plantation/register"           element={<Register />} />
        <Route path="/company/nf-plantation/forgot-password"    element={<ForgotPassword />} />
        <Route path="/company/nf-plantation/auth/change-password" element={<ChangePassword />} />
        <Route path="/company/nf-plantation/application/edit/:id" element={<EditApplication />} />

        {/* Customer Dashboard */}
        <Route path="/company/nf-plantation/dashboard" element={<DashboardLayout />}>
          <Route index            element={<Dashboard />} />
          <Route path="profile"   element={<Profile />} />
          <Route path="my-investment" element={<MyInvestment />} />
          <Route path="payment-process" element={<PaymentProcess />} />
          <Route path="notifications"   element={<Notifications />} />
          <Route path="add-cash"        element={<AddCash />} />
          <Route path="withdraw"        element={<Withdraw />} />
          <Route path="calculator"      element={<Calculator />} />
          <Route path="calendar"        element={<Calendar />} />
          <Route path="branches"        element={<Branches />} />
          <Route path="support"         element={<Support />} />
          <Route path="fd-plans"        element={<FDPlans />} />
          <Route path="fd-activation/:planId" element={<FDActivation />} />
          <Route path="wallet"          element={<Wallet />} />
          <Route path="transactions"    element={<Transactions />} />
          <Route path="settings"        element={<Settings />} />
        </Route>

        <Route path="*" element={<div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>Page not found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
