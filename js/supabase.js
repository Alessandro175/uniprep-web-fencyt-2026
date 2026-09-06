// ==========================================
// PREUNI - CONEXIÓN SUPABASE
// ==========================================
const SUPABASE_URL =
  "https://dpwhcsrbtrcbyqryedfp.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_-YiBahW4cWbOkn1VCRdltA_Ope8mlnx";

let supabaseClient = null;

if (window.supabase?.createClient) {
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
} else {
  console.error("Supabase no pudo cargarse. Los módulos locales continúan disponibles, pero las cuentas necesitan conexión.");
  document.documentElement.dataset.supabaseStatus = "unavailable";
}

window.supabaseClient = supabaseClient;

if (supabaseClient) {
  document.documentElement.dataset.supabaseStatus = "ready";
  console.log("✅ Supabase conectado correctamente");
}
