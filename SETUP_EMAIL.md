# 📧 How to Setup Real Emails (Resend + Supabase)

To fix verification emails forever, follow these steps exactly.

## Phase 1: Get Resend Ready
1.  **Sign Up**: Go to [Resend.com](https://resend.com) and create a free account.
2.  **Get API Key**:
    *   Click **API Keys** on the left.
    *   Click **Create API Key**.
    *   Name it `Supabase`.
    *   **Permission**: "Full Access" or "Sending Access".
    *   **COPY the key** (starts with `re_...`). You only see it once!

## Phase 2: Configure Supabase
1.  Log in to your **Supabase Dashboard**.
2.  Go to **Project Settings** (Cog icon at bottom left).
3.  Click **Authentication** in the sidebar.
4.  Scroll down to **SMTP Settings** and toggle it **ON**.
5.  Fill in these exact details:

| Field | Value |
| :--- | :--- |
| **Sender Email** | `onboarding@resend.dev` *(See status below)* |
| **Sender Name** | `NeuroNxt` |
| **Host** | `smtp.resend.com` |
| **Port number** | `465` |
| **Username** | `resend` |
| **Password** | *[Paste your API Key here]* |
| **Minimum Interval** | `60` (default) |

6.  Click **Save**.

## Phase 3: The "Domain" Catch ⚠️
### If you DO NOT have your own domain (e.g., `neuronxt.com`):
*   You must use `onboarding@resend.dev` as the "Sender Email".
*   **LIMITATION**: You can ONLY send emails to the **exact email address** you used to sign up for Resend.
*   *Why?* To prevent spam, they don't let you email random people until you verify you own a domain.

### If you DO have a domain:
1.  In Resend, go to **Domains** -> **Add Domain**.
2.  Follow the instructions to add **DNS Records** (DKIM/SPF) to your domain provider (GoDaddy, Namecheap, Vercel, etc).
3.  Once verified (takes ~1 hour), change **Sender Email** in Supabase to `noreply@yourdomain.com`.
4.  Now you be can email **ANYONE**.

---

## Summary Checklist
- [ ] Created Resend Account
- [ ] Copied API Key
- [ ] Updated Supabase SMTP Settings
- [ ] Tested by signing up a new user

