/**
 * ANALYTICS AGGREGATION ENGINE
 *
 * Computes dashboard metrics, pipeline statistics, revenue trends,
 * team performance, and funnel conversions from raw data.
 * Pure logic — accepts arrays of data, returns computed metrics.
 */

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface DashboardMetrics {
  contacts: { total: number; new: number; active: number; leads: number; trend: number };
  deals: { total: number; open: number; won: number; lost: number; pipelineValue: number; wonValue: number; trend: number };
  revenue: { total: number; monthly: number; avgDealSize: number; trend: number };
  tasks: { total: number; completed: number; overdue: number; completionRate: number };
  activities: { total: number; calls: number; emails: number; meetings: number };
}

export interface PipelineMetrics {
  stages: { name: string; count: number; value: number; avgDays: number; conversionRate: number; color: string }[];
  totalValue: number;
  avgDealSize: number;
  avgCycleLength: number;
  winRate: number;
  velocityPerDay: number;
}

export interface RevenueTrend {
  period: string;
  revenue: number;
  deals: number;
  avgDealSize: number;
}

export interface TeamMemberMetrics {
  userId: string;
  name: string;
  deals: { open: number; won: number; lost: number; value: number };
  activities: { calls: number; emails: number; meetings: number; tasks: number };
  score: number; // composite performance score 0-100
}

export interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
}

// ════════════════════════════════════════
// RAW DATA TYPES (what comes from the database)
// ════════════════════════════════════════

export interface RawContact {
  id: string;
  status: string;
  createdAt: Date;
}

export interface RawDeal {
  id: string;
  stage: string;
  value: number;
  status: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  expectedClose?: Date;
}

export interface RawActivity {
  id: string;
  action: string;
  userId?: string;
  createdAt: Date;
}

export interface RawTask {
  id: string;
  status: string;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
}

// ════════════════════════════════════════
// DASHBOARD METRICS
// ════════════════════════════════════════

/**
 * Compute all dashboard overview metrics.
 */
export function computeDashboardMetrics(
  contacts: RawContact[],
  deals: RawDeal[],
  activities: RawActivity[],
  tasks: RawTask[],
  daysBack: number = 30
): DashboardMetrics {
  const now = new Date();
  const periodStart = new Date(now.getTime() - daysBack * 86400000);
  const prevPeriodStart = new Date(periodStart.getTime() - daysBack * 86400000);

  // Contacts
  const newContacts = contacts.filter((c) => c.createdAt >= periodStart);
  const prevNewContacts = contacts.filter((c) => c.createdAt >= prevPeriodStart && c.createdAt < periodStart);
  const contactTrend = prevNewContacts.length > 0 ? ((newContacts.length - prevNewContacts.length) / prevNewContacts.length) * 100 : 0;

  // Deals
  const openDeals = deals.filter((d) => d.status === "open");
  const wonDeals = deals.filter((d) => d.status === "won" || d.stage.toLowerCase().includes("won"));
  const lostDeals = deals.filter((d) => d.status === "lost" || d.stage.toLowerCase().includes("lost"));
  const periodWon = wonDeals.filter((d) => d.updatedAt >= periodStart);
  const prevPeriodWon = wonDeals.filter((d) => d.updatedAt >= prevPeriodStart && d.updatedAt < periodStart);
  const dealTrend = prevPeriodWon.length > 0 ? ((periodWon.length - prevPeriodWon.length) / prevPeriodWon.length) * 100 : 0;

  const pipelineValue = openDeals.reduce((s, d) => s + (d.value || 0), 0);
  const wonValue = periodWon.reduce((s, d) => s + (d.value || 0), 0);

  // Revenue
  const totalRevenue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const monthlyRevenue = wonValue;
  const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
  const prevRevenue = prevPeriodWon.reduce((s, d) => s + (d.value || 0), 0);
  const revenueTrend = prevRevenue > 0 ? ((wonValue - prevRevenue) / prevRevenue) * 100 : 0;

  // Tasks
  const completedTasks = tasks.filter((t) => t.status === "done" || t.completedAt);
  const overdueTasks = tasks.filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now);
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  // Activities
  const periodActivities = activities.filter((a) => a.createdAt >= periodStart);
  const calls = periodActivities.filter((a) => a.action.includes("call")).length;
  const emails = periodActivities.filter((a) => a.action.includes("email")).length;
  const meetings = periodActivities.filter((a) => a.action.includes("meeting")).length;

  return {
    contacts: {
      total: contacts.length,
      new: newContacts.length,
      active: contacts.filter((c) => c.status === "active").length,
      leads: contacts.filter((c) => c.status === "lead").length,
      trend: Math.round(contactTrend),
    },
    deals: {
      total: deals.length,
      open: openDeals.length,
      won: wonDeals.length,
      lost: lostDeals.length,
      pipelineValue,
      wonValue,
      trend: Math.round(dealTrend),
    },
    revenue: {
      total: totalRevenue,
      monthly: monthlyRevenue,
      avgDealSize: Math.round(avgDealSize),
      trend: Math.round(revenueTrend),
    },
    tasks: {
      total: tasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      completionRate: Math.round(completionRate),
    },
    activities: {
      total: periodActivities.length,
      calls,
      emails,
      meetings,
    },
  };
}

// ════════════════════════════════════════
// PIPELINE METRICS
// ════════════════════════════════════════

/**
 * Compute pipeline breakdown with conversion rates.
 */
export function computePipelineMetrics(
  deals: RawDeal[],
  stageConfig: { name: string; order: number; color: string }[]
): PipelineMetrics {
  const stageMap = new Map<string, RawDeal[]>();
  for (const deal of deals) {
    if (!stageMap.has(deal.stage)) stageMap.set(deal.stage, []);
    stageMap.get(deal.stage)!.push(deal);
  }

  const totalDeals = deals.length;
  const stages = stageConfig.map((s) => {
    const stageDeals = stageMap.get(s.name) || [];
    const value = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const avgDays = stageDeals.length > 0
      ? stageDeals.reduce((sum, d) => sum + daysBetween(d.createdAt, d.updatedAt), 0) / stageDeals.length
      : 0;
    const conversionRate = totalDeals > 0 ? (stageDeals.length / totalDeals) * 100 : 0;

    return { name: s.name, count: stageDeals.length, value, avgDays: Math.round(avgDays), conversionRate: Math.round(conversionRate), color: s.color };
  });

  const wonDeals = deals.filter((d) => d.stage.toLowerCase().includes("won"));
  const lostDeals = deals.filter((d) => d.stage.toLowerCase().includes("lost"));
  const closedDeals = wonDeals.length + lostDeals.length;
  const winRate = closedDeals > 0 ? (wonDeals.length / closedDeals) * 100 : 0;

  const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0;
  const avgCycleLength = closedDeals > 0
    ? [...wonDeals, ...lostDeals].reduce((s, d) => s + daysBetween(d.createdAt, d.updatedAt), 0) / closedDeals
    : 0;

  const daysInPeriod = 30;
  const velocityPerDay = wonDeals.length > 0 ? wonDeals.reduce((s, d) => s + (d.value || 0), 0) / daysInPeriod : 0;

  return {
    stages,
    totalValue,
    avgDealSize: Math.round(avgDealSize),
    avgCycleLength: Math.round(avgCycleLength),
    winRate: Math.round(winRate),
    velocityPerDay: Math.round(velocityPerDay),
  };
}

// ════════════════════════════════════════
// REVENUE TRENDS
// ════════════════════════════════════════

/**
 * Compute monthly revenue trends for the last N months.
 */
export function computeRevenueTrends(
  deals: RawDeal[],
  months: number = 12
): RevenueTrend[] {
  const now = new Date();
  const trends: RevenueTrend[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const wonInMonth = deals.filter((d) =>
      (d.stage.toLowerCase().includes("won") || d.status === "won") &&
      d.updatedAt >= monthStart && d.updatedAt <= monthEnd
    );

    const revenue = wonInMonth.reduce((s, d) => s + (d.value || 0), 0);
    const avgDealSize = wonInMonth.length > 0 ? revenue / wonInMonth.length : 0;

    trends.push({
      period: monthStart.toLocaleString("en-US", { month: "short", year: "numeric" }),
      revenue,
      deals: wonInMonth.length,
      avgDealSize: Math.round(avgDealSize),
    });
  }

  return trends;
}

// ════════════════════════════════════════
// TEAM PERFORMANCE
// ════════════════════════════════════════

/**
 * Compute per-team-member performance metrics.
 */
export function computeTeamMetrics(
  deals: RawDeal[],
  activities: RawActivity[],
  tasks: RawTask[],
  teamMembers: { id: string; name: string }[]
): TeamMemberMetrics[] {
  return teamMembers.map((member) => {
    const memberDeals = deals.filter((d) => d.assignedTo === member.id);
    const memberActivities = activities.filter((a) => a.userId === member.id);
    const memberTasks = tasks.filter((t) => t.assignedTo === member.id);

    const openDeals = memberDeals.filter((d) => d.status === "open").length;
    const wonDeals = memberDeals.filter((d) => d.stage.toLowerCase().includes("won") || d.status === "won");
    const lostDeals = memberDeals.filter((d) => d.stage.toLowerCase().includes("lost") || d.status === "lost").length;
    const dealValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);

    const calls = memberActivities.filter((a) => a.action.includes("call")).length;
    const emails = memberActivities.filter((a) => a.action.includes("email")).length;
    const meetings = memberActivities.filter((a) => a.action.includes("meeting")).length;
    const completedTasks = memberTasks.filter((t) => t.status === "done").length;

    // Composite score: weighted by revenue (40%), activity (30%), win rate (20%), task completion (10%)
    const revenueScore = Math.min(dealValue / 50000, 1) * 40; // $50K = max score
    const activityScore = Math.min((calls + emails + meetings) / 50, 1) * 30; // 50 activities = max
    const winRate = (wonDeals.length + lostDeals) > 0 ? wonDeals.length / (wonDeals.length + lostDeals) : 0;
    const winRateScore = winRate * 20;
    const taskScore = memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 10 : 5;

    return {
      userId: member.id,
      name: member.name,
      deals: { open: openDeals, won: wonDeals.length, lost: lostDeals, value: dealValue },
      activities: { calls, emails, meetings, tasks: completedTasks },
      score: Math.round(revenueScore + activityScore + winRateScore + taskScore),
    };
  });
}

// ════════════════════════════════════════
// FUNNEL ANALYSIS
// ════════════════════════════════════════

/**
 * Compute a conversion funnel from stage progression data.
 */
export function computeFunnel(
  deals: RawDeal[],
  stageOrder: string[]
): FunnelStep[] {
  const stageCounts = new Map<string, number>();
  for (const stage of stageOrder) stageCounts.set(stage, 0);
  for (const deal of deals) {
    // A deal that reached stage N also passed through stages 0..N-1
    const dealStageIdx = stageOrder.indexOf(deal.stage);
    if (dealStageIdx === -1) continue;
    for (let i = 0; i <= dealStageIdx; i++) {
      stageCounts.set(stageOrder[i], (stageCounts.get(stageOrder[i]) || 0) + 1);
    }
  }

  const totalDeals = deals.length;
  return stageOrder.map((stage, i) => {
    const count = stageCounts.get(stage) || 0;
    const percentage = totalDeals > 0 ? Math.round((count / totalDeals) * 100) : 0;
    const prevCount = i > 0 ? (stageCounts.get(stageOrder[i - 1]) || 0) : totalDeals;
    const dropoff = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0;

    return { name: stage, count, percentage, dropoff };
  });
}

// ════════════════════════════════════════
// DATA EXPORT
// ════════════════════════════════════════

/**
 * Export contacts to CSV string.
 */
export function exportToCSV(
  rows: Record<string, any>[],
  columns: { key: string; label: string }[]
): string {
  const headers = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(",")
  ).join("\n");

  return `${headers}\n${body}`;
}

/**
 * Standard export column definitions per entity type.
 */
export const EXPORT_COLUMNS = {
  contacts: [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "source", label: "Source" },
    { key: "tags", label: "Tags" },
    { key: "createdAt", label: "Created" },
  ],
  deals: [
    { key: "title", label: "Deal Title" },
    { key: "value", label: "Value" },
    { key: "stage", label: "Stage" },
    { key: "status", label: "Status" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "expectedClose", label: "Expected Close" },
    { key: "createdAt", label: "Created" },
  ],
  invoices: [
    { key: "number", label: "Invoice Number" },
    { key: "contactName", label: "Client" },
    { key: "total", label: "Total" },
    { key: "status", label: "Status" },
    { key: "dueDate", label: "Due Date" },
    { key: "paidAt", label: "Paid At" },
  ],
};

// ════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════

function daysBetween(a: Date, b: Date): number {
  return Math.round(Math.abs(b.getTime() - a.getTime()) / 86400000);
}
