// static/config.js
const SUPABASE_URL = 'https://sdiumcscsekpumdfkprh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fsLSmMBdrJldk-MjbAgCsQ_r8gdLFiK';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Shared Logout function
async function logout() {
    await _supabase.auth.signOut();
    localStorage.removeItem('sb-access-token');
    window.location.href = '/login';
}