import { NextRequest, NextResponse } from "next/server";
import { initDB, updateQuery, deleteQuery } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await context.params;
    const body = await request.json();

    if (!body.final_reply || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields: final_reply, status" },
        { status: 400 }
      );
    }

    const query = await updateQuery(Number(id), {
      final_reply: body.final_reply,
      status: body.status,
    });

    if (!query) {
      return NextResponse.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(query);
  } catch (error) {
    console.error("PATCH query error:", error);
    return NextResponse.json(
      { error: "Failed to update query" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await context.params;
    await deleteQuery(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE query error:", error);
    return NextResponse.json(
      { error: "Failed to delete query" },
      { status: 500 }
    );
  }
}