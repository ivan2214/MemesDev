import { Button } from "@/shared/components/ui/button";
import type { SortType } from "@/shared/types";
import { SORT_OPTIONS } from "../_constants";

export function SortOptions({
  value,
  onChange,
}: {
  value: SortType;
  onChange: (v: SortType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SORT_OPTIONS.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={value === option.value ? "default" : "outline"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
