"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  tags: string[];
  score: number;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  pipeline: string;
  contactId: string;
  contactName: string;
  assignedTo: string;
  closeDate: string;
  notes: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  assignedTo: string;
  contactName: string;
  dueDate: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "virtual" | "in-person" | "phone";
  location: string;
  participants: string[];
  contactName: string;
  notes: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: "contact_created" | "deal_created" | "task_created" | "meeting_scheduled" | "email_sent" | "import_completed" | "deal_moved" | "deal_won";
  description: string;
  timestamp: string;
  contactName?: string;
}

// ════════════════════════════════════════
// SEED DATA
// ════════════════════════════════════════

const seedContacts: Contact[] = [
  { id: "c1", firstName: "Mason", lastName: "Thompson", email: "mason@vertexpartners.com", phone: "(305) 555-0142", company: "Vertex Partners", source: "referral", status: "active", tags: ["Hot Lead", "Enterprise"], score: 92, createdAt: "2026-03-01" },
  { id: "c2", firstName: "Sarah", lastName: "Chen", email: "sarah@dataflowsolutions.com", phone: "(415) 555-0198", company: "DataFlow Solutions", source: "website", status: "active", tags: ["Demo Scheduled"], score: 78, createdAt: "2026-03-03" },
  { id: "c3", firstName: "Lucas", lastName: "Anderson", email: "lucas@techventures.io", phone: "(212) 555-0167", company: "TechVentures Inc", source: "referral", status: "active", tags: ["Compliance"], score: 65, createdAt: "2026-02-15" },
  { id: "c4", firstName: "Aiden", lastName: "Parker", email: "aiden@brightdynamics.com", phone: "(678) 555-0134", company: "Bright Dynamics", source: "website", status: "active", tags: ["Closing"], score: 71, createdAt: "2026-02-20" },
  { id: "c5", firstName: "Daniel", lastName: "Kim", email: "daniel@fusionlabs.co", phone: "(510) 555-0189", company: "Fusion Labs", source: "form", status: "lead", tags: ["Inbound", "GHL Switch"], score: 33, createdAt: "2026-03-10" },
  { id: "c6", firstName: "Emily", lastName: "Rodriguez", email: "emily@pulsemedia.co", phone: "(323) 555-0156", company: "Pulse Media", source: "social", status: "active", tags: ["Billing"], score: 54, createdAt: "2026-02-10" },
  { id: "c7", firstName: "Jackson", lastName: "Brooks", email: "jackson@halocollar.com", phone: "(904) 555-0123", company: "Halo Collar", source: "referral", status: "active", tags: ["Pilot", "Won"], score: 88, createdAt: "2026-01-20" },
];

const seedDeals: Deal[] = [
  { id: "d1", title: "Enterprise Migration", value: 24000, stage: "Proposal Sent", pipeline: "Default", contactId: "c1", contactName: "Mason Thompson", assignedTo: "Orlando", closeDate: "2026-03-30", notes: "", createdAt: "2026-03-01" },
  { id: "d2", title: "DataFlow Platform", value: 8500, stage: "Meeting Booked", pipeline: "Default", contactId: "c2", contactName: "Sarah Chen", assignedTo: "Orlando", closeDate: "2026-04-15", notes: "", createdAt: "2026-03-03" },
  { id: "d3", title: "TechVentures SOW", value: 15750, stage: "Negotiation", pipeline: "Default", contactId: "c3", contactName: "Lucas Anderson", assignedTo: "Orlando", closeDate: "2026-03-20", notes: "", createdAt: "2026-02-15" },
  { id: "d4", title: "Bright Dynamics Retainer", value: 6200, stage: "Proposal Sent", pipeline: "Default", contactId: "c4", contactName: "Aiden Parker", assignedTo: "Orlando", closeDate: "2026-04-01", notes: "", createdAt: "2026-02-20" },
  { id: "d5", title: "Halo Collar Pilot", value: 31500, stage: "Closed Won", pipeline: "Default", contactId: "c7", contactName: "Jackson Brooks", assignedTo: "Orlando", closeDate: "2026-03-10", notes: "", createdAt: "2026-01-20" },
  { id: "d6", title: "Fusion Labs CRM Switch", value: 12800, stage: "Lead", pipeline: "Default", contactId: "c5", contactName: "Daniel Kim", assignedTo: "Orlando", closeDate: "2026-05-01", notes: "Switching from GoHighLevel", createdAt: "2026-03-10" },
];

const seedTasks: Task[] = [
  { id: "t1", title: "Follow up with Mason on proposal", description: "", priority: "high", status: "todo", assignedTo: "Orlando", contactName: "Mason Thompson", dueDate: "2026-03-13", createdAt: "2026-03-11" },
  { id: "t2", title: "Prep demo for Sarah Chen", description: "Thursday 2pm EST", priority: "high", status: "in_progress", assignedTo: "Orlando", contactName: "Sarah Chen", dueDate: "2026-03-14", createdAt: "2026-03-11" },
  { id: "t3", title: "Send SOC 2 docs to Lucas", description: "", priority: "medium", status: "todo", assignedTo: "Orlando", contactName: "Lucas Anderson", dueDate: "2026-03-14", createdAt: "2026-03-12" },
  { id: "t4", title: "Review Aiden's signed SOW", description: "", priority: "medium", status: "todo", assignedTo: "Orlando", contactName: "Aiden Parker", dueDate: "2026-03-17", createdAt: "2026-03-12" },
  { id: "t5", title: "Onboard Halo Collar", description: "Set up pilot environment", priority: "high", status: "done", assignedTo: "Orlando", contactName: "Jackson Brooks", dueDate: "2026-03-10", createdAt: "2026-03-08" },
];

const seedMeetings: Meeting[] = [
  { id: "m1", title: "Demo — DataFlow Solutions", date: "2026-03-14", startTime: "14:00", endTime: "15:00", type: "virtual", location: "https://meet.google.com/abc", participants: ["Orlando", "Sarah Chen"], contactName: "Sarah Chen", notes: "CTO joining too", createdAt: "2026-03-11" },
  { id: "m2", title: "Proposal Review — TechVentures", date: "2026-03-15", startTime: "10:00", endTime: "10:30", type: "virtual", location: "", participants: ["Orlando", "Lucas Anderson"], contactName: "Lucas Anderson", notes: "", createdAt: "2026-03-12" },
];

// ════════════════════════════════════════
// CONTEXT
// ════════════════════════════════════════

interface CRMStore {
  // Data
  contacts: Contact[];
  deals: Deal[];
  tasks: Task[];
  meetings: Meeting[];
  activities: Activity[];

  // Contact CRUD
  addContact: (data: Omit<Contact, "id" | "createdAt" | "score">) => Contact;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Deal CRUD
  addDeal: (data: Omit<Deal, "id" | "createdAt">) => Deal;
  updateDeal: (id: string, data: Partial<Deal>) => void;
  moveDeal: (id: string, newStage: string) => void;
  deleteDeal: (id: string) => void;

  // Task CRUD
  addTask: (data: Omit<Task, "id" | "createdAt">) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Meeting CRUD
  addMeeting: (data: Omit<Meeting, "id" | "createdAt">) => Meeting;
  deleteMeeting: (id: string) => void;

  // Activity log
  logActivity: (type: Activity["type"], description: string, contactName?: string) => void;

  // Stats
  stats: {
    totalContacts: number;
    totalDeals: number;
    pipelineValue: number;
    wonValue: number;
    tasksOverdue: number;
    tasksDone: number;
  };
}

const CRMContext = createContext<CRMStore | null>(null);

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error("useCRM must be used within CRMProvider");
  return ctx;
}

// ════════════════════════════════════════
// PROVIDER
// ════════════════════════════════════════

function genId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function today() { return new Date().toISOString().split("T")[0]; }

export function CRMProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(seedContacts);
  const [deals, setDeals] = useState<Deal[]>(seedDeals);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [meetings, setMeetings] = useState<Meeting[]>(seedMeetings);
  const [activities, setActivities] = useState<Activity[]>([
    { id: "a1", type: "deal_won", description: "Halo Collar Pilot — $31,500 closed", timestamp: "2026-03-10T14:30:00", contactName: "Jackson Brooks" },
    { id: "a2", type: "contact_created", description: "Daniel Kim added from intake form", timestamp: "2026-03-10T05:30:00", contactName: "Daniel Kim" },
    { id: "a3", type: "meeting_scheduled", description: "Demo with DataFlow Solutions — Thursday 2pm", timestamp: "2026-03-11T09:15:00", contactName: "Sarah Chen" },
  ]);

  const logActivity = useCallback((type: Activity["type"], description: string, contactName?: string) => {
    setActivities((prev) => [{ id: genId(), type, description, timestamp: new Date().toISOString(), contactName }, ...prev]);
  }, []);

  // ── Contacts ──
  const addContact = useCallback((data: Omit<Contact, "id" | "createdAt" | "score">) => {
    const contact: Contact = { ...data, id: genId(), createdAt: today(), score: Math.floor(Math.random() * 40) + 30 };
    setContacts((prev) => [contact, ...prev]);
    logActivity("contact_created", `${data.firstName} ${data.lastName} added`, `${data.firstName} ${data.lastName}`);
    return contact;
  }, [logActivity]);

  const updateContact = useCallback((id: string, data: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ── Deals ──
  const addDeal = useCallback((data: Omit<Deal, "id" | "createdAt">) => {
    const deal: Deal = { ...data, id: genId(), createdAt: today() };
    setDeals((prev) => [deal, ...prev]);
    logActivity("deal_created", `${data.title} — $${data.value.toLocaleString()}`, data.contactName);
    return deal;
  }, [logActivity]);

  const updateDeal = useCallback((id: string, data: Partial<Deal>) => {
    setDeals((prev) => prev.map((d) => d.id === id ? { ...d, ...data } : d));
  }, []);

  const moveDeal = useCallback((id: string, newStage: string) => {
    setDeals((prev) => prev.map((d) => {
      if (d.id !== id) return d;
      logActivity("deal_moved", `${d.title} moved to ${newStage}`, d.contactName);
      if (newStage === "Closed Won") logActivity("deal_won", `${d.title} — $${d.value.toLocaleString()} closed!`, d.contactName);
      return { ...d, stage: newStage };
    }));
  }, [logActivity]);

  const deleteDeal = useCallback((id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ── Tasks ──
  const addTask = useCallback((data: Omit<Task, "id" | "createdAt">) => {
    const task: Task = { ...data, id: genId(), createdAt: today() };
    setTasks((prev) => [task, ...prev]);
    logActivity("task_created", data.title, data.contactName);
    return task;
  }, [logActivity]);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...data } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Meetings ──
  const addMeeting = useCallback((data: Omit<Meeting, "id" | "createdAt">) => {
    const meeting: Meeting = { ...data, id: genId(), createdAt: today() };
    setMeetings((prev) => [meeting, ...prev]);
    logActivity("meeting_scheduled", `${data.title} — ${data.date} at ${data.startTime}`, data.contactName);
    return meeting;
  }, [logActivity]);

  const deleteMeeting = useCallback((id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ── Computed Stats ──
  const stats = {
    totalContacts: contacts.length,
    totalDeals: deals.length,
    pipelineValue: deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost").reduce((s, d) => s + d.value, 0),
    wonValue: deals.filter((d) => d.stage === "Closed Won").reduce((s, d) => s + d.value, 0),
    tasksOverdue: tasks.filter((t) => t.status !== "done" && t.dueDate < today()).length,
    tasksDone: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <CRMContext.Provider value={{
      contacts, deals, tasks, meetings, activities,
      addContact, updateContact, deleteContact,
      addDeal, updateDeal, moveDeal, deleteDeal,
      addTask, updateTask, deleteTask,
      addMeeting, deleteMeeting,
      logActivity, stats,
    }}>
      {children}
    </CRMContext.Provider>
  );
}
