// backend/ml/trainingData.js
//
// Labeled training examples for the local ML phishing classifier.
// label: 1 = phishing, 0 = legitimate.
//
// NOTE ON SCALE: this is a small, hand-written demo dataset (~100
// examples) meant to get a working hybrid model running quickly. It's
// enough for the model to learn real patterns (urgency + credential
// requests correlate with phishing; casual conversational language
// correlates with legitimate mail), but it is NOT a substitute for
// training on a large real-world corpus. For production-grade
// accuracy, retrain on a public dataset such as the Nazario phishing
// corpus + a legitimate-email corpus (e.g. Enron), combined and
// balanced, then re-run `npm run train-model`.

const TRAINING_DATA = [
  // ---- Phishing examples (label: 1) ----
  { text: "Urgent action required verify your account immediately or it will be suspended", label: 1 },
  { text: "Your account has been locked due to unusual activity click here to verify your identity", label: 1 },
  { text: "Final notice your payment failed update your billing information now to avoid suspension", label: 1 },
  { text: "Security alert unauthorized login detected confirm your password immediately", label: 1 },
  { text: "Congratulations you have been selected as a winner claim your prize now click here", label: 1 },
  { text: "Dear customer your account will be closed unless you verify your details within 24 hours", label: 1 },
  { text: "Your card has been compromised confirm your card number and pin to secure your account", label: 1 },
  { text: "Immediate action required your subscription payment failed update billing now", label: 1 },
  { text: "Attention your mailbox is full click here to verify and restore access immediately", label: 1 },
  { text: "We detected unusual activity on your bank account login now to confirm your identity", label: 1 },
  { text: "Your package could not be delivered click the link to confirm your address and pay a fee", label: 1 },
  { text: "Urgent your account access has been restricted please confirm your credentials to unlock", label: 1 },
  { text: "You have won a free gift card claim now before this offer expires today", label: 1 },
  { text: "Warning suspicious login attempt on your account reset your password immediately", label: 1 },
  { text: "Dear valued customer your payment information needs verification click here now", label: 1 },
  { text: "Your invoice is overdue click here to make a wire transfer immediately to avoid penalty", label: 1 },
  { text: "Security breach detected your account may be compromised verify your identity now", label: 1 },
  { text: "Action required confirm your social security number to avoid account termination", label: 1 },
  { text: "Your account shows unauthorized access attempt login immediately to secure it", label: 1 },
  { text: "Final warning your account will be terminated today confirm your username and password", label: 1 },
  { text: "Congratulations you are the lucky winner of our reward program claim your prize immediately", label: 1 },
  { text: "Your refund is pending click here and enter your card details to receive payment", label: 1 },
  { text: "Alert your identity has been flagged for fraud verify your details immediately", label: 1 },
  { text: "Please confirm your login credentials within 24 hours or your account will be suspended", label: 1 },
  { text: "Your bank account has a security violation click here to verify and avoid restriction", label: 1 },
  { text: "Act now your subscription will expire today update your payment method immediately", label: 1 },
  { text: "We noticed unusual activity please reset your password by clicking the attached link", label: 1 },
  { text: "Your account is at risk confirm your identity now to prevent permanent suspension", label: 1 },
  { text: "Important your document requires signature click here and login with your credentials", label: 1 },
  { text: "Your email storage is full urgent action required click here to verify and upgrade", label: 1 },
  { text: "Dear user your account has been flagged for illegal activity verify immediately", label: 1 },
  { text: "Limited time offer free gift selected winners click here to claim before it expires", label: 1 },
  { text: "Your card was declined update your billing details immediately to avoid service closure", label: 1 },
  { text: "Unauthorized access detected on your account confirm your password to secure it now", label: 1 },
  { text: "Your account has a pending violation please verify your identity to avoid restriction", label: 1 },
  { text: "Hurry this offer expires today claim your free reward by verifying your account", label: 1 },
  { text: "We could not process your payment update your card information immediately to continue", label: 1 },
  { text: "Your account requires urgent verification due to suspicious login from unknown device", label: 1 },
  { text: "Immediate attention needed your account access is restricted confirm credentials now", label: 1 },
  { text: "Your subscription has expired renew now by confirming your billing and card details", label: 1 },

  // ---- Legitimate examples (label: 0) ----
  { text: "Hey want to grab lunch tomorrow at noon let me know", label: 0 },
  { text: "Thanks for the update on the project I will review the report tomorrow", label: 0 },
  { text: "Reminder our team meeting is scheduled for tomorrow at 10am please check the calendar", label: 0 },
  { text: "Attached is the agenda for our conference next week let me know if you have questions", label: 0 },
  { text: "Happy birthday hope you have a wonderful day with your family", label: 0 },
  { text: "Can we schedule a call this week to discuss the project feedback", label: 0 },
  { text: "Here are the photos from the weekend trip thanks for organizing everything", label: 0 },
  { text: "Just a reminder about your appointment tomorrow afternoon see you then", label: 0 },
  { text: "Your order has shipped and is on the way tracking details are attached", label: 0 },
  { text: "Thanks for the invite to the conference I will be attending and looking forward to it", label: 0 },
  { text: "Please review the attached report and share your feedback before our meeting", label: 0 },
  { text: "Welcome to the team looking forward to working with you on upcoming projects", label: 0 },
  { text: "Congrats on the new role excited to see what you accomplish", label: 0 },
  { text: "Here is the receipt for your recent purchase thank you for your order", label: 0 },
  { text: "Our vacation photos are attached let me know what you think", label: 0 },
  { text: "Reminder the office will be closed for the holiday next week", label: 0 },
  { text: "Thanks for your help on the presentation it went really well today", label: 0 },
  { text: "Newsletter update from the team check out this month's highlights", label: 0 },
  { text: "Let's plan a call to go over the agenda for next week's project meeting", label: 0 },
  { text: "Following up on our conversation from today let me know your thoughts", label: 0 },
  { text: "The delivery for your order is scheduled for tomorrow between 9am and noon", label: 0 },
  { text: "Great catching up with you at the conference let's stay in touch", label: 0 },
  { text: "Here's the schedule for next week's team meetings please add them to your calendar", label: 0 },
  { text: "Thanks for attending today's call I will send the notes shortly", label: 0 },
  { text: "Looking forward to the weekend any plans with the family", label: 0 },
  { text: "Attaching the project report for your review whenever you get a chance", label: 0 },
  { text: "Quick question about the report can we discuss during our call tomorrow", label: 0 },
  { text: "Reminder your subscription renews automatically next month no action needed", label: 0 },
  { text: "Thanks for the birthday wishes it means a lot to me and my family", label: 0 },
  { text: "See you at the meeting tomorrow I will bring the updated agenda", label: 0 },
  { text: "Your appointment reminder for next week is confirmed see you then", label: 0 },
  { text: "Great feedback on the project thanks for taking the time to review it", label: 0 },
  { text: "Just checking in about the weekend plans let me know if you are free", label: 0 },
  { text: "Here is the invitation to our team celebration next Friday hope to see you there", label: 0 },
  { text: "Thanks for the quick call earlier really helped clarify the project scope", label: 0 },
  { text: "The team meeting notes and agenda are attached for your review", label: 0 },
  { text: "Looking forward to the conference next month let me know your travel schedule", label: 0 },
  { text: "Your delivery tracking shows the package will arrive tomorrow", label: 0 },
  { text: "Thanks for organizing the office celebration everyone had a great time", label: 0 },
  { text: "Quick reminder about tomorrow's call please review the agenda beforehand", label: 0 }
];

module.exports = { TRAINING_DATA };
