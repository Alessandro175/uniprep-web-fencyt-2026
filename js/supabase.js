// ==========================================
// PREUNI - CONEXIÓN SUPABASE
// ==========================================
const SUPABASE_URL =
  "https://dpwhcsrbtrcbyqryedfp.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_-YiBahW4cWbOkn1VCRdltA_Ope8mlnx";

let supabaseClient = null;

if (!window.supabase?.createClient) {
  console.error(
    "❌ No se pudo cargar la librería de Supabase. Revisa tu conexión y recarga la página."
  );
} else {
  supabaseClient = window.supabase.createClient(
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

  console.log("✅ Supabase conectado correctamente");
}

window.supabaseClient = supabaseClient;
