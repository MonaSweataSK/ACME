import * as React from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({ options, value, onChange, placeholder = "Select...", className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900/50 backdrop-blur-sm px-3 py-2 text-sm text-slate-100 ring-offset-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2 truncate text-slate-200">
          {selectedOption ? (
            <>
              {selectedOption.icon}
              {selectedOption.label}
            </>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-200", { "rotate-180": isOpen })} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-700 bg-slate-900 shadow-lg animate-in fade-in zoom-in-95">
          <div className="flex items-center border-b border-slate-800 px-3 py-2">
            <Search size={16} className="text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-sm text-slate-500">No results found.</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-slate-800",
                    value === opt.value ? "bg-slate-800/50 text-indigo-400 font-medium" : "text-slate-300"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    {opt.label}
                  </span>
                  {value === opt.value && <Check size={16} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
