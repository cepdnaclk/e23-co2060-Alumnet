import { theme } from "../styles/ui";

export default function PageShell({ title, subtitle, children, right }) {
  return (
    <>
      <style>{responsiveCss}</style>
      <div className="page-shell-wrap">
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
    </>
  );
}

const responsiveCss = `
.page-shell-wrap{
  min-height:100vh;
  background:#f3f3f1;
  font-family:"Google Sans";
  padding:26px 24px 30px;
  animation:pageDissolve .22s ease both;
}

@media (max-width: 900px){
  .page-shell-wrap{
    padding:18px 16px 24px;
  }
}

@media (max-width: 700px){
  .page-shell-wrap{
    padding:14px;
  }
}

@keyframes pageDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}
`;

const container = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "2px 10px 24px",
  minHeight: "calc(100vh - 44px)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 18,
};

const titleStyle = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.2,
  fontWeight: 400,
  letterSpacing: "-0.02em",
  color: "rgba(17,17,17,0.72)",
};

const subtitleStyle = {
  marginTop: 4,
  color: "rgba(17,17,17,0.42)",
  fontSize: 13,
  lineHeight: 1.5,
};

const content = {
  marginTop: 8,
};
