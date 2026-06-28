"use client";

import { useState } from "react";
import Header from "./components/Header";
import ComposeTab from "./components/ComposeTab";
import InboxTab from "./components/InboxTab";
import AnalyticsTab from "./components/AnalyticsTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("compose");

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {activeTab === "compose" && <ComposeTab />}
        {activeTab === "inbox" && <InboxTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </main>
    </>
  );
}