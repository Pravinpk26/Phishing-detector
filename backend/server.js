const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
let latestScan = null;

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.post("/analyze-url", (req, res) => {
  const { url } = req.body;

  let score = 0;
  const reasons = [];

  if (
    url.includes("bit.ly") ||
    url.includes("tinyurl.com") ||
    url.includes("t.co")
  ) {
    score += 30;
    reasons.push("URL Shortener Detected");
  }

  if (
    url.includes(".xyz") ||
    url.includes(".top") ||
    url.includes(".click") ||
    url.includes(".zip")
  ) {
    score += 40;
    reasons.push("Suspicious Domain Extension");
  }

  if (
    /^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url)
  ) {
    score += 50;
    reasons.push("IP Address Used Instead of Domain");
  }

  if (url.length > 100) {
    score += 20;
    reasons.push("Unusually Long URL");
  }

  console.log("URL:", url);
  console.log("Score:", score);

  res.json({
    url,
    score,
    reasons,
  });
});
app.post("/analyze-email", (req, res) => {

    const { sender, subject, body, links } = req.body;

    let score = 0;

    const reasons = [];

    // Sender checks
    if (
        sender.includes(".xyz") ||
        sender.includes(".top")
    ) {
        score += 30;
        reasons.push("Suspicious sender domain");
    }

    // Subject checks
    if (
        subject.toLowerCase().includes("verify") ||
        subject.toLowerCase().includes("urgent") ||
        subject.toLowerCase().includes("account")
    ) {
        score += 20;
        reasons.push("Urgent or phishing subject");
    }

    // Body checks
    if (
        body.toLowerCase().includes("click here") ||
        body.toLowerCase().includes("password") ||
        body.toLowerCase().includes("login")
    ) {
        score += 25;
        reasons.push("Suspicious email content");
    }

    // Link checks
    links.forEach(link => {

        if (
            link.includes("bit.ly") ||
            link.includes("tinyurl") ||
            link.includes(".xyz") ||
            link.includes(".zip")
        ) {

            score += 15;

            reasons.push("Suspicious link found");

        }

    });
    latestScan = {

    score,

    reasons,

    sender,

    subject,

    body,

    links

};
    res.json({

        score,

        reasons,

        sender,

        subject,

        links

    });

});
app.get("/latest-scan", (req, res) => {

    if (!latestScan) {
        return res.json(null);
    }

    res.json(latestScan);

});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
