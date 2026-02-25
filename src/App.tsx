import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import SettlementOverview from "./pages/SettlementOverview";
import EarningsSummary from "./pages/EarningsSummary";
import ActivityLogs from "./pages/ActivityLogs";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settlements" element={<SettlementOverview />} />
          <Route path="/earnings" element={<EarningsSummary />} />
          <Route path="/activity" element={<ActivityLogs />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
