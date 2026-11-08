"use client";

import { useSchedulingTranslations } from "../../i18n";

export function MonthColumnsHeader() {
  const { locale } = useSchedulingTranslations();

  // Starting on Monday (Lun .. Dom)
  const weekdaysEs = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const weekdaysEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdays = locale === "es" ? weekdaysEs : weekdaysEn;

  return (
    <div className="grid w-full grid-cols-7 divide-x py-2 text-center bg-muted/5">
      {weekdays.map((name) => (
        <div key={name} className="text-xs font-medium text-muted-foreground">
          {name}
        </div>
      ))}
    </div>
  );
}
