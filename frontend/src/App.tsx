import { Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from './data/store';
import { AppShell } from './components/layout/AppShell';
import Login from './screens/Login';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import Orders from './screens/Orders';
import OrderDetail from './screens/OrderDetail';
import Intake from './screens/Intake';
import Pickup from './screens/Pickup';
import ShareCard from './screens/ShareCard';
import Labels from './screens/Labels';
import FollowUps from './screens/FollowUps';
import Reports from './screens/Reports';
import Account from './screens/Account';
import Sync from './screens/Sync';
import PublicReceipt from './screens/PublicReceipt';
import type { ReactNode } from 'react';

function HomeRedirect() {
  const { loggedIn, tenant } = useStore();
  return <Navigate to={loggedIn ? `/${tenant.slug}/dashboard` : '/login'} replace />;
}

function Protected({ children }: { children: ReactNode }) {
  const { loggedIn } = useStore();
  if (!loggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/r/:token" element={<PublicReceipt />} />
      <Route
        path="/:slug"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/new" element={<Intake />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="orders/:id/pickup" element={<Pickup />} />
        <Route path="orders/:id/share" element={<ShareCard />} />
        <Route path="labels" element={<Labels />} />
        <Route path="follow-ups" element={<FollowUps />} />
        <Route path="reports" element={<Reports />} />
        <Route path="account" element={<Account />} />
        <Route path="sync" element={<Sync />} />
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
