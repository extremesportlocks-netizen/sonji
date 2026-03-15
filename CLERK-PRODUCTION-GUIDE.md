# SONJI — Clerk Production Mode Setup

**When:** Before any external demo (Power, Colton, CLYR)  
**Time:** ~15 minutes  
**Who:** Orlando only (needs Clerk dashboard access)

---

## Why This Matters

Clerk is currently in **development mode**. Dev mode:
- Shows "Development" badge on login/signup forms
- Limits to test emails only
- Doesn't send real verification emails
- Won't work with custom domain SSO

Production mode:
- Clean, branded login forms
- Real email verification
- Works on sonji.io domain
- Supports Google/GitHub social login properly

---

## Step-by-Step

### 1. Go to Clerk Dashboard
- URL: https://dashboard.clerk.com
- Sign in with whatever account you created Clerk with

### 2. Create Production Instance
- In your Sonji application, click **"Create production instance"** (top banner or settings)
- Clerk will generate NEW keys (different from dev)
- **Copy both keys:**
  - `CLERK_SECRET_KEY` (starts with `sk_live_...`)
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_...`)

### 3. Configure Production Instance
In the Clerk production dashboard:

**a) Allowed Origins**
- Add: `https://sonji.io`
- Add: `https://*.sonji.io` (for future subdomains)

**b) Sign-in Methods**
- Email + Password: ✅ Enable
- Google OAuth: ✅ Enable (optional but recommended)
- GitHub OAuth: ✅ Enable (optional)

**c) Email Templates** (optional polish)
- Customize the verification email template with Sonji branding
- From name: "Sonji"
- From email: Use default or set up custom domain

**d) Redirects**
- After sign-in URL: `/dashboard`
- After sign-up URL: `/onboarding`

### 4. Update Vercel Environment Variables
Go to: https://vercel.com/dashboard → Sonji project → Settings → Environment Variables

**Replace these two values (don't delete, just update):**

| Variable | Old (Dev) | New (Production) |
|----------|-----------|-------------------|
| `CLERK_SECRET_KEY` | `sk_test_...` | `sk_live_...` (from step 2) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` (from step 2) |

**Important:** Update for ALL environments (Production, Preview, Development)

### 5. Redeploy
After updating env vars:
- Go to Deployments tab in Vercel
- Click the 3-dot menu on the latest deployment
- Click **"Redeploy"**
- Wait ~60 seconds

### 6. Test the Flow
1. Open sonji.io/signup in an incognito window
2. Create a test account with a real email
3. Verify you receive the verification email
4. Complete signup → should redirect to /onboarding
5. Go through onboarding wizard
6. Verify "Go to Dashboard" works
7. Verify the dashboard loads with your tenant name

### 7. Link Orlando's Existing Account
After switching to production, your current dev-mode Clerk account won't exist in the production instance. You have two options:

**Option A (Recommended):** Sign up fresh in production mode. Then I'll run a SQL query to link your new Clerk ID to the existing ESL tenant:
```sql
UPDATE users SET clerk_id = 'user_NEW_PROD_ID' WHERE email = 'hello@sonji.io';
```

**Option B:** Manually insert your production Clerk user ID into the users table.

Either way, this is a 30-second fix once you have the new Clerk user ID.

---

## Rollback Plan

If anything breaks:
1. Revert the two env vars back to `sk_test_...` and `pk_test_...`
2. Redeploy in Vercel
3. Everything goes back to dev mode immediately

---

## After Production Mode is Live

- Remove `SITE_PASSWORD` env var (no more password gate needed)
- Or keep it for marketing pages only (authenticated users bypass it)
- Share sonji.io/signup link with Power and CLYR
- They sign up → onboarding → their own tenant created automatically
