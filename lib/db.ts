import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "support.db");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = createClient({
  url: `file:${dbPath}`,
});

export async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_message TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      reply_draft TEXT NOT NULL,
      final_reply TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function getAllQueries() {
  const result = await db.execute("SELECT * FROM queries ORDER BY created_at DESC");
  return result.rows;
}

export async function getQueryById(id: number) {
  const result = await db.execute({
    sql: "SELECT * FROM queries WHERE id = ?",
    args: [id],
  });
  return result.rows[0] || null;
}

export async function createQuery(data: {
  customer_message: string;
  category: string;
  priority: string;
  sentiment: string;
  reply_draft: string;
}) {
  const result = await db.execute({
    sql: `INSERT INTO queries (customer_message, category, priority, sentiment, reply_draft, status)
          VALUES (?, ?, ?, ?, ?, 'resolved')`,
    args: [
      data.customer_message,
      data.category,
      data.priority,
      data.sentiment,
      data.reply_draft,
    ],
  });
  const id = Number(result.lastInsertRowid);
  return getQueryById(id);
}

export async function updateQuery(
  id: number,
  data: { final_reply: string; status: string }
) {
  await db.execute({
    sql: `UPDATE queries SET final_reply = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [data.final_reply, data.status, id],
  });
  return getQueryById(id);
}

export async function deleteQuery(id: number) {
  await db.execute({
    sql: "DELETE FROM queries WHERE id = ?",
    args: [id],
  });
}

export default db;