const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const app = express();
app.use(cors({ origin: /\.solutionprime\.com\.br$/, credentials: true }));
app.use(express.json());

const PORT = 3004;
const RELAY_SECRET = "LmHub2026_R3lay_S3cret!";

const HUB_URL = "https://masvrduahiaiowfoltlu.supabase.co";
const HUB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hc3ZyZHVhaGlhaW93Zm9sdGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDY1MjEsImV4cCI6MjA4ODkyMjUyMX0.Z0OcrGW70-j0h3ETJyLjP25KPrA0FeD-1t3sr0Wzms8";

const APPS = {
  loumind: { url: "https://dafmslttspnbgrhyqsez.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZm1zbHR0c3BuYmdyaHlxc2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDkxODYsImV4cCI6MjA4ODQ4NTE4Nn0.LdK9-JP84as9sTABBRgE9lxkNAeC4l8zd-RgLjaYrII" },
  louflow: { url: "https://zmmcvvtwspptcocttxso.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbWN2dnR3c3BwdGNvY3R0eHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ0NTUsImV4cCI6MjA3NTExMDQ1NX0.Cpsu43BFBnW0ekHSm8hhlc1p4C-02Vqq2mwiXHYIuBM" },
  loutv: { url: "https://uegbnizlqxsquacarfgb.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZ2JuaXpscXhzcXVhY2FyZmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ3MjIsImV4cCI6MjA4ODQ5MDcyMn0.BwioqTdDHYIB2GnEnnsvrD6tkrfJ9w1m_lcXf68cvtg" },
  bi: { url: "https://tovhpfkfofzrrjxrjuwq.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdmhwZmtmb2Z6cnJqeHJqdXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ3ODcsImV4cCI6MjA4ODQ5MDc4N30.n6FE2SyPgRwgdj-fjtlXEk4uyrjbAcTTgD9otQYLhaU" },
  pmo: { url: "https://fyncuyebwnsefjqiifpj.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bmN1eWVid25zZWZqcWlpZnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4MDIsImV4cCI6MjA4ODQ5MDgwMn0.6dyE4i2bK1WIoYRR14e4nbis7V3nSOuTnEdyx3lAVCI" },
  rh: { url: "https://dvcmakuzchhmwcuyhqsr.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Y21ha3V6Y2hobXdjdXlocXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4MTYsImV4cCI6MjA4ODQ5MDgxNn0.ljv0ahV_Ov3B5tJ5uzRlvTA_oXp7Pha5fxkx_z444PE" },
  meet: { url: "https://esqdjfkvihaplhvdnjuo.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcWRqZmt2aWhhcGxodmRuanVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4MzEsImV4cCI6MjA4ODQ5MDgzMX0.5X1PpWw-DyvxjYZx73eTP3jeZs4k6U4JAYp79MxDQis" },
  orcamento: { url: "https://vdylkdyxuzkkiujuyeyi.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeWxrZHl4dXpra2l1anV5ZXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4NDYsImV4cCI6MjA4ODQ5MDg0Nn0.fFkejh-ERX1kUWEegqpWObYVOzbmrZL89doUTqMWAm4" },
  docs: { url: "https://igdalbefrhqxruulwtsb.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZGFsYmVmcmhxeHJ1dWx3dHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4OTIsImV4cCI6MjA4ODQ5MDg5Mn0.HaO5x7etMKjxdc75JTYw59AScwkBgq2ngzh5v0yrwG0" },
  dbstudio: { url: "https://qopjikfnvusaidpjzlsg.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcGppa2ZudnVzYWlkcGp6bHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4NjksImV4cCI6MjA4ODQ5MDg2OX0.8XHwZwPvDIV64hsw2d69GsmnLS75wOw5vU0TBWEWGFs" },
  historico: { url: "https://whhnsahboqluhuwxwsbq.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaG5zYWhib3FsdWh1d3h3c2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4ODAsImV4cCI6MjA4ODQ5MDg4MH0.zrKLTKtEPBtqmUnqoy9UqtuStRc5VTTwAJ9gQOOqSeY" },
  loudata: { url: "https://civfillqwqhtrhxzcgwi.supabase.co", anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdmZpbGxxd3FodHJoeHpjZ3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ4NjAsImV4cCI6MjA4ODQ5MDg2MH0.hqHNQD5H1aW_PKUSfgtIT6GCVyWxMAJP59x1O63T7Sw" },
};

function genPassword(email) {
  return crypto.createHash("sha256").update(email + "_loumar_hub_2026_relay").digest("hex");
}

app.post("/auth/session", async (req, res) => {
  try {
    const { hub_token, app_id } = req.body;
    if (!hub_token || !app_id) return res.status(400).json({ error: "Missing hub_token or app_id" });

    const appConfig = APPS[app_id];
    if (!appConfig) return res.status(400).json({ error: "Unknown app: " + app_id });

    // Validar hub token e criar client autenticado
    const hubClient = createClient(HUB_URL, HUB_ANON, {
      global: { headers: { Authorization: "Bearer " + hub_token } }
    });
    const { data: { user }, error: authErr } = await hubClient.auth.getUser(hub_token);
    if (authErr || !user) return res.status(401).json({ error: "Invalid hub token" });

    // Buscar perfil e acesso (client autenticado com token do usuario)
    const { data: profile } = await hubClient.from("profiles").select("*").eq("id", user.id).single();
    if (!profile) return res.status(403).json({ error: "No profile found" });

    let hasAccess = profile.role === "admin";
    if (!hasAccess) {
      const { data: access } = await hubClient.from("user_platform_access").select("platform_id").eq("user_id", user.id);
      hasAccess = access?.some(a => a.platform_id === app_id);
    }
    if (!hasAccess) return res.status(403).json({ error: "No access to " + app_id });

    // Criar/garantir usuario na app via RPC
    const appClient = createClient(appConfig.url, appConfig.anon);
    const { error: rpcErr } = await appClient.rpc("hub_create_session", {
      p_email: user.email,
      p_full_name: profile.full_name || "",
      p_secret: RELAY_SECRET,
    });

    if (rpcErr) {
      console.error("RPC error for", app_id, ":", rpcErr.message);
      return res.status(500).json({ error: "Failed to provision user in " + app_id });
    }

    // SignIn na app
    const password = genPassword(user.email);
    const { data: signInData, error: signInErr } = await appClient.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (signInErr) {
      console.error("SignIn error for", app_id, ":", signInErr.message);
      return res.status(500).json({ error: "Failed to sign in to " + app_id });
    }

    const appRef = appConfig.url.replace("https://", "").replace(".supabase.co", "");
    res.json({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      expires_at: signInData.session.expires_at,
      user: { id: signInData.user.id, email: signInData.user.email },
      app_ref: appRef,
    });
  } catch (err) {
    console.error("Relay error:", err.message);
    res.status(500).json({ error: "Internal relay error" });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok", apps: Object.keys(APPS).length }));

app.listen(PORT, () => console.log("Auth Relay running on port", PORT));
