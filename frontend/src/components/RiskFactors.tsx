import "./RiskFactors.css";
import { useContext } from "react";
import { ScanContext } from "../context/ScanContext";

function RiskFactors() {

    const { scanData } = useContext(ScanContext);

    if (!scanData) {

        return (

            <div className="riskCard">

                <h2>Risk Factors</h2>

                <p>No scan available.</p>

            </div>

        );

    }

    return (

        <div className="riskCard">

            <h2>Risk Factors</h2>

            {

                scanData.reasons.length === 0 ? (

                    <p>No suspicious indicators detected.</p>

                ) : (

                    scanData.reasons.map((risk: string, index: number) => (

                        <div
                            key={index}
                            className="riskRow"
                        >

                            <div className="riskLeft">

                                <span className="redDot">

                                    ●

                                </span>

                                {risk}

                            </div>

                            <span className="riskBadge">

                                HIGH

                            </span>

                        </div>

                    ))

                )

            }

        </div>

    );

}

export default RiskFactors;