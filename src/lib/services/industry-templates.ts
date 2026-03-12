/**
 * INDUSTRY TEMPLATE SYSTEM
 *
 * Each industry gets a complete starter kit:
 * - Custom pipeline stages with colors
 * - Intake form fields
 * - Email templates
 * - Suggested automation workflows
 * - Custom field definitions
 * - Tag presets
 *
 * These are seeded automatically during tenant provisioning
 * based on the industry selected in the onboarding wizard.
 */

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface IndustryTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string; // tailwind color class
  pipeline: { name: string; stages: { name: string; order: number; color: string }[] };
  formFields: { type: string; label: string; placeholder: string; required: boolean; options?: string[] }[];
  emailTemplates: { name: string; subject: string; bodyPreview: string }[];
  automations: { name: string; trigger: string; description: string }[];
  customFields: { key: string; label: string; type: "text" | "number" | "date" | "select"; options?: string[] }[];
  tags: string[];
  kpis: string[];
}

// ════════════════════════════════════════
// 12 INDUSTRY TEMPLATES
// ════════════════════════════════════════

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  health: {
    id: "health",
    name: "Health & Wellness",
    icon: "❤️",
    description: "Med spas, clinics, telehealth, chiropractic, functional medicine",
    color: "text-rose-500 bg-rose-50",
    pipeline: {
      name: "Patient Pipeline",
      stages: [
        { name: "Inquiry", order: 0, color: "#6366f1" },
        { name: "Intake Submitted", order: 1, color: "#2563eb" },
        { name: "Provider Review", order: 2, color: "#d97706" },
        { name: "Treatment Active", order: 3, color: "#059669" },
        { name: "Follow-up", order: 4, color: "#0891b2" },
        { name: "Churned", order: 5, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Enter your full name", required: true },
      { type: "email", label: "Email Address", placeholder: "you@example.com", required: true },
      { type: "phone", label: "Phone Number", placeholder: "(555) 123-4567", required: true },
      { type: "date", label: "Date of Birth", placeholder: "", required: true },
      { type: "select", label: "Treatment Interest", placeholder: "Select...", required: true, options: ["Weight Management", "Skin Rejuvenation", "Hormone Therapy", "IV Therapy", "Wellness Consultation", "Other"] },
      { type: "select", label: "How did you hear about us?", placeholder: "Select...", required: false, options: ["Google", "Instagram", "Facebook", "Friend/Referral", "Doctor Referral", "Other"] },
      { type: "textarea", label: "Medical History / Notes", placeholder: "Any relevant medical history or questions...", required: false },
    ],
    emailTemplates: [
      { name: "Welcome — New Patient", subject: "Welcome to {{tenant.businessName}}!", bodyPreview: "We're excited to begin your wellness journey..." },
      { name: "Intake Confirmation", subject: "Your intake form has been received", bodyPreview: "Our team will review your information within 24 hours..." },
      { name: "Appointment Reminder", subject: "Reminder: Your appointment is tomorrow", bodyPreview: "Just a friendly reminder about your upcoming visit..." },
      { name: "Post-Treatment Follow-up", subject: "How are you feeling, {{contact.firstName}}?", bodyPreview: "We wanted to check in after your recent treatment..." },
    ],
    automations: [
      { name: "New Patient Welcome", trigger: "form.submitted", description: "Send welcome email + create intake review task" },
      { name: "Appointment Reminder (24hr)", trigger: "appointment.scheduled", description: "Send email + SMS reminder 24 hours before" },
      { name: "Post-Treatment Check-in", trigger: "appointment.completed", description: "Wait 3 days → send follow-up email" },
      { name: "Re-engagement", trigger: "manual", description: "Tag inactive → nurture email → wait → SMS if no open" },
    ],
    customFields: [
      { key: "dateOfBirth", label: "Date of Birth", type: "date" },
      { key: "primaryConcern", label: "Primary Concern", type: "text" },
      { key: "insuranceProvider", label: "Insurance Provider", type: "text" },
      { key: "referringPhysician", label: "Referring Physician", type: "text" },
    ],
    tags: ["New Patient", "Active Treatment", "Returning Patient", "VIP", "Insurance", "Cash Pay", "Referral"],
    kpis: ["New Patients / Month", "Treatment Retention Rate", "Average Revenue per Patient", "No-Show Rate"],
  },

  fitness: {
    id: "fitness",
    name: "Fitness & Gym",
    icon: "💪",
    description: "Gyms, personal trainers, studios, CrossFit, yoga",
    color: "text-orange-500 bg-orange-50",
    pipeline: {
      name: "Member Pipeline",
      stages: [
        { name: "Trial Visit", order: 0, color: "#6366f1" },
        { name: "Tour Completed", order: 1, color: "#2563eb" },
        { name: "Signed Up", order: 2, color: "#059669" },
        { name: "Active Member", order: 3, color: "#0891b2" },
        { name: "At Risk", order: 4, color: "#d97706" },
        { name: "Cancelled", order: 5, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: true },
      { type: "select", label: "Fitness Goal", placeholder: "Select...", required: true, options: ["Weight Loss", "Muscle Building", "General Fitness", "Sports Performance", "Flexibility", "Rehab/Recovery"] },
      { type: "select", label: "Preferred Time", placeholder: "Select...", required: false, options: ["Early Morning (5-8am)", "Morning (8-11am)", "Midday (11am-2pm)", "Afternoon (2-5pm)", "Evening (5-8pm)"] },
      { type: "select", label: "Experience Level", placeholder: "Select...", required: false, options: ["Beginner", "Intermediate", "Advanced"] },
    ],
    emailTemplates: [
      { name: "Free Trial Invite", subject: "Your free trial at {{tenant.businessName}}", bodyPreview: "Come see what we're all about..." },
      { name: "Welcome — New Member", subject: "Welcome to the family, {{contact.firstName}}!", bodyPreview: "Here's everything you need for your first week..." },
      { name: "30-Day Check-in", subject: "How's your first month going?", bodyPreview: "You've been with us for a month — let's check in..." },
    ],
    automations: [
      { name: "Trial to Member", trigger: "contact.tagged", description: "After trial visit → send follow-up → wait 2 days → check enrollment" },
      { name: "Missed 2 Weeks", trigger: "manual", description: "Tag at-risk → send re-engagement → create call task" },
    ],
    customFields: [
      { key: "fitnessGoal", label: "Fitness Goal", type: "text" },
      { key: "membershipType", label: "Membership Type", type: "select", options: ["Monthly", "Annual", "Class Pack", "Personal Training"] },
      { key: "trainer", label: "Assigned Trainer", type: "text" },
    ],
    tags: ["Trial", "New Member", "Personal Training", "Group Classes", "VIP", "At Risk", "Referral"],
    kpis: ["New Members / Month", "Member Retention Rate", "Average Revenue per Member", "Trial-to-Member Conversion"],
  },

  beauty: {
    id: "beauty",
    name: "Beauty & Salon",
    icon: "✂️",
    description: "Salons, barbers, spas, lash studios, nail salons",
    color: "text-pink-500 bg-pink-50",
    pipeline: {
      name: "Client Pipeline",
      stages: [
        { name: "Booked", order: 0, color: "#6366f1" },
        { name: "Visited", order: 1, color: "#2563eb" },
        { name: "Regular Client", order: 2, color: "#059669" },
        { name: "Lapsed", order: 3, color: "#d97706" },
        { name: "Lost", order: 4, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: false },
      { type: "select", label: "Service", placeholder: "What service?", required: true, options: ["Haircut", "Color", "Blowout", "Nails", "Facial", "Lashes", "Waxing", "Massage", "Other"] },
      { type: "select", label: "Preferred Stylist", placeholder: "Any preference?", required: false, options: ["No Preference", "First Available"] },
    ],
    emailTemplates: [
      { name: "Booking Confirmation", subject: "You're booked! See you soon", bodyPreview: "Your appointment is confirmed for..." },
      { name: "Review Request", subject: "How was your visit, {{contact.firstName}}?", bodyPreview: "We'd love to hear about your experience..." },
    ],
    automations: [
      { name: "Post-Visit Review Request", trigger: "appointment.completed", description: "Wait 2 hours → send review request email" },
      { name: "Rebooking Reminder", trigger: "manual", description: "4 weeks after last visit → send rebooking email with link" },
    ],
    customFields: [
      { key: "preferredStylist", label: "Preferred Stylist", type: "text" },
      { key: "allergies", label: "Allergies/Sensitivities", type: "text" },
      { key: "lastService", label: "Last Service", type: "text" },
    ],
    tags: ["New Client", "Regular", "VIP", "Color Client", "Referral", "Gift Card"],
    kpis: ["Bookings / Week", "Client Retention Rate", "Average Ticket", "Review Rating"],
  },

  agency: {
    id: "agency",
    name: "Agency & Consulting",
    icon: "💼",
    description: "Marketing agencies, consultants, freelancers, service firms",
    color: "text-indigo-500 bg-indigo-50",
    pipeline: {
      name: "Sales Pipeline",
      stages: [
        { name: "Lead", order: 0, color: "#6366f1" },
        { name: "Discovery Call", order: 1, color: "#2563eb" },
        { name: "Proposal Sent", order: 2, color: "#d97706" },
        { name: "Negotiation", order: 3, color: "#f59e0b" },
        { name: "Closed Won", order: 4, color: "#059669" },
        { name: "Closed Lost", order: 5, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Work Email", placeholder: "you@company.com", required: true },
      { type: "text", label: "Company", placeholder: "Company name", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: false },
      { type: "select", label: "Service Interest", placeholder: "Select...", required: true, options: ["Marketing Strategy", "Website Design", "SEO", "Social Media", "Paid Ads", "Branding", "Consulting", "Other"] },
      { type: "select", label: "Monthly Budget", placeholder: "Select range...", required: false, options: ["Under $2K", "$2K-$5K", "$5K-$10K", "$10K-$25K", "$25K+"] },
      { type: "textarea", label: "Tell us about your project", placeholder: "What are you looking to achieve?", required: false },
    ],
    emailTemplates: [
      { name: "Discovery Call Confirmation", subject: "Our call is confirmed — {{meeting.date}}", bodyPreview: "Looking forward to learning about your business..." },
      { name: "Proposal Follow-up", subject: "Checking in on the proposal", bodyPreview: "I wanted to follow up on the proposal I sent last week..." },
      { name: "Welcome — New Client", subject: "Welcome aboard, {{contact.firstName}}!", bodyPreview: "We're thrilled to start working with {{contact.company}}..." },
    ],
    automations: [
      { name: "Lead Qualification", trigger: "form.submitted", description: "Score lead → if high: assign to sales → if low: nurture sequence" },
      { name: "Proposal Follow-up (5 days)", trigger: "deal.stage_changed", description: "When deal hits Proposal Sent → wait 5 days → send follow-up" },
    ],
    customFields: [
      { key: "companySize", label: "Company Size", type: "select", options: ["1-10", "11-50", "51-200", "200+"] },
      { key: "monthlyBudget", label: "Monthly Budget", type: "text" },
      { key: "currentProvider", label: "Current Provider", type: "text" },
    ],
    tags: ["Inbound", "Referral", "Enterprise", "SMB", "Retainer", "Project-Based"],
    kpis: ["Pipeline Value", "Win Rate", "Average Deal Size", "Sales Cycle Length"],
  },

  realestate: {
    id: "realestate",
    name: "Real Estate",
    icon: "🏠",
    description: "Agents, brokerages, property management, investment",
    color: "text-emerald-500 bg-emerald-50",
    pipeline: {
      name: "Transaction Pipeline",
      stages: [
        { name: "Inquiry", order: 0, color: "#6366f1" },
        { name: "Showing Scheduled", order: 1, color: "#2563eb" },
        { name: "Offer Made", order: 2, color: "#d97706" },
        { name: "Under Contract", order: 3, color: "#f59e0b" },
        { name: "Closed", order: 4, color: "#059669" },
        { name: "Lost", order: 5, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: true },
      { type: "select", label: "I'm looking to...", placeholder: "Select...", required: true, options: ["Buy a Home", "Sell a Home", "Rent", "Invest", "Both Buy & Sell"] },
      { type: "select", label: "Budget Range", placeholder: "Select...", required: false, options: ["Under $200K", "$200K-$400K", "$400K-$600K", "$600K-$1M", "$1M+"] },
      { type: "select", label: "Timeline", placeholder: "When?", required: false, options: ["ASAP", "1-3 Months", "3-6 Months", "6-12 Months", "Just Browsing"] },
      { type: "text", label: "Preferred Area/Neighborhood", placeholder: "Where are you looking?", required: false },
    ],
    emailTemplates: [
      { name: "New Listing Alert", subject: "New listing in your area: {{custom.address}}", bodyPreview: "A new property just hit the market that matches your criteria..." },
      { name: "Showing Follow-up", subject: "What did you think of the property?", bodyPreview: "I hope you enjoyed the showing yesterday..." },
      { name: "Under Contract Update", subject: "Great news — you're under contract!", bodyPreview: "The seller has accepted your offer..." },
    ],
    automations: [
      { name: "New Lead Follow-up", trigger: "form.submitted", description: "Immediate email + assign agent + create call task within 1 hour" },
      { name: "Post-Showing Check-in", trigger: "appointment.completed", description: "Wait 4 hours → send follow-up → wait 2 days → call task if no reply" },
    ],
    customFields: [
      { key: "buyerSeller", label: "Buyer / Seller", type: "select", options: ["Buyer", "Seller", "Both", "Investor"] },
      { key: "priceRange", label: "Price Range", type: "text" },
      { key: "preferredArea", label: "Preferred Area", type: "text" },
      { key: "preApproved", label: "Pre-Approved", type: "select", options: ["Yes", "No", "In Progress"] },
    ],
    tags: ["Buyer", "Seller", "Investor", "Pre-Approved", "First-Time Buyer", "Referral", "Hot Lead"],
    kpis: ["Active Listings", "Days on Market", "Closed Volume", "Commission Revenue"],
  },

  contractors: {
    id: "contractors",
    name: "Home Services",
    icon: "🔨",
    description: "Roofing, HVAC, plumbing, electrical, landscaping, cleaning",
    color: "text-amber-600 bg-amber-50",
    pipeline: {
      name: "Job Pipeline",
      stages: [
        { name: "New Lead", order: 0, color: "#6366f1" },
        { name: "Estimate Scheduled", order: 1, color: "#2563eb" },
        { name: "Estimate Sent", order: 2, color: "#d97706" },
        { name: "Job Booked", order: 3, color: "#059669" },
        { name: "In Progress", order: 4, color: "#0891b2" },
        { name: "Completed", order: 5, color: "#10b981" },
        { name: "Lost", order: 6, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: false },
      { type: "text", label: "Service Address", placeholder: "123 Main St", required: true },
      { type: "select", label: "Service Needed", placeholder: "Select...", required: true, options: ["Repair", "Installation", "Maintenance", "Emergency", "Inspection", "Estimate", "Other"] },
      { type: "select", label: "Urgency", placeholder: "How soon?", required: true, options: ["Emergency (Today)", "Within 1-2 Days", "This Week", "Flexible / No Rush"] },
      { type: "textarea", label: "Describe the Issue", placeholder: "Tell us what's going on...", required: false },
    ],
    emailTemplates: [
      { name: "Estimate Sent", subject: "Your estimate from {{tenant.businessName}}", bodyPreview: "Here's the estimate for the work we discussed..." },
      { name: "Job Complete — Review Request", subject: "How did we do, {{contact.firstName}}?", bodyPreview: "We just finished up your project and would love your feedback..." },
      { name: "Seasonal Maintenance Reminder", subject: "Time for your annual check-up", bodyPreview: "It's that time of year — let's make sure everything is in top shape..." },
    ],
    automations: [
      { name: "Speed-to-Lead", trigger: "form.submitted", description: "Immediate SMS + email → assign technician → create estimate task" },
      { name: "Estimate Follow-up", trigger: "deal.stage_changed", description: "When estimate sent → wait 3 days → follow-up call task" },
      { name: "Post-Job Review", trigger: "deal.won", description: "Job complete → wait 2 hours → send review request email + SMS" },
    ],
    customFields: [
      { key: "serviceAddress", label: "Service Address", type: "text" },
      { key: "serviceType", label: "Service Type", type: "text" },
      { key: "estimateAmount", label: "Estimate Amount", type: "number" },
      { key: "urgency", label: "Urgency Level", type: "select", options: ["Emergency", "Urgent", "Standard", "Flexible"] },
    ],
    tags: ["Emergency", "Residential", "Commercial", "Repeat Customer", "Insurance Claim", "Referral"],
    kpis: ["Jobs Completed / Month", "Estimate-to-Job Rate", "Average Job Value", "Response Time"],
  },

  legal: {
    id: "legal",
    name: "Legal & Law Firms",
    icon: "⚖️",
    description: "Law firms, solo attorneys, paralegals, legal consultants",
    color: "text-slate-600 bg-slate-50",
    pipeline: {
      name: "Case Pipeline",
      stages: [
        { name: "Consultation Request", order: 0, color: "#6366f1" },
        { name: "Consultation Completed", order: 1, color: "#2563eb" },
        { name: "Retained", order: 2, color: "#059669" },
        { name: "Active Case", order: 3, color: "#0891b2" },
        { name: "Case Closed", order: 4, color: "#10b981" },
        { name: "Declined", order: 5, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: true },
      { type: "select", label: "Type of Legal Matter", placeholder: "Select...", required: true, options: ["Personal Injury", "Family Law", "Criminal Defense", "Business Law", "Estate Planning", "Immigration", "Real Estate", "Employment", "Other"] },
      { type: "textarea", label: "Brief Description", placeholder: "Tell us about your situation...", required: true },
      { type: "select", label: "How urgently do you need help?", placeholder: "Select...", required: false, options: ["Emergency", "Within a week", "Within a month", "Just exploring options"] },
    ],
    emailTemplates: [
      { name: "Consultation Confirmation", subject: "Your consultation is confirmed", bodyPreview: "Thank you for scheduling a consultation with our firm..." },
      { name: "Retainer Agreement", subject: "Your retainer agreement from {{tenant.businessName}}", bodyPreview: "Attached is the retainer agreement for your review..." },
    ],
    automations: [
      { name: "Intake to Consultation", trigger: "form.submitted", description: "Assign attorney → send confirmation → create prep task" },
      { name: "Case Status Update", trigger: "deal.stage_changed", description: "Email client when case stage changes" },
    ],
    customFields: [
      { key: "caseType", label: "Case Type", type: "text" },
      { key: "courtDate", label: "Next Court Date", type: "date" },
      { key: "opposingCounsel", label: "Opposing Counsel", type: "text" },
      { key: "retainerAmount", label: "Retainer Amount", type: "number" },
    ],
    tags: ["Consultation", "Retained", "Pro Bono", "Referral", "High Priority", "Personal Injury", "Family Law"],
    kpis: ["Consultations / Month", "Retention Rate", "Average Case Value", "Case Resolution Time"],
  },

  coaching: {
    id: "coaching",
    name: "Coaching & Education",
    icon: "🎯",
    description: "Life coaches, business coaches, tutors, course creators, mentors",
    color: "text-violet-500 bg-violet-50",
    pipeline: {
      name: "Client Pipeline",
      stages: [
        { name: "Interested", order: 0, color: "#6366f1" },
        { name: "Discovery Call", order: 1, color: "#2563eb" },
        { name: "Enrolled", order: 2, color: "#059669" },
        { name: "Active Program", order: 3, color: "#0891b2" },
        { name: "Completed", order: 4, color: "#10b981" },
        { name: "Alumni", order: 5, color: "#7c3aed" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: false },
      { type: "select", label: "What are you looking for?", placeholder: "Select...", required: true, options: ["1-on-1 Coaching", "Group Program", "Online Course", "Workshop", "Mentorship", "Not Sure Yet"] },
      { type: "select", label: "Primary Goal", placeholder: "Select...", required: true, options: ["Career Growth", "Business Growth", "Health & Wellness", "Relationships", "Mindset", "Financial", "Other"] },
      { type: "textarea", label: "Tell me about yourself", placeholder: "What's your current situation and biggest challenge?", required: false },
    ],
    emailTemplates: [
      { name: "Discovery Call Booking", subject: "Let's chat, {{contact.firstName}}!", bodyPreview: "I'd love to learn more about your goals..." },
      { name: "Program Welcome", subject: "Welcome to the program! Here's what's next", bodyPreview: "Congratulations on taking this step..." },
      { name: "Session Recap", subject: "Recap from our session + action items", bodyPreview: "Great session today! Here's what we covered..." },
    ],
    automations: [
      { name: "Lead Nurture Sequence", trigger: "form.submitted", description: "Welcome email → wait 2 days → value email → wait 3 days → discovery call CTA" },
      { name: "Session Reminder", trigger: "appointment.scheduled", description: "24hr email reminder + 1hr SMS reminder" },
    ],
    customFields: [
      { key: "programType", label: "Program Type", type: "select", options: ["1-on-1", "Group", "Course", "VIP Day"] },
      { key: "sessionsRemaining", label: "Sessions Remaining", type: "number" },
      { key: "goalArea", label: "Primary Goal Area", type: "text" },
    ],
    tags: ["Lead", "Discovery Booked", "Enrolled", "Active", "Alumni", "Testimonial", "Referral"],
    kpis: ["Enrollment Rate", "Client Retention", "Session Completion Rate", "Average Program Value"],
  },

  restaurant: {
    id: "restaurant",
    name: "Restaurant & Food",
    icon: "🍽️",
    description: "Restaurants, cafes, catering, food trucks, bars",
    color: "text-red-500 bg-red-50",
    pipeline: {
      name: "Catering Pipeline",
      stages: [
        { name: "Inquiry", order: 0, color: "#6366f1" },
        { name: "Menu Consultation", order: 1, color: "#2563eb" },
        { name: "Quote Sent", order: 2, color: "#d97706" },
        { name: "Confirmed", order: 3, color: "#059669" },
        { name: "Event Complete", order: 4, color: "#10b981" },
        { name: "Lost", order: 5, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: true },
      { type: "select", label: "Event Type", placeholder: "Select...", required: true, options: ["Corporate Event", "Wedding", "Birthday/Party", "Holiday Event", "Regular Catering", "Other"] },
      { type: "date", label: "Event Date", placeholder: "", required: true },
      { type: "number", label: "Number of Guests", placeholder: "Estimated headcount", required: true },
      { type: "textarea", label: "Special Requirements", placeholder: "Dietary restrictions, venue details...", required: false },
    ],
    emailTemplates: [
      { name: "Catering Quote", subject: "Your catering quote from {{tenant.businessName}}", bodyPreview: "Thank you for considering us for your event..." },
      { name: "Event Confirmation", subject: "Your event is confirmed! 🎉", bodyPreview: "We're excited to cater your event on..." },
    ],
    automations: [
      { name: "Quote Follow-up", trigger: "deal.stage_changed", description: "Quote sent → wait 3 days → follow-up email if no response" },
      { name: "Post-Event Review", trigger: "deal.won", description: "Event complete → wait 1 day → send review request + rebooking offer" },
    ],
    customFields: [
      { key: "eventType", label: "Event Type", type: "text" },
      { key: "guestCount", label: "Guest Count", type: "number" },
      { key: "eventDate", label: "Event Date", type: "date" },
      { key: "dietaryRestrictions", label: "Dietary Restrictions", type: "text" },
    ],
    tags: ["Corporate", "Wedding", "Private Event", "Repeat Client", "VIP", "Dietary Restrictions"],
    kpis: ["Events Booked / Month", "Average Event Value", "Quote-to-Booking Rate", "Repeat Client Rate"],
  },

  automotive: {
    id: "automotive",
    name: "Automotive",
    icon: "🚗",
    description: "Dealerships, auto repair, detailing, body shops, rental",
    color: "text-blue-600 bg-blue-50",
    pipeline: {
      name: "Customer Pipeline",
      stages: [
        { name: "Inquiry", order: 0, color: "#6366f1" },
        { name: "Test Drive / Quote", order: 1, color: "#2563eb" },
        { name: "Financing Review", order: 2, color: "#d97706" },
        { name: "Sold / Serviced", order: 3, color: "#059669" },
        { name: "Follow-up", order: 4, color: "#0891b2" },
        { name: "Lost", order: 5, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: false },
      { type: "select", label: "I'm interested in...", placeholder: "Select...", required: true, options: ["Buying a Vehicle", "Selling/Trading In", "Service/Repair", "Detailing", "Parts", "Other"] },
      { type: "text", label: "Vehicle (Year/Make/Model)", placeholder: "e.g., 2024 Toyota Camry", required: false },
      { type: "textarea", label: "Details", placeholder: "Tell us more about what you need...", required: false },
    ],
    emailTemplates: [
      { name: "Test Drive Confirmation", subject: "Your test drive is scheduled!", bodyPreview: "We've reserved your test drive for..." },
      { name: "Service Reminder", subject: "Time for your vehicle service", bodyPreview: "It's been 6 months since your last visit..." },
    ],
    automations: [
      { name: "Service Reminder (6 months)", trigger: "manual", description: "6 months post-service → email + SMS reminder to rebook" },
      { name: "Post-Purchase Follow-up", trigger: "deal.won", description: "Wait 7 days → satisfaction check → wait 30 days → review request" },
    ],
    customFields: [
      { key: "vehicleInterest", label: "Vehicle Interest", type: "text" },
      { key: "tradeIn", label: "Trade-In Vehicle", type: "text" },
      { key: "lastServiceDate", label: "Last Service Date", type: "date" },
    ],
    tags: ["Buyer", "Seller", "Service", "Detailing", "Fleet", "Repeat Customer", "Referral"],
    kpis: ["Vehicles Sold / Month", "Service Revenue", "Average Deal Value", "CSI Score"],
  },

  nonprofit: {
    id: "nonprofit",
    name: "Nonprofit",
    icon: "🤝",
    description: "Nonprofits, charities, foundations, associations, churches",
    color: "text-teal-600 bg-teal-50",
    pipeline: {
      name: "Donor Pipeline",
      stages: [
        { name: "Prospect", order: 0, color: "#6366f1" },
        { name: "Contacted", order: 1, color: "#2563eb" },
        { name: "Meeting Scheduled", order: 2, color: "#d97706" },
        { name: "Pledge Made", order: 3, color: "#059669" },
        { name: "Donation Received", order: 4, color: "#10b981" },
        { name: "Declined", order: 5, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true },
      { type: "phone", label: "Phone", placeholder: "(555) 123-4567", required: false },
      { type: "select", label: "I'd like to...", placeholder: "Select...", required: true, options: ["Make a Donation", "Volunteer", "Partner/Sponsor", "Learn More", "Attend an Event", "Other"] },
      { type: "select", label: "Donation Amount", placeholder: "Select...", required: false, options: ["$25", "$50", "$100", "$250", "$500", "$1,000", "$5,000+", "Other Amount"] },
      { type: "textarea", label: "Message", placeholder: "Tell us why you'd like to get involved...", required: false },
    ],
    emailTemplates: [
      { name: "Thank You — Donation", subject: "Thank you for your generous gift, {{contact.firstName}}!", bodyPreview: "Your support makes our mission possible..." },
      { name: "Impact Update", subject: "See the impact of your donation", bodyPreview: "Here's what your support has helped us achieve..." },
      { name: "Event Invitation", subject: "You're invited: {{custom.eventName}}", bodyPreview: "Join us for our upcoming event..." },
    ],
    automations: [
      { name: "Donation Thank You", trigger: "invoice.paid", description: "Immediate thank you email + tax receipt → add donor tag" },
      { name: "Annual Giving Campaign", trigger: "manual", description: "Send appeal → wait 5 days → reminder → wait 3 days → final ask" },
    ],
    customFields: [
      { key: "donorLevel", label: "Donor Level", type: "select", options: ["Bronze", "Silver", "Gold", "Platinum", "Major Donor"] },
      { key: "totalGiving", label: "Total Giving", type: "number" },
      { key: "volunteerHours", label: "Volunteer Hours", type: "number" },
    ],
    tags: ["Donor", "Volunteer", "Sponsor", "Board Member", "Major Donor", "Monthly Donor", "Event Attendee"],
    kpis: ["Total Donations", "Donor Retention Rate", "Average Gift Size", "Volunteer Hours"],
  },

  ecommerce: {
    id: "ecommerce",
    name: "E-Commerce",
    icon: "🛒",
    description: "Online stores, DTC brands, subscription boxes, dropshipping",
    color: "text-purple-500 bg-purple-50",
    pipeline: {
      name: "Customer Pipeline",
      stages: [
        { name: "Subscriber", order: 0, color: "#6366f1" },
        { name: "First Purchase", order: 1, color: "#2563eb" },
        { name: "Repeat Customer", order: 2, color: "#059669" },
        { name: "VIP", order: 3, color: "#7c3aed" },
        { name: "At Risk", order: 4, color: "#d97706" },
        { name: "Churned", order: 5, color: "#dc2626" },
      ],
    },
    formFields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true },
      { type: "select", label: "How did you find us?", placeholder: "Select...", required: false, options: ["Google", "Instagram", "TikTok", "Facebook", "Friend/Referral", "Podcast", "Other"] },
    ],
    emailTemplates: [
      { name: "Welcome — New Subscriber", subject: "Welcome! Here's 10% off your first order", bodyPreview: "Thanks for joining the family..." },
      { name: "Abandoned Cart", subject: "You left something behind, {{contact.firstName}}", bodyPreview: "The items in your cart are waiting for you..." },
      { name: "Post-Purchase Thank You", subject: "Thanks for your order! 🎉", bodyPreview: "Your order is on its way..." },
      { name: "Review Request", subject: "How's your {{custom.productName}}?", bodyPreview: "We'd love to hear what you think..." },
    ],
    automations: [
      { name: "Welcome Series", trigger: "contact.created", description: "Welcome email → wait 2 days → value email → wait 3 days → offer email" },
      { name: "Post-Purchase Flow", trigger: "invoice.paid", description: "Thank you → wait 7 days → review request → wait 21 days → replenishment reminder" },
      { name: "Win-Back Campaign", trigger: "manual", description: "60 days no purchase → offer email → wait 5 days → last chance → update to churned" },
    ],
    customFields: [
      { key: "lifetimeValue", label: "Lifetime Value", type: "number" },
      { key: "orderCount", label: "Total Orders", type: "number" },
      { key: "lastOrderDate", label: "Last Order Date", type: "date" },
      { key: "favoriteProduct", label: "Favorite Product", type: "text" },
    ],
    tags: ["Subscriber", "First Purchase", "Repeat Buyer", "VIP", "Wholesale", "Influencer", "Referral"],
    kpis: ["Customer Acquisition Cost", "Lifetime Value", "Repeat Purchase Rate", "Average Order Value"],
  },
};

/**
 * Get all industries as a list (for the onboarding wizard).
 */
export function getAllIndustries(): { id: string; name: string; icon: string; description: string; color: string }[] {
  return Object.values(INDUSTRY_TEMPLATES).map(({ id, name, icon, description, color }) => ({
    id, name, icon, description, color,
  }));
}

/**
 * Get a specific industry template by ID.
 */
export function getIndustryTemplate(id: string): IndustryTemplate | null {
  return INDUSTRY_TEMPLATES[id] || null;
}

/**
 * Get the pipeline stages for an industry (used in tenant provisioning).
 */
export function getIndustryPipeline(id: string) {
  return INDUSTRY_TEMPLATES[id]?.pipeline || INDUSTRY_TEMPLATES.agency.pipeline;
}
