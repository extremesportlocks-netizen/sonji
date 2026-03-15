# Clerk Production Mode — Checklist

**Time needed:** ~15 minutes  
**When to do this:** Before any external demo (Power, Colton, Rocco, CLYR)

---

## Step 1: Create Production Instance

1. Go to https://dashboard.clerk.com
2. Click your current dev instance (top-left dropdown)
3. Click **"Create production instance"** (or go to Settings → Instance)
4. Name it: `sonji-production`
5. Clerk will generate new keys — **do NOT close this page**

---

## Step 2: Copy New Keys

You'll get 2 new keys:

```
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxx
```

**These are DIFFERENT from your dev keys.** Dev keys start with `sk_test_` / `pk_test_`. Production keys start with `sk_live_` / `pk_live_`.

---

## Step 3: Update Vercel Environment Variables

1. Go to https://vercel.com → Sonji project → Settings → Environment Variables
2. Find `CLERK_SECRET_KEY` → click Edit → paste the new `sk_live_` key → Save
3. Find `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → click Edit → paste the new `pk_live_` key → Save

**Important:** Make sure both are set for the **Production** environment (not just Preview/Development).

---

## Step 4: Configure Production Instance in Clerk

In the Clerk dashboard (production instance):

1. **Domains:** Add `sonji.io` as the production domain
2. **Paths:**
   - Sign-in URL: `/login`
   - Sign-up URL: `/signup`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/onboarding`
3. **Social Connections (optional):** Enable Google OAuth if you want "Sign in with Google"
4. **Email templates:** Customize if desired (Clerk sends verification emails)

---

## Step 5: Redeploy

1. Go to Vercel → Sonji → Deployments
2. Click the 3-dot menu on the latest deployment → **Redeploy**
3. Wait ~60 seconds for the build

---

## Step 6: Re-link Your User

**Critical:** Your dev Clerk user does NOT carry over to production. You need to:

1. Go to sonji.io/signup
2. Create a new account with hello@sonji.io
3. Go through the onboarding wizard (or we can manually link your Clerk ID to the ESL tenant in the database)

**To manually link (faster):**
```sql
-- Run in Neon SQL Editor after signing up in production Clerk
-- Replace 'user_xxxxx' with your new production Clerk user ID
-- (find it in Clerk dashboard → Users → click your user → copy User ID)

UPDATE users 
SET clerk_id = 'user_xxxxx' 
WHERE email = 'hello@sonji.io';
```

---

## Step 7: Verify

1. Go to sonji.io/login → sign in with your production account
2. Dashboard should load with ESL data
3. Sign out → go to sonji.io/signup → create a test account → verify onboarding works
4. Delete the test account in Clerk dashboard when done

---

## What Changes

| Before (Dev) | After (Production) |
|---|---|
| `sk_test_` keys | `sk_live_` keys |
| Clerk dev mode banner | Clean, no banner |
| Test email verification | Real email verification |
| Dev users only | Anyone can sign up |
| sonji.io shows Clerk dev warning | Clean production experience |

---

## Rollback

If anything breaks, just swap the Vercel env vars back to the `sk_test_` / `pk_test_` keys and redeploy. Dev mode will resume instantly.

---

**Bottom line:** Swap 2 env vars in Vercel, configure domain in Clerk, redeploy, re-link your user. 15 minutes.
