// backend/utils/urlReputation.js
//
// URL / domain reputation checks.
//
// Two layers:
//   1. Heuristics (always on, no config needed) — shortener detection,
//      suspicious TLDs, IP-literal hosts, punycode/homograph hints,
//      typosquatting against common brands, credential-harvesting
//      keywords in the path/query, etc.
//   2. Optional live reputation lookup via Google Safe Browsing, if
//      SAFE_BROWSING_API_KEY is set in the environment. If it's not
//      configured, or the request fails/times out, we silently fall
//      back to heuristics only — nothing breaks.

const axios = require("axios");

const URL_SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
  "buff.ly", "rebrand.ly", "cutt.ly", "shorte.st", "adf.ly",
  "tiny.cc", "rb.gy", "shorturl.at", "bl.ink"
];

const SUSPICIOUS_TLDS = [
  ".xyz", ".top", ".click", ".zip", ".mov", ".gq", ".tk", ".ml",
  ".cf", ".ga", ".work", ".support", ".fit", ".loan", ".men",
  ".stream", ".download", ".racing", ".review"
];

// Popular brands most commonly impersonated in phishing. Used for
// typosquat / lookalike-domain detection (edit distance against the
// registrable domain, not the full hostname).
const COMMON_BRANDS = [
  "paypal", "amazon", "google", "microsoft", "apple", "facebook",
  "netflix", "bankofamerica", "wellsfargo", "chase", "americanexpress",
  "ebay", "linkedin", "instagram", "dropbox", "docusign", "adobe",
  "outlook", "office365", "irs", "usps", "fedex", "dhl", "coinbase"
];

const CREDENTIAL_KEYWORDS = [
  "login", "signin", "verify", "secure", "account", "update",
  "confirm", "password", "billing", "suspended"
];

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function safeParseUrl(rawUrl) {
  try {
    // Add a scheme if missing so the URL parser doesn't choke.
    const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(rawUrl)
      ? rawUrl
      : `http://${rawUrl}`;
    return new URL(withScheme);
  } catch {
    return null;
  }
}

function getRegistrableDomain(hostname) {
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
}

/**
 * Heuristic reputation scan of a single URL. Never throws — a malformed
 * URL is itself treated as suspicious rather than crashing the request.
 *
 * @param {string} rawUrl
 * @returns {{ score: number, maxScore: number, reasons: string[], hostname: string|null }}
 */
function analyzeUrlHeuristics(rawUrl) {
  const reasons = [];
  let score = 0;
  const maxScore = 100;

  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    return { score: 0, maxScore, reasons, hostname: null };
  }

  const parsed = safeParseUrl(rawUrl);
  if (!parsed) {
    return {
      score: 25,
      maxScore,
      reasons: ["Malformed or unparsable URL"],
      hostname: null
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const registrable = getRegistrableDomain(hostname);

  // 1. URL shorteners hide the real destination.
  if (URL_SHORTENERS.some((s) => hostname === s || hostname.endsWith(`.${s}`))) {
    score += 20;
    reasons.push(`Shortened URL (${hostname}) hides the real destination`);
  }

  // 2. Suspicious / low-reputation TLDs, commonly abused for phishing.
  if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
    score += 25;
    reasons.push(`Domain uses a high-risk TLD (${hostname})`);
  }

  // 3. Raw IP address instead of a domain name.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    score += 30;
    reasons.push("Link points to a raw IP address instead of a domain");
  }

  // 4. Punycode / IDN homograph domains (xn--...) are frequently used to
  //    visually mimic a legitimate brand (e.g. а vs a).
  if (hostname.includes("xn--")) {
    score += 25;
    reasons.push("Domain uses punycode encoding (possible lookalike character trick)");
  }

  // 5. Credentials in the URL, or an "@" trick that hides the true host
  //    (https://real-looking-name@evil.com/...).
  if (parsed.username || parsed.password) {
    score += 20;
    reasons.push("URL embeds credentials before the '@' to disguise the real host");
  }

  // 6. Excessive subdomains, often used to bury a brand name
  //    (paypal.com.secure-login.xyz).
  const subdomainCount = hostname.split(".").length - 2;
  if (subdomainCount >= 3) {
    score += 15;
    reasons.push(`Unusually deep subdomain chain (${hostname})`);
  }

  // 7. Non-standard port.
  if (parsed.port && !["80", "443", ""].includes(parsed.port)) {
    score += 10;
    reasons.push(`Non-standard port used (${parsed.port})`);
  }

  // 8. No HTTPS.
  if (parsed.protocol === "http:") {
    score += 10;
    reasons.push("Link does not use HTTPS");
  }

  // 9. Very long URLs are a classic obfuscation tactic.
  if (rawUrl.length > 100) {
    score += 10;
    reasons.push("Unusually long URL");
  }

  // 10. Credential-harvesting keywords stacked in path/query.
  const pathAndQuery = (parsed.pathname + parsed.search).toLowerCase();
  const keywordHits = CREDENTIAL_KEYWORDS.filter((k) => pathAndQuery.includes(k));
  if (keywordHits.length >= 2) {
    score += 15;
    reasons.push(`Link path contains credential-related keywords (${keywordHits.join(", ")})`);
  }

  // 11. Typosquatting: registrable domain is close to (but not exactly)
  //     a well-known brand.
  const domainRoot = registrable.split(".")[0];
  for (const brand of COMMON_BRANDS) {
    if (domainRoot === brand) continue; // exact match, not typosquatting
    const distance = levenshtein(domainRoot, brand);
    if (distance > 0 && distance <= 2 && Math.abs(domainRoot.length - brand.length) <= 2) {
      score += 30;
      reasons.push(`Domain "${registrable}" closely resembles "${brand}" (possible typosquat)`);
      break;
    }
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    reasons,
    hostname
  };
}

/**
 * Optional live reputation lookup via Google Safe Browsing v4.
 * No-ops (returns null) if SAFE_BROWSING_API_KEY isn't set, or if the
 * call fails for any reason — callers should treat null as "skip".
 *
 * @param {string} rawUrl
 * @returns {Promise<{ score: number, reasons: string[] } | null>}
 */
async function checkSafeBrowsing(rawUrl) {
  const apiKey = process.env.SAFE_BROWSING_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: { clientId: "phishing-detector", clientVersion: "1.0.0" },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION"
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: rawUrl }]
        }
      },
      { timeout: 4000 }
    );

    const matches = response.data && response.data.matches;
    if (matches && matches.length > 0) {
      const threatTypes = [...new Set(matches.map((m) => m.threatType))];
      return {
        score: 60,
        reasons: [`Flagged by Google Safe Browsing (${threatTypes.join(", ")})`]
      };
    }
    return { score: 0, reasons: [] };
  } catch {
    // Network error, timeout, bad key, etc. — fail open to heuristics.
    return null;
  }
}

/**
 * Full reputation analysis of a single URL: heuristics plus (if
 * configured) a live Safe Browsing check.
 *
 * @param {string} rawUrl
 * @returns {Promise<{ score: number, maxScore: number, reasons: string[], hostname: string|null }>}
 */
async function analyzeUrl(rawUrl) {
  const heuristics = analyzeUrlHeuristics(rawUrl);
  const liveCheck = await checkSafeBrowsing(rawUrl);

  if (liveCheck) {
    return {
      score: Math.min(heuristics.score + liveCheck.score, heuristics.maxScore),
      maxScore: heuristics.maxScore,
      reasons: [...heuristics.reasons, ...liveCheck.reasons],
      hostname: heuristics.hostname
    };
  }

  return heuristics;
}

module.exports = {
  analyzeUrl,
  analyzeUrlHeuristics,
  levenshtein,
  getRegistrableDomain,
  URL_SHORTENERS,
  SUSPICIOUS_TLDS,
  COMMON_BRANDS
};
