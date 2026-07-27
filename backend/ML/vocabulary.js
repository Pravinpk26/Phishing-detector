// backend/ml/vocabulary.js
//
// Fixed vocabulary used to convert raw email text (subject + body) into
// a numeric feature vector the neural network can read. Each word below
// becomes one input feature: 1 if the word appears in the email, 0 if
// it doesn't (a "bag of words" representation).
//
// This vocabulary mixes:
//   - classic phishing/social-engineering vocabulary
//   - words that tend to appear in ordinary, legitimate email
// so the model has signal to distinguish the two, not just a one-sided
// keyword list.
//
// IMPORTANT: if you change this list, you MUST retrain the model
// (npm run train-model) — the saved weights are tied to this exact
// word order and length.

const VOCABULARY = [
  // Urgency / pressure language
  "urgent", "immediately", "verify", "suspended", "expire", "expires",
  "locked", "restricted", "unauthorized", "unusual", "action", "required",
  "final", "notice", "alert", "warning", "important", "attention",
  "asap", "now", "hurry", "limited", "deadline", "risk",

  // Credential / financial harvesting
  "password", "login", "signin", "username", "account", "confirm",
  "update", "billing", "payment", "invoice", "refund", "transfer",
  "wire", "bank", "card", "ssn", "security", "identity", "pin",
  "credentials", "reset",

  // Classic phishing call-to-action
  "click", "link", "here", "download", "attachment", "open", "access",
  "claim", "winner", "prize", "free", "gift", "reward", "congratulations",
  "selected",

  // Generic / impersonal greetings (mild signal)
  "dear", "customer", "user", "member", "valued", "sir", "madam",

  // Threat / fear language
  "suspend", "terminate", "close", "closed", "violation", "fraud",
  "compromised", "breach", "hacked", "illegal",

  // --- Legitimate / benign signal words ---
  "meeting", "schedule", "project", "team", "thanks", "regards",
  "attached", "review", "feedback", "lunch", "call", "tomorrow",
  "today", "weekend", "photos", "family", "birthday", "conference",
  "agenda", "report", "colleague", "office", "vacation",
  "question", "help", "invite", "invitation", "congrats", "welcome",
  "newsletter", "subscription", "receipt", "order", "shipped",
  "delivery", "tracking", "appointment", "reminder", "calendar"
];

module.exports = { VOCABULARY };
