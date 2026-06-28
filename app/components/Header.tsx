"use client";

import { MessageSquare, Inbox, BarChart3 } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "compose", label: "Compose", icon: MessageSquare },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-[#262a3a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center glow-accent">
            <MessageSquare className="w-[18px] h-[18px] text-amber-400" />
          </div>
          <div>
            <span className="text-lg font-bold text-[#eaeef2] tracking-tight">SupportDesk</span>
            <span className="hidden sm:inline text-xs text-[#7a8099] ml-2 font-medium">AI-Powered Support</span>
          </div>
        </div>

        <nav className="flex gap-1 p-0.5 bg-[#12141c] rounded-xl border border-[#262a3a]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/15 to-amber-400/10 text-amber-400 shadow-sm shadow-amber-500/5 border border-amber-500/20"
                    : "text-[#7a8099] hover:text-[#eaeef2] hover:bg-[#1a1d2b] border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}