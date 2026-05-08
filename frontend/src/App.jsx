import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AnalyticsEngine from './pages/AnalyticsEngine';
import LiveAlerts from './pages/LiveAlerts';
import SystemParameters from './pages/SystemParameters';
import CaseManagement from './pages/CaseManagement';
import RuleBuilder from './pages/RuleBuilder';
import APIIntegrations from './pages/APIIntegrations';
import TeamSettings from './pages/TeamSettings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/analytics" element={<AnalyticsEngine />} />
          <Route path="/alerts" element={<LiveAlerts />} />
          <Route path="/cases" element={<CaseManagement />} />
          <Route path="/rules" element={<RuleBuilder />} />
          <Route path="/integrations" element={<APIIntegrations />} />
          <Route path="/team" element={<TeamSettings />} />
          <Route path="/parameters" element={<SystemParameters />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
