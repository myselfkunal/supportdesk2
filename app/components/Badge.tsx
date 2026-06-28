"use client";

interface BadgeProps {
  text: string;
  color: string;
  variant?: "default" | "outline";
}

export default function Badge({ text, color, variant = "default" }: BadgeProps) {
  if (variant === "outline") {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border leading-relaxed"
        style={{ borderColor: color, color }}
      >
        {text}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium leading-relaxed"
      style={{
        backgroundColor: `${color}15`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {text}
    </span>
  );
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "High":
      return "#ef4444";
    case "Medium":
      return "#f59e0b";
    case "Low":
      return "#10b981";
    default:
      return "#7a8099";
  }
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case "Positive":
      return "#10b981";
    case "Negative":
      return "#ef4444";
    case "Neutral":
      return "#7a8099";
    default:
      return "#7a8099";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "resolved":
      return "#10b981";
    case "draft":
      return "#f59e0b";
    default:
      return "#7a8099";
  }
}