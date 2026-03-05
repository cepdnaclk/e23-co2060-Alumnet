// src/styles/ui.js
export const theme = {
  blue: "#0b2a6f",
  white: "#ffffff",
  text: "#0b2a6f",
  lightGray: "#f3f4f6",
  border: "rgba(11,42,111,0.18)",
  borderSoft: "rgba(11,42,111,0.12)",
};

export const pageWrapStyle = (heroBg) => ({
  minHeight: "100vh",
  backgroundImage: `linear-gradient(rgba(11,42,111,0.9), rgba(11,42,111,0.9)), url(${heroBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "grid",
  placeItems: "center",
  padding: "40px 20px",
  fontFamily: "DM Sans, sans-serif",
});

export const cardStyle = {
  width: "100%",
  maxWidth: 460,
  borderRadius: 14,
  padding: "32px 36px",
  background: "rgba(255,255,255,0.96)",
  boxShadow: "0 20px 60px rgba(0,0,0,.25)",
  border: "1px solid rgba(255,255,255,0.55)",
  backdropFilter: "blur(10px)",
};

export const titleStyle = {
  margin: "0 0 22px",
  fontSize: 30,
  textAlign: "center",
  color: theme.text,
  fontWeight: 700,
};

export const subtitleStyle = {
  marginTop: -12,
  marginBottom: 18,
  textAlign: "center",
  opacity: 0.82,
  color: theme.text,
};

export const labelStyle = {
  display: "block",
  marginBottom: 6,
  marginTop: 14,
  fontSize: 14,
  color: theme.text,
};

export const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1px solid ${theme.border}`,
  outline: "none",
  background: "rgba(255,255,255,0.98)",
  marginBottom: 14,
  fontFamily: "DM Sans, sans-serif",
};

export const selectStyle = {
  ...inputStyle,
  appearance: "none",
};

export const btnPrimaryStyle = {
  width: "100%",
  marginTop: 8,
  padding: "12px 14px",
  borderRadius: 10,
  border: "none",
  background: theme.blue,
  color: theme.white,
  fontWeight: 600,
  fontFamily: "DM Sans, sans-serif",
};

export const btnSecondaryStyle = {
  width: "100%",
  marginTop: 10,
  padding: "12px 14px",
  borderRadius: 10,
  border: `1px solid ${theme.border}`,
  background: "white",
  color: theme.blue,
  fontWeight: 600,
  fontFamily: "DM Sans, sans-serif",
};

export const footerRowStyle = {
  marginTop: 16,
  paddingTop: 14,
  borderTop: `1px solid ${theme.borderSoft}`,
  textAlign: "center",
  color: theme.text,
};

export const linkStyle = {
  color: theme.blue,
  textDecoration: "none",
  fontWeight: 500,
};

export const badge = (variant) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    border: `1px solid ${theme.border}`,
    background: "rgba(255,255,255,0.8)",
    color: theme.blue,
  };

  if (variant === "verified") {
    return { ...base, border: "1px solid rgba(22,163,74,0.35)", color: "#166534" };
  }
  if (variant === "pending") {
    return { ...base, border: "1px solid rgba(245,158,11,0.35)", color: "#92400e" };
  }
  if (variant === "admin") {
    return { ...base, border: "1px solid rgba(59,130,246,0.35)", color: "#1d4ed8" };
  }
  return base;
};

export const errorBoxStyle = {
  marginTop: 8,
  background: "rgba(255,0,0,0.08)",
  border: "1px solid rgba(255,0,0,0.22)",
  padding: 10,
  borderRadius: 10,
  color: "#b91c1c",
  fontSize: 13,
};

export const uiCss = `
.card{
  transform: translateY(10px);
  opacity:0;
  transition: transform .55s ease, opacity .55s ease;
}
.card.in{
  transform: translateY(0);
  opacity:1;
}
input:focus, select:focus, textarea:focus{
  border-color: rgba(11,42,111,0.4) !important;
  box-shadow: 0 0 0 4px rgba(11,42,111,0.12);
}
.btnPrimary, .btnSecondary{
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.btnPrimary:hover, .btnSecondary:hover{
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0,0,0,.25);
  filter: brightness(1.02);
}
.link:hover{
  text-decoration: underline;
}
.grid2{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 640px){
  .grid2{ grid-template-columns: 1fr; }
}
`;

