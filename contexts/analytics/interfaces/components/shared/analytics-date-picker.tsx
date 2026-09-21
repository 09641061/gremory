"use client";

import React from "react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ButtonGroup } from "@/contexts/shared/interfaces/components/ui/button-group";
import { Calendar, Download } from "lucide-react";
import type { AnalyticsPreset } from "../../../domain/model/value-objects/analytics-date-range";
import { useAnalyticsI18n } from "../../i18n";

export interface AnalyticsDatePickerProps {
  currentPreset: AnalyticsPreset;
  onPresetChange: (preset: AnalyticsPreset) => void;
  isExporting?: boolean;
  onExport?: () => void;
  maxDays?: number;
}

export function AnalyticsDatePicker({
  currentPreset,
  onPresetChange,
  isExporting,
  onExport,
  maxDays = 30,
}: AnalyticsDatePickerProps) {
  const { t } = useAnalyticsI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="size-4 text-muted-foreground" />
        <ButtonGroup>
          <Button
            size="sm"
            variant={currentPreset === "today" ? "default" : "outline"}
            onClick={() => onPresetChange("today")}
          >
            {t.datePicker.today}
          </Button>
          <Button
            size="sm"
            variant={currentPreset === "7d" ? "default" : "outline"}
            onClick={() => onPresetChange("7d")}
          >
            {t.datePicker.last7Days}
          </Button>
          <Button
            size="sm"
            variant={currentPreset === "30d" ? "default" : "outline"}
            onClick={() => onPresetChange("30d")}
          >
            {t.datePicker.last30Days}
          </Button>
          {maxDays > 30 && (
            <Button
              size="sm"
              variant={currentPreset === "90d" ? "default" : "outline"}
              onClick={() => onPresetChange("90d")}
            >
              {t.datePicker.last90Days}
            </Button>
          )}
        </ButtonGroup>
      </div>

      {onExport && (
        <Button
          size="sm"
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="gap-1.5"
        >
          <Download className="size-3.5" />
          {isExporting ? t.export.exporting : t.export.downloadCsv}
        </Button>
      )}
    </div>
  );
}
