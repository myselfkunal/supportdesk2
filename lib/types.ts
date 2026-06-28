export interface AnalysisResult {
  category: string;
  priority: string;
  sentiment: string;
}

export interface Query {
  id: number;
  customer_message: string;
  category: string;
  priority: string;
  sentiment: string;
  reply_draft: string;
  final_reply: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}