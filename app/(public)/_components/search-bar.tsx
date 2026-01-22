"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useQueryParams } from "@/shared/hooks/use-query-params";

export function SearchBar({ value }: { value: string }) {
  const { set } = useQueryParams();
  const [query, setQuery] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    set("q", "");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        set("q", query);
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleChange}
          placeholder="Buscar memes..."
          className="pr-10 pl-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1/2 right-3 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit">Buscar</Button>
    </form>
  );
}
