// ============================================================
// CARO LERICHE — BEHEER · publieke configuratie
// ------------------------------------------------------------
// ⚠️ Alleen PUBLIEKE sleutels. De anon key is veilig openbaar:
// de database is beschermd met RLS (Row Level Security).
// ============================================================

const SUPABASE_URL      = 'https://kgudzqwwoulynhmfqusf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndWR6cXd3b3VseW5obWZxdXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNzMyODEsImV4cCI6MjEwMTk0OTI4MX0.B0DtPJLTpJhXSgz4aB8hZCdmzMN2fqyrGqRMakPrgBo';

// Netlify build hook — na opslaan laat het dashboard de site herbouwen.
// Vul later de build hook-URL in (Netlify → Site config → Build & deploy → Build hooks).
const NETLIFY_BUILD_HOOK = '';
