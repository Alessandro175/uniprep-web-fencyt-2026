// ==========================================
// PREUNI - CONEXIÓN SUPABASE
// ==========================================
const SUPABASE_URL =
  "https://dpwhcsrbtrcbyqryedfp.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_-YiBahW4cWbOkn1VCRdltA_Ope8mlnx";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

window.supabaseClient = supabaseClient;

console.log("✅ Supabase conectado correctamente");