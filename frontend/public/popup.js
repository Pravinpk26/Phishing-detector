document.getElementById("scanBtn").addEventListener("click", async () => {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.tabs.sendMessage(
        tab.id,
        {
            action: "scanEmail"
        },
        (email) => {

            if (chrome.runtime.lastError) {
                document.getElementById("result").innerHTML =
                    chrome.runtime.lastError.message;
                return;
            }

            if (!email) {
                document.getElementById("result").innerHTML =
                    "No email detected.";
                return;
            }

            document.getElementById("result").innerHTML = `
                <h3>Email Detected</h3>

                <b>Sender:</b><br>
                ${email.sender}
                <br><br>

                <b>Subject:</b><br>
                ${email.subject}
                <br><br>

                <b>Links Found:</b>
                ${email.links.length}
            `;
        }
    );

});