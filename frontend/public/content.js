console.log("Phishing Detector Loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "scanEmail") {

        const senderName =
            document.querySelector("h3 span[email]")?.getAttribute("email") ||
            "Not Found";

        const subject =
            document.querySelector("h2")?.innerText ||
            "Not Found";

        const body =
            document.querySelector("div.a3s")?.innerText ||
            "Not Found";

        const links = [...document.querySelectorAll("a")]
            .map(link => link.href)
            .filter(link => link.startsWith("http"));

        sendResponse({
            sender: senderName,
            subject: subject,
            body: body,
            links: links
        });

        return true;
    }

});