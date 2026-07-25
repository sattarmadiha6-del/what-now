"use client";

import { Download } from "lucide-react";

function toCsvValue(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ExportHistoryButton({ rows }) {
  function handleExport() {
    const headers = [
      "date",
      "dish_name",
      "status",
      "energy",
      "ingredients",
      "craving",
    ];
    const lines = [headers.join(",")];
    for (const row of rows) {
      lines.push(
        headers
          .map((h) =>
            toCsvValue(
              h === "date"
                ? new Date(row.created_at).toLocaleDateString()
                : row[h]
            )
          )
          .join(",")
      );
    }
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "what-now-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!rows.length) return null;

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 text-xs font-medium text-green hover:text-green-dark transition-colors"
    >
      <Download size={13} />
      Export
    </button>
  );
}
