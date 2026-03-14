import twilio from "twilio";

/**
 * SONJI SMS SERVICE
 * 
 * Two modes:
 * 1. Platform-managed: Sonji's Twilio account, subaccounts per tenant with dedicated numbers
 * 2. BYOK: Tenant provides their own Twilio credentials
 * 
 * Tenant SMS config stored in tenants.settings.sms:
 * {
 *   mode: "platform" | "byok",
 *   twilioAccountSid?: string,      // BYOK: their SID
 *   twilioAuthToken?: string,        // BYOK: their auth token
 *   twilioPhoneNumber?: string,      // Their dedicated number (platform or BYOK)
 *   subAccountSid?: string,          // Platform mode: Twilio subaccount SID
 *   subAccountAuthToken?: string,    // Platform mode: subaccount auth token
 *   messagingServiceSid?: string,    // Optional: Twilio Messaging Service
 * }
 */

// Platform Twilio client (Sonji's master account)
function getPlatformTwilio() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

// Get Twilio client for a specific tenant
function getTwilioForTenant(smsConfig: any) {
  if (!smsConfig) return getPlatformTwilio();

  if (smsConfig.mode === "byok" && smsConfig.twilioAccountSid && smsConfig.twilioAuthToken) {
    return twilio(smsConfig.twilioAccountSid, smsConfig.twilioAuthToken);
  }

  // Platform mode with subaccount
  if (smsConfig.subAccountSid && smsConfig.subAccountAuthToken) {
    return twilio(smsConfig.subAccountSid, smsConfig.subAccountAuthToken);
  }

  return getPlatformTwilio();
}

// ─── SUBACCOUNT PROVISIONING (Platform mode) ───

export async function createSubAccount(tenantName: string): Promise<{
  success: boolean;
  subAccountSid?: string;
  subAccountAuthToken?: string;
  error?: string;
}> {
  const client = getPlatformTwilio();
  if (!client) return { success: false, error: "Twilio not configured" };

  try {
    const account = await client.api.accounts.create({
      friendlyName: `Sonji - ${tenantName}`,
    });

    return {
      success: true,
      subAccountSid: account.sid,
      subAccountAuthToken: account.authToken,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create subaccount" };
  }
}

export async function provisionPhoneNumber(
  subAccountSid?: string,
  subAccountAuthToken?: string,
  areaCode?: string
): Promise<{
  success: boolean;
  phoneNumber?: string;
  phoneSid?: string;
  error?: string;
}> {
  let client;
  if (subAccountSid && subAccountAuthToken) {
    client = twilio(subAccountSid, subAccountAuthToken);
  } else {
    client = getPlatformTwilio();
  }
  if (!client) return { success: false, error: "Twilio not configured" };

  try {
    // Search for available numbers
    const searchParams: any = { limit: 1, smsEnabled: true, voiceEnabled: true };
    if (areaCode) searchParams.areaCode = areaCode;

    const available = await client.availablePhoneNumbers("US").local.list(searchParams);
    if (available.length === 0) {
      // Try toll-free if no local numbers
      const tollFree = await client.availablePhoneNumbers("US").tollFree.list({ limit: 1, smsEnabled: true });
      if (tollFree.length === 0) return { success: false, error: "No phone numbers available" };

      const purchased = await client.incomingPhoneNumbers.create({
        phoneNumber: tollFree[0].phoneNumber,
      });
      return { success: true, phoneNumber: purchased.phoneNumber, phoneSid: purchased.sid };
    }

    const purchased = await client.incomingPhoneNumbers.create({
      phoneNumber: available[0].phoneNumber,
    });
    return { success: true, phoneNumber: purchased.phoneNumber, phoneSid: purchased.sid };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to provision number" };
  }
}

// ─── SEND SMS ───

interface SendSMSParams {
  to: string;
  body: string;
  from?: string;       // Override sender number
  mediaUrl?: string[];  // MMS
}

export async function sendSMS(
  smsConfig: any,
  params: SendSMSParams
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const client = getTwilioForTenant(smsConfig);
  if (!client) return { success: false, error: "SMS not configured. Connect Twilio in Settings." };

  const from = params.from || smsConfig?.twilioPhoneNumber;
  if (!from) return { success: false, error: "No sending phone number configured" };

  try {
    const message = await client.messages.create({
      to: params.to,
      from,
      body: params.body,
      mediaUrl: params.mediaUrl,
    });

    return { success: true, sid: message.sid };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to send SMS" };
  }
}

// ─── BATCH SMS ───

export async function sendBatchSMS(
  smsConfig: any,
  messages: SendSMSParams[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  // Send in batches of 20 to respect rate limits
  for (let i = 0; i < messages.length; i += 20) {
    const batch = messages.slice(i, i + 20);
    const promises = batch.map((m) => sendSMS(smsConfig, m));
    const responses = await Promise.allSettled(promises);

    for (const r of responses) {
      if (r.status === "fulfilled" && r.value.success) {
        results.sent++;
      } else {
        results.failed++;
        const err = r.status === "fulfilled" ? r.value.error : "Promise rejected";
        if (err) results.errors.push(err);
      }
    }

    // Rate limit: pause 1 second between batches
    if (i + 20 < messages.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return results;
}

// ─── VERIFY BYOK CREDENTIALS ───

export async function verifyTwilioCredentials(
  accountSid: string,
  authToken: string
): Promise<{ valid: boolean; phoneNumbers?: string[]; error?: string }> {
  try {
    const client = twilio(accountSid, authToken);
    const account = await client.api.accounts(accountSid).fetch();
    if (!account) return { valid: false, error: "Invalid credentials" };

    // List their phone numbers
    const numbers = await client.incomingPhoneNumbers.list({ limit: 20 });
    return {
      valid: true,
      phoneNumbers: numbers.map((n) => n.phoneNumber),
    };
  } catch {
    return { valid: false, error: "Invalid Twilio credentials" };
  }
}

// ─── LOOKUP (for contact enrichment) ───

export async function lookupPhoneNumber(
  phoneNumber: string,
  smsConfig?: any
): Promise<{ valid: boolean; carrier?: string; type?: string; error?: string }> {
  const client = getTwilioForTenant(smsConfig) || getPlatformTwilio();
  if (!client) return { valid: false, error: "Twilio not configured" };

  try {
    const lookup = await client.lookups.v2.phoneNumbers(phoneNumber).fetch({ fields: "line_type_intelligence" });
    return {
      valid: lookup.valid,
      carrier: (lookup as any).lineTypeIntelligence?.carrier_name,
      type: (lookup as any).lineTypeIntelligence?.type,
    };
  } catch {
    return { valid: false, error: "Lookup failed" };
  }
}
