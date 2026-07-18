import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">

      {/* Gmail Status */}
      <div className="statusCard">

        <h2>📧 Gmail Connected</h2>

        <span className="activeBadge">
          ● Active
        </span>

        <p>Connected securely with Gmail API</p>

      </div>

      {/* Features */}
      <div className="featureCard">

        <h3>Key Features</h3>

        <ul>

          <li>✔ AI Email Analysis</li>

          <li>✔ URL Reputation Check</li>

          <li>✔ Attachment Scan</li>

          <li>✔ Risk Score Engine</li>

          <li>✔ Gmail Integration</li>

        </ul>

      </div>

      {/* Quick Stats */}

      <div className="statsCard">

        <h3>Quick Stats</h3>

        <div className="statRow">

          <span>Emails Scanned</span>

          <strong>24</strong>

        </div>

        <div className="statRow">

          <span>Threats Found</span>

          <strong>6</strong>

        </div>

        <div className="statRow">

          <span>Safe Emails</span>

          <strong>18</strong>

        </div>

      </div>

      {/* System Status */}

      <div className="privacyCard">

        <h3>System Status</h3>

        <p>🟢 Backend Online</p>

        <p>🟢 Extension Connected</p>

        <p>🟢 AI Engine Running</p>

      </div>

    </div>
  );
}

export default Sidebar;