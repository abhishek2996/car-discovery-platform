Great call on simplifying the scope. Here's the updated prompt series:

---

## Prompt 1
Create development steps in `Scratchpad` of `.cursorrules` to create a **new car discovery platform with dealer dashboard and admin dashboard like CarDekho** using TypeScript, Next.js 15, Shadcn, Lucide, Zod, Zustand, Recharts, Resend, Uploadthing, Prisma, PostgreSQL, next-auth@beta. The platform has three portals: a **public-facing new car discovery site** (browse new cars by brand/budget/body type, compare cars, expert reviews, upcoming cars, dealer locator, enquiry & test drive requests), a **dealer dashboard** (new car inventory management, lead & enquiry tracking, test drive scheduling, offer management, performance analytics), and an **admin dashboard** (platform analytics, car catalog management, dealer approvals, user management, content/news management). Include role-based auth for buyers, dealers, and admins. No payment gateway needed — the platform is lead-generation focused, not transactional. Format the scratchpad as nested markdown checkboxes grouped by feature area, matching the structure of a phased development plan.

---

## Prompt 2
We already completed these steps:
- [x] Initialize Next.js 15 project with TypeScript
- [x] Set up project structure and folders
- [x] Configure ESLint and Prettier

Mark them as done and start from this step:
Install and configure dependencies (Shadcn UI, Lucide, Zod, Zustand, Recharts, Resend, Uploadthing, Prisma, next-auth@beta)

---

## Prompt 3
We already set `DATABASE_URL` in `.env`. Mark this step as done:
- [x] Set up PostgreSQL database

Now start from this step:
- [ ] Configure Prisma schema with the following models:
  - User model (with roles: BUYER, DEALER, ADMIN)
  - Car model (new cars only — brand, model, variant, fuel type, transmission, body type, price, mileage, images)
  - Brand & CarModel model
  - Dealer / Showroom model
  - Enquiry model
  - Lead & Test Drive Request model
  - Review & Rating model
  - Wishlist model
  - Comparison model
  - NewsArticle model

---

## Prompt 4
Implement NextAuth.js authentication with the following:
- Email/Password credentials
- OAuth providers (Google, Facebook)
- JWT handling
- Role-based protected routes for BUYER, DEALER, and ADMIN
- Middleware to guard `/dealer/*` and `/admin/*` routes based on user role

---

## Prompt 5
Implement core features starting from the home layout. We are building this for the **UK market** with the following rules applied throughout the entire project:

**Localisation & Language:**
- Use **UK English** spelling and terminology (e.g. "tyre" not "tire", "bonnet" not "hood", "windscreen" not "windshield")
- Default city/region selector includes UK cities: London, Manchester, Birmingham, Glasgow, Leeds, Bristol, Edinburgh

**Pricing & Finance:**
- All prices in **GBP (£)**
- No payment gateway — all transactions happen off-platform between buyer and dealer
- Finance options reference **UK PCP / HP finance** with a note that dealers must be **FCA authorised**

**Cars & Listings:**
- **New cars only** — no used car buying, selling, or listing features anywhere on the platform
- All cars are **right-hand drive (RHD)** by default
- Distance and mileage displayed in **miles**
- Fuel references use **pence per litre (ppl)**
- **ULEZ / Clean Air Zone** compliance badge displayed on relevant listings
- EV range displayed in **miles**, with links to **Zap-Map** style UK charging networks
- Number plate format follows **UK standard** (e.g. AB12 CDE) where relevant

**Platform Purpose:**
- The platform is **lead-generation focused** — buyers browse and enquire, dealers follow up off-platform
- No cart, checkout, order, or payment flow anywhere in the codebase