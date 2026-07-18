import "./StatsCards.css";
import { useContext } from "react";
import { ScanContext } from "../context/ScanContext";

function StatsCards() {

    const { history } = useContext(ScanContext);

    const total = history.length;

    const threats = history.filter(
        (item: any) => item.status === "Phishing"
    ).length;

    const safe = history.filter(
        (item: any) => item.status === "Safe"
    ).length;

    const cards = [

        {
            title: "Emails Scanned",
            value: total
        },

        {
            title: "Threats Found",
            value: threats
        },

        {
            title: "Safe Emails",
            value: safe
        },

        {
            title: "Detection Accuracy",
            value: "98%"
        }

    ];

    return (

        <div className="statsGrid">

            {

                cards.map((card, index) => (

                    <div
                        key={index}
                        className="statCard"
                    >

                        <h3>{card.title}</h3>

                        <h1>{card.value}</h1>

                    </div>

                ))

            }

        </div>

    );

}

export default StatsCards;