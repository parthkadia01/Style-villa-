# Fashion Factory Tailor Management

Mobile-first MVP for showroom alteration management.

## Current MVP
- Showroom/Admin dashboard
- Tailor view
- 4-digit PIN prototype login
- New alteration entry
- Tailor assignment
- Pending / In Progress / Ready / Delivered workflow
- Customer, bill and alteration search
- Tailor-wise payment report
- Mobile-first Fashion Factory UI

## Data
The current UI uses browser storage for the prototype so the workflow can be tested safely. Supabase database schema is already prepared separately. The next integration phase will replace local demo storage with authenticated Supabase reads/writes and enforce tailor-specific access using RLS.

## Security note
The demo PINs in this prototype are not production authentication. Production login will use a secure server-side authentication flow and hashed credentials.
