import type { ResponseData } from '../types';
import { Inbox, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface ResponsePanelProps {
  response: ResponseData | null;
  loading: boolean;
}

function ResponsePanel({ response, loading }: ResponsePanelProps) {
  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col shadow-card">
        <CardContent className="p-6 flex-1 flex flex-col overflow-y-auto animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/20 hover:scale-110">
              <Inbox className="w-5 h-5" />
            </div>
            Response
          </h3>
          
          {loading && (
            <div className="flex flex-col items-center justify-center flex-1 animate-fade-in">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
                <div className="absolute inset-0 w-12 h-12 text-primary/20 animate-pulse">
                  <Loader2 className="w-12 h-12" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            </div>
          )}

          {!loading && !response && (
            <div className="flex flex-col items-center justify-center flex-1 text-center px-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-primary/5 mb-3 animate-pulse">
                <Inbox className="w-12 h-12 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">No response yet. Send a request to see the response here.</p>
            </div>
          )}

          {!loading && response && (
            <div className="flex-1 flex flex-col space-y-4 animate-fade-in">
              {response.error ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 animate-slide-in">
                    <Badge variant="error" className="text-sm animate-scale-in">
                      <AlertTriangle className="w-4 h-4 mr-1 animate-pulse" />
                      {response.status || 'Error'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Error
                    </h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap font-mono bg-rose-50 p-4 rounded-xl border border-rose-200">
                      {response.message}
                    </p>
                  </div>
                  {response.data !== undefined && response.data !== null && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">Response Data:</h5>
                      <pre className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto font-mono">
                        {typeof response.data === 'object'
                          ? JSON.stringify(response.data, null, 2)
                          : String(response.data)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 animate-slide-in">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={response.status && response.status >= 200 && response.status < 300 ? "success" : "error"}
                        className="text-sm animate-scale-in transition-all duration-200 hover:scale-105"
                      >
                        {response.status || 'Unknown'} {response.statusText || ''}
                      </Badge>
                    </div>
                    {response.time && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {response.time}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 border-b border-slate-200 pb-3">
                    <button className="text-sm font-medium text-primary border-b-2 border-primary pb-2 px-2 transition-all duration-200 hover:scale-105 relative">
                      Body
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-scale-in"></span>
                    </button>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-2 px-2 transition-all duration-200 hover:scale-105 hover:border-b-2 hover:border-primary/30">
                      Headers
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20">
                    <pre className="text-xs p-4 overflow-x-auto font-mono text-foreground whitespace-pre-wrap break-words animate-fade-in">
                      {response.data !== undefined && response.data !== null
                        ? typeof response.data === 'object'
                          ? JSON.stringify(response.data, null, 2)
                          : String(response.data)
                        : 'No data'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ResponsePanel;
