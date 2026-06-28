import { NextRequest, NextResponse } from "next/server";
import { initDB, getAllQueries, createQuery } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    const queries = await getAllQueries();
    return NextResponse.json(queries);
  } catch (error) {
    console.error("GET queries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const body = await request.json();

    if (!body.customer_message || !body.category || !body.priority || !body.sentiment || !body.reply_draft) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const query = await createQuery({
      customer_message: body.customer_message,
      category: body.category,
      priority: body.priority,
      sentiment: body.sentiment,
      reply_draft: body.reply_draft,
    });

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    console.error("POST query error:", error);
    return NextResponse.json(
      { error: "Failed to create query" },
      { status: 500 }
    );
  }
}