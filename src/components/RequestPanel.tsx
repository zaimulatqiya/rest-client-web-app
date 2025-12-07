import type { Header } from '../types';
import HeaderInput from './HeaderInput';
import { Send, Loader2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MethodSelect } from './ui/method-select';
import { Card, CardContent } from './ui/card';

interface RequestPanelProps {
  method: string;
  url: string;
  headers: Header[];
  body: string;
  loading: boolean;
  onMethodChange: (method: string) => void;
  onUrlChange: (url: string) => void;
  onHeadersChange: (headers: Header[]) => void;
  onBodyChange: (body: string) => void;
  onSendRequest: () => void;
}

function RequestPanel({
  method,
  url,
  headers,
  body,
  loading,
  onMethodChange,
  onUrlChange,
  onHeadersChange,
  onBodyChange,
  onSendRequest
}: RequestPanelProps) {
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onSendRequest();
    }
  };

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col shadow-card">
        <CardContent className="p-6 flex-1 flex flex-col overflow-y-auto animate-fade-in">
          {/* Request Line */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-32">
              <MethodSelect value={method} onChange={onMethodChange} />
            </div>
            
            <Input
              type="text"
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-11 font-mono text-sm rounded-xl"
            />
            
          <Button 
            onClick={onSendRequest} 
            disabled={loading}
            className="h-11 px-6 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:translate-x-1" />
                Send
              </>
            )}
          </Button>
          </div>

          <HeaderInput 
            headers={headers}
            onHeadersChange={onHeadersChange}
          />

          {hasBody && (
            <div className="mt-6 space-y-3 flex-1 flex flex-col min-h-0 animate-fade-in">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 flex-shrink-0">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20 hover:scale-110">
                  <FileText className="w-4 h-4" />
                </div>
                Body
              </h3>
              <textarea
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => onBodyChange(e.target.value)}
                className="w-full flex-1 p-4 rounded-xl border border-input bg-background text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 hover:border-primary/30 focus-visible:border-primary focus-visible:shadow-md focus-visible:shadow-primary/10"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default RequestPanel;
