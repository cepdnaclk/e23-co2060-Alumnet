import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import alumnetLogo from "../assets/alumnet-logo.png";
import heroBg from "../assets/bg.png";

const steps = [
  {
    number: "1.",
    title: "Discovery",
    text: "Browse a curated directory of alumni based on your career interests and goals.",
  },
  {
    number: "2.",
    title: "Connection",
    text: "Send a request to connect for a coffee chat or a formal long-term mentorship.",
  },
  {
    number: "3.",
    title: "Mentorship",
    text: "Access structured 1-on-1 sessions, resume reviews, and industry insights.",
  },
  {
    number: "4.",
    title: "Success",
    text: "Build your professional network and unlock exclusive career opportunities.",
  },
];

export default function Landing() {
  const nav = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="landingRoot">
      <style>{css}</style>

      <header className={`landingNav ${mounted ? "in" : ""}`}>
        <div className="landingNavInner">
          <button className="brandMark" onClick={() => nav("/")}>
            <img src={alumnetLogo} alt="Alumnet" />
          </button>

          <nav className="landingNavLinks">
            <a className="navLink" href="#about">
              About
            </a>
            <a className="navLink" href="#features">
              Features
            </a>
            <a className="navLink" href="#alumni">
              For alumni
            </a>
            <a className="navLink" href="#students">
              For students
            </a>
          </nav>

          <div className="navActions">
            <button className="pillButton pillButtonDark" onClick={() => nav("/register")}>
              Register
            </button>
            <button className="pillButton pillButtonLight" onClick={() => nav("/login")}>
              Login
            </button>
          </div>
        </div>
      </header>

      <main className={`landingMain ${mounted ? "in" : ""}`}>
        <section className="heroSection">
          <img src={heroBg} alt="" className="heroImage" />
          <div className="heroContent">
            <h1 className="heroTitle">Reconnect. Mentor. Inspire.</h1>
            <p className="heroSubtitle">
              Empowering alumni and students to build meaningful connections,
              share knowledge, and grow together.
            </p>
            <button className="pillButton pillButtonDark heroCta" onClick={() => nav("/register")}>
              <span>Get started</span>
              <ArrowRight size={14} strokeWidth={2.4} />
            </button>
          </div>
        </section>

        <section className="whiteSection" id="about">
          <div className="sectionInner introInner">
            <h2 className="sectionTitle">
              Connect students and alumni through one simple platform.
            </h2>
            <p className="sectionText">
              Discover mentors, join approved events, build meaningful academic
              and professional connections, and grow through a clean, focused
              alumni network experience.
            </p>
          </div>
        </section>

        <section className="greySection" id="features">
          <div className="sectionInner">
            <div className="stepsGrid">
              {steps.map((step) => (
                <div key={step.title} className="stepItem">
                  <div className="stepHeading">
                    <span className="stepNumber">{step.number}</span>
                    <span className="stepTitle">{step.title}</span>
                  </div>
                  <p className="stepText">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="whiteSection whiteSectionLast" id="alumni">
          <div className="sectionInner audienceInner">
            <div>
              <p className="audienceLabel">For alumni</p>
              <h2 className="audienceTitle">Share experience that opens doors.</h2>
              <p className="audienceText">
                Guide students through mentoring, events, and professional
                conversations shaped by real career journeys.
              </p>
            </div>
            <div id="students">
              <p className="audienceLabel">For students</p>
              <h2 className="audienceTitle">Find people who have walked ahead.</h2>
              <p className="audienceText">
                Discover alumni, request mentorship, and build the confidence
                to make your next academic or career move.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const css = `
.landingRoot{
  min-height:100vh;
  background:#eef7fb;
  color:#111111;
  overflow:hidden;
  font-family:"Google Sans";
}

.landingNav{
  position:fixed;
  z-index:10;
  top:0;
  left:0;
  width:100%;
  opacity:0;
  transform:translateY(-10px);
  transition:opacity .55s ease, transform .55s ease, background-color .22s ease, box-shadow .22s ease, backdrop-filter .22s ease;
}

.landingNav.in{
  opacity:1;
  transform:translateY(0);
}

.landingNavInner{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  width:100%;
  max-width:1440px;
  margin:0 auto;
  padding:22px 38px 0;
  gap:24px;
}

.brandMark{
  display:inline-flex;
  align-items:center;
  justify-self:start;
  width:118px;
  transition:transform .2s ease, opacity .2s ease;
}

.brandMark:hover{
  opacity:.76;
  transform:translateY(-1px);
}

.brandMark img{
  display:block;
  width:100%;
  height:auto;
}

.landingNavLinks{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:34px;
  justify-self:center;
}

.navLink{
  color:#080808;
  font-size:14px;
  line-height:1;
  white-space:nowrap;
  transition:opacity .18s ease, transform .18s ease;
}

.navLink:hover{
  opacity:.64;
  transform:translateY(-1px);
}

.navActions{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:14px;
}

.pillButton{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  min-width:78px;
  padding:11px 18px 12px;
  border-radius:999px;
  border:1px solid transparent;
  font-size:14px;
  font-weight:500;
  line-height:1;
  text-decoration:none;
  transition:transform .2s ease, box-shadow .2s ease, background-color .2s ease, opacity .2s ease;
}

.pillButton:hover{
  transform:translateY(-1px);
}

.pillButtonDark{
  background:#000000;
  color:#ffffff;
  border-color:#000000;
  box-shadow:0 6px 16px rgba(0,0,0,.18);
}

.pillButtonDark:hover{
  box-shadow:0 8px 22px rgba(0,0,0,.22);
}

.pillButtonLight{
  background:rgba(255,255,255,.90);
  color:#111111;
  border-color:rgba(255,255,255,.50);
  box-shadow:0 6px 15px rgba(0,0,0,.10);
}

.pillButtonLight:hover{
  background:#ffffff;
}

.landingMain{
  width:100%;
  opacity:0;
  transform:translateY(16px);
  transition:opacity .7s ease .05s, transform .7s ease .05s;
}

.landingMain.in{
  opacity:1;
  transform:translateY(0);
}

.heroSection{
  position:relative;
  min-height:max(100vh, calc(100vw * 768 / 1364));
  display:flex;
  align-items:flex-start;
  justify-content:center;
  padding:168px 24px 0;
  overflow:hidden;
}

.heroImage{
  position:absolute;
  top:0;
  left:50%;
  width:100%;
  max-width:none;
  height:auto;
  transform:translateX(-50%);
  object-fit:contain;
  object-position:top center;
}

.heroContent{
  position:relative;
  z-index:1;
  text-align:center;
  width:min(760px, 100%);
}

.heroTitle{
  margin:0 0 16px;
  font-size:54px;
  line-height:1.12;
  letter-spacing:-0.035em;
  color:#000000;
  font-weight:500;
}

.heroSubtitle{
  max-width:590px;
  margin:0 auto 20px;
  font-size:16px;
  line-height:1.35;
  color:#000000;
  font-weight:300;
}

.heroCta{
  min-width:148px;
}

.whiteSection{
  background:#f8fbf9;
}

.greySection{
  background:#e9f2f4;
}

.whiteSectionLast{
  scroll-margin-top:90px;
}

.sectionInner{
  max-width:1120px;
  margin:0 auto;
  padding:70px 30px 76px;
}

.introInner{
  text-align:center;
  max-width:820px;
  margin:0 auto;
}

.sectionTitle{
  font-size:42px;
  line-height:1.08;
  letter-spacing:-0.04em;
  color:#111111;
  font-weight:400;
  margin:0 0 16px;
}

.sectionText{
  font-size:17px;
  line-height:1.75;
  color:rgba(17,17,17,0.68);
  max-width:760px;
  margin:0 auto;
}

.stepsGrid{
  display:grid;
  grid-template-columns:repeat(4, minmax(0,1fr));
  gap:24px;
}

.stepItem{
  padding:24px 22px;
  border:1px solid rgba(0,0,0,.07);
  border-radius:8px;
  background:rgba(255,255,255,.52);
  transition:transform .18s ease, opacity .18s ease;
}

.stepItem:hover{
  transform:translateY(-3px);
}

.stepHeading{
  display:flex;
  align-items:center;
  gap:6px;
  margin-bottom:10px;
}

.stepNumber{
  font-size:18px;
  color:#111111;
}

.stepTitle{
  font-size:20px;
  line-height:1.1;
  color:#111111;
}

.stepText{
  font-size:14px;
  line-height:1.7;
  color:rgba(17,17,17,0.62);
}

.audienceInner{
  display:grid;
  grid-template-columns:repeat(2, minmax(0,1fr));
  gap:28px;
}

.audienceLabel{
  margin:0 0 14px;
  font-size:15px;
  line-height:1;
  color:rgba(17,17,17,.56);
}

.audienceTitle{
  margin:0 0 14px;
  font-size:34px;
  line-height:1.08;
  letter-spacing:-0.035em;
  color:#111111;
  font-weight:400;
}

.audienceText{
  max-width:470px;
  font-size:16px;
  line-height:1.7;
  color:rgba(17,17,17,.66);
}

@media (max-width: 960px){
  .landingNavInner{
    grid-template-columns:1fr auto;
    padding:22px 22px 0;
  }

  .landingNavLinks{
    grid-column:1 / -1;
    grid-row:2;
    gap:18px;
    padding-top:16px;
  }

  .brandMark{
    width:108px;
  }

  .navLink,
  .pillButton{
    font-size:13px;
  }

  .heroTitle{
    font-size:44px;
  }

  .sectionTitle{
    font-size:36px;
  }

  .stepsGrid{
    grid-template-columns:repeat(2, minmax(0,1fr));
    gap:18px 22px;
  }

  .audienceTitle{
    font-size:28px;
  }
}

@media (max-width: 640px){
  .landingNavInner{
    padding:18px 16px 0;
    flex-wrap:wrap;
    gap:16px 12px;
  }

  .brandMark{
    width:96px;
  }

  .landingNavLinks{
    order:3;
    width:100%;
    justify-content:space-between;
    gap:10px;
    overflow-x:auto;
    padding-bottom:4px;
  }

  .navLink{
    font-size:13px;
  }

  .navActions{
    gap:8px;
  }

  .pillButton{
    min-width:auto;
    padding:10px 13px 11px;
    font-size:12px;
  }

  .heroSection{
    min-height:max(100vh, calc(100vw * 768 / 1364));
    padding:168px 18px 0;
  }

  .heroTitle{
    font-size:36px;
    line-height:1.1;
  }

  .heroSubtitle{
    max-width:335px;
    font-size:14px;
    line-height:1.36;
    margin-bottom:18px;
  }

  .heroCta{
    min-width:134px;
  }

  .whiteSection,
  .greySection{
    border-radius:0;
  }

  .sectionInner{
    padding:38px 18px 42px;
  }

  .sectionTitle{
    font-size:28px;
  }

  .sectionText{
    font-size:15px;
  }

  .stepsGrid{
    grid-template-columns:1fr;
    gap:14px;
  }

  .stepTitle{
    font-size:18px;
  }

  .audienceInner{
    grid-template-columns:1fr;
    gap:32px;
  }

  .audienceTitle{
    font-size:25px;
  }
}
`;
