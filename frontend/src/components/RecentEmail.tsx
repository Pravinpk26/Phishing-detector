import "./RecentEmail.css";
import { useContext } from "react";
import { ScanContext } from "../context/ScanContext";

function RecentEmail() {

    const { scanData } = useContext(ScanContext);

    if (!scanData) {

        return (

            <div className="emailCard">

                <div className="emailHeader">
                    <h2>📧 Recent Email</h2>
                    <span className="scanBadge">Waiting...</span>
                </div>

                <div className="previewBox">

                    No email has been scanned yet.

                    <br /><br />

                    Open Gmail and click
                    <strong> Scan Current Email </strong>
                    in the extension.

                </div>

            </div>

        );

    }

    return (

        <div className="emailCard">

            <div className="emailHeader">

                <h2>📧 Recent Email</h2>

                <span className="scanBadge">
                    Latest Scan
                </span>

            </div>

            <div className="emailInfo">

                <div className="infoRow">

                    <span className="label">
                        From
                    </span>

                    <span>
                        {scanData.sender}
                    </span>

                </div>

                <div className="infoRow">

                    <span className="label">
                        Subject
                    </span>

                    <span>
                        {scanData.subject}
                    </span>

                </div>

                <div className="infoRow">

                    <span className="label">
                        Links
                    </span>

                    <span>
                        {scanData.links?.length || 0}
                    </span>

                </div>

            </div>

            <div className="previewBox">

                {scanData.body}

            </div>

        </div>

    );

}

export default RecentEmail;