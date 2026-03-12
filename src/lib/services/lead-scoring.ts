/**
 * LEAD SCORING ENGINE
 *
 * Calculates a 0-100 score for each contact based on configurable rules.
 * Supports demographic scoring (who they are) and behavioral scoring (what they do).
 * Pure logic — no database dependency.
 */

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface ScoringRule {
  id: string;
  category: "demographic" | "behavioral" | "engagement";
  field: string;
  condition: "equals" | "contains" | "greater_than" | "less_than" | "exists" | "in_list";
  value: any;
  points: number; // positive = good, negative = bad
  description: string;
}

export interface ScoringProfile {
  name: string;
  maxScore: number;
  rules: ScoringRule[];
  thresholds: {
    hot: number;     // score >= this = hot lead
    warm: number;    // score >= this = warm lead
    cold: number;    // below warm = cold
  };
}

export interface ContactData {
  // Demographic
  email?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  source?: string;
  status?: string;
  customFields?: Record<string, any>;

  // Behavioral (activity counts)
  emailsOpened?: number;
  emailsClicked?: number;
  formsSubmitted?: number;
  meetingsAttended?: number;
  pageViews?: number;
  lastActivityDaysAgo?: number;
  totalInteractions?: number;
  dealValue?: number;
  dealStage?: string;

  // Time-based
  daysSinceCreated?: number;
  daysSinceLastContact?: number;
}

export interface ScoreResult {
  totalScore: number;
  maxPossible: number;
  percentage: number;
  grade: "A" | "B" | "C" | "D" | "F";
  temperature: "hot" | "warm" | "cold";
  breakdown: { rule: ScoringRule; matched: boolean; pointsAwarded: number }[];
  topFactors: string[];
  recommendations: string[];
}

// ════════════════════════════════════════
// SCORING ENGINE
// ════════════════════════════════════════

/**
 * Score a contact against a scoring profile.
 */
export function scoreContact(contact: ContactData, profile: ScoringProfile): ScoreResult {
  const breakdown: ScoreResult["breakdown"] = [];
  let totalScore = 0;
  let maxPossible = 0;

  for (const rule of profile.rules) {
    const fieldValue = getFieldValue(contact, rule.field);
    const matched = evaluateRule(fieldValue, rule.condition, rule.value);
    const pointsAwarded = matched ? rule.points : 0;

    if (rule.points > 0) maxPossible += rule.points;
    totalScore += pointsAwarded;

    breakdown.push({ rule, matched, pointsAwarded });
  }

  // Clamp score
  totalScore = Math.max(0, Math.min(totalScore, profile.maxScore));
  const percentage = Math.round((totalScore / profile.maxScore) * 100);

  // Determine temperature
  const temperature = totalScore >= profile.thresholds.hot ? "hot"
    : totalScore >= profile.thresholds.warm ? "warm"
    : "cold";

  // Determine grade
  const grade = percentage >= 90 ? "A"
    : percentage >= 70 ? "B"
    : percentage >= 50 ? "C"
    : percentage >= 30 ? "D"
    : "F";

  // Top positive factors
  const topFactors = breakdown
    .filter((b) => b.matched && b.pointsAwarded > 0)
    .sort((a, b) => b.pointsAwarded - a.pointsAwarded)
    .slice(0, 3)
    .map((b) => b.rule.description);

  // Recommendations
  const recommendations = generateRecommendations(contact, breakdown, temperature);

  return { totalScore, maxPossible, percentage, grade, temperature, breakdown, topFactors, recommendations };
}

/**
 * Score multiple contacts and return sorted by score.
 */
export function scoreContacts(
  contacts: { id: string; data: ContactData }[],
  profile: ScoringProfile
): { id: string; score: ScoreResult }[] {
  return contacts
    .map((c) => ({ id: c.id, score: scoreContact(c.data, profile) }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore);
}

// ════════════════════════════════════════
// RULE EVALUATION
// ════════════════════════════════════════

function getFieldValue(contact: ContactData, field: string): any {
  if (field.startsWith("customFields.")) {
    return contact.customFields?.[field.replace("customFields.", "")];
  }
  return (contact as any)[field];
}

function evaluateRule(fieldValue: any, condition: string, compareValue: any): boolean {
  switch (condition) {
    case "equals":
      return String(fieldValue).toLowerCase() === String(compareValue).toLowerCase();
    case "contains":
      if (Array.isArray(fieldValue)) return fieldValue.some((v: string) => String(v).toLowerCase().includes(String(compareValue).toLowerCase()));
      return String(fieldValue || "").toLowerCase().includes(String(compareValue).toLowerCase());
    case "greater_than":
      return Number(fieldValue || 0) > Number(compareValue);
    case "less_than":
      return Number(fieldValue || 0) < Number(compareValue);
    case "exists":
      return fieldValue !== null && fieldValue !== undefined && String(fieldValue).trim() !== "";
    case "in_list":
      const list = Array.isArray(compareValue) ? compareValue : String(compareValue).split(",").map((s: string) => s.trim().toLowerCase());
      return list.includes(String(fieldValue).toLowerCase());
    default:
      return false;
  }
}

function generateRecommendations(
  contact: ContactData,
  breakdown: ScoreResult["breakdown"],
  temperature: string
): string[] {
  const recs: string[] = [];

  if (temperature === "hot") {
    recs.push("Priority follow-up — this lead is highly engaged");
    if (!contact.meetingsAttended) recs.push("Schedule a discovery call immediately");
  }
  if (temperature === "warm") {
    recs.push("Send a personalized follow-up email");
    if ((contact.emailsOpened || 0) > 0 && !contact.emailsClicked) recs.push("Try a more compelling CTA — they open but don't click");
  }
  if (temperature === "cold") {
    recs.push("Add to nurture sequence");
    if ((contact.daysSinceLastContact || 0) > 30) recs.push("Re-engagement campaign — no activity in 30+ days");
  }

  if (!contact.phone) recs.push("Missing phone number — try to capture in next interaction");
  if (!contact.company) recs.push("Missing company info — qualify further");
  if ((contact.formsSubmitted || 0) > 1) recs.push("Submitted multiple forms — high intent signal");

  return recs.slice(0, 4);
}

// ════════════════════════════════════════
// DEFAULT SCORING PROFILES
// ════════════════════════════════════════

export const DEFAULT_SCORING_PROFILE: ScoringProfile = {
  name: "Standard Lead Scoring",
  maxScore: 100,
  thresholds: { hot: 70, warm: 40, cold: 0 },
  rules: [
    // Demographic (who they are) — up to 40 points
    { id: "d1", category: "demographic", field: "email", condition: "exists", value: true, points: 10, description: "Has email address" },
    { id: "d2", category: "demographic", field: "phone", condition: "exists", value: true, points: 10, description: "Has phone number" },
    { id: "d3", category: "demographic", field: "company", condition: "exists", value: true, points: 5, description: "Has company name" },
    { id: "d4", category: "demographic", field: "source", condition: "in_list", value: "referral,partner", points: 10, description: "Came from referral or partner" },
    { id: "d5", category: "demographic", field: "source", condition: "equals", value: "website", points: 5, description: "Came from website" },

    // Behavioral (what they do) — up to 45 points
    { id: "b1", category: "behavioral", field: "emailsOpened", condition: "greater_than", value: 0, points: 5, description: "Opened at least one email" },
    { id: "b2", category: "behavioral", field: "emailsClicked", condition: "greater_than", value: 0, points: 10, description: "Clicked a link in an email" },
    { id: "b3", category: "behavioral", field: "formsSubmitted", condition: "greater_than", value: 0, points: 15, description: "Submitted an intake form" },
    { id: "b4", category: "behavioral", field: "meetingsAttended", condition: "greater_than", value: 0, points: 15, description: "Attended a meeting" },

    // Engagement (recency) — up to 15 points
    { id: "e1", category: "engagement", field: "lastActivityDaysAgo", condition: "less_than", value: 7, points: 15, description: "Active in last 7 days" },
    { id: "e2", category: "engagement", field: "lastActivityDaysAgo", condition: "less_than", value: 30, points: 8, description: "Active in last 30 days" },

    // Negative signals
    { id: "n1", category: "engagement", field: "daysSinceLastContact", condition: "greater_than", value: 60, points: -15, description: "No contact in 60+ days" },
    { id: "n2", category: "behavioral", field: "status", condition: "equals", value: "inactive", points: -20, description: "Marked as inactive" },
  ],
};

/**
 * Get score label and color for display.
 */
export function getScoreDisplay(score: number): { label: string; color: string; bg: string } {
  if (score >= 70) return { label: "Hot", color: "text-red-600", bg: "bg-red-50 border-red-200" };
  if (score >= 40) return { label: "Warm", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  return { label: "Cold", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
}
