// backend/routes/analysis.js
//
// Express routes for email/URL analysis. Response shapes for
// /analyze-email and /analyze-url are kept identical to the original
// implementation (score, reasons, sender, subject, links / url) so
// the existing frontend keeps working unchanged. Extra fields
// (riskLevel, breakdown) are additive only.

const express = require("express");
const router = express.Router();

const { analyzeEmail } = require("../services/emailAnalyzer");
const { analyzeUrl } = require("../utils/urlReputation");

// In-memory store of the most recent scan, used by GET /latest-scan
// (polled by the frontend). Fine for a single-user local tool; would
// need a real store (e.g. the existing database/emails.json) for
// multi-user or persistent history.
let latestScan = null;

router.post("/analyze-url", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "A 'url' string is required." });
    }

    const result = await analyzeUrl(url);

    console.log("URL:", url);
    console.log("Score:", result.score);

    res.json({
      url,
      score: result.score,
      reasons: result.reasons
    });
  } catch (err) {
    console.error("Error in /analyze-url:", err);
    res.status(500).json({ error: "Failed to analyze URL." });
  }
});

router.post("/analyze-email", async (req, res) => {
  try {
    const { sender, subject, body, links, attachments } = req.body;

    const result = await analyzeEmail({ sender, subject, body, links, attachments });

    latestScan = {
      score: result.score,
      reasons: result.reasons,
      riskLevel: result.riskLevel,
      breakdown: result.breakdown,
      ai: result.ai,
      sender,
      subject,
      body,
      links,
      attachments
    };

    // Response shape matches the original API exactly; riskLevel,
    // breakdown, and ai are new, additive fields for callers that want
    // them -- existing frontend code reading score/reasons/sender/
    // subject/links is unaffected.
    res.json({
      score: result.score,
      reasons: result.reasons,
      sender,
      subject,
      links,
      riskLevel: result.riskLevel,
      breakdown: result.breakdown,
      ai: result.ai
    });
  } catch (err) {
    console.error("Error in /analyze-email:", err);
    res.status(500).json({ error: "Failed to analyze email." });
  }
});

router.get("/latest-scan", (req, res) => {
  if (!latestScan) {
    return res.json(null);
  }
  res.json(latestScan);
});

module.exports = router;
