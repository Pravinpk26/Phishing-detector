// backend/utils/riskScore.js
//
// Combines per-category sub-scores (sender, subject/urgency, body,
// links, attachments) into one normalized 0-100 risk score, using
// fixed category weights so no single factor can dominate unfairly.

// Max points each category can contribute to the final 0-100 score.
// "ai" is the local ML classifier's prediction (Phase 4 hybrid layer);
// the other categories are the original rule-based checks. Rebalanced
// so rules still carry most of the weight (they're deterministic and
// explainable) while the model contributes a meaningful second opinion.
const WEIGHTS = {
  sender: 15,
  urgency: 10,
  content: 15,
  links: 30,
  attachments: 10,
  ai: 20
};

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0); // 100

/**
 * Scales a raw 0-100 sub-score down into a category's share of the
 * final score (e.g. a raw 100 in "links" becomes 35 points).
 */
function scaleToWeight(rawScoreOutOf100, category) {
  const weight = WEIGHTS[category] || 0;
  const clampedRaw = Math.max(0, Math.min(100, rawScoreOutOf100));
  return (clampedRaw / 100) * weight;
}

/**
 * @param {Object} categoryScores - raw 0-100 score per category. A
 *   category can be omitted (undefined/null) if it's genuinely
 *   unavailable (e.g. "ai" when no trained model exists yet) --
 *   the final score is normalized over whichever categories actually
 *   reported a value, so a missing category never silently drags the
 *   score down.
 * @param {number} [categoryScores.sender]
 * @param {number} [categoryScores.urgency]
 * @param {number} [categoryScores.content]
 * @param {number} [categoryScores.links]
 * @param {number} [categoryScores.attachments]
 * @param {number} [categoryScores.ai]
 * @returns {{ total: number, breakdown: Object, riskLevel: string }}
 */
function computeRiskScore(categoryScores) {
  const breakdown = {};
  let weightedSum = 0;
  let availableWeight = 0;

  for (const category of Object.keys(WEIGHTS)) {
    const raw = categoryScores[category];
    const isAvailable = raw !== undefined && raw !== null;

    if (isAvailable) {
      const weighted = scaleToWeight(raw, category);
      breakdown[category] = {
        raw: Math.round(raw),
        weighted: Math.round(weighted * 10) / 10,
        maxWeight: WEIGHTS[category]
      };
      weightedSum += weighted;
      availableWeight += WEIGHTS[category];
    } else {
      breakdown[category] = { raw: null, weighted: 0, maxWeight: WEIGHTS[category], skipped: true };
    }
  }

  // Normalize to 0-100 based on the weight that was actually available
  // (e.g. if "ai" is missing, the remaining 80 points of weight become
  // the new 100% rather than capping the score at 80).
  const total = availableWeight > 0
    ? Math.round(Math.min((weightedSum / availableWeight) * TOTAL_WEIGHT, TOTAL_WEIGHT))
    : 0;

  let riskLevel = "Safe";
  if (total >= 80) riskLevel = "Phishing";
  else if (total >= 40) riskLevel = "Suspicious";

  return { total, breakdown, riskLevel };
}

module.exports = { computeRiskScore, WEIGHTS };
