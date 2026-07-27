console.log("Phishing Detector Loaded");

// Tracks whichever inbox row the mouse is currently over, so that if
// the user clicks "Scan Current Email" while looking at the inbox
// list (no email opened), we know which row to read from.
let lastHoveredRow = null;

document.addEventListener(
  "mouseover",
  (event) => {
    const row = event.target.closest("tr.zA");
    if (row) lastHoveredRow = row;
  },
  true
);

/**
 * Extracts sender/subject/body/links from a fully OPENED email thread.
 * This is the full, accurate scan -- body and links come straight from
 * the rendered email content.
 */
function extractFromOpenEmail() {
  const senderName =
    document.querySelector("h3 span[email]")?.getAttribute("email") ||
    "Not Found";

  const subject =
    document.querySelector("h2")?.innerText ||
    "Not Found";

  const bodyEl = document.querySelector("div.a3s");
  const body = bodyEl?.innerText || "Not Found";

  // IMPORTANT: scope link extraction to the email body element only.
  // Previously this queried the whole page (document.querySelectorAll("a")),
  // which also picked up Gmail's own UI links (compose, inbox nav,
  // settings, etc.) -- wildly inflating the link count and duplicating
  // "unusually long URL" reasons for links that were never actually in
  // the email.
  const links = bodyEl
    ? [...bodyEl.querySelectorAll("a")]
        .map((link) => link.href)
        .filter((link) => link && link.startsWith("http"))
    : [];

  return {
    sender: senderName,
    subject,
    body,
    links,
    source: "opened-email"
  };
}

/**
 * Extracts whatever's available from an inbox LIST ROW, without
 * opening the email. Gmail does not render the full body or any links
 * in the list view -- only sender, subject, and a short preview
 * snippet are in the DOM. So this is intentionally a lighter, "quick
 * glance" scan: no links, and body is just the truncated preview text.
 * `limited: true` tells the popup to show a note about this.
 */
function extractFromListRow(row) {
  if (!row) return null;

  const senderSpan = row.querySelector("span[email]");
  const sender =
    senderSpan?.getAttribute("email") ||
    senderSpan?.innerText ||
    "Not Found";

  const subjectEl = row.querySelector(".bog") || row.querySelector(".y6");
  const subject = subjectEl?.innerText || "Not Found";

  const snippetEl = row.querySelector(".y2");
  const snippet = snippetEl?.innerText || "";

  return {
    sender,
    subject,
    body: snippet,
    links: [], // not available without opening the email
    source: "inbox-preview",
    limited: true
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanEmail") {
    const openEmailBody = document.querySelector("div.a3s");

    let result;
    if (openEmailBody) {
      result = extractFromOpenEmail();
    } else {
      // No email open -- fall back to the last-hovered inbox row, or
      // the first visible row if nothing was hovered yet.
      const row = lastHoveredRow || document.querySelector("tr.zA");
      result = extractFromListRow(row);
    }

    sendResponse(
      result || {
        sender: "Not Found",
        subject: "Not Found",
        body: "",
        links: [],
        source: "none"
      }
    );

    return true;
  }
});
