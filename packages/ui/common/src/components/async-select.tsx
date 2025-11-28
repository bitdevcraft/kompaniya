import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDebounce } from "../hooks/use-debounce";
import { cn } from "../lib/utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface AsyncSelectProps<T> {
  /** Async function to fetch options */
  fetcher: (query?: string) => Promise<T[]>;
  /** Preload all data ahead of time */
  preload?: boolean;
  /** Function to filter options */
  filterFn?: (option: T, query: string) => boolean;
  /** Function to render each option */
  renderOption: (option: T) => React.ReactNode;
  /** Function to get the value from an option */
  getOptionValue: (option: T) => string;
  /** Function to get the display value for the selected option */
  getDisplayValue: (option: T) => React.ReactNode;
  /** Custom not found message */
  notFound?: React.ReactNode;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Label for the select field */
  label: string;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;
  /** Custom width for the popover */
  width?: string | number;
  /** Custom class names */
  className?: string;
  /** Custom trigger button class names */
  triggerClassName?: string;
  /** Custom no results message */
  noResultsMessage?: string;
  /** Allow clearing the selection */
  clearable?: boolean;

  /** New: only fetch when popover is open (default true) */
  fetchOnOpen?: boolean;
  /** New: minimum characters before fetching when not preloading (default 0) */
  minQueryLength?: number;
  /** New: enable in-memory cache per query (default true) */
  enableCache?: boolean;
}

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export function AsyncSelect<T>({
  fetcher,
  preload = false,
  filterFn,
  renderOption,
  getOptionValue,
  getDisplayValue,
  notFound,
  loadingSkeleton,
  label,
  placeholder = "Select...",
  value,
  onChange,
  disabled = false,
  width = "200px",
  className,
  triggerClassName,
  noResultsMessage,
  clearable = true,
  fetchOnOpen = true,
  minQueryLength = 0,
  enableCache = true,
}: AsyncSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [rawOptions, setRawOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, preload ? 0 : 500);

  // Stable refs prevent effect churn when parent re-creates functions
  const fetcherRef = useRef(fetcher);
  const filterFnRef = useRef(filterFn);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);
  useEffect(() => {
    filterFnRef.current = filterFn;
  }, [filterFn]);

  // Query cache
  const cacheRef = useRef<Map<string, T[]>>(new Map());
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);

  // Keep local selected value in sync
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Compute display options
  const options = useMemo(() => {
    if (!preload) return rawOptions;
    const q = debouncedSearchTerm.trim();
    if (!q) return rawOptions;
    const f = filterFnRef.current;
    return f ? rawOptions.filter((o) => f(o, q)) : rawOptions;
  }, [rawOptions, preload, debouncedSearchTerm]);

  // Keep selectedOption resolved from current options
  useEffect(() => {
    if (!selectedValue) {
      setSelectedOption(null);
      return;
    }
    const found =
      options.find((o) => getOptionValue(o) === selectedValue) ?? null;
    setSelectedOption(found);
  }, [options, selectedValue, getOptionValue]);

  const normalize = (q?: string) => (q ?? "").trim();

  const load = useCallback(
    async (query: string) => {
      const key = normalize(query);

      if (enableCache && cacheRef.current.has(key)) {
        setError(null);
        setRawOptions(cacheRef.current.get(key) as T[]);
        return;
      }

      const currentId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const data = await fetcherRef.current(key);
        if (currentId !== requestIdRef.current) return; // drop stale
        if (enableCache) cacheRef.current.set(key, data);
        setRawOptions(data);
      } catch (err) {
        if (currentId !== requestIdRef.current) return;
        setError(
          err instanceof Error ? err.message : "Failed to fetch options",
        );
        setRawOptions([]);
      } finally {
        if (currentId === requestIdRef.current) setLoading(false);
      }
    },
    [enableCache],
  );

  // Initial preload or initial value resolution
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (preload) {
      // Preload once
      load("");
    } else if (value) {
      // Resolve display of an existing value without opening
      load(value);
    }
  }, [preload, value, load]);

  // Fetch-on-open and on debounced search (when not preloading)
  useEffect(() => {
    if (preload) return; // handled by initial load + local filtering not used
    if (fetchOnOpen && !open) return;

    const q = debouncedSearchTerm.trim();
    if (q.length >= minQueryLength) {
      load(q);
    } else if (!q && value) {
      // Ensure selected value is resolvable in list
      load(value);
    } else if (!q) {
      setRawOptions([]);
      setError(null);
    }
  }, [
    preload,
    open,
    fetchOnOpen,
    debouncedSearchTerm,
    minQueryLength,
    value,
    load,
  ]);

  const handleSelect = useCallback(
    (currentValue: string) => {
      const newValue =
        clearable && currentValue === selectedValue ? "" : currentValue;
      setSelectedValue(newValue);
      const found = options.find((o) => getOptionValue(o) === newValue) ?? null;
      setSelectedOption(found);
      onChange(newValue);
      setOpen(false);
    },
    [selectedValue, onChange, clearable, options, getOptionValue],
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn(
            "justify-between",
            disabled && "opacity-50 cursor-not-allowed",
            triggerClassName,
          )}
          disabled={disabled}
          role="combobox"
          style={{ width }}
          variant="outline"
        >
          {selectedOption ? getDisplayValue(selectedOption) : placeholder}
          <ChevronsUpDown className="opacity-50" size={10} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", className)} style={{ width }}>
        <Command shouldFilter={false}>
          <div className="relative border-b w-full">
            <CommandInput
              onValueChange={setSearchTerm}
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
            />
            {loading && options.length > 0 && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
          <CommandList>
            {error && (
              <div className="p-4 text-destructive text-center">{error}</div>
            )}

            {loading &&
              options.length === 0 &&
              (loadingSkeleton || <DefaultLoadingSkeleton />)}

            {!loading &&
              !error &&
              options.length === 0 &&
              (notFound || (
                <CommandEmpty>
                  {noResultsMessage ?? `No ${label.toLowerCase()} found.`}
                </CommandEmpty>
              ))}

            <CommandGroup>
              {options.map((option) => {
                const ov = getOptionValue(option);
                return (
                  <CommandItem key={ov} onSelect={handleSelect} value={ov}>
                    {renderOption(option)}
                    <Check
                      className={cn(
                        "ml-auto h-3 w-3",
                        selectedValue === ov ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map((i) => (
        <CommandItem disabled key={i}>
          <div className="flex items-center gap-2 w-full">
            <div className="h-6 w-6 rounded-full animate-pulse bg-muted" />
            <div className="flex flex-col flex-1 gap-1">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              <div className="h-3 w-16 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
