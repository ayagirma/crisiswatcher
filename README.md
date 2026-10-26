# Ethiopia Crisis Watch

A mobile-first website for verified updates, a blog, petitions, letters to
Congress, and GoFundMe fundraisers. It has a **frontend** (what visitors see,
plus a private admin page for writing blog posts) and a **backend** (a small
server and database for blog posts, likes, and the forms). Both run free on
Cloudflare.

## Folders

```
frontend/                  the website, served as-is (no build step)
  index.html               page layout
  css/styles.css           all the styling
  js/content.js            EDIT HERE: settings, news, petitions, campaigns, Learn page
  js/app.js                pages and navigation
  js/sanitize.js           keeps only safe formatting in blog posts
  admin/                   your private page for writing posts (/admin/)
backend/
  index.js                 the list of API addresses (/api/...)
  routes/public.js         blog posts, likes, contact form, newsletter
  routes/admin.js          writing posts, photos, messages, subscribers
  lib/security.js          admin login and spam limits
  lib/http.js              shared helpers
  db/migrations/           database tables
wrangler.toml              Cloudflare settings
archive/                   the old single-file version, for reference
```

## Pages

| Link | Page | What it's for |
|---|---|---|
| `#home` | Home | Mission, three main actions, the featured fundraiser, the latest updates, and how we verify |
| `#news` | News & Updates | Newest first, with region filters, search, and a Verified or Developing label |
| `#post-<id>` | Post | The full post, its sources, a safety notice on anonymized accounts, and share buttons |
| `#blog` | Blog | Your opinion posts, newest first, labeled Opinion and kept apart from the verified News |
| `#blog-<id>` | Blog post | The post, Like and Dislike buttons, "Email me your opinion", and share buttons |
| `#action` | Take Action | Petitions, a letter builder with live preview and copy, then find your representative |
| `#donate` | Donate | GoFundMe campaigns with progress, where the money goes, updates, and fee and tax notes |
| `#learn` | Learn | Timeline, region explainers, slide-series articles, and trusted sources |
| `#about` | About & Contact | Who runs the site, how to share a firsthand account safely, and a contact form |
| `/admin/` | Admin | Write and publish blog posts, read contact messages, see newsletter subscribers |

## Writing a blog post

1. Go to `/admin/` on your site and log in with your admin password.
2. Click **+ New post**. Type a title, then write. The toolbar does bold,
   italic, headings, lists, quotes, links, and photos. You can also paste text
   from Word or Google Docs; simple formatting is kept.
3. Add a one-sentence **Summary** (shown on the blog list).
4. Click **Publish**. It's on the site right away. **Save draft** keeps it
   private until you're ready. Ctrl+S saves at any time.

The posts list shows each post's author, status, likes, and dislikes. **Authors** lets administrators invite new writers with individual emails and passwords. Authors can write and edit their own articles, while sensitive sections like **Messages** (contact form) and **Subscribers** (newsletter list) remain private to administrators.

## Try it on your computer

You need [Node.js](https://nodejs.org) (version 20 or newer). In a terminal in
this folder:

```
npm install            # once
npm run db:setup       # once: creates the local database
npm run dev            # starts the site at http://localhost:8787
```

The admin page is at http://localhost:8787/admin/. The local password is in the
file `.dev.vars` (change it there if you like). Nothing you do locally
affects the real site.

## Put it online (free)

One-time setup, about 15 minutes:

1. Create a free account at [cloudflare.com](https://dash.cloudflare.com/sign-up). No credit card needed.
2. Log in from the terminal: `npx wrangler login` (a browser window opens; click **Allow**).
3. Create the online database: `npx wrangler d1 create ecw-db`. Copy the
   `database_id` it prints into `wrangler.toml`, replacing the zeros.
4. Create the tables: `npm run db:setup:online`
5. **Set your admin password:** `npx wrangler secret put ADMIN_PASSWORD`, then type
   a password (at least 8 characters). Keep it somewhere safe.
6. Publish: `npm run deploy`. It prints your address, like
   `https://ethiopia-crisis-watch.<your-name>.workers.dev`.

After that, writing posts happens on `/admin/`, with no code. Run
`npm run deploy` again only when you change files (for example news items in
`content.js`).

To change the password later, repeat step 5. That logs out every device.

### Your web address

The site is configured and connected to:
- **`https://crisiswatcher.org`** (and `https://www.crisiswatcher.org`)
- Fallback: `https://ethiopia-crisis-watch.ayagirma.workers.dev`
- Admin portal: `https://crisiswatcher.org/admin/`

### What the free plan covers

Unlimited visits to the pages. 100,000 backend requests a day (reading posts,
likes, forms). 5 GB of database storage, with 100,000 writes a day. That's
room for many thousands of readers a day.

## Editing other content

News posts, petitions, fundraisers, and the Learn page are in the `CONFIG` and
`CONTENT` objects in `frontend/js/content.js`. Items marked `sample: true` show a
dashed **Sample** label. Replace them before launch.

- `CONFIG.blogAuthor`: the name shown on blog posts.
- `CONFIG.blogEmail`: where **Email me your opinion** sends readers (blank =
  `CONFIG.contactEmail`). It opens the reader's email app with the post title as
  the subject.

### Connecting GoFundMe

For each campaign in `CONTENT.campaigns`:

- `gofundmeUrl`: the campaign link, `https://www.gofundme.com/f/<your-campaign>`.
  **Donate on GoFundMe** opens `<gofundmeUrl>/donate`, which is GoFundMe's own
  secure checkout. The site never touches payment details.
- `raised`, `donors`, `asOf`: copy these from the campaign page when you post an
  update.
- `uses`: the budget split shown under "Where the money goes".
- `updates`: progress notes, newest first.
- Set `featured: true` on the campaign you want on Home and at the top of Donate.

Set `CONFIG.gofundmeWidget = true` to also load GoFundMe's official embed widget,
which shows live totals, on the Donate page. The widget works on your own
domain.

## How the backend protects people

- **Contact messages store no IP address or device details.** People may be
  sharing firsthand accounts. Spam limits use a one-way code that's deleted
  after an hour.
- **Admin login:** one password, kept as a Cloudflare secret, never in the code.
  After 10 wrong tries, logins pause for 15 minutes.
- **Blog posts are cleaned before display**, so only text formatting, links, and
  photos can appear. Never scripts.
- **Likes:** one per reader per post. Someone determined could still clear their
  browser and vote again, so treat the numbers as a rough signal.

## API

| Method | Address | Who | What |
|---|---|---|---|
| GET | `/api/posts` | anyone | Published posts, newest first |
| GET | `/api/posts/:id` | anyone | One published post |
| GET / POST | `/api/reactions/:id` | anyone | Like and dislike totals; set `{ voter, vote }` |
| POST | `/api/contact` | anyone | `{ topic, name, email, message }` |
| POST | `/api/subscribe` | anyone | `{ email }` |
| GET | `/api/images/:id` | anyone | A photo from a post |
| POST | `/api/admin/login`, `/api/admin/logout` | anyone | Admin session |
| GET / POST / PUT / DELETE | `/api/admin/posts[/:id]` | admin | Write, edit, publish, delete posts |
| POST | `/api/admin/images` | admin | Upload a photo (raw image body) |
| GET / PUT / DELETE | `/api/admin/messages[/:id]` | admin | Contact messages |
| GET / DELETE | `/api/admin/subscribers` | admin | Newsletter list |

To change the database later, add a new file in `backend/db/migrations/`
(`0002_...sql`) and run `npm run db:setup` and `npm run db:setup:online`.
