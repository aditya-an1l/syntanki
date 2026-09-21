"use client";

import { useState, useEffect } from "react";

export default function Banner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("syntanki:banner-dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("syntanki:banner-dismissed", "true");
  };

  if (!visible) return null;

  return (
    <div
      style={{
        background: "var(--surface-soft)",
        borderBottom: "1px solid var(--hairline)",
        padding: "8px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        fontSize: 14,
        color: "var(--body)",
      }}
    >
      <span>Work Ongoing - This app is actively being developed</span>
      <button
        onClick={dismiss}
        style={{
          background: "none",
          border: "none",
          color: "var(--mute)",
          cursor: "pointer",
          fontSize: 16,
          padding: 0,
          lineHeight: 1,
        }}
      >
        x
      </button>
    </div>
  );
}
