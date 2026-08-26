# Fashion Factory Tailor Management

Mobile-first web app for showroom alteration management.

## Live architecture
- Static mobile-first frontend in GitHub Pages compatible HTML/CSS/JS
- Supabase PostgreSQL database
- Supabase Edge Function `tailor-api` for server-side PIN authentication and all data operations
- Tailor-specific job filtering enforced by the API session
- Session tokens expire after 30 days

## Current features
- Showroom/Admin login with 4-digit PIN
- Tailor login with 4-digit PIN; tailor is identified automatically
- New alteration entry
- Customer + mobile + bill details
- Size, measurements and special instructions
- Tailor assignment / reassignment
- Pending → In Progress → Ready → Delivered
- Tailor sees only assigned jobs
- Search by customer, mobile, bill or alteration number
- Tailor-wise monthly payment report
- Mobile-first Fashion Factory UI

## Initial demo PINs
- Showroom/Admin: `1234`
- Hiteshbhai: `1111`
- Hardik: `2222`

These are starter PINs only and should be changed before real production use.

## Database
Supabase tables include customers, tailors, profiles, alterations, sessions and tailor_rates. The frontend no longer uses browser localStorage for job data; live job data is read/written through the Supabase Edge Function.
