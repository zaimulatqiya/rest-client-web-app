import type { Header } from "../types";
import { List, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface HeaderInputProps {
  headers: Header[];
  onHeadersChange: (headers: Header[]) => void;
}

function HeaderInput({ headers, onHeadersChange }: HeaderInputProps) {
  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    onHeadersChange(newHeaders);
  };

  const addHeader = () => {
    onHeadersChange([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    onHeadersChange(newHeaders.length === 0 ? [{ key: "", value: "" }] : newHeaders);
  };

  const activeHeadersCount = headers.filter((h) => h.key).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20 hover:scale-110">
            <List className="w-4 h-4" />
          </div>
          Headers
          {activeHeadersCount > 0 && <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">({activeHeadersCount})</span>}
        </h3>
        <Button variant="outline" size="sm" onClick={addHeader} className="h-8 text-xs">
          <Plus className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:rotate-90" />
          Add Header
        </Button>
      </div>

      <div className="space-y-2">
        {headers.map((header, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input type="text" placeholder="Key" value={header.key} onChange={(e) => updateHeader(i, "key", e.target.value)} className="flex-1 rounded-xl" />
            <Input type="text" placeholder="Value" value={header.value} onChange={(e) => updateHeader(i, "value", e.target.value)} className="flex-1 rounded-xl" />
            {headers.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeHeader(i)} className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeaderInput;
