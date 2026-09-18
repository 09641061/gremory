export class AnalyticsExportService {
  /**
   * Transforms analytics data to CSV format with UTF-8 BOM for Excel compatibility.
   */
  static toCsvWithBom(headers: string[], rows: (string | number | null | undefined)[][]): string {
    const csvRows = [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",")];

    for (const row of rows) {
      const values = row.map(val => {
        if (val === null || val === undefined) return '""';
        if (typeof val === "number") return String(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    return "\uFEFF" + csvRows.join("\r\n");
  }

  static triggerDownload(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
