/**
 * INDUSTRY CONFIGURATION
 * 
 * Central config that drives terminology, widget defaults, and UI
 * personalization per industry. Used across dashboard, contacts,
 * deals, and all demo views.
 */

export interface IndustryConfig {
  key: string;
  name: string;
  companyName: string;
  icon: string;
  // Terminology
  contactLabel: string;        // "Patient" / "Client" / "Member"
  contactLabelPlural: string;  // "Patients" / "Clients" / "Members"
  dealLabel: string;           // "Treatment" / "Project" / "Listing"
  dealLabelPlural: string;
  revenueLabel: string;        // "Revenue" / "Commission" / "Donations"
  // Tier labels
  highValueLabel: string;      // "VIP Patient" / "Whale" / "Major Donor"
  midTierLabel: string;
  lowTierLabel: string;
  // Dashboard widget defaults
  defaultLayout: string[];     // Widget types in order
  // Sonji Box
  sonjiBoxMetrics: string[];
  sonjiBoxLabels: Record<string, string>;
  gradientFrom: string;
  gradientTo: string;
}

const configs: Record<string, IndustryConfig> = {
  health_wellness: {
    key: "health_wellness", name: "Health & Wellness", companyName: "Glow Med Spa", icon: "♥",
    contactLabel: "Patient", contactLabelPlural: "Patients",
    dealLabel: "Treatment", dealLabelPlural: "Treatments",
    revenueLabel: "Revenue",
    highValueLabel: "VIP Patient", midTierLabel: "Regular Patient", lowTierLabel: "New Patient",
    defaultLayout: ["revenue_overview", "customer_tiers", "subscription_breakdown", "pipeline", "top_customers", "recent_contacts", "activity_feed", "campaign_stats"],
    sonjiBoxMetrics: ["total_revenue", "total_contacts", "active_subs", "whales", "avg_order"],
    sonjiBoxLabels: { total_revenue: "Revenue", total_contacts: "Patients", active_subs: "Active Patients", whales: "VIP Patients", avg_order: "Avg Treatment" },
    gradientFrom: "#0c4a6e", gradientTo: "#0369a1",
  },
  fitness_gym: {
    key: "fitness_gym", name: "Fitness & Gym", companyName: "Iron Republic Fitness", icon: "💪",
    contactLabel: "Member", contactLabelPlural: "Members",
    dealLabel: "Membership", dealLabelPlural: "Memberships",
    revenueLabel: "Revenue",
    highValueLabel: "VIP Member", midTierLabel: "Active Member", lowTierLabel: "Trial Member",
    defaultLayout: ["revenue_overview", "subscription_breakdown", "pipeline", "customer_tiers", "recent_contacts", "open_tasks", "activity_feed"],
    sonjiBoxMetrics: ["active_subs", "total_contacts", "total_revenue", "avg_ltv", "open_tasks"],
    sonjiBoxLabels: { active_subs: "Active Members", total_contacts: "Total Members", total_revenue: "Revenue", avg_ltv: "Avg Value", open_tasks: "At Risk" },
    gradientFrom: "#064e3b", gradientTo: "#047857",
  },
  beauty_salon: {
    key: "beauty_salon", name: "Beauty & Salon", companyName: "Luxe Beauty Studio", icon: "✂",
    contactLabel: "Client", contactLabelPlural: "Clients",
    dealLabel: "Appointment", dealLabelPlural: "Appointments",
    revenueLabel: "Revenue",
    highValueLabel: "VIP Client", midTierLabel: "Regular", lowTierLabel: "New Client",
    defaultLayout: ["revenue_overview", "pipeline", "subscription_breakdown", "customer_tiers", "recent_contacts", "campaign_stats", "activity_feed"],
    sonjiBoxMetrics: ["total_revenue", "total_contacts", "active_subs", "avg_order", "whales"],
    sonjiBoxLabels: { total_revenue: "Revenue", total_contacts: "Clients", active_subs: "Regulars", avg_order: "Avg Ticket", whales: "VIP Clients" },
    gradientFrom: "#881337", gradientTo: "#be123c",
  },
  agency_consulting: {
    key: "agency_consulting", name: "Agency & Consulting", companyName: "Power Marketing Agency", icon: "🏢",
    contactLabel: "Client", contactLabelPlural: "Clients",
    dealLabel: "Project", dealLabelPlural: "Projects",
    revenueLabel: "MRR",
    highValueLabel: "Enterprise", midTierLabel: "Growth", lowTierLabel: "Starter",
    defaultLayout: ["revenue_overview", "pipeline", "top_customers", "customer_tiers", "open_tasks", "recent_contacts", "activity_feed", "campaign_stats"],
    sonjiBoxMetrics: ["total_revenue", "active_subs", "total_deals", "avg_ltv", "avg_order"],
    sonjiBoxLabels: { total_revenue: "MRR", active_subs: "Active Retainers", total_deals: "Pipeline", avg_ltv: "Avg Client Value", avg_order: "Avg Retainer" },
    gradientFrom: "#312e81", gradientTo: "#4338ca",
  },
  real_estate: {
    key: "real_estate", name: "Real Estate", companyName: "Summit Realty Group", icon: "🏠",
    contactLabel: "Lead", contactLabelPlural: "Leads",
    dealLabel: "Transaction", dealLabelPlural: "Transactions",
    revenueLabel: "Commission",
    highValueLabel: "Luxury Buyer", midTierLabel: "Active Buyer", lowTierLabel: "Lead",
    defaultLayout: ["revenue_overview", "pipeline", "top_customers", "recent_contacts", "open_tasks", "activity_feed"],
    sonjiBoxMetrics: ["total_deals", "active_deals", "total_revenue", "total_contacts", "won_deals"],
    sonjiBoxLabels: { total_deals: "Active Deals", active_deals: "In Pipeline", total_revenue: "Commission YTD", total_contacts: "In Sphere", won_deals: "Closed" },
    gradientFrom: "#78350f", gradientTo: "#b45309",
  },
  home_services: {
    key: "home_services", name: "Home Services", companyName: "Apex Roofing & HVAC", icon: "🔧",
    contactLabel: "Customer", contactLabelPlural: "Customers",
    dealLabel: "Job", dealLabelPlural: "Jobs",
    revenueLabel: "Revenue",
    highValueLabel: "Premium", midTierLabel: "Regular", lowTierLabel: "One-Time",
    defaultLayout: ["revenue_overview", "pipeline", "customer_tiers", "open_tasks", "recent_contacts", "activity_feed"],
    sonjiBoxMetrics: ["total_revenue", "total_deals", "active_deals", "avg_order", "total_contacts"],
    sonjiBoxLabels: { total_revenue: "Revenue", total_deals: "Total Jobs", active_deals: "Estimates Out", avg_order: "Avg Job Value", total_contacts: "Customers" },
    gradientFrom: "#1e293b", gradientTo: "#334155",
  },
  legal: {
    key: "legal", name: "Legal & Law Firms", companyName: "Sterling Law Group", icon: "⚖",
    contactLabel: "Client", contactLabelPlural: "Clients",
    dealLabel: "Case", dealLabelPlural: "Cases",
    revenueLabel: "Revenue",
    highValueLabel: "Retainer Client", midTierLabel: "Active Client", lowTierLabel: "Consultation",
    defaultLayout: ["revenue_overview", "pipeline", "top_customers", "open_tasks", "recent_contacts", "activity_feed"],
    sonjiBoxMetrics: ["active_deals", "total_revenue", "total_contacts", "avg_ltv", "avg_order"],
    sonjiBoxLabels: { active_deals: "Active Cases", total_revenue: "Revenue", total_contacts: "Clients", avg_ltv: "Avg Case Value", avg_order: "Avg Retainer" },
    gradientFrom: "#0f172a", gradientTo: "#1e293b",
  },
  coaching_education: {
    key: "coaching_education", name: "Coaching & Education", companyName: "Elevate Coaching Co.", icon: "🎓",
    contactLabel: "Student", contactLabelPlural: "Students",
    dealLabel: "Enrollment", dealLabelPlural: "Enrollments",
    revenueLabel: "Revenue",
    highValueLabel: "VIP Client", midTierLabel: "Group Member", lowTierLabel: "Lead",
    defaultLayout: ["revenue_overview", "pipeline", "customer_tiers", "recent_contacts", "open_tasks", "activity_feed"],
    sonjiBoxMetrics: ["active_subs", "total_revenue", "total_deals", "total_contacts", "avg_ltv"],
    sonjiBoxLabels: { active_subs: "Active Clients", total_revenue: "Revenue", total_deals: "In Pipeline", total_contacts: "Leads", avg_ltv: "Avg Program" },
    gradientFrom: "#4c1d95", gradientTo: "#6d28d9",
  },
  restaurant_food: {
    key: "restaurant_food", name: "Restaurant & Food", companyName: "The Copper Table", icon: "🍽",
    contactLabel: "Customer", contactLabelPlural: "Customers",
    dealLabel: "Order", dealLabelPlural: "Orders",
    revenueLabel: "Revenue",
    highValueLabel: "VIP Diner", midTierLabel: "Regular", lowTierLabel: "New Customer",
    defaultLayout: ["revenue_overview", "pipeline", "subscription_breakdown", "recent_contacts", "activity_feed", "campaign_stats"],
    sonjiBoxMetrics: ["total_revenue", "total_contacts", "active_subs", "avg_order", "whales"],
    sonjiBoxLabels: { total_revenue: "Revenue", total_contacts: "Customers", active_subs: "Regulars", avg_order: "Avg Check", whales: "VIP Diners" },
    gradientFrom: "#881337", gradientTo: "#9f1239",
  },
  automotive: {
    key: "automotive", name: "Automotive", companyName: "Precision Auto Works", icon: "🚗",
    contactLabel: "Customer", contactLabelPlural: "Customers",
    dealLabel: "Work Order", dealLabelPlural: "Work Orders",
    revenueLabel: "Revenue",
    highValueLabel: "Fleet Account", midTierLabel: "Regular", lowTierLabel: "Walk-In",
    defaultLayout: ["revenue_overview", "pipeline", "customer_tiers", "open_tasks", "recent_contacts", "activity_feed"],
    sonjiBoxMetrics: ["total_revenue", "total_deals", "active_deals", "avg_order", "total_contacts"],
    sonjiBoxLabels: { total_revenue: "Revenue", total_deals: "Work Orders", active_deals: "In Shop", avg_order: "Avg Repair", total_contacts: "Customers" },
    gradientFrom: "#1e293b", gradientTo: "#334155",
  },
  nonprofit: {
    key: "nonprofit", name: "Nonprofit", companyName: "Harbor Community Foundation", icon: "💚",
    contactLabel: "Supporter", contactLabelPlural: "Supporters",
    dealLabel: "Campaign", dealLabelPlural: "Campaigns",
    revenueLabel: "Donations",
    highValueLabel: "Major Donor", midTierLabel: "Repeat Donor", lowTierLabel: "First-Time",
    defaultLayout: ["revenue_overview", "pipeline", "customer_tiers", "subscription_breakdown", "recent_contacts", "activity_feed"],
    sonjiBoxMetrics: ["total_revenue", "active_subs", "total_contacts", "avg_order", "whales"],
    sonjiBoxLabels: { total_revenue: "Donations", active_subs: "Active Donors", total_contacts: "Supporters", avg_order: "Avg Gift", whales: "Major Donors" },
    gradientFrom: "#064e3b", gradientTo: "#047857",
  },
  ecommerce: {
    key: "ecommerce", name: "E-Commerce", companyName: "ESL Sports", icon: "🛒",
    contactLabel: "Customer", contactLabelPlural: "Customers",
    dealLabel: "Order", dealLabelPlural: "Orders",
    revenueLabel: "Revenue",
    highValueLabel: "Whale", midTierLabel: "Mid-Tier", lowTierLabel: "Low-Tier",
    defaultLayout: ["revenue_overview", "quick_actions", "customer_tiers", "subscription_breakdown", "top_customers", "money_on_table", "recent_contacts", "pipeline", "open_tasks", "activity_feed", "revenue_chart", "upcoming_meetings", "campaign_stats"],
    sonjiBoxMetrics: ["total_revenue", "total_contacts", "active_subs", "whales", "avg_ltv"],
    sonjiBoxLabels: {},
    gradientFrom: "#0f172a", gradientTo: "#1e293b",
  },
};

export function getIndustryConfig(key: string | null): IndustryConfig | null {
  if (!key) return null;
  return configs[key] || null;
}

export function getCurrentIndustry(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sonji-demo-industry") || null;
}

export function getActiveConfig(): IndustryConfig | null {
  return getIndustryConfig(getCurrentIndustry());
}

export default configs;
