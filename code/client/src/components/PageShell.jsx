// src/components/PageShell.jsx
import { theme } from "../styles/ui";

export default function PageShell({ title, subtitle, children, right }) {
  return (
    <div style={pageWrap}>
      <div style={container}>
        <div style={header}>
          <div>
            <h1 style={titleStyle}>{title}</h1>
            {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
          </div>

          {right && <div>{right}</div>}
        </div>

        <div style={content}>{children}</div>
      </div>
    </div>
  );
}

const pageWrap = {
  background: "#f6f7fb",
  minHeight: "calc(100vh - 60px)",
  fontFamily: "DM Sans, sans-serif",
};

const container = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "32px 20px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 20,
};

const titleStyle = {
  margin: 0,
  fontSize: 32,
  fontWeight: 700,
  color: theme.blue,
};

const subtitleStyle = {
  marginTop: 6,
  color: "rgba(11,42,111,0.75)",
};

const content = {
  marginTop: 10,
};