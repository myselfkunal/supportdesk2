"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Inbox, RefreshCw } from "lucide-react";
import QueryRow from "./QueryRow";

interface QueryData {
  id: number;
  customer_message: string;
  category: string;
  priority: string;
  sentiment: string;
  reply_draft: string;
  final_reply: string | null;
  status: string;
  created_at: string;
}

export default function InboxTab() {
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/queries");
      if (res.ok) {
        const data = await res.json();
        setQueries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/queries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQueries((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-[#262a3a] border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-r-amber-500/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-sm text-[#7a8099] mt-4 font-medium">Loading queries...</p>
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#7a8099]">
        <div className="w-16 h-16 rounded-2xl bg-[#12141c] border border-[#262a3a] flex items-center justify-center mb-5">
          <Inbox className="w-8 h-8 text-[#4a5069]" />
        </div>
        <p className="text-base font-semibold text-[#eaeef2]">No saved queries yet</p>
        <p className="text-sm mt-1.5 text-[#7a8099]">Analyze and save a reply from the Compose tab to get started</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Inbox className="w-[18px] h-[18px] text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#eaeef2]">Saved Queries</h2>
            <p className="text-xs text-[#7a8099]">{queries.length} query{queries.length !== 1 ? 'ies' : 'y'} saved</p>
          </div>
        </div>
        <button
          onClick={fetchQueries}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#7a8099] hover:text-[#eaeef2] bg-[#12141c] rounded-lg border border-[#262a3a] hover:border-[#2f3346] transition-all duration-200"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Query list */}
      <div className="space-y-3">
        {queries.map((query, index) => (
          <div key={query.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <QueryRow key={query.id} query={query} onDelete={handleDelete} />
          </div>
        ))}
      </div>
    </div>
  );
}