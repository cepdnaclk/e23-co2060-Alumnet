export const theme = {
  bg: "#e8e7e3",
  surface: "rgba(250,249,246,0.78)",
  surfaceStrong: "rgba(255,255,255,0.88)",
  text: "#111111",
  textSoft: "rgba(17,17,17,0.66)",
  border: "rgba(0,0,0,0.10)",
  borderSoft: "rgba(0,0,0,0.06)",
  black: "#111111",
  white: "#ffffff",
  teal: "#7ea7ae",
  tealSoft: "rgba(126,167,174,0.16)",
};

export const pageWrapStyle = () => ({
  minHeight: "100vh",
  background: theme.bg,
  display: "grid",
  placeItems: "center",
  padding: "32px 18px",
  fontFamily: '"Google Sans", Arial, sans-serif',
});

export const cardStyle = {
  width: "100%",
  borderRadius: 30,
  padding: "34px 30px 28px",
  background: theme.surface,
  border: `1px solid ${theme.borderSoft}`,
  boxShadow: "0 14px 34px rgba(0,0,0,0.045)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

export const titleStyle = {
  margin: "0 0 8px",
  fontSize: 34,
  lineHeight: 1.02,
  textAlign: "center",
  color: theme.text,
  fontWeight: 400,
  letterSpacing: "-0.04em",
};

export const subtitleStyle = {
  margin: "0 0 24px",
  textAlign: "center",
  color: theme.textSoft,
  fontSize: 15,
  lineHeight: 1.6,
};

export const sectionTitleStyle = {
  margin: "4px 0 12px",
  fontSize: 18,
  lineHeight: 1.2,
  color: theme.text,
  fontWeight: 400,
  letterSpacing: "-0.02em",
};

export const labelStyle = {
  display: "block",
  marginBottom: 7,
  marginTop: 10,
  fontSize: 14,
  color: theme.text,
};

export const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: `1px solid ${theme.border}`,
  outline: "none",
  background: "rgba(255,255,255,0.76)",
  color: theme.text,
  marginBottom: 10,
  fontFamily: '"Google Sans", Arial, sans-serif',
  fontSize: 15,
  transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
};

export const textareaStyle = {
  ...inputStyle,
  minHeight: 96,
  resize: "vertical",
};

export const selectStyle = {
  ...inputStyle,
  appearance: "none",
};

export const btnPrimaryStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 999,
  border: "none",
  background: theme.black,
  color: theme.white,
  fontSize: 15,
  fontWeight: 400,
  fontFamily: '"Google Sans", Arial, sans-serif',
};

export const btnSecondaryStyle = {
  width: "100%",
  marginTop: 10,
  padding: "12px 14px",
  borderRadius: 999,
  border: `1px solid ${theme.border}`,
  background: "rgba(255,255,255,0.72)",
  color: theme.text,
  fontWeight: 400,
  fontFamily: '"Google Sans", Arial, sans-serif',
};

export const footerRowStyle = {
  marginTop: 18,
  paddingTop: 14,
  borderTop: `1px solid ${theme.borderSoft}`,
  textAlign: "center",
  color: theme.textSoft,
  fontSize: 15,
};

export const linkStyle = {
  color: theme.text,
  textDecoration: "none",
  fontWeight: 400,
  fontSize: 15,
};

export const dividerStyle = {
  height: 1,
  background: theme.borderSoft,
  margin: "10px 0 16px",
};

export const badge = (variant) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 400,
    border: `1px solid ${theme.border}`,
    background: "rgba(255,255,255,0.74)",
    color: theme.text,
  };

  if (variant === "verified") {
    return {
      ...base,
      border: "1px solid rgba(34,197,94,0.26)",
      color: "#166534",
      background: "rgba(240,253,244,0.92)",
    };
  }

  if (variant === "pending") {
    return {
      ...base,
      border: "1px solid rgba(245,158,11,0.24)",
      color: "#92400e",
      background: "rgba(255,251,235,0.92)",
    };
  }

  if (variant === "admin") {
    return {
      ...base,
      border: "1px solid rgba(126,167,174,0.28)",
      color: "#295b64",
      background: theme.tealSoft,
    };
  }

  return base;
};

export const errorBoxStyle = {
  marginTop: 8,
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.16)",
  padding: 10,
  borderRadius: 14,
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
  border-color: rgba(0,0,0,0.18) !important;
  box-shadow: 0 0 0 4px rgba(0,0,0,0.04);
}

.btnPrimary, .btnSecondary{
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease, opacity .18s ease;
}

.btnPrimary:hover, .btnSecondary:hover{
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0,0,0,.08);
}

.link{
  transition: opacity .18s ease, transform .18s ease;
}

.link:hover{
  opacity:.7;
}

.grid2{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 640px){
  .grid2{
    grid-template-columns: 1fr;
  }
}
`;