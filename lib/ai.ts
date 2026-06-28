import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export interface AnalysisResult {
  category: string;
  priority: string;
  sentiment: string;
}

const VALID_CATEGORIES = [
  "Order Issue",
  "Refund",
  "Delivery",
  "General Inquiry",
  "Technical Support",
  "Billing",
  "Complaint",
  "Feedback",
];

const VALID_PRIORITIES = ["Low", "Medium", "High"];
const VALID_SENTIMENTS = ["Positive", "Neutral", "Negative"];

function keywordFallbackAnalysis(message: string): AnalysisResult {
  const lower = message.toLowerCase();

  // Priority heuristics
  let priority = "Low";
  if (
    lower.includes("urgent") ||
    lower.includes("angry") ||
    lower.includes("frustrated") ||
    lower.includes("furious") ||
    lower.includes("extremely") ||
    lower.includes("immediately") ||
    lower.includes("unacceptable") ||
    lower.includes("terrible")
  ) {
    priority = "High";
  } else if (
    lower.includes("please") ||
    lower.includes("kindly") ||
    lower.includes("appreciate") ||
    lower.includes("when can") ||
    lower.includes("how long")
  ) {
    priority = "Medium";
  }

  // Sentiment heuristics
  let sentiment = "Neutral";
  const positiveWords = ["thank", "great", "appreciate", "happy", "pleased", "excellent", "love", "good", "wonderful"];
  const negativeWords = [
    "angry", "frustrated", "terrible", "bad", "horrible", "awful",
    "unacceptable", "furious", "disappointed", "upset", "annoyed", "hate",
    "worst", "never", "useless",
  ];
  if (positiveWords.some((w) => lower.includes(w))) {
    sentiment = "Positive";
  }
  if (negativeWords.some((w) => lower.includes(w))) {
    sentiment = "Negative";
  }

  // Category heuristics
  let category = "General Inquiry";
  if (lower.includes("refund") || lower.includes("money back") || lower.includes("reimburs")) {
    category = "Refund";
  } else if (lower.includes("deliver") || lower.includes("shipping") || lower.includes("shipment") || lower.includes("track") || lower.includes("arrive")) {
    category = "Delivery";
  } else if (lower.includes("order") || lower.includes("purchase") || lower.includes("bought") || lower.includes("placed")) {
    category = "Order Issue";
  } else if (lower.includes("bill") || lower.includes("charge") || lower.includes("payment") || lower.includes("invoice") || lower.includes("price")) {
    category = "Billing";
  } else if (
    lower.includes("tech") ||
    lower.includes("bug") ||
    lower.includes("error") ||
    lower.includes("crash") ||
    lower.includes("login") ||
    lower.includes("password") ||
    lower.includes("not working") ||
    lower.includes("issue with")
  ) {
    category = "Technical Support";
  } else if (lower.includes("complaint") || lower.includes("complain")) {
    category = "Complaint";
  } else if (
    lower.includes("feedback") ||
    lower.includes("suggestion") ||
    lower.includes("recommend")
  ) {
    category = "Feedback";
  }

  return { category, priority, sentiment };
}

function validateAnalysis(raw: any): AnalysisResult {
  const category = VALID_CATEGORIES.includes(raw?.category) ? raw.category : "General Inquiry";
  const priority = VALID_PRIORITIES.includes(raw?.priority) ? raw.priority : "Low";
  const sentiment = VALID_SENTIMENTS.includes(raw?.sentiment) ? raw.sentiment : "Neutral";
  return { category, priority, sentiment };
}

export async function analyzeMessage(message: string): Promise<AnalysisResult> {
  if (!process.env.GROQ_API_KEY) {
    return keywordFallbackAnalysis(message);
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            'You are a JSON-only classification API. Respond with valid JSON only. No explanation, no markdown, no backticks. Return exactly: { "category": "...", "priority": "...", "sentiment": "..." }. Valid categories: Order Issue, Refund, Delivery, General Inquiry, Technical Support, Billing, Complaint, Feedback. Valid priorities: Low, Medium, High. Valid sentiments: Positive, Neutral, Negative.',
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0,
      max_tokens: 128,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return validateAnalysis(parsed);
  } catch {
    return keywordFallbackAnalysis(message);
  }
}

export async function generateReply(
  message: string,
  analysis: AnalysisResult
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return generateTemplateReply(message, analysis);
  }

  try {
    const isNegative = analysis.sentiment === "Negative";
    const isHigh = analysis.priority === "High";

    let systemPrompt =
      "You are a professional customer support agent. Respond with a helpful, concise reply to the customer's message. Sign off as 'Support Team'. Reply text only, no markdown, no JSON.";

    if (isNegative || isHigh) {
      systemPrompt =
        "You are a professional customer support agent. The customer is experiencing a sensitive issue. Lead with empathy and understanding. Sign off as 'Support Team'. Reply text only, no markdown, no JSON.";
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Context: Category: ${analysis.category}, Priority: ${analysis.priority}, Sentiment: ${analysis.sentiment}\n\nCustomer message: ${message}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    return completion.choices[0]?.message?.content?.trim() || generateTemplateReply(message, analysis);
  } catch {
    return generateTemplateReply(message, analysis);
  }
}

function generateTemplateReply(message: string, analysis: AnalysisResult): string {
  const empathyLine =
    analysis.sentiment === "Negative" || analysis.priority === "High"
      ? "I understand your frustration and I sincerely apologize for the inconvenience. "
      : "Thank you for reaching out to us. ";

  const categoryLines: Record<string, string> = {
    Refund:
      "I've noted your refund request. Our team will review it and process any eligible refunds as per our policy. You'll receive a confirmation email once it's done.",
    Delivery:
      "I can see you're concerned about your delivery. Let me check the tracking details and get back to you with an update as soon as possible.",
    "Order Issue":
      "I understand you're having an issue with your order. Let me look into this for you and I'll follow up shortly with more details.",
    Billing:
      "Thank you for bringing this billing matter to our attention. I'll review the charges and get back to you with clarification.",
    "Technical Support":
      "I appreciate you reporting this technical issue. Let me investigate the problem and I'll reach out with steps to resolve it.",
    Complaint:
      "I'm sorry to hear about your experience. I've escalated your complaint to the relevant team for prompt review.",
    Feedback:
      "Thank you for sharing your valuable feedback. We're always looking to improve and I'll make sure this reaches the right team.",
    "General Inquiry":
      "I'd be happy to help with your inquiry. Let me look into the details and I'll get back to you shortly.",
  };

  const body = categoryLines[analysis.category] || categoryLines["General Inquiry"];

  return `${empathyLine}${body}\n\nBest regards,\nSupport Team`;
}