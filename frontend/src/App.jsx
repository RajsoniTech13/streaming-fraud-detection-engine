import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveAlerts from './pages/LiveAlerts';
import SystemParameters from './pages/SystemParameters';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alerts" element={<LiveAlerts />} />
          <Route path="/parameters" element={<SystemParameters />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
