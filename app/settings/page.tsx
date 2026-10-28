"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const ai = localStorage.getItem("syntanki:ai_enabled");
    if (ai !== null) setAiEnabled(ai === "true");
    const gk = localStorage.getItem("syntanki:gemini_key");
    if (gk) setGeminiKey(gk);
    const ok = localStorage.getItem("syntanki:openai_key");
    if (ok) setOpenaiKey(ok);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const applyTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    if (t === "system") {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    } else {
      localStorage.setItem("theme", t);
      document.documentElement.setAttribute("data-theme", t);
    }
  };

  const save = () => {
    localStorage.setItem("syntanki:ai_enabled", String(aiEnabled));
    localStorage.setItem("syntanki:gemini_key", geminiKey);
    localStorage.setItem("syntanki:openai_key", openaiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ color: "var(--ink)", marginBottom: 24 }}>Settings</h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: "var(--ink)", marginBottom: 8 }}>Appearance</h2>
        <p style={{ color: "var(--mute)", marginBottom: 12 }}>
          Choose how Syntanki looks. System follows your OS preference.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => applyTheme(t)}
              style={{
                padding: "8px 16px",
                background: theme === t ? "var(--primary)" : "var(--surface-soft)",
                color: theme === t ? "var(--ink)" : "var(--body)",
                border: "1px solid var(--hairline)",
                borderRadius: 6,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: "var(--ink)", marginBottom: 8 }}>AI Instructor</h2>
        <p style={{ color: "var(--mute)", marginBottom: 12 }}>
          Off by default. When enabled, AI can rephrase questions and generate
          mnemonics. Your keys stay in localStorage only.
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--body)" }}>
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
          />
          <span>{aiEnabled ? "Enabled" : "Disabled"}</span>
        </label>
      </section>

      {aiEnabled && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ color: "var(--ink)", marginBottom: 8 }}>API Keys (BYOK)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, color: "var(--mute)" }}>
                Gemini API Key (free tier)
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid var(--hairline)",
                  width: "100%",
                  background: "var(--surface-card)",
                  color: "var(--ink)",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, color: "var(--mute)" }}>
                OpenAI API Key (optional)
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid var(--hairline)",
                  width: "100%",
                  background: "var(--surface-card)",
                  color: "var(--ink)",
                }}
              />
            </div>
          </div>
        </section>
      )}

      <button
        onClick={save}
        style={{
          padding: "8px 24px",
          background: "var(--primary)",
          color: "var(--ink)",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Save
      </button>
      {saved && <span style={{ marginLeft: 12, color: "var(--mute)" }}>Saved.</span>}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: "var(--ink)", marginBottom: 8 }}>Cross-Device Sync</h2>
        <p style={{ color: "var(--mute)", marginBottom: 12 }}>
          Sync is manual and opt-in: export a deck JSON from one device, import it
          on another. Works offline, no server, no account. When both devices have
          the same deck, the newer export wins (Last-Write-Wins by client time).
        </p>
        <p style={{ color: "var(--mute)", fontSize: 12, marginBottom: 12 }}>
          Use the Export button on any deck card, then Restore from JSON in the
          deck drawer on your other device.
        </p>
      </section>

      <p style={{ marginTop: 24 }}>
        <a href="/">Back to decks</a>
      </p>
    </main>
  );
}
