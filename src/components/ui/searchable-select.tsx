import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Option {
  value: string;
  label: string;
  code?: string;
  flag?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (option.code && option.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get selected option
  const selectedOption = options.find((option) => option.value === value);

  // Focus search input when popover opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Clear search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-start min-h-[40px] px-3 text-left",
            !value && "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          disabled={disabled}
          style={{ justifyContent: 'space-between' }}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 mr-2">
            {selectedOption ? (
              <>
                {selectedOption.flag && (
                  <span className="text-base flex-shrink-0">{selectedOption.flag}</span>
                )}
                {selectedOption.code && (
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded flex-shrink-0 font-mono">
                    {selectedOption.code}
                  </span>
                )}
                <span className="truncate text-left min-w-0">{selectedOption.label}</span>
              </>
            ) : (
              <span className="text-left">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === option.value && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 flex-shrink-0",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                  {option.flag && (
                    <span className="text-base flex-shrink-0">{option.flag}</span>
                  )}
                  {option.code && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                      {option.code}
                    </span>
                  )}
                  <span className="truncate min-w-0">{option.label}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}