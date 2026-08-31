"use client";

import React from "react";
import { SUPPORTED_CURRENCIES, type CurrencyCode } from "../../../domain/model/value-objects/currency";
import { cn } from "@/lib/utils";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

interface CurrencySelectorProps {
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  className?: string;
}

/**
 * CurrencySelector component allowing user to toggle between PEN, USD, and EUR.
 */
export function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  className = "",
}: CurrencySelectorProps) {
  return (
    <div className={cn("inline-flex items-center p-1 bg-muted/50 rounded-lg gap-1 border border-border/40", className)}>
      {SUPPORTED_CURRENCIES.map(({ code, symbol, label }) => {
        const isSelected = selectedCurrency === code;

        return (
          <Button
            key={code}
            type="button"
            variant={isSelected ? "outline" : "ghost"}
            size="sm"
            onClick={() => onCurrencyChange(code)}
            className={cn(
              "h-7 px-2.5 text-xs font-semibold transition-all duration-150",
              isSelected
                ? "font-bold shadow-xs"
                : "text-muted-foreground"
            )}
          >
            <span className="opacity-75 mr-1">{symbol}</span>
            {label}
          </Button>
        );
      })}
    </div>
  );
}
