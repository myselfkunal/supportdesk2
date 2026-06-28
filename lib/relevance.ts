/**
 * Checks whether a message is relevant to customer support.
 * Returns { relevant: true } if the message appears to be a customer support query,
 * or { relevant: false, reason: string } with a contextual warning if it's off-topic.
 */

const OFF_TOPIC_PATTERNS: { pattern: RegExp; response: string }[] = [
  {
    pattern:
      /\b(write|create|generate|make|build|develop|code|program|script)\b.*\b(python|javascript|java|c\+\+|ruby|go|rust|typescript|php|html|css|sql|react|angular|vue|node|django|flask|express)\b/i,
    response:
      "I can only help with customer support-related queries. Please provide a customer message you'd like assistance with, such as an order issue, delivery concern, refund request, or similar support inquiry.",
  },
  {
    pattern: /\b(tell|say|recite|share|give)\b.*\b(joke|jokes|story|stories|poem|poems|riddle|fact|trivia)\b/i,
    response:
      "I'm a customer support assistant, not a general AI. Please paste a customer message you need help analyzing — for example, a question about an order, delivery, refund, or technical issue.",
  },
  {
    pattern:
      /\b(what is the meaning of life|who are you|what can you do|what is your purpose|are you sentient|do you have feelings|what is your name)\b/i,
    response:
      "I'm SupportDesk's AI assistant, designed to help analyze and draft replies to customer support messages. Please share a customer query you'd like me to work on.",
  },
  {
    pattern: /\b(recipe|cook|bake|ingredients|dinner|lunch|breakfast|food recipe)\b/i,
    response:
      "This assistant is for customer support only. Please provide a customer support message so I can help categorize it and draft a reply.",
  },
  {
    pattern:
      /\b(weather|forecast|temperature|rain|sunny|climate)\b.*\b(today|tomorrow|this week|outside)\b/i,
    response:
      "I can't help with weather queries. Please provide a customer support message (e.g., about an order, delivery, or billing issue) for me to analyze.",
  },
  {
    pattern: /\b(translate|translation)\b.*\b(from|to)\b.*\b(english|spanish|french|german|chinese|japanese|hindi|arabic|portuguese|russian|italian|dutch|korean)\b/i,
    response:
      "I'm focused on customer support, not translation. Please share a customer message you'd like analyzed and drafted a reply for.",
  },
  {
    pattern:
      /\b(draw|paint|design|create)\b.*\b(image|picture|art|logo|graphic|illustration|meme)\b/i,
    response:
      "I can't create images or artwork. I'm here to help with customer support queries — please paste a customer message below.",
  },
  {
    pattern:
      /\b(play|recommend|suggest)\b.*\b(game|movie|song|music|book|show|series|film|album)\b|\b(gaming|gamer|video games)\b/i,
    response:
      "I can only assist with customer support-related messages. Please enter a customer inquiry about orders, refunds, delivery, or similar topics.",
  },
  {
    pattern: /\b(math|calculate|compute|solve|equation|formula|derivative|integral|algebra|trigonometry|calculus)\b/i,
    response:
      "I'm a customer support assistant, not a math solver. Please provide a customer message you'd like help analyzing.",
  },
  {
    pattern:
      /\b(how (do I|to|can I|would I)\s.*(hack|crack|exploit|bypass|cheat|steal|scam|phish|unauthorized|illegal))\b/i,
    response:
      "I can't assist with that request. Please provide a legitimate customer support query for analysis.",
  },
  {
    pattern:
      /\b(what('s| is) (the |my )?(ip|address|location|current time|date today))\b|\b(how old are you|are you real|do you have a body)\b|\b(sing|dance|act|perform)\b/i,
    response:
      "I'm here to help with customer support. Please paste a customer message you'd like me to classify and draft a reply for.",
  },
  {
    pattern:
      /\b(summarize|summarise|explain)\b.*\b(this (article|paper|document|book|page|text|news|post))\b|\b(read|analyze)\b.*\b(this (link|url|website|page))\b/i,
    response:
      "I can only process customer support messages. Please provide the customer's message directly so I can analyze it and draft a reply.",
  },
];

const SUPPORT_KEYWORDS = [
  "order",
  "refund",
  "delivery",
  "shipping",
  "billing",
  "invoice",
  "payment",
  "complaint",
  "feedback",
  "return",
  "exchange",
  "cancel",
  "track",
  "damage",
  "defective",
  "wrong item",
  "missing",
  "late",
  "charge",
  "subscription",
  "account",
  "login",
  "password",
  "error",
  "bug",
  "crash",
  "not working",
  "help",
  "support",
  "issue",
  "problem",
  "question about",
  "customer service",
  "contact",
  "speak to",
  "manager",
  "escalate",
  "cheap",
  "price",
  "discount",
  "promo",
  "coupon",
  "voucher",
  "gift card",
  "credit",
  "debit",
  "bank",
  "receipt",
  "confirmation",
  "notification",
  "status",
  "update on",
];

/**
 * Determine if a message is a support-related query or off-topic.
 */
export function checkRelevance(message: string): {
  relevant: boolean;
  reason?: string;
} {
  if (!message || typeof message !== "string") {
    return {
      relevant: false,
      reason: "Please enter a valid customer support message.",
    };
  }

  const trimmed = message.trim();

  // If the message is too short, treat it as potentially off-topic
  if (trimmed.length < 10) {
    return {
      relevant: false,
      reason:
        "That seems too short to be a customer support query. Please paste the full customer message you'd like help with.",
    };
  }

  const lower = trimmed.toLowerCase();

  // Count how many support-related keywords appear
  const supportKeywordCount = SUPPORT_KEYWORDS.filter((kw) =>
    lower.includes(kw.toLowerCase())
  ).length;

  // If multiple support keywords are found, consider it relevant without checking off-topic patterns
  // This prevents false positives like "I want to order a python book" being flagged
  if (supportKeywordCount >= 2) {
    return { relevant: true };
  }

  // Check off-topic patterns
  for (const { pattern, response } of OFF_TOPIC_PATTERNS) {
    if (pattern.test(message)) {
      return { relevant: false, reason: response };
    }
  }

  // If no support keywords at all and the message looks like a general question, flag it
  if (supportKeywordCount === 0) {
    const generalQuestionPatterns = [
      /\b(who|what|when|where|why|how)\b[\s\S]+\?$/,
      /\b(can you|could you|will you|would you)\b/i,
      /\b(i want|i need|i would like|give me)\b.+/i,
    ];

    // Only flag if it matches a general question pattern (not a support-y one)
    const matchesGeneral = generalQuestionPatterns.some((p) => p.test(trimmed));
    if (matchesGeneral) {
      return {
        relevant: false,
        reason:
          "That doesn't appear to be a customer support message. Please enter a customer query related to orders, delivery, refunds, billing, technical issues, or similar support topics.",
      };
    }
  }

  // If it has at least one support keyword, let it through
  if (supportKeywordCount >= 1) {
    return { relevant: true };
  }

  // Fallback: if none of the above matched, treat as off-topic
  return {
    relevant: false,
    reason:
      "That doesn't look like a customer support message. Please paste a customer inquiry you'd like help analyzing (e.g., about an order, delivery, refund, or technical issue).",
  };
}