import bgImage from "../assets/bg.png";

export default function LoadingScreen({ text = "Loading..." }) {
  return (
    <>
      <style>{css}</style>
      <main className="loadingScreen">
        <img src={bgImage} alt="" className="loadingBg" />
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
  background:#fbfbfa;
  font-family:"Google Sans";
}

.loadingBg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  filter:blur(18px);
  transform:scale(1.08);
  opacity:.34;
}

.loadingOverlay{
  position:absolute;
  inset:0;
  background:rgba(251,251,250,.48);
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
