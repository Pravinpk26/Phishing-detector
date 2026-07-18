import "./History.css";
import { useContext } from "react";
import { ScanContext } from "../context/ScanContext";

function History() {

    const { history } = useContext(ScanContext);

    return (

        <div className="historyCard">

            <h2>Recent Scans</h2>

            {

                history.length === 0 ? (

                    <p>No scans yet.</p>

                ) : (

                    history.map((item: any, index: number) => (

                        <div
                            key={index}
                            className="historyItem"
                        >

                            <div>

                                <strong>

                                    {item.status}

                                </strong>

                                <p>

                                    {item.subject}

                                </p>

                            </div>

                            <span>

                                {item.time}

                            </span>

                        </div>

                    ))

                )

            }

        </div>

    );

}

export default History;