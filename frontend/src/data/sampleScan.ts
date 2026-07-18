const sampleScan = {
  sender: "support@paypal.com",
  subject: "Verify your PayPal Account",
  date: "10 Jul 2026 · 3:20 PM",

  body:
    "We noticed unusual activity in your account. Please verify your information by clicking the secure link below.",

  riskScore: 92,

  verdict: "PHISHING",

  factors: [
    "Suspicious Sender",
    "Credential Request",
    "Urgent Language",
    "Suspicious Link",
    "New Domain"
  ],

  links: [
    {
      url: "https://secure-account.net/verify",
      reputation: "Very Low",
      domainAge: "10 Days",
      ssl: "Invalid",
      blacklist: "Detected"
    }
  ]
};

export default sampleScan;