export const accounts = [
  { id: "acc-1", name: "Demetri", email: "demetri@demetrimahdi.com" },
  { id: "acc-2", name: "Mahdi", email: "mahdi@demetrimahdi.com" },
];

const base = [
  {
    from: "alerts@bank-secure.com",
    subject: "Urgent: Verify your account",
    snippet: "Your account will be suspended unless you verify immediately.",
    body: "This is a placeholder email body for UI preview.",
    folder: "Spam",
    unread: true,
    starred: false,
    aiVerdict: "Likely Scam",
    aiConfidence: 93,
  },
  {
    from: "team@demetri-mahdi.com",
    subject: "Project kickoff notes",
    snippet: "Attached are the kickoff items and timeline.",
    body: "UI-only message detail. Backend integration will come later.",
    folder: "Inbox",
    unread: true,
    starred: true,
    aiVerdict: "Safe",
    aiConfidence: 88,
  },
  {
    from: "noreply@newsletter.dev",
    subject: "Weekly web development digest",
    snippet: "Top links for frontend engineering this week.",
    body: "Sample content for list/detail panel.",
    folder: "Inbox",
    unread: false,
    starred: false,
    aiVerdict: "Safe",
    aiConfidence: 81,
  },
];

export const mockEmails = Array.from({ length: 72 }).map((_, i) => {
  const seed = base[i % base.length];
  return { ...seed, id: i + 1, subject: `${seed.subject} #${i + 1}` };
});
