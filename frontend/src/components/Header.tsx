import "./Header.css";
import shield from "../assets/shield.png";

function Header() {
  return (
    <div className="header">

      <div className="headerLeft">

        <img
          src={shield}
          className="logo"
          alt="logo"
        />

        <div>

          <h1>Phishing Email Detector</h1>

          <p>AI-Powered Email Security Assistant</p>

        </div>

      </div>

    </div>
  );
}

export default Header;