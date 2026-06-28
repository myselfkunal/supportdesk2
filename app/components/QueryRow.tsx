"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, MessageSquare, Clock, Reply } from "lucide-react";
import Badge, {
  getPriorityColor,
  getSentimentColor,
  getStatusColor,
} from "./Badge";

interface QueryRowProps {
  query: {
    id: number;
    customer_message: string;
    category: string;
    priority: string;
    sentiment: string;
    reply_draft: string;
    final_reply: string | null;
    status: string;
    created_at: string;
  };
  onDelete: (id: number) => void;
}

export default function QueryRow({ query, onDelete }: QueryRowProps) {
  const [expanded, setExpanded] = useState(false);

  const truncatedMessage =
    query.customer_message.length > 80
      ? query.customer_message.slice(0, 80) + "..."
      : query.customer_message;

  const formattedDate = new Date(query.created_at + "Z").toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className={`bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/10 ${expanded ? 'shadow-md shadow-black/10' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-[#1a1d2b]/50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#eaeef2] truncate font-medium">{truncatedMessage}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-[#7a8099] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </span>
            <span className="text-[11px] text-[#7a8099]">•</span>
            <Badge text={query.status} color={getStatusColor(query.status)} />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Badge text={query.category} color="#8b5cf6" />
          <Badge text={query.priority} color={getPriorityColor(query.priority)} />
          <Badge text={query.sentiment} color={getSentimentColor(query.sentiment)} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#7a8099] transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#7a8099] transition-transform" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#262a3a] animate-scale-in">
          <div className="p-4 space-y-4">
            {/* Mobile badges */}
            <div className="flex md:hidden flex-wrap items-center gap-2">
              <Badge text={query.category} color="#8b5cf6" />
              <Badge text={query.priority} color={getPriorityColor(query.priority)} />
              <Badge text={query.sentiment} color={getSentimentColor(query.sentiment)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0c10] rounded-lg p-3.5 border border-[#262a3a]">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#7a8099]" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7a8099]">Customer Message</span>
                </div>
                <p className="text-sm text-[#eaeef2] whitespace-pre-wrap leading-relaxed">
                  {query.customer_message}
                </p>
              </div>
              <div className="bg-[#0a0c10] rounded-lg p-3.5 border border-[#262a3a]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Reply className="w-3.5 h-3.5 text-[#7a8099]" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7a8099]">{query.final_reply ? "Final Reply" : "Reply Draft"}</span>
                </div>
                <p className="text-sm text-[#eaeef2] whitespace-pre-wrap leading-relaxed">
                  {query.final_reply || query.reply_draft}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this query?")) onDelete(query.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg border border-transparent hover:border-[#ef4444]/20 transition-all duration-200"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}