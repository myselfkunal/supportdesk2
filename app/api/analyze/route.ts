import { NextRequest, NextResponse } from "next/server";
import { analyzeMessage, generateReply } from "@/lib/ai";
import { checkRelevance } from "@/lib/relevance";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if the message is relevant to customer support
    const relevance = checkRelevance(message);
    if (!relevance.relevant) {
      return NextResponse.json(
        { error: "IRRELEVANT", warning: relevance.reason },
        { status: 200 }
      );
    }

    const analysis = await analyzeMessage(message);
    const reply = await generateReply(message, analysis);

    return NextResponse.json({ analysis, reply });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze message" },
      { status: 500 }
    );
  }
}
