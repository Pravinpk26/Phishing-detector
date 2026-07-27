document.addEventListener("DOMContentLoaded", () => {

    const scanBtn = document.getElementById("scanBtn");
    const result = document.getElementById("result");

    scanBtn.addEventListener("click", async () => {

        // Get current Gmail tab
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        // Ask content.js to extract the email
        chrome.tabs.sendMessage(
            tab.id,
            {
                action: "scanEmail"
            },
            (email) => {

                if (chrome.runtime.lastError) {
                    result.innerHTML =
                        "Error: " + chrome.runtime.lastError.message;
                    return;
                }

                if (!email) {
                    result.innerHTML = "No email detected.";
                    return;
                }

                const scanNote = email.limited
                    ? `<p style="color:#f5c451;"><strong>Quick preview scan</strong> — this email wasn't opened, so only the sender, subject, and preview snippet were checked (no links or full body). Open the email for a complete scan.</p>`
                    : "";

                // Send extracted email to background.js
                chrome.runtime.sendMessage(
                    {
                        type: "EMAIL_DATA",
                        data: email
                    },
                    (analysis) => {

                        if (chrome.runtime.lastError) {
                            result.innerHTML =
                                "Background Error: " +
                                chrome.runtime.lastError.message;
                            return;
                        }

                        if (!analysis) {
                            result.innerHTML =
                                "No response from backend.";
                            return;
                        }

                        result.innerHTML = `
                            <h2>Analysis Result</h2>

                            ${scanNote}

                            <p><strong>Risk Score:</strong> ${analysis.score}/100</p>

                            <p><strong>Sender:</strong><br>${analysis.sender}</p>

                            <p><strong>Subject:</strong><br>${analysis.subject}</p>

                            <p><strong>Reasons:</strong></p>

                            <ul>
                                ${analysis.reasons
                                    .map(reason => `<li>${reason}</li>`)
                                    .join("")}
                            </ul>
                        `;

                    }
                );

            }
        );

    });

});