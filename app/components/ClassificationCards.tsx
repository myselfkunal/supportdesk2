"use client";

import { Tag, ArrowUpCircle, Smile } from "lucide-react";
import Badge, { getPriorityColor, getSentimentColor } from "./Badge";

interface ClassificationCardsProps {
  category: string;
  priority: string;
  sentiment: string;
}

const categoryColors: Record<string, string> = {
  "Order Issue": "#8b5cf6",
  Refund: "#3b82f6",
  Delivery: "#f59e0b",
  "General Inquiry": "#7a8099",
  "Technical Support": "#06b6d4",
  Billing: "#ec4899",
  Complaint: "#ef4444",
  Feedback: "#10b981",
};

export default function ClassificationCards({
  category,
  priority,
  sentiment,
}: ClassificationCardsProps) {
  const getSentimentIcon = (s: string) => {
    switch (s) {
      case "Positive": return "😊";
      case "Negative": return "😟";
      case "Neutral": return "😐";
      default: return "😐";
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-in">
      <div className="group bg-gradient-to-br from-[#181c25] to-[#1a1d2b] border border-[#262a3a] rounded-xl p-4 hover:border-[#2f3346] transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Tag className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7a8099]">Category</span>
        </div>
        <Badge
          text={category}
          color={categoryColors[category] || "#7a8099"}
        />
      </div>

      <div className="group bg-gradient-to-br from-[#181c25] to-[#1a1d2b] border border-[#262a3a] rounded-xl p-4 hover:border-[#2f3346] transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg border flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${getPriorityColor(priority)}10`, borderColor: `${getPriorityColor(priority)}20` }}>
            <ArrowUpCircle className="w-3.5 h-3.5" style={{ color: getPriorityColor(priority) }} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7a8099]">Priority</span>
        </div>
        <Badge text={priority} color={getPriorityColor(priority)} />
      </div>

      <div className="group bg-gradient-to-br from-[#181c25] to-[#1a1d2b] border border-[#262a3a] rounded-xl p-4 hover:border-[#2f3346] transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg border flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${getSentimentColor(sentiment)}10`, borderColor: `${getSentimentColor(sentiment)}20` }}>
            <Smile className="w-3.5 h-3.5" style={{ color: getSentimentColor(sentiment) }} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7a8099]">Sentiment</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{getSentimentIcon(sentiment)}</span>
          <Badge text={sentiment} color={getSentimentColor(sentiment)} />
        </div>
      </div>
    </div>
  );
}