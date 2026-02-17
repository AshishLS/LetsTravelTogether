# DSN Ride Pool Dashboard

Production-ready, mobile-first ride sharing dashboard for a closed WhatsApp group coordinating rides from Pune, Mumbai, and Kolhapur.

## Stack
- React + Vite
- TailwindCSS
- Supabase (Postgres + RLS + RPC)
- Leaflet + OpenStreetMap tiles
- Nominatim API for geocoding

## Features
- Public ride creation (no login)
- Public seat request flow (requests saved as `pending`)
- Driver/ride cards with seat stats and full-state highlighting
- City/time/availability/nearby filters
- Nearby highlighting within 10 km using Haversine formula
- List/Map toggle with green (available) and red (full) markers
- `/admin` route protected by password constant
- Admin can approve/reject requests, edit rides, delete rides
- City analytics summary for Pune/Mumbai/Kolhapur
- Auto refresh every 10 seconds
- Duplicate reservation prevention (same phone + ride)

## 1) Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env
   ```
3. Fill `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSWORD`

## 2) Supabase Database Setup
1. Create a Supabase project (free tier).
2. Open SQL Editor and run:
   - `supabase/schema.sql`
3. Ensure your admin password inside `supabase/schema.sql` matches `VITE_ADMIN_PASSWORD`.

### Database Collections (tables)
- `rides`
  - `id`, `driver_name`, `phone`, `city`, `area`, `vehicle_type`, `total_seats`, `departure_time`, `latitude`, `longitude`, `created_at`
- `reservations`
  - `id`, `ride_id`, `passenger_name`, `phone`, `seats_requested`, `status`, `created_at`

### Seat Formula
`available_seats = total_seats - SUM(approved reservations)`

## 3) Run Locally
```bash
npm run dev
```

## 4) Deployment (Vercel)
1. Push repository to GitHub.
2. Import project in Vercel.
3. Framework preset: `Vite`.
4. Add environment variables from `.env.example`.
5. Deploy.

## 5) Deployment (Firebase Hosting)
1. Install CLI:
   ```bash
   npm i -g firebase-tools
   ```
2. Login and init hosting:
   ```bash
   firebase login
   firebase init hosting
   ```
3. Build app:
   ```bash
   npm run build
   ```
4. Set `dist` as public directory and configure SPA rewrite to `/index.html`.
5. Deploy:
   ```bash
   firebase deploy
   ```

## Admin Access
- Route: `/admin`
- Password is checked against `VITE_ADMIN_PASSWORD` in frontend and SQL RPC validation.

## Notes
- Nominatim usage policies apply. For heavy load, add throttling/caching.
- This app intentionally has no login flow per requirement.
