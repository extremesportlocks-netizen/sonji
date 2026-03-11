"use client";

import { useState } from "react";
import Header from "@/components/dashboard/header";
import {
  Plus, GripVertical, Trash2, Settings, Eye, Code, Copy, ExternalLink,
  Type, Mail, Phone, AlignLeft, List, Calendar, ToggleLeft, Upload,
  Hash, Globe, CheckSquare, Star, MoreHorizontal, ChevronDown,
  Pencil, FileText, X, Check,
} from "lucide-react";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}

const fieldTypes = [
  { type: "text", label: "Short Text", icon: Type, color: "bg-blue-50 text-blue-600" },
  { type: "textarea", label: "Long Text", icon: AlignLeft, color: "bg-indigo-50 text-indigo-600" },
  { type: "email", label: "Email", icon: Mail, color: "bg-emerald-50 text-emerald-600" },
  { type: "phone", label: "Phone", icon: Phone, color: "bg-amber-50 text-amber-600" },
  { type: "number", label: "Number", icon: Hash, color: "bg-violet-50 text-violet-600" },
  { type: "select", label: "Dropdown", icon: List, color: "bg-rose-50 text-rose-500" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, color: "bg-cyan-50 text-cyan-600" },
  { type: "date", label: "Date", icon: Calendar, color: "bg-orange-50 text-orange-600" },
  { type: "file", label: "File Upload", icon: Upload, color: "bg-pink-50 text-pink-600" },
  { type: "url", label: "Website URL", icon: Globe, color: "bg-teal-50 text-teal-600" },
];

const mockForms = [
  { id: "f1", name: "New Patient Intake", fields: 12, submissions: 347, status: "Active", lastEdit: "2 hours ago" },
  { id: "f2", name: "Consultation Request", fields: 6, submissions: 89, status: "Active", lastEdit: "Yesterday" },
  { id: "f3", name: "Feedback Survey", fields: 8, submissions: 23, status: "Draft", lastEdit: "3 days ago" },
];

export default function FormsPage() {
  const [view, setView] = useState<"list" | "builder">("list");
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formName, setFormName] = useState("New Patient Intake");
  const [fields, setFields] = useState<FormField[]>([
    { id: "1", type: "text", label: "Full Name", placeholder: "Enter your full name", required: true },
    { id: "2", type: "email", label: "Email Address", placeholder: "you@example.com", required: true },
    { id: "3", type: "phone", label: "Phone Number", placeholder: "(555) 123-4567", required: false },
    { id: "4", type: "select", label: "Service Interested In", placeholder: "Select a service...", required: true, options: ["Consultation", "Treatment A", "Treatment B", "Follow-up", "Other"] },
    { id: "5", type: "textarea", label: "Additional Notes", placeholder: "Tell us anything else we should know...", required: false },
  ]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const addField = (type: string) => {
    const ft = fieldTypes.find((f) => f.type === type);
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: ft?.label || "New Field",
      placeholder: "",
      required: false,
      ...(type === "select" ? { options: ["Option 1", "Option 2", "Option 3"] } : {}),
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const moveField = (id: string, dir: -1 | 1) => {
    const idx = fields.findIndex((f) => f.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === fields.length - 1)) return;
    const newFields = [...fields];
    [newFields[idx], newFields[idx + dir]] = [newFields[idx + dir], newFields[idx]];
    setFields(newFields);
  };

  const selected = fields.find((f) => f.id === selectedField);

  // ═══ FORM LIST VIEW ═══
  if (view === "list") {
    return (
      <>
        <Header title="Forms" subtitle={`${mockForms.length} forms`} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div />
            <button onClick={() => setView("builder")}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
              <Plus className="w-4 h-4" /> Create Form
            </button>
          </div>

          <div className="grid gap-4">
            {mockForms.map((form) => (
              <div key={form.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition cursor-pointer"
                onClick={() => { setActiveForm(form.id); setView("builder"); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{form.name}</p>
                      <p className="text-xs text-gray-400">{form.fields} fields · {form.submissions} submissions · Edited {form.lastEdit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${form.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      {form.status}
                    </span>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><Copy className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><ExternalLink className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ═══ FORM BUILDER VIEW ═══
  return (
    <>
      {/* Builder Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="text-sm text-gray-500 hover:text-gray-700 transition">← Back</button>
          <div className="w-px h-5 bg-gray-200" />
          <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
            className="text-sm font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${previewMode ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <Code className="w-3.5 h-3.5" /> Embed
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
            <Check className="w-3.5 h-3.5" /> Publish
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* LEFT: Field Palette */}
        {!previewMode && (
          <div className="w-[220px] flex-shrink-0 border-r border-gray-100 bg-white p-4 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3">Add Fields</p>
            <div className="space-y-1.5">
              {fieldTypes.map((ft) => {
                const Icon = ft.icon;
                return (
                  <button key={ft.type} onClick={() => addField(ft.type)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${ft.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {ft.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CENTER: Form Canvas */}
        <div className="flex-1 bg-gray-50/50 overflow-y-auto">
          <div className="max-w-lg mx-auto py-8 px-4">
            {previewMode && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{formName}</h2>
                <p className="text-sm text-gray-500 mb-6">Please fill out the form below and we'll get back to you shortly.</p>
              </div>
            )}

            <div className={`${previewMode ? "bg-white rounded-2xl border border-gray-200 shadow-lg p-8" : ""} space-y-3`}>
              {fields.map((field) => {
                const ft = fieldTypes.find((t) => t.type === field.type);
                const Icon = ft?.icon || Type;
                const isSelected = selectedField === field.id;

                return (
                  <div key={field.id}
                    onClick={() => !previewMode && setSelectedField(field.id)}
                    className={`rounded-xl transition ${
                      previewMode
                        ? "mb-4"
                        : `p-4 border cursor-pointer group ${isSelected ? "border-indigo-300 bg-indigo-50/30 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`
                    }`}>
                    {!previewMode && (
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${ft?.color || "bg-gray-100 text-gray-400"}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="text-xs text-gray-400">{ft?.label}</span>
                          {field.required && <span className="text-[9px] text-red-500 font-medium">Required</span>}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={(e) => { e.stopPropagation(); moveField(field.id, -1); }} className="p-1 text-gray-400 hover:text-gray-600 rounded">↑</button>
                          <button onClick={(e) => { e.stopPropagation(); moveField(field.id, 1); }} className="p-1 text-gray-400 hover:text-gray-600 rounded">↓</button>
                          <button onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea rows={3} placeholder={field.placeholder || "Type here..."}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" readOnly={!previewMode} />
                      ) : field.type === "select" ? (
                        <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/50 text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                          <option>{field.placeholder || "Select..."}</option>
                          {field.options?.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      ) : field.type === "checkbox" ? (
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                          <span className="text-sm text-gray-600">{field.placeholder || "I agree"}</span>
                        </div>
                      ) : field.type === "file" ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Drag and drop or click to upload</p>
                        </div>
                      ) : (
                        <input type={field.type} placeholder={field.placeholder || "Type here..."}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" readOnly={!previewMode} />
                      )}
                    </div>
                  </div>
                );
              })}

              {previewMode && (
                <button className="w-full py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition mt-4">
                  Submit
                </button>
              )}

              {!previewMode && fields.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500 mb-1">No fields yet</p>
                  <p className="text-xs text-gray-400">Click a field type from the left panel to add it</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Field Settings */}
        {!previewMode && selected && (
          <div className="w-[280px] flex-shrink-0 border-l border-gray-100 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Field Settings</p>
              <button onClick={() => setSelectedField(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Label</label>
                <input type="text" value={selected.label} onChange={(e) => updateField(selected.id, { label: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Placeholder</label>
                <input type="text" value={selected.placeholder} onChange={(e) => updateField(selected.id, { placeholder: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-sm text-gray-700">Required</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={selected.required} onChange={(e) => updateField(selected.id, { required: e.target.checked })} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>
              {selected.type === "select" && selected.options && (
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Options</label>
                  <div className="space-y-1.5">
                    {selected.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <GripVertical className="w-3 h-3 text-gray-300" />
                        <input type="text" value={opt}
                          onChange={(e) => {
                            const opts = [...(selected.options || [])];
                            opts[i] = e.target.value;
                            updateField(selected.id, { options: opts });
                          }}
                          className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        <button onClick={() => updateField(selected.id, { options: selected.options?.filter((_, j) => j !== i) })}
                          className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => updateField(selected.id, { options: [...(selected.options || []), `Option ${(selected.options?.length || 0) + 1}`] })}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Add option</button>
                  </div>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100">
                <button onClick={() => removeField(selected.id)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Field
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
