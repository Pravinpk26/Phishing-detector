chrome.runtime.onInstalled.addListener(() => {
    console.log("Phishing Detector Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "EMAIL_DATA") {

        console.log("Received Email:");
        console.log(message.data);

        fetch("http://localhost:5000/analyze-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message.data)
        })
        .then(async (response) => {

            console.log("Response Status:", response.status);

            const data = await response.json();

            console.log("Backend Response:", data);

            sendResponse(data);

        })
        .catch((error) => {

            console.error("Fetch Error:", error);

            sendResponse({
                score: 0,
                sender: "",
                subject: "",
                reasons: ["Failed to connect to backend"]
            });

        });

        return true;
    }

});