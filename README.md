# WallDash

Smart home dashboard for wall-mounted tablets. Neumorphic UI (Soft UI) built with React + Vite, Supabase, FullCalendar.

## Features

- **3-screen infinite carousel:** YouTube Music ↔ Home (weather + voice assistant + calendar widget) ↔ Calendar (FullCalendar)
- **Weather widget:** Live forecast from OpenWeatherMap with GPS, 30 min refresh
- **Today's calendar widget:** Shows today's events with real-time sync via Supabase
- **Voice AI assistant:** Speech-to-text → Groq LLM → Text-to-speech
- **Family calendar:** FullCalendar with week/month/day views, assignments, recurring events, neumorphic styling
- **Mobile event management:** Dedicated `/mobile` route for quick add/edit/delete on phones (Supabase Auth)
- **Dark/Light theme:** Toggle with CSS variables, synced across screens
- **PIN lock:** 4-digit PIN verified against Supabase config, persists in localStorage
- **Battery saving:** Auto-dim display after 15s of inactivity (22:00–08:00), auto-return to Home after 30s
- **Real-time sync:** Supabase Realtime WebSockets — changes on mobile appear instantly on tablet
- **Offline fallback:** Weather widget falls back to mock data without API key

## Target Hardware

- **Device:** Samsung Galaxy Tab A 10.1" (2016) — SM-T580
- **OS:** LineageOS + WebView Kiosk (nktnet1)

## Stack

**Vite + React · Tailwind CSS · Supabase · Groq · FullCalendar · Swiper.js**

## Getting Started

```bash
git clone <repo-url>
cd WallDash-demo
npm install
cp .env.example .env   # fill in your API keys (see below)
npm run dev
```

## Environment Variables

Edit `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_OPENWEATHERMAP_API_KEY` | No | OpenWeatherMap API key (shows mock data without it) |
| `VITE_GROQ_API_KEY` | No | Groq API key for voice assistant (falls back to echo) |
| `VITE_ROBOROCK_API_URL` | No | Roborock API backend URL (requires separate backend) |
| `VITE_ROBOROCK_API_KEY` | No | Roborock API key |
| `VITE_FALLBACK_LAT` | No | Fallback latitude for weather (default: `40.4168`) |
| `VITE_FALLBACK_LON` | No | Fallback longitude for weather (default: `-3.7038`) |
| `VITE_FALLBACK_CITY` | No | Fallback city name for weather (default: `Madrid`) |

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Configure the seed data to match your needs:

### Allowed emails (for `/mobile` auth)

Edit the `allowed_emails` INSERT in `schema.sql` before running, or add them manually in the Supabase dashboard:

```sql
INSERT INTO allowed_emails (email) VALUES
  ('your-email@example.com'),
  ('friend@example.com')
ON CONFLICT DO NOTHING;
```

### Tablet PIN

The default PIN is `1234`. To change it, update the config table:

```sql
UPDATE config SET value = 'YOUR_PIN' WHERE key = 'tablet_pin';
```

### Telegram bot (optional)

If you want to use the Telegram bot feature, add your Telegram user ID to the `telegram_allowed_users` table. You can get your user ID by messaging [@userinfobot](https://t.me/userinfobot) on Telegram.

```sql
INSERT INTO telegram_allowed_users (telegram_user_id) VALUES (YOUR_TELEGRAM_ID);
```

Then deploy the Telegram bot edge function and configure the environment variables:
- `TELEGRAM_BOT_TOKEN` — get it from [@BotFather](https://t.me/BotFather)
- `TELEGRAM_WEBHOOK_SECRET` — a random secret for webhook verification

## Project Structure

```
src/
├── assets/          # Static assets (icons)
├── auth/            # Login and PIN screens
├── carousel/        # Main 3-screen carousel (Home, Calendar, YouTube)
├── components/      # Reusable UI components + widgets
├── config/          # App configuration
├── constants/       # Color definitions
├── contexts/        # React contexts (Profile)
├── hooks/           # Custom hooks (weather, clock, realtime, etc.)
├── mobile/          # Mobile-specific views (/mobile route)
├── services/        # API services (Supabase, weather, voice, etc.)
├── utils/           # Utility functions (date/time)
├── App.jsx          # Router and auth
└── main.jsx         # Entry point
supabase/
├── schema.sql       # Database schema + seed data
└── functions/       # Edge functions (Telegram bot)
```

## License

[PolyForm Noncommercial License 1.0.0](LICENSE) — Free to use, modify, and distribute for non-commercial purposes only. Derivative works must be published under the same license.
