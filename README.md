# TurfBook — Sports Turf Booking & Management Platform

> **A full-stack sports turf booking and management operating system that enables customers to discover and book sports pitches in real time while empowering turf owners to manage schedules, walk-in cash bookings, dynamic pricing, advance payments, QR check-ins, tournaments, and financial analytics from a single dashboard.**

---

## ⚡ Key Highlights

* **Zero Double-Booking Guarantee**: Database-level atomic transactions (`prisma.$transaction`) with composite unique indexing (`[groundId, date, startTime]`) and optimistic locking ensure concurrent requests to the same slot are strictly serialized and collisions are rejected.
* **BookMyShow-Style Customer Booking**: Real-time hourly slot picker across multi-sport grounds (Football 7v7, 5v5, Box Cricket, Badminton, Pickleball), duration selection, add-on equipment (match ball, bibs, referee, recording), promo coupons (`FIRST20`, `FLAT150`), and advance payment (30% advance token vs 100% online).
* **Instant Digital QR Match Ticket**: Every booking generates a cryptographic QR pass with unique Booking ID (`TB-XXXXXX`), WhatsApp share integration, and directions.
* **Turf Owner OS ("Turf Operating System")**:
  * Live KPI cards: Today's Bookings, Today's Revenue, Upcoming Slots, Occupancy %.
  * Real-time Hourly Schedule Grid (06:00 to 23:00) with 1-click slot blocking for maintenance.
  * Manual Walk-In & Phone Booking: Synchronizes offline cash bookings instantly with the online platform.
  * QR Code Check-in Scanner: Validates tickets, checks balance dues at venue, and marks players arrived in 1 click.
  * Financial Analytics & Heatmaps: 7-day revenue trend area chart, peak-hour demand heatmap, and sport share distribution.
  * Player CRM: Frequent squad tracking, lifetime match spend, and WhatsApp offer dispatch.
* **Tournaments & Leagues**: Tournament directory, prize pools (e.g. ₹25,000 Cup), rules, and team roster registration.
* **Super Admin Console**: Platform GMV tracking, 5% commission revenue calculations, turf owner KYC approvals queue, and customer dispute resolution ticketing.
* **Instant Role Switcher Banner**: Floating persistent toolbar allowing 1-click demo toggling between:
  * ⚽ **Customer View** (Rahul Patil)
  * 🏟️ **Turf Owner OS** (Apex Sports Arena)
  * 🛡️ **Super Admin** (TurfBook Ops)

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
* **Data Visualizations**: Recharts (Revenue trend area charts, hourly bar heatmaps)
* **QR Passes**: QRCodeSVG (`qrcode.react`)
* **Database & ORM**: Prisma ORM with SQLite (zero-config local dev) / PostgreSQL & Supabase ready
* **Backend**: Next.js Server Route Handlers with atomic ACID transaction isolation

---

## 🚀 Quick Start Guide

### 1. Install & Setup Database
```bash
# Dependencies are already installed
npm run prisma:push
npm run prisma:seed
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Verify Zero Double-Booking Concurrency Safety
```bash
npm run test:concurrency
```
*Simulates 5 parallel customer booking attempts at the exact same millisecond and verifies that strictly 1 succeeds while all 4 other requests are safely rejected.*

---

## 👥 Pre-Configured Demo Accounts

Use the **floating role bar** at the top of the app to switch instantly without typing credentials:

| Persona | Name | Role | Primary Features |
| :--- | :--- | :--- | :--- |
| **Customer** | Rahul Patil | `CUSTOMER` | Browse turfs, live slot picker, add-ons, coupons (`FIRST20`), digital QR passes, tiered cancellation |
| **Turf Owner** | Vikram Malhotra | `OWNER` | Apex Sports Arena dashboard, hourly calendar, manual walk-in bookings, QR check-in scanner, analytics |
| **Super Admin** | TurfBook Ops | `ADMIN` | Platform GMV, 5% commission calculation, pending turf approval queue, dispute tickets |

---

## 🗄️ Database Architecture

```mermaid
erDiagram
    USER ||--o{ TURF : owns
    USER ||--o{ BOOKING : books
    USER ||--o{ REVIEW : writes
    USER ||--o{ COMPLAINT : files
    TURF ||--o{ GROUND : contains
    TURF ||--o{ ADD_ON : offers
    TURF ||--o{ COUPON : issues
    TURF ||--o{ EVENT : hosts
    GROUND ||--o{ TIME_SLOT : schedules
    GROUND ||--o{ BOOKING : reserved_for
    BOOKING ||--o{ TIME_SLOT : locks
    BOOKING ||--o{ BOOKING_ADD_ON : includes
    EVENT ||--o{ EVENT_REGISTRATION : registers
```

---

## 🔄 Switching to PostgreSQL / Supabase

To switch from local SQLite to a production PostgreSQL / Supabase database:
1. In `prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `.env`, paste your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
   ```
3. Run `npx prisma db push` and `npx prisma db seed`.

---

## 📄 License
MIT © 2026 TurfBook Inc.
