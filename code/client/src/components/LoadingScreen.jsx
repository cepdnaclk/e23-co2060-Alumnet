export default function LoadingScreen({ text = "Loading..." }) {
  return (
    <>
      <style>{css}</style>
      <main className="loadingScreen">
        <div className="loadingOverlay" />
        <div className="loadingText">{text}</div>
      </main>
    </>
  );
}

const css = `
.loadingScreen{
  position:relative;
  min-height:calc(100vh - 104px);
  display:grid;
  place-items:center;
  overflow:hidden;
  background:linear-gradient(180deg, #afd6ff 0%, #cfe7f7 34%, #f6e8ee 62%, #eef7fb 100%);
  font-family:"Google Sans";
}

.loadingOverlay{
  position:absolute;
  inset:0;
  background:
    linear-gradient(135deg, rgba(255,255,255,.48), rgba(255,255,255,0) 42%),
    radial-gradient(circle at 50% 24%, rgba(255,232,238,.66), rgba(255,232,238,0) 44%),
    radial-gradient(circle at 50% 14%, rgba(255,255,255,.62), rgba(255,255,255,0) 36%);
}

.loadingText{
  position:relative;
  z-index:1;
  color:#111111;
  font-size:15px;
  line-height:1;
  font-weight:500;
}
`;
