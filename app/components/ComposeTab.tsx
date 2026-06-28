"use client";

import { useState, useCallback } from "react";
import { Send, RotateCcw, Sparkles, Loader2, Edit3, AlertTriangle } from "lucide-react";
import ClassificationCards from "./ClassificationCards";
import Toast from "./Toast";

interface AnalysisResult {
  category: string;
  priority: string;
  sentiment: string;
}

export default function ComposeTab() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [originalReply, setOriginalReply] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setAnalysis(null);
    setWarning(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();

      if (data.error === "IRRELEVANT" && data.warning) {
        setWarning(data.warning);
        setLoading(false);
        return;
      }

      setAnalysis(data.analysis);
      setReplyDraft(data.reply);
      setOriginalReply(data.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReplyDraft(originalReply);
  };

  const handleSave = async () => {
    if (!analysis) return;

    try {
      const res = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_message: message,
          category: analysis.category,
          priority: analysis.priority,
          sentiment: analysis.sentiment,
          reply_draft: replyDraft,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setShowToast(true);
      setMessage("");
      setAnalysis(null);
      setReplyDraft("");
      setOriginalReply("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToastClose = useCallback(() => {
    setShowToast(false);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Toast message="Reply saved successfully!" visible={showToast} onClose={handleToastClose} />

      {/* Input Section */}
      <div className="bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl p-5 shadow-lg shadow-black/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <label className="text-sm font-semibold text-[#eaeef2]">
            Customer Message
          </label>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste the customer's message here..."
          rows={5}
          className="w-full bg-[#0a0c10] border border-[#262a3a] rounded-lg p-3.5 text-sm text-[#eaeef2] placeholder-[#7a8099] resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all duration-200"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !message.trim()}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-amber-500/50 disabled:to-amber-600/50 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold rounded-lg text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "Analyzing..." : "Analyze & Draft Reply"}
        </button>
      </div>

      {/* Warning Section */}
      {warning && (
        <div className="bg-gradient-to-br from-[#2d1b1b] to-[#3a1a1a] border border-red-500/30 rounded-xl p-5 shadow-lg shadow-red-500/10 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center mt-0.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-300 mb-1.5">
                Unrelated Message Detected
              </h3>
              <p className="text-sm text-red-200/80 leading-relaxed">
                {warning}
              </p>
            </div>
            <button
              onClick={() => setWarning(null)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-300 transition-all duration-200"
            >
              <span className="text-xs font-bold">&times;</span>
            </button>
          </div>
        </div>
      )}

      {analysis && (
        <>
          <ClassificationCards
            category={analysis.category}
            priority={analysis.priority}
            sentiment={analysis.sentiment}
          />

          {/* Reply Draft Section */}
          <div className="bg-gradient-to-br from-[#12141c] to-[#181c25] border border-[#262a3a] rounded-xl p-5 shadow-lg shadow-black/5 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <label className="text-sm font-semibold text-[#eaeef2]">
                  Reply Draft
                </label>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#7a8099] hover:text-[#eaeef2] bg-[#0a0c10] rounded-lg border border-[#262a3a] hover:border-[#2f3346] transition-all duration-200"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
            <textarea
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              rows={6}
              className="w-full bg-[#0a0c10] border border-[#262a3a] rounded-lg p-3.5 text-sm text-[#eaeef2] placeholder-[#7a8099] resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all duration-200"
            />
            <button
              onClick={handleSave}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-lg text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              Save to Inbox
            </button>
          </div>
        </>
      )}
    </div>
  );
}