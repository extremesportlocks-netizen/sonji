/**
 * SONJI V2 ROADMAP — Status as of March 16, 2026
 * 
 * Source: Gemini deep analysis + Colton feature requests
 * 
 * ═══════════════════════════════════════════════════════════
 * TIER 1 — BUILD NOW (Cross-industry, high ROI)
 * ═══════════════════════════════════════════════════════════
 * 
 * ✅ 1. SONJI RECOVERED REVENUE COUNTER — SHIPPED
 *    Dashboard widget tracks $ recovered by automations per industry.
 *    src/components/dashboard/recovered-revenue.tsx
 * 
 * ✅ 2. DEAL VELOCITY / PIPELINE MOMENTUM — SHIPPED
 *    Cards degrade green→amber→red when deals stall.
 *    src/components/dashboard/deal-velocity.tsx
 * 
 * ✅ 3. PREDICTIVE GHOSTING ALERTS — SHIPPED
 *    27 alerts across 12 industries. Severity badges, baseline vs current.
 *    src/components/dashboard/ghosting-alerts.tsx
 * 
 * ═══════════════════════════════════════════════════════════
 * TIER 2 — INDUSTRY-SPECIFIC (shipped as automations)
 * ═══════════════════════════════════════════════════════════
 * 
 * 64 automations across 12 industries:
 * src/app/dashboard/workflows/page.tsx
 * 
 * HEALTHCARE (8 automations):
 * ✅ Waitlist Trigger: cancellation → auto-SMS waitlist (draft)
 * ✅ Consumable Timeline: Botox 12-week rebooking reminder
 * ✅ Post-Treatment Check-In: Day 3 text
 * ✅ No-Show Recovery: auto reschedule link
 * ✅ Review Request: 48hr post-visit
 * ✅ Appointment Reminder: 24hr SMS
 * ✅ New Patient Welcome
 * ✅ Lapsed Win-Back: 90 days
 * 
 * AGENCY (8 automations):
 * ✅ Communication Velocity: client going cold detection
 * ✅ Scope Creep Detector: revision count > max (draft)
 * ✅ Renewal Alert: 28 days before contract end
 * ✅ New Lead Auto-Response
 * ✅ Proposal Follow-Up: 3-email drip
 * ✅ Client Onboarding Kickoff: auto-create project
 * ✅ Monthly Report Delivery
 * ✅ NPS Survey: 90 days
 * 
 * HOME SERVICES (6 automations):
 * ✅ Weather-Triggered Nurture: storm alert (draft)
 * ✅ Estimate Auto-Reply + Follow-Up
 * ✅ Job Completion + Review
 * ✅ Seasonal HVAC Reminder
 * ✅ Maintenance Plan Anniversary
 * 
 * AUTOMOTIVE (4 automations):
 * ✅ Declined Service Recovery: 30-day follow-up with discount
 * ✅ Service Appointment Reminder
 * ✅ Service Complete Notification
 * ✅ Maintenance Due Reminder
 * 
 * COACHING (4 automations):
 * ✅ "Stuck" Intervention: 14 days no check-in
 * ✅ Program Completion Celebration
 * ✅ Application Received
 * ✅ Session Reminder
 * 
 * E-COMMERCE (5 automations):
 * ✅ VIP Escalation: 4th purchase milestone
 * ✅ Cancellation Save Attempt
 * ✅ Win-Back: 60 days
 * ✅ Welcome + First Purchase Offer
 * ✅ Subscription Renewal Reminder
 * 
 * Also shipped: FITNESS (5), BEAUTY (5), REAL ESTATE (4),
 * LEGAL (4), RESTAURANT (4), NONPROFIT (4)
 * 
 * ═══════════════════════════════════════════════════════════
 * TIER 2.5 — COLTON'S FEATURE REQUESTS (all shipped)
 * ═══════════════════════════════════════════════════════════
 * 
 * ✅ SMS Cost Optimization: BYOK Twilio (tenant brings their own key)
 * ✅ Analytics Accuracy: real Stripe data, not GHL fake numbers
 * ✅ Project Management System:
 *    - Projects page: grid + list view, budget, margin, resource loading
 *    - Project detail: tasks, time tracking, budget breakdown, team
 *    - Live timer: start/stop, real-time counter
 *    - Deal → Project handoff: "Convert to Project" button on won deals
 *    - All 12 industries have demo projects
 * 
 * ═══════════════════════════════════════════════════════════
 * TIER 3 — PLATFORM FEATURES (not yet built)
 * ═══════════════════════════════════════════════════════════
 * 
 * 🔲 GrapeJS page/funnel builder — the GHL killer feature. Dedicated session.
 * 🔲 Stripe billing for Sonji subscriptions — pricing page → real checkout
 * 🔲 White-label theming engine — DB-driven CSS vars per tenant
 * 🔲 ESL Portal rebuild — replace Thrasker
 * 🔲 Mobile PWA
 * 🔲 Template marketplace
 * 🔲 Google Analytics integration
 * 🔲 Custom AI agents per tenant
 * 
 * ═══════════════════════════════════════════════════════════
 * STATS (as of March 16, 2026)
 * ═══════════════════════════════════════════════════════════
 * 116 commits | 24,400+ lines | 119 files | 27 pages
 * 64 automations | 27 ghosting alerts | 16 dashboard widgets
 * 9 modals | 26 API routes | 16 services
 * 12 industry demos | 0 empty states
 */

export const V2_ROADMAP_VERSION = "2026-03-16";
