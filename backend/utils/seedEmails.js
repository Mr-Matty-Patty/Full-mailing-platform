// backend/utils/seedEmails.js
// Inserts a few demo emails for a newly-registered user so the inbox isn't empty.
// Each email has its phishing verdict and category pre-set so we don't have to
// call the ML services during signup (faster, no dependencies).

const SEED_EMAILS = [
  {
    sender: "team@demetriandmahdi.online",
    subject: "Welcome to D&M Mail",
    snippet: "Your AI-protected inbox is ready. Here's what's new...",
    body:
      "Hi there,\n\n" +
      "Welcome to Demetri & Mahdi Mail. Every message you receive is " +
      "automatically scanned by our AI for phishing and categorized for you.\n\n" +
      "You'll see badges next to each email showing what our model thinks. " +
      "Try clicking around — the warning email below is a good example of " +
      "phishing detection in action.\n\n" +
      "— The D&M team",
    folder: "Inbox",
    is_read: 0,
    is_starred: 1,
    ai_verdict: "Legitimate",
    ai_confidence: 99.2,
    ai_category: "Notification",
    ai_category_confidence: 92.4,
  },
  {
    sender: "alerts@bank-secure-update.com",
    subject: "URGENT: Verify your account immediately",
    snippet: "Your account will be suspended unless you click this link...",
    body:
      "Dear Customer,\n\n" +
      "We have detected unusual activity on your account. To prevent " +
      "suspension, you must verify your identity within 24 hours by clicking " +
      "the link below:\n\n" +
      "http://bank-secure-update-verify.example.com/login\n\n" +
      "Failure to act will result in permanent account closure.\n\n" +
      "Bank Security Team",
    folder: "Inbox",
    is_read: 0,
    is_starred: 0,
    ai_verdict: "Phishing",
    ai_confidence: 97.8,
    ai_category: "Notification",
    ai_category_confidence: 81.5,
  },
  {
    sender: "newsletter@dev-weekly.io",
    subject: "Weekly Web Dev Digest — issue #142",
    snippet: "Top JavaScript articles, new tools, and what's trending...",
    body:
      "This week's highlights:\n\n" +
      "• React 19 stabilizes the new compiler\n" +
      "• A deep dive into CSS @container queries\n" +
      "• Why Bun is gaining traction in production\n" +
      "• 5 underrated VS Code extensions\n\n" +
      "Read more on our website.\n\n" +
      "Unsubscribe at any time.",
    folder: "Inbox",
    is_read: 1,
    is_starred: 0,
    ai_verdict: "Legitimate",
    ai_confidence: 95.4,
    ai_category: "Promotional",
    ai_category_confidence: 88.1,
  },
  {
    sender: "noreply@github.com",
    subject: "[Mr-Matty-Patty/Full-mailing-platform] PR opened",
    snippet: "Copilot opened a pull request: Implement neon glow line",
    body:
      "Pull request #1 has been opened.\n\n" +
      "Title: Implement neon glow line\n" +
      "Author: Copilot\n" +
      "Branch: copilot/implement-neon-glow → main\n\n" +
      "View the PR on GitHub to review and merge.",
    folder: "Inbox",
    is_read: 1,
    is_starred: 0,
    ai_verdict: "Legitimate",
    ai_confidence: 99.5,
    ai_category: "Notification",
    ai_category_confidence: 96.2,
  },
  {
    sender: "demetri@demetriandmahdi.online",
    subject: "Project sync notes",
    snippet: "Hey, attached the kickoff items and timeline for the report...",
    body:
      "Hey,\n\n" +
      "Quick recap from yesterday's call:\n\n" +
      "1. Phishing model is solid (99% acc), already deployed locally.\n" +
      "2. Category model trained in Azure ML notebooks — model file " +
      "downloaded.\n" +
      "3. Backend needs the new endpoints + schema migration for category.\n" +
      "4. Frontend overhaul is in progress (PR-by-PR via Copilot).\n\n" +
      "I'll be free Sunday afternoon if you want to pair on the deployment.\n\n" +
      "— Demetri",
    folder: "Inbox",
    is_read: 0,
    is_starred: 1,
    ai_verdict: "Legitimate",
    ai_confidence: 99.8,
    ai_category: "Personal",
    ai_category_confidence: 94.3,
  },
  {
    sender: "promotions@megastore.example",
    subject: "🔥 50% OFF everything — TODAY ONLY",
    snippet: "Don't miss out — biggest sale of the year ends at midnight...",
    body:
      "FLASH SALE — TODAY ONLY!\n\n" +
      "Save 50% off everything across all categories.\n" +
      "Use code: SAVE50\n\n" +
      "Free shipping on orders over $25.\n\n" +
      "Shop now — sale ends at midnight!\n\n" +
      "Unsubscribe | Privacy Policy",
    folder: "Inbox",
    is_read: 1,
    is_starred: 0,
    ai_verdict: "Legitimate",
    ai_confidence: 91.2,
    ai_category: "Promotional",
    ai_category_confidence: 97.6,
  },
];

/**
 * Insert seed emails for a newly registered user.
 * Spreads received_at across the last few days so the list looks natural.
 */
async function seedEmailsForUser(db, userId) {
  // Most recent first; older emails go further back in time
  const now = Date.now();
  const stagger = [0, 30, 90, 180, 360, 720]; // minutes ago for each row

  const values = SEED_EMAILS.map((e, i) => {
    const receivedAt = new Date(now - (stagger[i] || i * 60) * 60 * 1000);
    return [
      userId,
      e.sender,
      e.subject,
      e.snippet,
      e.body,
      e.folder,
      e.is_read,
      e.is_starred,
      e.ai_verdict,
      e.ai_confidence,
      e.ai_category,
      e.ai_category_confidence,
      receivedAt,
    ];
  });

  await db.query(
    `INSERT INTO emails
       (user_id, sender, subject, snippet, body, folder,
        is_read, is_starred, ai_verdict, ai_confidence,
        ai_category, ai_category_confidence, received_at)
     VALUES ?`,
    [values]
  );
}

module.exports = { seedEmailsForUser, SEED_EMAILS };
