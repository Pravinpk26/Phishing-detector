import "./TopFlow.css";

function TopFlow() {
  return (
    <div className="workflowCard">

      <div className="flowItem">
        <div className="flowIcon">📧</div>
        <div>
          <h4>1. Access Gmail</h4>
          <p>Securely connect and fetch emails</p>
        </div>
      </div>

      <div className="arrow">→</div>

      <div className="flowItem">
        <div className="flowIcon">🤖</div>
        <div>
          <h4>2. AI Analysis</h4>
          <p>Analyze sender, subject and body</p>
        </div>
      </div>

      <div className="arrow">→</div>

      <div className="flowItem">
        <div className="flowIcon">🌐</div>
        <div>
          <h4>3. Link Scanning</h4>
          <p>Check URLs and reputation</p>
        </div>
      </div>

      <div className="arrow">→</div>

      <div className="flowItem">
        <div className="flowIcon">🛡️</div>
        <div>
          <h4>4. Results</h4>
          <p>Generate risk score</p>
        </div>
      </div>

    </div>
  );
}

export default TopFlow;