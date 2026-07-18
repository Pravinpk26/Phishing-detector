export function analyzeUrl(url: string) {
  let score = 0;
  const reasons: string[] = [];

  if (
    url.includes("bit.ly") ||
    url.includes("tinyurl.com")
  ) {
    score += 30;
    reasons.push("URL Shortener Detected");
  }

  if (
    url.endsWith(".xyz") ||
    url.endsWith(".top") ||
    url.endsWith(".click")
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

  return {
    score,
    reasons,
  };
}
