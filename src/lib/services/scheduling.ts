/**
 * SCHEDULING ENGINE
 *
 * Calculates available time slots from availability rules,
 * detects conflicts with existing appointments,
 * handles timezone conversions, and generates bookable slots.
 * Pure logic — no database dependency.
 */

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface AvailabilityRule {
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  timezone: string;  // "America/New_York"
}

export interface ExistingAppointment {
  startsAt: Date;
  endsAt: Date;
  status: "scheduled" | "confirmed" | "cancelled";
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  conflict?: string; // reason if not available
}

export interface BookingConfig {
  slotDurationMinutes: number;     // default 30
  bufferMinutes: number;           // gap between appointments, default 0
  minAdvanceHours: number;         // can't book within X hours, default 2
  maxAdvanceDays: number;          // can't book more than X days out, default 60
  allowWeekends: boolean;          // default false
  breakStart?: string;             // "12:00"
  breakEnd?: string;               // "13:00"
}

// ════════════════════════════════════════
// TIME UTILITIES
// ════════════════════════════════════════

/**
 * Parse "HH:MM" time string into minutes since midnight.
 */
function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Format minutes since midnight into "HH:MM".
 */
function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Get the day of week (0-6) for a given date.
 */
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Create a Date from a date + time string.
 */
function dateAtTime(date: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Check if two time ranges overlap.
 */
function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Get all dates between start and end (inclusive).
 */
function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// ════════════════════════════════════════
// SLOT GENERATION
// ════════════════════════════════════════

const DEFAULT_CONFIG: BookingConfig = {
  slotDurationMinutes: 30,
  bufferMinutes: 0,
  minAdvanceHours: 2,
  maxAdvanceDays: 60,
  allowWeekends: false,
};

/**
 * Generate available time slots for a date range.
 *
 * @param rules - User's availability rules
 * @param appointments - Existing appointments to check conflicts
 * @param startDate - Start of the range to check
 * @param endDate - End of the range to check
 * @param config - Booking configuration
 */
export function generateSlots(
  rules: AvailabilityRule[],
  appointments: ExistingAppointment[],
  startDate: Date,
  endDate: Date,
  config: Partial<BookingConfig> = {}
): TimeSlot[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = new Date();
  const minBookTime = new Date(now.getTime() + cfg.minAdvanceHours * 60 * 60 * 1000);
  const maxBookTime = new Date(now.getTime() + cfg.maxAdvanceDays * 24 * 60 * 60 * 1000);

  // Filter out cancelled appointments
  const activeAppointments = appointments.filter((a) => a.status !== "cancelled");

  const slots: TimeSlot[] = [];
  const dates = getDateRange(startDate, endDate);

  for (const date of dates) {
    const dayOfWeek = getDayOfWeek(date);

    // Skip weekends if not allowed
    if (!cfg.allowWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) continue;

    // Find rules for this day
    const dayRules = rules.filter((r) => r.dayOfWeek === dayOfWeek);
    if (dayRules.length === 0) continue;

    for (const rule of dayRules) {
      const ruleStartMin = parseTime(rule.startTime);
      const ruleEndMin = parseTime(rule.endTime);
      const breakStartMin = cfg.breakStart ? parseTime(cfg.breakStart) : null;
      const breakEndMin = cfg.breakEnd ? parseTime(cfg.breakEnd) : null;

      // Generate slots within this rule's time range
      let currentMin = ruleStartMin;

      while (currentMin + cfg.slotDurationMinutes <= ruleEndMin) {
        const slotStartMin = currentMin;
        const slotEndMin = currentMin + cfg.slotDurationMinutes;

        // Skip if in break time
        if (breakStartMin !== null && breakEndMin !== null) {
          if (slotStartMin < breakEndMin && slotEndMin > breakStartMin) {
            currentMin = breakEndMin;
            continue;
          }
        }

        const slotStart = dateAtTime(date, formatTime(slotStartMin));
        const slotEnd = dateAtTime(date, formatTime(slotEndMin));

        let available = true;
        let conflict: string | undefined;

        // Check minimum advance time
        if (slotStart < minBookTime) {
          available = false;
          conflict = "Too soon — minimum advance booking time not met";
        }

        // Check maximum advance time
        if (slotStart > maxBookTime) {
          available = false;
          conflict = "Too far in advance";
        }

        // Check conflicts with existing appointments (include buffer)
        if (available) {
          const bufferedStart = new Date(slotStart.getTime() - cfg.bufferMinutes * 60 * 1000);
          const bufferedEnd = new Date(slotEnd.getTime() + cfg.bufferMinutes * 60 * 1000);

          for (const appt of activeAppointments) {
            if (rangesOverlap(bufferedStart, bufferedEnd, appt.startsAt, appt.endsAt)) {
              available = false;
              conflict = "Conflicts with existing appointment";
              break;
            }
          }
        }

        slots.push({ start: slotStart, end: slotEnd, available, conflict });
        currentMin += cfg.slotDurationMinutes + cfg.bufferMinutes;
      }
    }
  }

  return slots;
}

/**
 * Get only available slots (convenience wrapper).
 */
export function getAvailableSlots(
  rules: AvailabilityRule[],
  appointments: ExistingAppointment[],
  startDate: Date,
  endDate: Date,
  config?: Partial<BookingConfig>
): TimeSlot[] {
  return generateSlots(rules, appointments, startDate, endDate, config)
    .filter((s) => s.available);
}

/**
 * Check if a specific time range is available.
 */
export function isSlotAvailable(
  start: Date,
  end: Date,
  rules: AvailabilityRule[],
  appointments: ExistingAppointment[],
  config?: Partial<BookingConfig>
): { available: boolean; reason?: string } {
  const dayOfWeek = getDayOfWeek(start);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Check if day has availability rules
  const dayRules = rules.filter((r) => r.dayOfWeek === dayOfWeek);
  if (dayRules.length === 0) {
    return { available: false, reason: "No availability set for this day" };
  }

  // Check if time falls within any rule
  const inRule = dayRules.some((r) => {
    const rStart = parseTime(r.startTime);
    const rEnd = parseTime(r.endTime);
    return startMin >= rStart && endMin <= rEnd;
  });
  if (!inRule) {
    return { available: false, reason: "Outside of available hours" };
  }

  // Check minimum advance
  const now = new Date();
  const minBookTime = new Date(now.getTime() + cfg.minAdvanceHours * 60 * 60 * 1000);
  if (start < minBookTime) {
    return { available: false, reason: `Must book at least ${cfg.minAdvanceHours} hours in advance` };
  }

  // Check conflicts
  const activeAppointments = appointments.filter((a) => a.status !== "cancelled");
  for (const appt of activeAppointments) {
    if (rangesOverlap(start, end, appt.startsAt, appt.endsAt)) {
      return { available: false, reason: "Conflicts with existing appointment" };
    }
  }

  return { available: true };
}

// ════════════════════════════════════════
// DEFAULT AVAILABILITY PRESETS
// ════════════════════════════════════════

export const AVAILABILITY_PRESETS: Record<string, { label: string; rules: AvailabilityRule[] }> = {
  business_hours: {
    label: "Business Hours (Mon-Fri 9am-5pm)",
    rules: [1, 2, 3, 4, 5].map((day) => ({
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      timezone: "America/New_York",
    })),
  },
  extended_hours: {
    label: "Extended Hours (Mon-Fri 8am-8pm)",
    rules: [1, 2, 3, 4, 5].map((day) => ({
      dayOfWeek: day,
      startTime: "08:00",
      endTime: "20:00",
      timezone: "America/New_York",
    })),
  },
  weekdays_and_saturday: {
    label: "Weekdays + Saturday Morning",
    rules: [
      ...[1, 2, 3, 4, 5].map((day) => ({
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        timezone: "America/New_York",
      })),
      { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", timezone: "America/New_York" },
    ],
  },
  afternoons_only: {
    label: "Afternoons Only (Mon-Fri 1pm-6pm)",
    rules: [1, 2, 3, 4, 5].map((day) => ({
      dayOfWeek: day,
      startTime: "13:00",
      endTime: "18:00",
      timezone: "America/New_York",
    })),
  },
};

/**
 * Format a slot for display.
 */
export function formatSlotDisplay(slot: TimeSlot): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", hour12: true };
  const start = slot.start.toLocaleTimeString("en-US", opts);
  const end = slot.end.toLocaleTimeString("en-US", opts);
  return `${start} — ${end}`;
}

/**
 * Group slots by date for calendar display.
 */
export function groupSlotsByDate(slots: TimeSlot[]): Map<string, TimeSlot[]> {
  const grouped = new Map<string, TimeSlot[]>();
  for (const slot of slots) {
    const dateKey = slot.start.toISOString().split("T")[0];
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(slot);
  }
  return grouped;
}
