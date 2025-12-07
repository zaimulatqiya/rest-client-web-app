import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;

const getMethodColor = (method: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    GET: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
    POST: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', hover: 'hover:bg-green-100' },
    PUT: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
    DELETE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', hover: 'hover:bg-red-100' },
    PATCH: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
    HEAD: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', hover: 'hover:bg-gray-100' },
    OPTIONS: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', hover: 'hover:bg-gray-100' },
  };
  return colors[method.toUpperCase()] || colors.GET;
};

interface MethodSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MethodSelect({ value, onChange, className }: MethodSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const methodColor = getMethodColor(value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => 
            prev < HTTP_METHODS.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => 
            prev > 0 ? prev - 1 : HTTP_METHODS.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0) {
            handleSelect(HTTP_METHODS[focusedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };

    const element = selectRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, focusedIndex, value]);

  React.useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('button');
      if (items[focusedIndex]) {
        items[focusedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleSelect = (method: string) => {
    onChange(method);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const currentIndex = HTTP_METHODS.indexOf(value as typeof HTTP_METHODS[number]);

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        }}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95",
          methodColor.bg,
          methodColor.text,
          methodColor.border,
          methodColor.hover,
          isOpen && "ring-2 ring-ring ring-offset-2 scale-105"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{value}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setIsOpen(false);
              setFocusedIndex(-1);
            }}
          />
          <div 
            ref={listRef}
            className={cn(
              "absolute z-50 mt-1 w-full rounded-xl border border-border bg-white shadow-card",
              "dropdown-content"
            )}
            role="listbox"
          >
            <div className="p-1 max-h-[280px] overflow-auto">
              {HTTP_METHODS.map((method, index) => {
                const itemColor = getMethodColor(method);
                const isSelected = value === method;
                const isFocused = focusedIndex === index;
                
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handleSelect(method)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm font-medium",
                      "outline-none transition-all duration-150 hover:scale-105 active:scale-95",
                      isSelected && itemColor.bg,
                      isSelected && itemColor.text,
                      isFocused && !isSelected && "bg-accent text-accent-foreground shadow-sm",
                      !isSelected && itemColor.hover
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{method}</span>
                    {isSelected && (
                      <span className="ml-auto text-xs font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
