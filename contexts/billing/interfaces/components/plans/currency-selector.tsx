"use client";

import React from "react";
import { SUPPORTED_CURRENCIES, type CurrencyCode } from "../../../domain/model/value-objects/currency";
import { cn } from "@/lib/utils";

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
    <div className={cn("inline-flex items-center p-1 bg-secondary/15 rounded-lg gap-1 border border-border/40", className)}>
      {SUPPORTED_CURRENCIES.map(({ code, symbol, label }) => {
        const isSelected = selectedCurrency === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => onCurrencyChange(code)}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 select-none cursor-pointer",
              isSelected
                ? "bg-card text-foreground shadow-xs border border-border font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="opacity-75 mr-1">{symbol}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
