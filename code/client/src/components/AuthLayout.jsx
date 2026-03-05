// src/components/AuthLayout.jsx
import { useEffect, useState } from "react";
import heroBg from "../assets/hero-bg.jpeg";
import { pageWrapStyle, cardStyle, uiCss } from "../styles/ui";

export default function AuthLayout({ children, maxWidth = 460 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={pageWrapStyle(heroBg)}>
      <style>{uiCss}</style>

      <div
        className={`card ${mounted ? "in" : ""}`}
        style={{ ...cardStyle, maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}