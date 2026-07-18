import "./Recommendation.css";
import { useContext } from "react";
import { ScanContext } from "../context/ScanContext";

function Recommendation() {

    const { scanData } = useContext(ScanContext);

    if (!scanData) {

        return (

            <div className="recommendCard">

                <h2>💡 Recommendation</h2>

                <p>Scan an email to receive security recommendations.</p>

            </div>

        );

    }

    let recommendation = "This email appears safe.";

    if (scanData.score >= 80) {

        recommendation =
            "Do NOT click any links or download attachments.";

    } else if (scanData.score >= 40) {

        recommendation =
            "Proceed carefully. Verify the sender before taking action.";

    }

    return (

        <div className="recommendCard">

            <h2>💡 Recommendation</h2>

            <p>{recommendation}</p>

            <ul>

                <li>Verify the sender.</li>

                <li>Avoid sharing passwords or OTPs.</li>

                <li>Inspect all hyperlinks carefully.</li>

                <li>Report suspicious emails if necessary.</li>

            </ul>

        </div>

    );

}

export default Recommendation;