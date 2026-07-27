// backend/services/emailAnalyzer.js
//
// Orchestrates the full email analysis: sender reputation, urgency
// language, body content, link reputation, and attachments -- then
// hands the per-category scores to riskScore.computeRiskScore() for
// a normalized 0-100 result with a detailed, human-readable list of
// reasons.

const { analyzeUrl, getRegistrableDomain, SUSPICIOUS_TLDS, COMMON_BRANDS, levenshtein } = require("../utils/urlReputation");
const { computeRiskScore } = require("../utils/riskScore");
const { predictPhishing } = require("../ml/classifier");

const URGENCY_KEYWORDS = [
  "urgent", "immediately", "verify your account", "account suspended",
  "action required", "final notice", "security alert", "unusual activity",
  "unauthorized access", "your account will be closed", "limited time",
  "act now", "expire", "locked"
];

const CREDENTIAL_CONTENT_KEYWORDS = [
  "click here", "password", "login", "log in", "confirm your identity",
  "update your payment", "social security", "credit card number",
  "wire transfer", "gift card", "bitcoin", "cryptocurrency", "ssn"
];

const GENERIC_GREETINGS = ["dear customer", "dear user", "dear valued customer", "dear member"];

const DANGEROUS_ATTACHMENT_EXTENSIONS = [
  ".exe", ".scr", ".bat", ".cmd", ".js", ".vbs", ".jar", ".msi",
  ".ps1", ".lnk", ".iso", ".hta", ".wsf"
];

const MACRO_ATTACHMENT_EXTENSIONS = [".docm", ".xlsm", ".pptm"];

function getExtension(filename) {
  const match = /\.[^.]+$/.exec(filename.toLowerCase());
  return match ? match[0] : "";
}

/**
 * Sender reputation: domain-based checks, plus brand-impersonation
 * detection (subject/body claims to be a well-known brand but the
 * sender's domain doesn't match it).
 */
function analyzeSender(sender, subject, body) {
  const reasons = [];
  let score = 0;

  if (!sender || typeof sender !== "string") {
    return { score: 0, reasons };
  }

  const atIndex = sender.lastIndexOf("@");
  const domain = atIndex !== -1 ? sender.slice(atIndex + 1).toLowerCase() : "";

  if (!domain) {
    return { score: 0, reasons };
  }

  if (SUSPICIOUS_TLDS.some((tld) => domain.endsWith(tld))) {
    score += 40;
    reasons.push(`Sender domain uses a high-risk TLD (${domain})`);
  }

  if (domain.includes("xn--")) {
    score += 40;
    reasons.push("Sender domain uses punycode encoding (possible lookalike trick)");
  }

  const registrable = getRegistrableDomain(domain);
  const domainRoot = registrable.split(".")[0];

  // Typosquat check against common brands.
  for (const brand of COMMON_BRANDS) {
    if (domainRoot === brand) continue;
    const distance = levenshtein(domainRoot, brand);
    if (distance > 0 && distance <= 2 && Math.abs(domainRoot.length - brand.length) <= 2) {
      score += 35;
      reasons.push(`Sender domain "${domain}" closely resembles "${brand}" (possible typosquat)`);
      break;
    }
  }

  // Brand impersonation: subject/body mentions a well-known brand, but
  // the sender's domain has nothing to do with that brand.
  const combinedText = `${subject || ""} ${body || ""}`.toLowerCase();
  for (const brand of COMMON_BRANDS) {
    if (combinedText.includes(brand) && !domain.includes(brand)) {
      score += 30;
      reasons.push(`Message references "${brand}" but sender domain (${domain}) does not match`);
      break;
    }
  }

  return { score: Math.min(score, 100), reasons };
}

/**
 * Urgency / social-engineering pressure language in the subject line.
 */
function analyzeUrgency(subject) {
  const reasons = [];
  let score = 0;

  if (!subject || typeof subject !== "string") {
    return { score: 0, reasons };
  }

  const lower = subject.toLowerCase();
  const hits = URGENCY_KEYWORDS.filter((k) => lower.includes(k));
  if (hits.length > 0) {
    score += Math.min(hits.length * 25, 60);
    reasons.push(`Subject uses urgency/pressure language (${hits[0]})`);
  }

  if (subject.length > 8 && subject === subject.toUpperCase()) {
    score += 20;
    reasons.push("Subject is written in all caps");
  }

  if (/!{2,}|\?{2,}/.test(subject)) {
    score += 15;
    reasons.push("Subject uses excessive punctuation");
  }

  return { score: Math.min(score, 100), reasons };
}

/**
 * Body content: credential-harvesting phrases, generic greetings, and
 * the especially dangerous combination of urgency + credential request
 * appearing together.
 */
function analyzeContent(body) {
  const reasons = [];
  let score = 0;

  if (!body || typeof body !== "string") {
    return { score: 0, reasons };
  }

  const lower = body.toLowerCase();

  const credentialHits = CREDENTIAL_CONTENT_KEYWORDS.filter((k) => lower.includes(k));
  if (credentialHits.length > 0) {
    score += Math.min(credentialHits.length * 20, 60);
    reasons.push(`Email body requests sensitive info or action (${credentialHits.slice(0, 3).join(", ")})`);
  }

  if (GENERIC_GREETINGS.some((g) => lower.includes(g))) {
    score += 15;
    reasons.push("Uses a generic greeting instead of your name");
  }

  const hasUrgencyWord = URGENCY_KEYWORDS.some((k) => lower.includes(k));
  if (hasUrgencyWord && credentialHits.length > 0) {
    score += 25;
    reasons.push("Combines urgency with a request for credentials or payment -- a classic phishing pattern");
  }

  return { score: Math.min(score, 100), reasons };
}

/**
 * Aggregates reputation checks across every link in the email.
 */
async function analyzeLinks(links) {
  if (!Array.isArray(links) || links.length === 0) {
    return { score: 0, reasons: [] };
  }

  const results = await Promise.all(links.map((link) => analyzeUrl(link)));

  let worst = 0;
  // Count how many links triggered each distinct reason, so identical
  // findings across many links collapse into one summarized line
  // instead of repeating verbatim (e.g. "Unusually long URL" x 10).
  const reasonCounts = new Map();

  for (const result of results) {
    worst = Math.max(worst, result.score);
    for (const reason of result.reasons) {
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    }
  }

  const reasons = [];
  for (const [reason, count] of reasonCounts) {
    reasons.push(count > 1 ? `${reason} (${count} links affected)` : reason);
  }

  // A message with many links is inherently riskier, independent of
  // any single link's own score.
  let volumeBonus = 0;
  if (links.length > 5) {
    volumeBonus = 15;
    reasons.push(`Email contains an unusually high number of links (${links.length})`);
  }

  return { score: Math.min(worst + volumeBonus, 100), reasons };
}

/**
 * Attachments are optional -- if the caller doesn't send any, this is
 * a safe no-op and doesn't affect the score.
 */
function analyzeAttachments(attachments) {
  const reasons = [];
  let score = 0;

  if (!Array.isArray(attachments) || attachments.length === 0) {
    return { score: 0, reasons };
  }

  for (const filename of attachments) {
    if (typeof filename !== "string") continue;
    const ext = getExtension(filename);

    if (DANGEROUS_ATTACHMENT_EXTENSIONS.includes(ext)) {
      score += 50;
      reasons.push(`Potentially dangerous attachment type (${filename})`);
    } else if (MACRO_ATTACHMENT_EXTENSIONS.includes(ext)) {
      score += 35;
      reasons.push(`Macro-enabled document attached (${filename})`);
    }

    // Double-extension trick, e.g. "invoice.pdf.exe".
    const doubleExtMatch = filename.toLowerCase().match(/\.[a-z0-9]{2,4}\.[a-z0-9]{2,4}$/);
    if (doubleExtMatch && DANGEROUS_ATTACHMENT_EXTENSIONS.includes(getExtension(filename))) {
      score += 20;
      reasons.push(`Attachment uses a double file extension to disguise its type (${filename})`);
    }
  }

  return { score: Math.min(score, 100), reasons };
}

/**
 * Full email analysis. Never throws on missing/malformed fields --
 * everything defaults to a safe empty value instead.
 *
 * @param {{sender?: string, subject?: string, body?: string, links?: string[], attachments?: string[]}} email
 * @returns {Promise<{score: number, reasons: string[], riskLevel: string, breakdown: Object}>}
 */
async function analyzeEmail({ sender, subject, body, links, attachments }) {
  const safeLinks = Array.isArray(links) ? links : [];

  const senderResult = analyzeSender(sender, subject, body);
  const urgencyResult = analyzeUrgency(subject);
  const contentResult = analyzeContent(body);
  const linksResult = await analyzeLinks(safeLinks);
  const attachmentsResult = analyzeAttachments(attachments);

  // Local AI layer (Phase 4 hybrid): a small TensorFlow.js model gives
  // a second, independent opinion on the raw text. If no trained model
  // is available, aiPrediction is null and computeRiskScore() simply
  // normalizes over the remaining rule-based categories -- the app
  // never breaks or silently under-scores because of a missing model.
  const combinedText = `${subject || ""} ${body || ""}`;
  const aiPrediction = await predictPhishing(combinedText);

  const { total, breakdown, riskLevel } = computeRiskScore({
    sender: senderResult.score,
    urgency: urgencyResult.score,
    content: contentResult.score,
    links: linksResult.score,
    attachments: attachmentsResult.score,
    ai: aiPrediction ? aiPrediction.score : undefined
  });

  const reasons = [
    ...senderResult.reasons,
    ...urgencyResult.reasons,
    ...contentResult.reasons,
    ...linksResult.reasons,
    ...attachmentsResult.reasons
  ];

  if (aiPrediction && aiPrediction.score >= 60) {
    reasons.push(
      `Local AI model flagged this email's language as phishing-like (${aiPrediction.score}% likelihood)`
    );
  }

  return {
    score: total,
    reasons,
    riskLevel,
    breakdown,
    ai: aiPrediction
      ? { score: aiPrediction.score, confidence: aiPrediction.confidence }
      : { score: null, confidence: null, note: "AI model not trained yet -- run npm run train-model" }
  };
}

module.exports = { analyzeEmail };
