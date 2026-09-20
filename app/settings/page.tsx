"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const ai = localStorage.getItem("syntanki:ai_enabled");
    if (ai !== null) setAiEnabled(ai === "true");
    const gk = localStorage.getItem("syntanki:gemini_key");
    if (gk) setGeminiKey(gk);
    const ok = localStorage.getItem("syntanki:openai_key");
    if (ok) setOpenaiKey(ok);
  }, []);

  const save = () => {
    localStorage.setItem("syntanki:ai_enabled", String(aiEnabled));
    localStorage.setItem("syntanki:gemini_key", geminiKey);
    localStorage.setItem("syntanki:openai_key", openaiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>Settings</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>AI Instructor</h2>
        <p style={{ color: "#888", marginBottom: 12 }}>
          Off by default. When enabled, AI can rephrase questions and generate
          mnemonics. Your keys stay in localStorage only.
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
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
          <h2>API Keys (BYOK)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, color: "#888" }}>
                Gemini API Key (free tier)
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                style={{ padding: 8, borderRadius: 4, border: "1px solid #333", width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, color: "#888" }}>
                OpenAI API Key (optional)
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                style={{ padding: 8, borderRadius: 4, border: "1px solid #333", width: "100%" }}
              />
            </div>
          </div>
        </section>
      )}

      <button
        onClick={save}
        style={{
          padding: "8px 24px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Save
      </button>
      {saved && <span style={{ marginLeft: 12, color: "#16a34a" }}>Saved.</span>}

      <p style={{ marginTop: 24 }}>
        <a href="/">Back to decks</a>
      </p>
    </main>
  );
}
