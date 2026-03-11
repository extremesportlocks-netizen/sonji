"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { Upload, FileText, Check, AlertTriangle, ArrowRight, X, Download } from "lucide-react";

interface ImportContactsModalProps { open: boolean; onClose: () => void; }

const sampleRows = [
  { "First Name": "Jessica", "Last Name": "Martinez", "Email": "jessica@glowmedspa.com", "Phone": "(305) 555-0142", "Company": "Glow Med Spa" },
  { "First Name": "Marcus", "Last Name": "Rivera", "Email": "marcus@apexconsulting.com", "Phone": "(415) 555-0198", "Company": "Apex Consulting" },
  { "First Name": "Sarah", "Last Name": "Lin", "Email": "sarah@brightrealty.com", "Phone": "(212) 555-0167", "Company": "Bright Realty" },
  { "First Name": "David", "Last Name": "Chen", "Email": "david@summitfitness.com", "Phone": "(678) 555-0134", "Company": "Summit Fitness" },
];

const crmFields = ["First Name", "Last Name", "Email", "Phone", "Company", "Tags", "Source", "Status", "— Skip —"];

type Step = "upload" | "mapping" | "preview" | "importing" | "done";

export default function ImportContactsModal({ open, onClose }: ImportContactsModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [mappings, setMappings] = useState<Record<string, string>>({
    "First Name": "First Name", "Last Name": "Last Name", "Email": "Email", "Phone": "Phone", "Company": "Company",
  });
  const [importProgress, setImportProgress] = useState(0);

  const csvColumns = Object.keys(sampleRows[0]);

  const handleUpload = () => {
    setFileName("contacts-export-2026.csv");
    setStep("mapping");
  };

  const startImport = () => {
    setStep("importing");
    let p = 0;
    const timer = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) { p = 100; clearInterval(timer); setTimeout(() => setStep("done"), 500); }
      setImportProgress(Math.min(p, 100));
    }, 200);
  };

  const reset = () => { setStep("upload"); setFileName(""); setImportProgress(0); };

  return (
    <Modal open={open} onClose={onClose} title="Import Contacts" subtitle="Upload a CSV file to import contacts" size="lg">
      {/* STEP 1: Upload */}
      {step === "upload" && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(); }}
            onClick={handleUpload}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
              dragOver ? "border-indigo-400 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
            }`}>
            <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? "text-indigo-500" : "text-gray-400"}`} />
            <p className="text-sm font-medium text-gray-900 mb-1">Drop your CSV file here, or click to browse</p>
            <p className="text-xs text-gray-400">Supports .csv and .tsv files up to 10MB</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              <Download className="w-3.5 h-3.5" /> Download sample CSV template
            </button>
            <span className="text-xs text-gray-400">Max 25,000 contacts per import</span>
          </div>
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {step === "mapping" && (
        <div>
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-gray-700 font-medium">{fileName}</span>
            <span className="text-xs text-gray-400 ml-auto">{sampleRows.length} contacts found</span>
            <button onClick={reset} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>

          <p className="text-xs font-medium text-gray-700 mb-3">Map your CSV columns to CRM fields:</p>

          <div className="space-y-2">
            {csvColumns.map((col) => (
              <div key={col} className="flex items-center gap-3">
                <div className="w-1/3 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">{col}</div>
                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <select value={mappings[col] || "— Skip —"} onChange={(e) => setMappings({ ...mappings, [col]: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                  {crmFields.map((f) => <option key={f}>{f}</option>)}
                </select>
                {mappings[col] && mappings[col] !== "— Skip —" && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button onClick={reset} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Back</button>
            <button onClick={() => setStep("preview")}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              Preview Import
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview */}
      {step === "preview" && (
        <div>
          <p className="text-xs font-medium text-gray-700 mb-3">Preview (first 4 rows):</p>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {csvColumns.filter((c) => mappings[c] && mappings[c] !== "— Skip —").map((col) => (
                    <th key={col} className="text-left px-3 py-2 font-semibold text-gray-600">{mappings[col]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {csvColumns.filter((c) => mappings[c] && mappings[c] !== "— Skip —").map((col) => (
                      <td key={col} className="px-3 py-2 text-gray-700">{row[col as keyof typeof row]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">{sampleRows.length} contacts ready to import</p>
              <p className="text-xs text-emerald-600">0 duplicates detected · 0 errors</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => setStep("mapping")} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Back</button>
            <button onClick={startImport}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              Import {sampleRows.length} Contacts
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Importing */}
      {step === "importing" && (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-2">Importing contacts...</p>
          <div className="w-full max-w-xs mx-auto h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-200" style={{ width: `${importProgress}%` }} />
          </div>
          <p className="text-xs text-gray-400">{Math.round(importProgress)}% complete</p>
        </div>
      )}

      {/* STEP 5: Done */}
      {step === "done" && (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-1">Import Complete!</p>
          <p className="text-sm text-gray-500 mb-6">{sampleRows.length} contacts were successfully imported.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">View Contacts</button>
            <button onClick={() => { reset(); }} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Import More</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
