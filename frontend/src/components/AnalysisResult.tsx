import "./AnalysisResult.css";
import { useContext } from "react";
import { ScanContext } from "../context/ScanContext";

function AnalysisResult() {

    const { scanData } = useContext(ScanContext);

    if (!scanData) {

        return (

            <div className="analysisCard">

                <h2>Analysis Result</h2>

                <h1 style={{ color: "#94a3b8" }}>
                    Waiting...
                </h1>

                <h3>
                    Scan an email to begin
                </h3>

            </div>

        );

    }

    const score = scanData.score;

    let verdict = "Safe";
    let color = "#22c55e";

    if (score >= 80) {

        verdict = "Phishing";
        color = "#ef4444";

    } else if (score >= 40) {

        verdict = "Suspicious";
        color = "#f59e0b";

    }

    return (

        <div className="analysisCard">

            <h2>Analysis Result</h2>

            <h1 style={{ color }}>
                {verdict}
            </h1>

            <h3>
                Risk Score: {score}/100
            </h3>

        </div>

    );

}

export default AnalysisResult;