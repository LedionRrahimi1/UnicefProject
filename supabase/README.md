# Supabase setup for MësoLehtë AI

## 1) Base tables
Run `schema.sql` in SQL Editor (materials + assignments).

## 2) Auth + classes + students
Run `schema_auth.sql` next.

## 2b) Stars + Titles (gamification)
Run `schema_gamification.sql` (`xp_transactions`, `student_badges`).

## 3) Disable email confirmation (important)
**Authentication → Providers → Email → turn OFF "Confirm email"**  
Otherwise new accounts cannot log in until they confirm.

## 4) Env
```env
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
Restart `npm run dev`.

## How it works
1. **Teacher** registers on Login → creates class (gets join code) → adds students (email + password) OR students self-register with join code
2. **Materials / assignments** save to Supabase
3. Student id = Auth user id → published work shows for that student

## Demo mode
If `VITE_USE_SUPABASE=false`, old demo emails still work with localStorage.
