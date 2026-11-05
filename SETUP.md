# Leerpad: parent monitoring setup (about 15 minutes)

Kids log in with a **family code + 4-digit PIN**. You log in with e-mail + password and see every child's progress from any device.

1. **Supabase project.** Create a free account and a new project at supabase.com. Pick an EU region.
2. **Database.** Dashboard → SQL Editor → paste all of `schema.sql` → Run. (Safe to run again.)
3. **Parent login.** Dashboard → Authentication → Sign In / Providers → Email. Leave it enabled. For the quickest start turn **Confirm email** off; otherwise you must click the link in the confirmation mail once.
4. **Keys.** Dashboard → Project Settings → API. Copy the **Project URL** and the **anon / publishable key** into `config.js`. (These are meant to be public; the tables are locked by row-level security.)
5. **Host the folder.** It is plain static files. Easiest: drag the folder onto app.netlify.com/drop, or use Cloudflare Pages or GitHub Pages. It must be served over https. The claude.ai-hosted preview cannot talk to Supabase.
6. **First use.** Open the site → "Ik ben ouder" → Account maken → add each child with a name, level and PIN → on the kids' phones choose "Ik ben leerling", enter the family code, pick their name, enter the PIN. "Add to Home Screen" installs it like an app.

## How it works
- Each child's progress (XP, streak, per-unit results, history) is saved to the server after every lesson and is also kept on the device, so it works offline and syncs later.
- Children cannot read or write tables directly. They only call functions that check the PIN. 5 wrong PINs lock that child for 15 minutes.
- Changing a PIN in the parent view signs the child out on their next visit.
- Updating exercises later does not affect saved progress. Keep unit ids stable.
- The family code is not secret on its own (it only shows first names and levels), but progress cannot be read or changed without the PIN.
