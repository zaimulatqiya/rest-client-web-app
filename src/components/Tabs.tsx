import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-slate-200/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 rounded-full relative overflow-hidden",
              activeTab === tab.id 
                ? "bg-primary text-white shadow-primary scale-105" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:scale-105 active:scale-95"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">{tabs.find((tab) => tab.id === activeTab)?.content}</div>
    </div>
  );
}

export default Tabs;
