"use client";

import { useState } from "react";
import Link from "next/link";
import { card, btnPrimary, btnSecondary, inputCls, sectionTitle } from "@/components/crm/ui";

// Simple CSV parser that handles quoted fields
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

const COLUMN_ALIASES: Record<string, string> = {
  "first name": "firstName", firstname: "firstName", first: "firstName",
  name: "name", "full name": "name", "contact name": "name",
  "last name": "lastName", lastname: "lastName", surname: "lastName", last: "lastName",
  email: "email", "e-mail": "email", "email address": "email",
  phone: "phone", mobile: "phone", "phone number": "phone", tel: "phone", telephone: "phone", "phone 1": "phone",
  "phone 2": "phone2", phone2: "phone2", "alt phone": "phone2", whatsapp: "phone2",
  company: "company", organisation: "company", organization: "company", business: "company",
  "job title": "jobTitle", jobtitle: "jobTitle", title: "jobTitle", designation: "jobTitle",
  address: "address", street: "address",
  city: "city", town: "city",
  state: "state", province: "state",
  country: "country",
  website: "website", url: "website",
  status: "status",
  tags: "tags", labels: "tags",
  notes: "notes", comments: "notes", remarks: "notes",
};

export default function ImportPage() {
  const [raw, setRaw] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [error, setError] = useState("");

  const parsed = raw.trim() ? parseCSV(raw.trim()) : [];
  const headers = parsed[0]?.map((h) => h.trim().toLowerCase()) ?? [];
  const mapping = headers.map((h) => COLUMN_ALIASES[h] ?? null);
  const dataRows = parsed.slice(1);
  const mappedCount = mapping.filter(Boolean).length;
  const hasNameColumn = mapping.includes("firstName") || mapping.includes("name");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const buildRows = () =>
    dataRows.map((cells) => {
      const obj: Record<string, string> = {};
      mapping.forEach((field, i) => {
        if (field && cells[i] !== undefined && cells[i].trim() !== "") {
          obj[field] = cells[i].trim();
        }
      });
      return obj;
    });

  const runImport = async () => {
    setImporting(true);
    setError("");
    setResult(null);
    const rows = buildRows();
    let created = 0;
    let skipped = 0;
    try {
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        setProgress(`Importing ${Math.min(i + 50, rows.length)} / ${rows.length}…`);
        const res = await fetch("/api/contacts/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: chunk }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Import failed");
        created += data.created;
        skipped += data.skipped;
      }
      setResult({ created, skipped });
      setRaw("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setImporting(false);
      setProgress("");
    }
  };

  return (
    <div className="p-5 max-w-[850px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-[#8a8a8a] mb-3">
        <Link href="/crm/settings" className="hover:text-[#1a1a1a]">← Settings</Link>
      </div>
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Import contacts</h1>
      <p className="text-[13px] text-[#616161] mb-4">
        Upload a CSV file or paste spreadsheet data. The first row must be column headers
        (e.g. First Name, Last Name, Email, Phone, Company…).
      </p>

      {result && (
        <div className="bg-[#affebf] border border-[#7edc95] text-[#014b40] px-4 py-3 rounded-xl text-[13px] mb-4">
          ✓ Import complete — <b>{result.created} contacts created</b>
          {result.skipped > 0 && <>, {result.skipped} skipped (missing name or duplicate email)</>}.{" "}
          <Link href="/crm/contacts" className="underline font-medium">View contacts →</Link>
        </div>
      )}
      {error && (
        <div className="bg-[#fedad9] border border-[#e0b3b2] text-[#8e1f0b] px-4 py-3 rounded-xl text-[13px] mb-4">
          {error}
        </div>
      )}

      <div className={`${card} p-4 space-y-3 mb-4`}>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Upload CSV file</label>
          <input
            type="file"
            accept=".csv,text/csv,.txt"
            onChange={handleFile}
            className="text-[13px] text-[#303030] file:mr-3 file:px-3.5 file:py-2 file:rounded-lg file:border file:border-[#d4d4d4] file:bg-white file:text-[13px] file:font-medium file:cursor-pointer hover:file:bg-[#f7f7f7]"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Or paste CSV data</label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={6}
            placeholder={"First Name,Last Name,Email,Phone,Company\nRaj,Kumar,raj@example.com,+1 902 555 0101,Kumar Textiles"}
            className={`${inputCls} font-mono text-xs resize-y`}
          />
        </div>
      </div>

      {dataRows.length > 0 && (
        <div className={`${card} overflow-hidden mb-4`}>
          <div className="px-4 py-3 border-b border-[#ebebeb] flex items-center justify-between">
            <h2 className={sectionTitle}>
              Preview — {dataRows.length} row{dataRows.length !== 1 ? "s" : ""}, {mappedCount} column
              {mappedCount !== 1 ? "s" : ""} recognized
            </h2>
          </div>
          {!hasNameColumn && (
            <p className="px-4 py-2 bg-[#ffeb78]/40 text-[13px] text-[#4f4700]">
              ⚠ No name column detected — rows need a "First Name" or "Name" column to import.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fafafa] border-b border-[#ebebeb]">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">
                      <span className={mapping[i] ? "text-[#014b40]" : "text-[#8a8a8a] line-through"}>
                        {h || "(blank)"}
                      </span>
                      {mapping[i] && <span className="block text-[10px] text-[#8a8a8a] font-normal">→ {mapping[i]}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1f1]">
                {dataRows.slice(0, 5).map((cells, ri) => (
                  <tr key={ri}>
                    {headers.map((_, ci) => (
                      <td key={ci} className="px-3 py-1.5 text-xs text-[#303030] whitespace-nowrap max-w-40 truncate">
                        {cells[ci] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dataRows.length > 5 && (
            <p className="px-4 py-2 text-xs text-[#8a8a8a] border-t border-[#f1f1f1]">
              …and {dataRows.length - 5} more rows
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 items-center pb-8">
        <button
          onClick={runImport}
          disabled={!hasNameColumn || dataRows.length === 0 || importing}
          className={btnPrimary}
        >
          {importing ? progress || "Importing…" : `Import ${dataRows.length || ""} contacts`}
        </button>
        {raw && (
          <button onClick={() => { setRaw(""); setResult(null); setError(""); }} className={btnSecondary}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
