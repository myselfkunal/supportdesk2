"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart3, AlertTriangle, CheckCircle, Frown, RefreshCw, TrendingUp } from "lucide-react";

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

interface Analytics {
  total: number;
  highPriority: number;
  resolved: number;
  negativeSentiment: number;
  categoryCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  sentimentCounts: Record<string, number>;
}

export default function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/queries");
      if (res.ok) {
        const data: QueryData[] = await res.json();
        computeAnalytics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  function computeAnalytics(queries: QueryData[]) {
    const categoryCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    const sentimentCounts: Record<string, number> = { Positive: 0, Neutral: 0, Negative: 0 };
    let highPriority = 0;
    let resolved = 0;
    let negativeSentiment = 0;

    for (const q of queries) {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
      priorityCounts[q.priority] = (priorityCounts[q.priority] || 0) + 1;
      sentimentCounts[q.sentiment] = (sentimentCounts[q.sentiment] || 0) + 1;
      if (q.priority === "High") highPriority++;
      if (q.status === "resolved") resolved++;
      if (q.sentiment === "Negative") negativeSentiment++;
    }

    setAnalytics({
      total: queries.length,
      highPriority,
      resolved,
      negativeSentiment,
      categoryCounts,
      priorityCounts,
      sentimentCounts,
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-[#262a3a] border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-r-amber-500/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-sm text-[#7a8099] mt-4 font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics || analytics.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#7a8099]">
        <div className="w-16 h-16 rounded-2xl bg-[#12141c] border border-[#262a3a] flex items-center justify-center mb-5">
          <BarChart3 className="w-8 h-8 text-[#4a5069]" />
        </div>
        <p className="text-base font-semibold text-[#eaeef2]">No data to analyze</p>
        <p className="text-sm mt-1.5 text-[#7a8099]">Save some queries first to see analytics</p>
      </div>
    );
  }

  const maxCategoryCount = Math.max(...Object.values(analytics.categoryCounts), 1);
  const resolveRate = Math.round((analytics.resolved / analytics.total) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <BarChart3 className="w-[18px] h-[18px] text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#eaeef2]">Analytics Dashboard</h2>
            <p className="text-xs text-[#7a8099]">Overview of all support queries</p>
          </div>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#7a8099] hover:text-[#eaeef2] bg-[#12141c] rounded-lg border border-[#262a3a] hover:border-[#2f3346] transition-all duration-200"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl p-4 hover:border-[#2f3346] transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8099]">Total</span>
          </div>
          <p className="text-2xl font-bold text-[#eaeef2]">{analytics.total}</p>
          <p className="text-xs text-[#7a8099] mt-1">All time queries</p>
        </div>

        <div className="group bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl p-4 hover:border-[#2f3346] transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8099]">Urgent</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{analytics.highPriority}</p>
          <p className="text-xs text-[#7a8099] mt-1">High priority items</p>
        </div>

        <div className="group bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl p-4 hover:border-[#2f3346] transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8099]">Success</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{analytics.resolved}</p>
          <p className="text-xs text-[#7a8099] mt-1">{resolveRate}% resolved rate</p>
        </div>

        <div className="group bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl p-4 hover:border-[#2f3346] transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Frown className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8099]">At Risk</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{analytics.negativeSentiment}</p>
          <p className="text-xs text-[#7a8099] mt-1">Negative sentiment</p>
        </div>
      </div>

      {/* Bar Chart - Categories */}
      <div className="bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl p-5 shadow-lg shadow-black/5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-[#eaeef2]">Queries by Category</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(analytics.categoryCounts).map(([category, count], idx) => {
            const percent = (count / maxCategoryCount) * 100;
            const categoryColor = getCategoryColor(category);
            return (
              <div key={category} className="animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#eaeef2]">{category}</span>
                  <span className="text-[#7a8099] font-medium">{count}</span>
                </div>
                <div className="w-full bg-[#0a0c10] rounded-full h-2.5 overflow-hidden border border-[#262a3a]">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: categoryColor,
                      boxShadow: `0 0 8px ${categoryColor}40`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority & Sentiment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl p-5 shadow-lg shadow-black/5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-[#eaeef2]">Priority Distribution</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.priorityCounts).map(([priority, count], idx) => {
              const color = getPriorityColor(priority);
              const percent = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
              return (
                <div key={priority} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#eaeef2]">{priority}</span>
                    <span className="text-[#7a8099] font-medium">{count} ({Math.round(percent)}%)</span>
                  </div>
                  <div className="w-full bg-[#0a0c10] rounded-full h-2.5 overflow-hidden border border-[#262a3a]">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}40`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl p-5 shadow-lg shadow-black/5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded border border-amber-500/20 flex items-center justify-center">
              <Frown className="w-3 h-3 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-[#eaeef2]">Sentiment Breakdown</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.sentimentCounts).map(([sentiment, count], idx) => {
              const color = getSentimentColor(sentiment);
              const percent = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
              return (
                <div key={sentiment} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#eaeef2]">{sentiment}</span>
                    <span className="text-[#7a8099] font-medium">{count} ({Math.round(percent)}%)</span>
                  </div>
                  <div className="w-full bg-[#0a0c10] rounded-full h-2.5 overflow-hidden border border-[#262a3a]">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}40`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Order Issue": "#8b5cf6",
    Refund: "#3b82f6",
    Delivery: "#f59e0b",
    "General Inquiry": "#7a8099",
    "Technical Support": "#06b6d4",
    Billing: "#ec4899",
    Complaint: "#ef4444",
    Feedback: "#10b981",
  };
  return colors[category] || "#7a8099";
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "High": return "#ef4444";
    case "Medium": return "#f59e0b";
    case "Low": return "#10b981";
    default: return "#7a8099";
  }
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case "Positive": return "#10b981";
    case "Negative": return "#ef4444";
    case "Neutral": return "#7a8099";
    default: return "#7a8099";
  }
}