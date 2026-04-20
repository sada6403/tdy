import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Events from './pages/Events';
import InvestmentPlans from './pages/InvestmentPlans';
import Contact from './pages/Contact';
import SampleAgreement from './pages/SampleAgreement';

import Login from '../features/auth/pages/Login';
import Register from '../features/registration/pages/Register';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ChangePassword from '../features/auth/pages/ChangePassword';

import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/nfplantation/dashboard/Dashboard';
import Profile from '../features/settings/pages/Profile';
import MyInvestment from '../features/plans/pages/MyInvestment';
import PaymentProcess from '../features/deposits/pages/PaymentProcess';
import Notifications from '../features/settings/pages/Notifications';
import AddCash from '../features/deposits/pages/AddCash';
import Withdraw from '../features/withdrawals/pages/Withdraw';
import Calculator from '../features/plans/pages/Calculator';
import Calendar from '../features/plans/pages/Calendar';
import Branches from '../features/settings/pages/Branches';
import Support from '../features/settings/pages/Support';
import FDPlans from '../features/plans/pages/FDPlans';
import FDActivation from '../features/plans/pages/FDActivation';
import Wallet from '../features/wallet/WalletDashboard';
import Transactions from '../features/wallet/pages/Transactions';
import Settings from '../features/settings/SettingsPage';
import EditApplication from '../features/registration/pages/EditApplication';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/company/nf-plantation" element={<Home />} />
      <Route path="/company/nf-plantation/home" element={<Home />} />
      <Route path="/company/nf-plantation/about" element={<About />} />
      <Route path="/company/nf-plantation/events" element={<Events />} />
      <Route path="/company/nf-plantation/services" element={<Services />} />
      <Route path="/company/nf-plantation/investment-plans" element={<InvestmentPlans />} />
      <Route path="/company/nf-plantation/contact" element={<Contact />} />
      <Route path="/company/nf-plantation/sample-agreement" element={<SampleAgreement />} />
      <Route path="/company/nf-plantation/login" element={<Login />} />
      <Route path="/company/nf-plantation/register" element={<Register />} />
      <Route path="/company/nf-plantation/forgot-password" element={<ForgotPassword />} />
      <Route path="/company/nf-plantation/auth/change-password" element={<ChangePassword />} />
      <Route path="/company/nf-plantation/application/edit/:id" element={<EditApplication />} />
      
      {/* Customer Dashboard Routes */}
      <Route path="/company/nf-plantation/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-investment" element={<MyInvestment />} />
        <Route path="payment-process" element={<PaymentProcess />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="add-cash" element={<AddCash />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="branches" element={<Branches />} />
        <Route path="support" element={<Support />} />
        <Route path="fd-plans" element={<FDPlans />} />
        <Route path="fd-activation/:planId" element={<FDActivation />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
};

export default AppRoutes;
