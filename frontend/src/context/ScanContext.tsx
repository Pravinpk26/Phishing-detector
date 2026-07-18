import {
    createContext,
    useState,
    useEffect
} from "react";

export const ScanContext = createContext<any>(null);

export function ScanProvider({ children }: any) {

    const [scanData, setScanData] = useState<any>(null);

    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {

        const fetchLatestScan = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/latest-scan"
                );

                const data = await response.json();

                if (!data) return;

                // Only update if this is a new scan
                if (
                    !scanData ||
                    data.subject !== scanData.subject
                ) {

                    setScanData(data);

                    let status = "Safe";

                    if (data.score >= 80) {
                        status = "Phishing";
                    }
                    else if (data.score >= 40) {
                        status = "Suspicious";
                    }

                    setHistory(previous => [

                        {
                            status,
                            subject: data.subject,
                            time: new Date().toLocaleTimeString()
                        },

                        ...previous

                    ]);

                }

            }
            catch (err) {

                console.log("Backend not reachable.");

            }

        };

        fetchLatestScan();

        const interval = setInterval(fetchLatestScan, 3000);

        return () => clearInterval(interval);

    }, [scanData]);

    return (

        <ScanContext.Provider
            value={{
                scanData,
                setScanData,
                history,
                setHistory
            }}
        >

            {children}

        </ScanContext.Provider>

    );

}