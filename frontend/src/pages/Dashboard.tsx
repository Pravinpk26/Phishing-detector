import "../styles/dashboard.css";
import "../styles/components.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TopFlow from "../components/TopFlow";
import StatsCards from "../components/StatsCards";

import RecentEmail from "../components/RecentEmail";
import AnalysisResult from "../components/AnalysisResult";
import RiskFactors from "../components/RiskFactors";
import LinkAnalysis from "../components/LinkAnalysis";
import Recommendation from "../components/Recommendation";
import History from "../components/History";


function Dashboard() {
  return (
    <div className="dashboard">

      <Header />

      <TopFlow />
      <StatsCards />

      <div className="mainLayout">

        <Sidebar />

        <div className="middle">

          <RecentEmail />

          <History />

        </div>

        <div className="right">

          <AnalysisResult />

          <RiskFactors />

          <LinkAnalysis />

          <Recommendation />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;