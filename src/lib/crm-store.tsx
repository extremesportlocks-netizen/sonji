"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

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
  contactEmail?: string;
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
// API HELPERS
// ════════════════════════════════════════

async function apiFetch<T>(url: string, options?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || json.message || "Request failed" };
    return { data: json.data ?? json, error: null };
  } catch {
    return { data: null, error: "Network error" };
  }
}

function mapContactFromAPI(row: any): Contact {
  return {
    id: row.id,
    firstName: row.firstName || row.first_name || "",
    lastName: row.lastName || row.last_name || "",
    email: row.email || "",
    phone: row.phone || "",
    company: row.company || "",
    source: row.source || "",
    status: row.status || "active",
    tags: Array.isArray(row.tags) ? row.tags : [],
    score: row.score || Math.floor(Math.random() * 40) + 30,
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
  };
}

function mapDealFromAPI(row: any): Deal {
  return {
    id: row.id,
    title: row.title || "",
    value: Number(row.value) || 0,
    stage: row.stage || "Lead",
    pipeline: row.pipeline || "Default",
    contactId: row.contactId || row.contact_id || "",
    contactName: row.contactName || [row.contactFirstName, row.contactLastName].filter(Boolean).join(" ") || "",
    contactEmail: row.contactEmail || row.contact_email || "",
    assignedTo: row.assignedTo || row.assigned_to || "",
    closeDate: row.expectedClose || row.expected_close || "",
    notes: row.notes || "",
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
  };
}

function mapTaskFromAPI(row: any): Task {
  return {
    id: row.id,
    title: row.title || "",
    description: row.description || "",
    priority: row.priority || "medium",
    status: row.status || "todo",
    assignedTo: row.assignedTo || row.assigned_to || "",
    contactName: row.contactName || "",
    dueDate: row.dueDate || row.due_date || "",
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
  };
}

// ════════════════════════════════════════
// CONTEXT
// ════════════════════════════════════════

interface CRMStore {
  // State
  contacts: Contact[];
  deals: Deal[];
  tasks: Task[];
  meetings: Meeting[];
  activities: Activity[];
  loading: boolean;
  tenantResolved: boolean;

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

  // Refetch
  refresh: () => void;
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantResolved, setTenantResolved] = useState(false);

  // Fetch real data from API on mount
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsRes, dealsRes, tasksRes, meetingsRes] = await Promise.allSettled([
        apiFetch<any>("/api/contacts?pageSize=500"),
        apiFetch<any>("/api/deals?pageSize=500"),
        apiFetch<any>("/api/tasks?pageSize=500"),
        apiFetch<any>("/api/meetings"),
      ]);

      if (contactsRes.status === "fulfilled" && contactsRes.value.data) {
        const rows = Array.isArray(contactsRes.value.data) ? contactsRes.value.data : contactsRes.value.data.data || [];
        setContacts(rows.map(mapContactFromAPI));
        setTenantResolved(true);
      }

      if (dealsRes.status === "fulfilled" && dealsRes.value.data) {
        const rows = Array.isArray(dealsRes.value.data) ? dealsRes.value.data : dealsRes.value.data.data || [];
        setDeals(rows.map(mapDealFromAPI));
      }

      if (tasksRes.status === "fulfilled" && tasksRes.value.data) {
        const rows = Array.isArray(tasksRes.value.data) ? tasksRes.value.data : tasksRes.value.data.data || [];
        setTasks(rows.map(mapTaskFromAPI));
      }

      if (meetingsRes.status === "fulfilled" && meetingsRes.value.data) {
        const rows = Array.isArray(meetingsRes.value.data) ? meetingsRes.value.data : meetingsRes.value.data.data || [];
        setMeetings(rows.map((m: any) => ({
          id: m.id,
          title: m.title || "Meeting",
          contactName: m.contactName || "",
          date: m.startsAt ? new Date(m.startsAt).toISOString().split("T")[0] : "",
          startTime: m.startsAt ? new Date(m.startsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "",
          endTime: m.endsAt ? new Date(m.endsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "",
          type: m.type || "call",
          location: m.location || "",
          notes: m.notes || "",
          createdAt: m.createdAt || "",
        })));
      }
    } catch (err) {
      console.error("[CRM] Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const logActivity = useCallback((type: Activity["type"], description: string, contactName?: string) => {
    setActivities((prev) => [{ id: genId(), type, description, timestamp: new Date().toISOString(), contactName }, ...prev]);
  }, []);

  // ── Contacts ──
  const addContact = useCallback((data: Omit<Contact, "id" | "createdAt" | "score">) => {
    const contact: Contact = { ...data, id: genId(), createdAt: today(), score: Math.floor(Math.random() * 40) + 30 };
    setContacts((prev) => [contact, ...prev]);
    logActivity("contact_created", `${data.firstName} ${data.lastName} added`, `${data.firstName} ${data.lastName}`);

    // Persist to API (fire-and-forget)
    apiFetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        source: data.source,
        status: data.status,
        tags: data.tags,
      }),
    }).then(res => {
      // Replace temp ID with real DB ID
      if (res.data && (res.data as any).id) {
        setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, id: (res.data as any).id } : c));
      }
    });

    return contact;
  }, [logActivity]);

  const updateContact = useCallback((id: string, data: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    apiFetch(`/api/contacts?id=${id}`, { method: "DELETE" });
  }, []);

  // ── Deals ──
  const addDeal = useCallback((data: Omit<Deal, "id" | "createdAt">) => {
    const deal: Deal = { ...data, id: genId(), createdAt: today() };
    setDeals((prev) => [deal, ...prev]);
    logActivity("deal_created", `${data.title} — $${data.value.toLocaleString()}`, data.contactName);

    apiFetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        value: data.value,
        stage: data.stage,
        contactName: data.contactName,
        notes: data.notes,
      }),
    });

    return deal;
  }, [logActivity]);

  const updateDeal = useCallback((id: string, data: Partial<Deal>) => {
    setDeals((prev) => prev.map((d) => d.id === id ? { ...d, ...data } : d));
    // Persist to API
    apiFetch(`/api/deals?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  }, []);

  const moveDeal = useCallback((id: string, newStage: string) => {
    setDeals((prev) => prev.map((d) => {
      if (d.id !== id) return d;
      logActivity("deal_moved", `${d.title} moved to ${newStage}`, d.contactName);
      if (newStage === "Closed Won") logActivity("deal_won", `${d.title} — $${d.value.toLocaleString()} closed!`, d.contactName);
      return { ...d, stage: newStage };
    }));
    // Persist stage change to API
    apiFetch(`/api/deals?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    }).catch(() => {});
  }, [logActivity]);

  const deleteDeal = useCallback((id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
    apiFetch(`/api/deals?id=${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  // ── Tasks ──
  const addTask = useCallback((data: Omit<Task, "id" | "createdAt">) => {
    const task: Task = { ...data, id: genId(), createdAt: today() };
    setTasks((prev) => [task, ...prev]);
    logActivity("task_created", data.title, data.contactName);

    apiFetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate,
      }),
    });

    return task;
  }, [logActivity]);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...data } : t));
    apiFetch(`/api/tasks?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    apiFetch(`/api/tasks?id=${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  // ── Meetings ──
  const addMeeting = useCallback((data: Omit<Meeting, "id" | "createdAt">) => {
    const meeting: Meeting = { ...data, id: genId(), createdAt: today() };
    setMeetings((prev) => [meeting, ...prev]);
    logActivity("meeting_scheduled", `${data.title} — ${data.date} at ${data.startTime}`, data.contactName);

    apiFetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        contactName: data.contactName,
        startTime: `${data.date}T${data.startTime}`,
        endTime: data.endTime ? `${data.date}T${data.endTime}` : undefined,
        type: data.type || "call",
        location: data.location || "",
      }),
    }).catch(() => {});

    return meeting;
  }, [logActivity]);

  const deleteMeeting = useCallback((id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    apiFetch(`/api/meetings?id=${id}`, { method: "DELETE" }).catch(() => {});
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
      contacts, deals, tasks, meetings, activities, loading, tenantResolved,
      addContact, updateContact, deleteContact,
      addDeal, updateDeal, moveDeal, deleteDeal,
      addTask, updateTask, deleteTask,
      addMeeting, deleteMeeting,
      logActivity, stats, refresh: fetchData,
    }}>
      {children}
    </CRMContext.Provider>
  );
}
