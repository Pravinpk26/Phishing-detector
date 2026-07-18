import "./LinkAnalysis.css";
import { useContext } from "react";
import { ScanContext } from "../context/ScanContext";

function LinkAnalysis() {

    const { scanData } = useContext(ScanContext);

    if (!scanData) {

        return (

            <div className="linkCard">

                <h2>Link Analysis</h2>

                <p>No links available.</p>

            </div>

        );

    }

    return (

        <div className="linkCard">

            <h2>Link Analysis</h2>

            {

                scanData.links.length === 0 ? (

                    <p>No hyperlinks detected in this email.</p>

                ) : (

                    scanData.links.map((link: string, index: number) => (

                        <div
                            key={index}
                            className="linkBox"
                            style={{ marginBottom: "15px" }}
                        >

                            <strong>URL</strong>

                            <br /><br />

                            {link}

                            <hr
                                style={{
                                    margin: "12px 0"
                                }}
                            />

                            <div className="linkRow">

                                <span>Threat Score</span>

                                <span className="score">

                                    {scanData.score}/100

                                </span>

                            </div>

                        </div>

                    ))

                )

            }

        </div>

    );

}

export default LinkAnalysis;