import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";

import Dashboard from "./pages/Dashboard";
import SettlementOverview from "./pages/SettlementOverview";
import EarningsSummary from "./pages/EarningsSummary";
import ActivityLogs from "./pages/ActivityLogs";

function App() {
  return (
    <Router>
  <RequireAuth>
    <Layout>
      <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settlements" element={<SettlementOverview />} />
          <Route path="/earnings" element={<EarningsSummary />} />
          <Route path="/activity" element={<ActivityLogs />} />
      </Routes>
    </Layout>
  </RequireAuth>
    </Router>
  );
}

export default App;
