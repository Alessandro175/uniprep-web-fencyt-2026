// =========================================================
// UNIPREP · SINCRONIZACIÓN SEGURA CON SUPABASE
// Preferencias, materiales IA, orientación y consumo estimado.
// La aplicación siempre conserva un respaldo local y funciona sin conexión.
// =========================================================
(function () {
  "use strict";

  const QUEUE_KEY = "uniprep_cloud_queue_v1";
  const LOCAL_USAGE_KEY = "uniprep_ai_usage_local_v1";
  const timers = new Map();
  let cloudAvailable = true;
  let universeAvailable = true;

  function storageRead(key, fallback) {
    return window.uniprepStorage?.leer?.(key, fallback) ?? fallback;
  }

  function storageWrite(key, value) {
    try { window.uniprepStorage?.guardar?.(key, value); } catch (_) {}
    return value;
  }

  function cleanText(value, max = 120) {
    return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
  }

  function schemaMissing(error) {
    return /relation|column|schema cache|PGRST20|42P01|42703/i.test(error?.message || "");
  }

  async function user() {
    try {
      const session = await window.supabaseClient?.auth?.getSession?.();
      return session?.data?.session?.user || null;
    } catch (_) {
      return null;
    }
  }

  function announce(state, detail = {}) {
    document.dispatchEvent(new CustomEvent("uniprep:cloud-sync", {detail:{state, ...detail}}));
  }

  function queue(operation) {
    const current = storageRead(QUEUE_KEY, []);
    const next = Array.isArray(current) ? current : [];
    const identity = `${operation.type}:${operation.key || operation.payload?.id || "single"}`;
    const filtered = next.filter(item => `${item.type}:${item.key || item.payload?.id || "single"}` !== identity);
    filtered.push({...operation, queuedAt:new Date().toISOString()});
    storageWrite(QUEUE_KEY, filtered.slice(-30));
    announce("local", {pending:filtered.length});
  }

  async function preferenceRow() {
    const active = await user();
    if (!active?.id || !window.supabaseClient || !cloudAvailable) return null;
    const {data, error} = await window.supabaseClient
      .from("user_preferences")
      .select("visual,tutor,accessibility,intro_seen_at,updated_at")
      .eq("user_id", active.id)
      .maybeSingle();
    if (error) {
      if (schemaMissing(error)) cloudAvailable = false;
      return null;
    }
    return data || null;
  }

  async function savePreferences(patch = {}, options = {}) {
    const active = await user();
    if (!active?.id || !window.supabaseClient || !cloudAvailable) {
      if (!options.skipQueue) queue({type:"preferences", key:"main", payload:patch});
      return {ok:false, local:true};
    }
    try {
      const previous = await preferenceRow() || {};
      const row = {
        user_id:active.id,
        visual:patch.visual === undefined ? (previous.visual || {}) : {...(previous.visual || {}), ...(patch.visual || {})},
        tutor:patch.tutor === undefined ? (previous.tutor || {}) : {...(previous.tutor || {}), ...(patch.tutor || {})},
        accessibility:patch.accessibility === undefined ? (previous.accessibility || {}) : {...(previous.accessibility || {}), ...(patch.accessibility || {})},
        intro_seen_at:patch.introSeen === undefined ? (previous.intro_seen_at || null) : (patch.introSeen ? new Date().toISOString() : null),
        updated_at:new Date().toISOString()
      };
      const {error} = await window.supabaseClient.from("user_preferences").upsert(row, {onConflict:"user_id"});
      if (error) throw error;
      announce("synced", {resource:"preferences"});
      return {ok:true, data:row};
    } catch (error) {
      if (schemaMissing(error)) cloudAvailable = false;
      if (!options.skipQueue) queue({type:"preferences", key:"main", payload:patch});
      return {ok:false, local:true, error:error?.message || "sync_failed"};
    }
  }

  function savePreferencesSoon(patch, delay = 650) {
    const key = Object.keys(patch || {}).sort().join("-") || "preferences";
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => {
      timers.delete(key);
      savePreferences(patch);
    }, delay));
  }

  async function saveStudyPack(pack, options = {}) {
    const active = await user();
    const safe = pack && typeof pack === "object" ? JSON.parse(JSON.stringify(pack)) : null;
    if (!safe?.id) return {ok:false};
    if (!active?.id || !window.supabaseClient || !cloudAvailable) {
      if (!options.skipQueue) queue({type:"study_pack", key:safe.id, payload:safe});
      return {ok:false, local:true};
    }
    try {
      const {error} = await window.supabaseClient.from("ai_study_packs").upsert({
        user_id:active.id,
        id:cleanText(safe.id, 100),
        title:cleanText(safe.title, 180),
        course_id:cleanText(safe.courseId, 60),
        content:safe,
        updated_at:new Date().toISOString()
      }, {onConflict:"user_id,id"});
      if (error) throw error;
      announce("synced", {resource:"study_pack"});
      return {ok:true};
    } catch (error) {
      if (schemaMissing(error)) cloudAvailable = false;
      if (!options.skipQueue) queue({type:"study_pack", key:safe.id, payload:safe});
      return {ok:false, local:true, error:error?.message};
    }
  }

  async function deleteStudyPack(id, options = {}) {
    const active = await user();
    if (!active?.id || !window.supabaseClient || !cloudAvailable) {
      if (!options.skipQueue) queue({type:"delete_pack", key:cleanText(id, 100), payload:{id}});
      return {ok:false, local:true};
    }
    const {error} = await window.supabaseClient.from("ai_study_packs").delete().eq("user_id", active.id).eq("id", cleanText(id, 100));
    if (error) {
      if (!options.skipQueue) queue({type:"delete_pack", key:cleanText(id, 100), payload:{id}});
      return {ok:false, error:error.message};
    }
    return {ok:true};
  }

  async function loadStudyPacks(limit = 12) {
    const active = await user();
    if (!active?.id || !window.supabaseClient || !cloudAvailable) return [];
    const {data, error} = await window.supabaseClient.from("ai_study_packs").select("content").eq("user_id", active.id).order("updated_at", {ascending:false}).limit(Math.min(24, Math.max(1, limit)));
    if (error) return [];
    return (data || []).map(row => row.content).filter(pack => pack?.id && pack?.title);
  }

  async function saveVocationalResult(result, options = {}) {
    const active = await user();
    if (!result || typeof result !== "object") return {ok:false};
    if (!active?.id || !window.supabaseClient || !cloudAvailable) {
      if (!options.skipQueue) queue({type:"vocational", key:"latest", payload:result});
      return {ok:false, local:true};
    }
    const {error} = await window.supabaseClient.from("vocational_results").upsert({user_id:active.id, result, updated_at:new Date().toISOString()}, {onConflict:"user_id"});
    if (error) {
      if (!options.skipQueue) queue({type:"vocational", key:"latest", payload:result});
      return {ok:false, error:error.message};
    }
    announce("synced", {resource:"vocational"});
    return {ok:true};
  }

  async function loadVocationalResult() {
    const active = await user();
    if (!active?.id || !window.supabaseClient || !cloudAvailable) return null;
    const {data, error} = await window.supabaseClient.from("vocational_results").select("result,updated_at").eq("user_id", active.id).maybeSingle();
    return error ? null : (data?.result || null);
  }

  async function saveFeedback(input = {}) {
    const active = await user();
    if (!active?.id || !window.supabaseClient || !cloudAvailable) return {ok:false, local:true};
    const rating = Number(input.rating) === -1 ? -1 : 1;
    const {error} = await window.supabaseClient.from("ai_feedback").insert({
      user_id:active.id,
      message_id:cleanText(input.messageId, 100),
      rating,
      context:{courseId:cleanText(input.courseId, 60), mode:cleanText(input.mode, 30)}
    });
    return {ok:!error, error:error?.message};
  }

  function normalizeUsage(usage = {}, model = "gpt-5.6-luna", requestType = "chat") {
    const inputTokens = Math.max(0, Number(usage.input_tokens ?? usage.prompt_tokens) || 0);
    const outputTokens = Math.max(0, Number(usage.output_tokens ?? usage.completion_tokens) || 0);
    const price = /sol/i.test(model) ? [4, 20] : /terra/i.test(model) ? [2, 12] : [0.2, 1.2];
    const estimatedUsd = inputTokens / 1e6 * price[0] + outputTokens / 1e6 * price[1];
    return {request_type:cleanText(requestType, 40), model:cleanText(model, 80), input_tokens:inputTokens, output_tokens:outputTokens, estimated_cost_usd:Number(estimatedUsd.toFixed(8)), created_at:new Date().toISOString()};
  }

  async function trackUsage(usage, model, requestType = "chat") {
    const row = normalizeUsage(usage, model, requestType);
    const local = storageRead(LOCAL_USAGE_KEY, []);
    storageWrite(LOCAL_USAGE_KEY, [row, ...(Array.isArray(local) ? local : [])].slice(0, 500));
    const active = await user();
    if (!active?.id || !window.supabaseClient || !cloudAvailable) return row;
    try { await window.supabaseClient.from("ai_usage_events").insert({user_id:active.id, ...row}); } catch (_) {}
    document.dispatchEvent(new CustomEvent("uniprep:ai-usage", {detail:row}));
    return row;
  }

  function localUsageSummary() {
    const rows = storageRead(LOCAL_USAGE_KEY, []);
    return (Array.isArray(rows) ? rows : []).reduce((sum, row) => ({
      requests:sum.requests + 1,
      inputTokens:sum.inputTokens + (Number(row.input_tokens) || 0),
      outputTokens:sum.outputTokens + (Number(row.output_tokens) || 0),
      estimatedUsd:sum.estimatedUsd + (Number(row.estimated_cost_usd) || 0)
    }), {requests:0,inputTokens:0,outputTokens:0,estimatedUsd:0});
  }

  async function saveUniverseState(input = {}, options = {}) {
    const active = await user();
    const safe = input && typeof input === "object" ? JSON.parse(JSON.stringify(input)) : {};
    if (!active?.id || !window.supabaseClient || !universeAvailable) {
      if (!options.skipQueue) queue({type:"universe_state", key:"main", payload:safe});
      return {ok:false, local:true};
    }
    try {
      const row = {user_id:active.id, state:safe, updated_at:new Date().toISOString()};
      const {error} = await window.supabaseClient.from("universe_profiles").upsert(row, {onConflict:"user_id"});
      if (error) throw error;
      announce("synced", {resource:"universe"});
      return {ok:true, data:row};
    } catch (error) {
      if (schemaMissing(error)) universeAvailable = false;
      if (!options.skipQueue) queue({type:"universe_state", key:"main", payload:safe});
      return {ok:false, local:true, error:error?.message || "universe_sync_failed"};
    }
  }

  async function loadUniverseState() {
    const active = await user();
    if (!active?.id || !window.supabaseClient || !universeAvailable) return null;
    const {data, error} = await window.supabaseClient
      .from("universe_profiles")
      .select("state,updated_at")
      .eq("user_id", active.id)
      .maybeSingle();
    if (error) {
      if (schemaMissing(error)) universeAvailable = false;
      return null;
    }
    return data || null;
  }

  async function logUniverseEvent(eventType, payload = {}, options = {}) {
    const active = await user();
    const safeType = cleanText(eventType || "interaction", 60);
    const safePayload = payload && typeof payload === "object" ? JSON.parse(JSON.stringify(payload)) : {};
    if (!active?.id || !window.supabaseClient || !universeAvailable) {
      if (!options.skipQueue) queue({type:"universe_event", key:`${safeType}_${Date.now()}`, payload:{eventType:safeType,data:safePayload}});
      return {ok:false, local:true};
    }
    try {
      const {error} = await window.supabaseClient.from("universe_events").insert({user_id:active.id,event_type:safeType,event_data:safePayload});
      if (error) throw error;
      return {ok:true};
    } catch (error) {
      if (schemaMissing(error)) universeAvailable = false;
      if (!options.skipQueue) queue({type:"universe_event", key:`${safeType}_${Date.now()}`, payload:{eventType:safeType,data:safePayload}});
      return {ok:false, local:true, error:error?.message || "universe_event_failed"};
    }
  }

  async function flushQueue() {
    if (!navigator.onLine) return;
    const items = storageRead(QUEUE_KEY, []);
    if (!Array.isArray(items) || !items.length) return;
    const pending = [];
    for (const item of items) {
      let result = {ok:false};
      if (item.type === "preferences") result = await savePreferences(item.payload, {skipQueue:true});
      if (item.type === "study_pack") result = await saveStudyPack(item.payload, {skipQueue:true});
      if (item.type === "delete_pack") result = await deleteStudyPack(item.payload?.id, {skipQueue:true});
      if (item.type === "vocational") result = await saveVocationalResult(item.payload, {skipQueue:true});
      if (item.type === "universe_state") result = await saveUniverseState(item.payload, {skipQueue:true});
      if (item.type === "universe_event") result = await logUniverseEvent(item.payload?.eventType, item.payload?.data, {skipQueue:true});
      if (!result?.ok) pending.push(item);
    }
    storageWrite(QUEUE_KEY, pending);
    announce(pending.length ? "local" : "synced", {pending:pending.length});
  }

  window.UniPrepCloud = {
    getPreferences:preferenceRow,
    savePreferences,
    savePreferencesSoon,
    saveStudyPack,
    deleteStudyPack,
    loadStudyPacks,
    saveVocationalResult,
    loadVocationalResult,
    saveFeedback,
    trackUsage,
    localUsageSummary,
    saveUniverseState,
    loadUniverseState,
    logUniverseEvent,
    flushQueue,
    isConfigured:() => cloudAvailable
  };

  window.addEventListener("online", flushQueue);
  document.addEventListener("uniprep:user-ready", flushQueue);
})();
