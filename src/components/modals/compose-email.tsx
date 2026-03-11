"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { Send, Paperclip, Bold, Italic, List, Link2, Image, X, ChevronDown, Sparkles } from "lucide-react";

interface ComposeEmailModalProps { open: boolean; onClose: () => void; prefillTo?: string; prefillSubject?: string; }

const contacts = [
  { name: "Mason Thompson", email: "mason@vertexpartners.com" },
  { name: "Sarah Chen", email: "sarah@dataflowsolutions.com" },
  { name: "Lucas Anderson", email: "lucas@techventures.io" },
  { name: "Aiden Parker", email: "aiden@brightdynamics.com" },
  { name: "Daniel Kim", email: "daniel@fusionlabs.co" },
  { name: "Emily Rodriguez", email: "emily@pulsemedia.co" },
];

export default function ComposeEmailModal({ open, onClose, prefillTo = "", prefillSubject = "" }: ComposeEmailModalProps) {
  const [to, setTo] = useState(prefillTo);
  const [cc, setCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState(prefillSubject);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showAiDraft, setShowAiDraft] = useState(false);

  const handleSend = () => { setSending(true); setTimeout(() => { setSending(false); onClose(); }, 1200); };

  const aiDraft = () => {
    setShowAiDraft(true);
    setTimeout(() => {
      setBody(`Hi ${to.split("@")[0] || "there"},\n\nThank you for your interest in our platform. I wanted to follow up on our recent conversation and share a few key points:\n\n1. Our implementation timeline is typically 2-3 weeks for teams your size\n2. All features are included in your plan — no hidden fees or add-ons\n3. We offer a dedicated onboarding specialist for the first 30 days\n\nWould you be available for a 30-minute call this week to walk through the next steps?\n\nBest regards,\nOrlando`);
      setShowAiDraft(false);
    }, 1500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Compose Email" size="lg">
      <div className="space-y-3">
        {/* To */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <span className="text-xs text-gray-400 w-8 flex-shrink-0">To</span>
          <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Start typing a name or email..."
            className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none" list="contacts-list" />
          <datalist id="contacts-list">
            {contacts.map((c) => <option key={c.email} value={c.email}>{c.name}</option>)}
          </datalist>
          {!showCc && <button onClick={() => setShowCc(true)} className="text-xs text-gray-400 hover:text-gray-600">Cc</button>}
        </div>

        {/* Cc */}
        {showCc && (
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-xs text-gray-400 w-8 flex-shrink-0">Cc</span>
            <input type="text" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Add Cc recipients..."
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none" />
          </div>
        )}

        {/* Subject */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <span className="text-xs text-gray-400 w-8 flex-shrink-0">Subj</span>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject..."
            className="flex-1 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none" />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 py-1 border-b border-gray-100">
          {[Bold, Italic, List, Link2, Image].map((Icon, i) => (
            <button key={i} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={aiDraft}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition">
            {showAiDraft ? <div className="w-3 h-3 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {showAiDraft ? "Drafting..." : "AI Draft"}
          </button>
        </div>

        {/* Body */}
        <textarea
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email..."
          className="w-full text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none leading-relaxed resize-none"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <Paperclip className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400">Sending as contact@sonji.io</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Discard</button>
          <button onClick={handleSend} disabled={!to || !subject || sending}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50">
            {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
