chrome.runtime.onInstalled.addListener(() => {
    console.log("Phishing Detector Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "EMAIL_DATA") {

        fetch("http://localhost:5000/analyze-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message.data)
        })
        .then(res => res.json())
        .then(data => {
            sendResponse(data);
        });

        return true;
    }

});