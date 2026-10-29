# Ethiopia Crisis Watch — Platform Operator & User Guide

> **Quick Summary:** A comprehensive, single-source operational manual and reference guide covering citizen advocacy, multi-author blogging, administrative tools, witness safety, and Cloudflare deployment.

---

## 1. Quick Navigation & Roles Overview

| Target Audience | Primary Features | Access Point |
|---|---|---|
| **Readers & Citizens** | Verified Situation Reports, Regional Crisis Map, Petitions, Letter Generator, GoFundMe Aid | Public Website (`#home`, `#news`, `#action`, `#donate`) |
| **Blog Writers & Authors** | Draft, format, publish opinion articles, image uploads | `/admin/` (Author Account) |
| **Administrators** | User management, author invites, contact messages, subscriber list export, post moderation | `/admin/` (Administrator Account) |
| **Engineers / Operators** | Deployment, database migrations, Cloudflare edge secrets, `.org` domain configuration | Terminal / Wrangler CLI |

---

## 2. Platform Features & How To Use Them

### 2.1 Interactive Regional Crisis Map (`#home`, `#news`)
- **How It Works:** Displays an SVG map of Ethiopia's regions (*Amhara, Oromia, Tigray, Arsi Zone, Benishangul-Gumuz, Afar, Somali, Gambela, Sidama/South*).
- **Functionality:** 
  - Clicking any region displays a real-time status card showing humanitarian access levels, active conflict status, and casualty monitoring summaries.
  - Clicking **"Filter news for [Region]"** instantly filters the verified situation reports list to that specific zone.

### 2.2 Constituent Advocacy Letter Builder (`#action`)
- **How It Works:** Generates tailored diplomatic letters for elected officials in 4 major jurisdictions:
  1. **United States:** U.S. House of Representatives and Senate
  2. **United Kingdom:** Members of Parliament (House of Commons)
  3. **Canada:** Members of Parliament (House of Commons)
  4. **European Union:** Members of the European Parliament (MEPs)
- **Key Demands:**
  - *Humanitarian Access & Aid Corridors*
  - *Protection of Civilians & Historic Places of Worship*
  - *Independent International Human Rights Investigations*
- **Privacy Guarantee:** The constituent's name, city, and postal code are saved **only in local browser storage** and never sent to the server.

### 2.3 Grassroots Relief & GoFundMe Aid (`#donate`)
- **Direct Checkout:** Every campaign's "Donate" button directs straight to GoFundMe's secure checkout (`https://www.gofundme.com/f/.../donate`). The website never handles cardholder or financial data.
- **Where the Money Goes:** Visual percentage split displays exact humanitarian budget allocations (e.g. 45% flour & grain distributions, 30% emergency heavy blankets, 25% trauma first aid).
- **Progress Tracking:** Live donor counts, goal completion percentage bars, and timestamped field distribution updates.

### 2.4 Educational Hub & Slide Series (`#learn`)
- **Timeline of Conflict:** Interactive chronology from the outbreak of the Tigray war (Nov 2020), the Pretoria Agreement (Nov 2022), Oromia peace negotiations, through the Amhara emergency decrees (2023–2026).
- **Slide Series Reader:** Multi-part breakdowns explaining constitutional structures, regional demographics, and how to verify UN OCHA / ReliefWeb briefs.
- **Emergency Directory:** Direct contacts for **ICRC Restoring Family Links** (missing persons tracing), **EHRC**, **UN OCHA**, and diaspora trauma counseling.

---

## 3. Blog Writing & Author Guide (`/admin/`)

Blog posts represent personal opinion, analysis, and reflections, kept strictly separate from verified crisis news reports.

### Step-by-Step: Writing a Post
1. **Access the Portal:** Navigate to [http://localhost:8787/admin/](http://localhost:8787/admin/) (or your live site `/admin/`).
2. **Log In:** Enter your author email and password.
3. **Create Post:** Click **+ New post** in the top right.
4. **Formatting Toolbar:**
   - **Headings & Hierarchy:** `Heading` (H2), `Subheading` (H3), `Normal` (Paragraph).
   - **Styling:** **Bold** (`Ctrl+B`), *Italics* (`Ctrl+I`), Quotes (`❝ Quote`), Lists (Bullet or Numbered).
   - **Links:** Click `🔗 Link` to insert web links or mailto addresses.
   - **Photos:** Click `🖼 Photo` to upload an image. The browser automatically compresses and resizes it to max 1600px before uploading to SQLite BLOB storage.
   - **Pasting Text:** You can paste text directly from Google Docs or Word; clean formatting is preserved while removing harmful styling.
5. **Post Metadata:**
   - **Summary:** Write 1–2 sentences summarizing the post for preview cards.
   - **Date:** Defaults to today's date, or select a custom date.
6. **Saving & Publishing:**
   - **Save draft:** Keeps the article private to you and administrators. Keyboard shortcut: `Ctrl + S`.
   - **Publish:** Pushes the post live to `#blog` immediately.
7. **Post Ownership Rules:**
   - Authors can edit and delete **only articles they authored**.
   - If you view an article authored by another contributor, the editor opens in **🔒 Read-Only Mode** to prevent accidental overwrites.

---

## 4. Administrator Guide (`/admin/`)

Administrators have full operational control over the site content, authors, security, and subscriber data.

### 4.1 Onboarding New Authors & Writers
1. Go to `/admin/` and click the **Authors** tab.
2. Click **+ Add Author**.
3. Fill in:
   - **Full Name:** (e.g. `Makeda Wolde`) — displayed in the post byline and avatar initial.
   - **Email:** The author's unique login username.
   - **Temporary Password:** Minimum 8 characters.
   - **Role:** Choose **Author** (can draft and edit their own articles) or **Administrator** (full site privileges).
4. Click **Create account**. The author can immediately log in and write.
5. **Managing Team Members:**
   - **Reset Password:** Click **Reset password** next to any author to assign a new password if forgotten.
   - **Revoke Access:** Click **Delete** to deactivate an author account.

### 4.2 Whistleblower Inbox & Messages
- Located on the **Messages** tab in `/admin/` (visible only to Administrators).
- Lists inquiries and firsthand accounts sent through the Contact form.
- Direct **"Reply by email"** action button.
- Toggle read/unread state or delete resolved messages.
- **Extreme Privacy:** Deliberately contains **no IP addresses or device fingerprints** to protect confidential sources.

### 4.3 Newsletter Subscriber Export
- Located on the **Subscribers** tab in `/admin/`.
- Single-click **"Copy all emails"** to paste into Mailchimp, Substack, or Gmail.
- Single-click **"Download spreadsheet (CSV)"** for reporting and record keeping.

---

## 5. Security & Witness Protection Protocols

- **PBKDF2 Password Hashing:** All author and administrator passwords use 100,000 rounds of PBKDF2-SHA256 with cryptographically random salts via the native Web Crypto API.
- **Cryptographic Sessions:** Logged-in sessions are stored in HttpOnly, SameSite=Strict cookies signed with HMAC-SHA256.
- **Zero Witness IP Storage:** Contact messages and rate limiting use an ephemeral one-way HMAC hash of visitor IPs that is automatically purged every hour.
- **XSS Sanitization:** All HTML bodies in posts are cleaned with `sanitize.js` both client-side and server-side, stripping scripts, `onload` attributes, and iframe exploits.

---

## 6. Technical Operations & Deployment Reference

### 6.1 Essential Terminal Commands

| Task | Command | Description |
|---|---|---|
| **Run Dev Server** | `npm run dev` | Starts local worker and frontend at `http://localhost:8787` |
| **Apply Local DB Schema** | `npm run db:setup` | Executes pending migrations on local SQLite D1 |
| **Apply Cloudflare DB Schema** | `npm run db:setup:online` | Executes migrations on the remote Cloudflare D1 database |
| **Set Admin Password** | `npx wrangler secret put ADMIN_PASSWORD` | Encrypts admin master password into Cloudflare Key Vault |
| **Deploy Website & Backend** | `npm run deploy` | Publishes frontend and backend together to Cloudflare Edge |

### 6.2 Your Custom Domain (`crisiswatcher.org`)
1. **Live Custom Domain:**
   - Primary: `https://crisiswatcher.org`
   - Secondary / WWW: `https://www.crisiswatcher.org`
   - Direct Edge Fallback: `https://ethiopia-crisis-watch.soleyana.workers.dev`
2. **Domain Status:**
   - Connected directly via Cloudflare Workers Custom Domains in `wrangler.toml`.
   - Free auto-renewing SSL/TLS certificate issued and managed by Cloudflare.
3. **Admin Portal:**
   - Live admin interface: `https://crisiswatcher.org/admin/`

