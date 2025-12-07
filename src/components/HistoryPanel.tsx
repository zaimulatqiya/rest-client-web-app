import type { HistoryItem } from '../types';
import { Code, History, Trash2, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const getMethodColor = (method: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    GET: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
    POST: { bg: 'bg-primary/20', text: 'text-primary' },
    PUT: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
    DELETE: { bg: 'bg-red-500/20', text: 'text-red-300' },
    PATCH: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
    HEAD: { bg: 'bg-gray-500/20', text: 'text-gray-300' },
    OPTIONS: { bg: 'bg-gray-500/20', text: 'text-gray-300' },
  };
  return colors[method.toUpperCase()] || colors.GET;
};

function HistoryPanel({ history, onSelectHistory, onClearHistory }: HistoryPanelProps) {
  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-sidebar-foreground flex flex-col h-screen dark-scrollbar">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 animate-slide-in">
          <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-primary/30 hover:scale-110 hover:rotate-3 border border-primary/20">
            <Code className="w-5 h-5 text-primary transition-transform duration-300" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">REST Client</h2>
        </div>
      </div>
      
      {/* History Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </h3>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearHistory}
              className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-slate-800/40 backdrop-blur-sm mb-3 animate-pulse border border-slate-700/30">
              <History className="w-12 h-12 text-slate-400/50" />
            </div>
            <p className="text-sm text-slate-400">No history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item, i) => {
              const methodColor = getMethodColor(item.method);
              return (
                <div
                  key={i}
                  className={cn(
                    "cursor-pointer transition-all duration-200 rounded-xl p-3 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/60 border border-slate-700/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 animate-fade-in"
                  )}
                  onClick={() => onSelectHistory(item)}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-md",
                      methodColor.bg,
                      methodColor.text
                    )}>
                      {item.method}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time.split(',')[1]?.trim() || item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate">
                    {item.url}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPanel;
