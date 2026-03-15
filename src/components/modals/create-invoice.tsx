"use client";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import { Plus, Trash2 } from "lucide-react";

interface LineItem { description: string; qty: number; price: number; }

export default function CreateInvoiceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [client, setClient] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", qty: 1, price: 0 }]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const updateItem = (idx: number, field: keyof LineItem, val: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: field === "description" ? val : parseFloat(val) || 0 } : item));
  };
  const addItem = () => setItems(prev => [...prev, { description: "", qty: 1, price: 0 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!client || items.length === 0) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setClient(""); setDueDate(""); setItems([{ description: "", qty: 1, price: 0 }]); setNotes("");
      onClose();
    }, 600);
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Invoice" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Client *</label>
            <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client name or email"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Line Items</label>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Description"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <input type="number" value={item.qty || ""} onChange={(e) => updateItem(idx, "qty", e.target.value)} placeholder="Qty"
                  className="w-16 px-3 py-2 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <input type="number" value={item.price || ""} onChange={(e) => updateItem(idx, "price", e.target.value)} placeholder="Price"
                  className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <span className="text-sm font-medium text-gray-700 w-20 text-right">${(item.qty * item.price).toFixed(2)}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2">
            <Plus className="w-3.5 h-3.5" /> Add line item
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500 mr-3">Total:</span>
          <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, thank you note..."
            rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
        <button onClick={handleSave} disabled={!client || saving}
          className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50">
          {saving ? "Creating..." : "Create Invoice"}
        </button>
      </div>
    </Modal>
  );
}
