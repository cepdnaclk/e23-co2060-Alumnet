import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import alumnetLogo from "../assets/alumnet-logo.png";

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
          <nav className="landingNavLinks">
            <button className="navLink" onClick={() => nav("/")}>
              Home
            </button>
            <button className="navLink" onClick={() => nav("/login")}>
              Login
            </button>
            <button className="navLink" onClick={() => nav("/register")}>
              Register
            </button>
          </nav>
        </div>
      </header>

      <main className={`landingMain ${mounted ? "in" : ""}`}>
        <section className="heroSection">
          <div className="heroInner">
            <p className="eyebrow">University of Peradeniya Alumni Network</p>

            <div className="logoTitleWrap">
              <img src={alumnetLogo} alt="Alumnet logo" className="titleLogo" />
            </div>

            <p className="heroSubtitle">
              A minimal platform for students, alumni, events, and mentorship
              connections.
            </p>
          </div>
        </section>

        <section className="whiteSection">
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

        <section className="greySection">
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

        <section className="whiteSection whiteSectionLast">
          <div className="sectionInner closingInner">
            <p className="closingText">
              Whether you're a student looking for a path or an alum ready to
              give back, your journey starts here.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

const css = `
.landingRoot{
  min-height:100vh;
  background:#e7e6e2;
  color:#111111;
  overflow:hidden;
  padding:20px 20px 40px;
}

.landingNav{
  max-width:1120px;
  margin:0 auto;
  opacity:0;
  transform:translateY(-10px);
  transition:opacity .55s ease, transform .55s ease;
}

.landingNav.in{
  opacity:1;
  transform:translateY(0);
}

.landingNavInner{
  display:flex;
  justify-content:center;
  align-items:center;
  width:fit-content;
  margin:0 auto;
  padding:7px 10px;
  border-radius:999px;
  background:rgba(255,255,255,0.68);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  border:1px solid rgba(0,0,0,0.06);
  box-shadow:0 8px 20px rgba(0,0,0,0.04);
}

.landingNavLinks{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:4px;
}

.navLink{
  color:#111111;
  padding:8px 16px;
  border-radius:999px;
  transition:transform .18s ease, background .18s ease, opacity .18s ease;
}

.navLink:hover{
  transform:translateY(-1px) scale(1.01);
  background:rgba(255,255,255,0.58);
}

.landingMain{
  max-width:1120px;
  margin:0 auto;
  opacity:0;
  transform:translateY(16px);
  transition:opacity .7s ease .05s, transform .7s ease .05s;
}

.landingMain.in{
  opacity:1;
  transform:translateY(0);
}

.heroSection{
  min-height:72vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:30px 24px 26px;
}

.heroInner{
  width:100%;
  text-align:center;
  padding:46px 18px 56px;
  background:#e7e6e2;
  border-radius:44px;
}

.eyebrow{
  font-size:16px;
  color:rgba(17,17,17,0.5);
  margin-bottom:18px;
  letter-spacing:-0.01em;
}

.logoTitleWrap{
  display:flex;
  justify-content:center;
  margin-bottom:10px;
}

.titleLogo{
  width:min(500px, 72vw);
  height:auto;
  object-fit:contain;
}

.heroSubtitle{
  max-width:650px;
  margin:0 auto;
  font-size:18px;
  line-height:1.6;
  color:rgba(17,17,17,0.66);
  font-weight:400;
}

.whiteSection{
  background:#f7f6f3;
  border-radius:44px;
  margin-top:18px;
}

.greySection{
  background:#e7e6e2;
  border-radius:44px;
  margin-top:18px;
}

.whiteSectionLast{
  margin-bottom:12px;
}

.sectionInner{
  padding:58px 30px 64px;
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
  color:rgba(17,17,17,0.64);
  max-width:760px;
  margin:0 auto;
}

.stepsGrid{
  display:grid;
  grid-template-columns:repeat(4, minmax(0,1fr));
  gap:24px;
}

.stepItem{
  padding:8px 6px;
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

.closingInner{
  text-align:center;
  max-width:760px;
  margin:0 auto;
  padding-top:72px;
  padding-bottom:78px;
}

.closingText{
  font-size:32px;
  line-height:1.22;
  letter-spacing:-0.03em;
  color:#111111;
  font-weight:400;
}

@media (max-width: 960px){
  .sectionTitle{
    font-size:36px;
  }

  .stepsGrid{
    grid-template-columns:repeat(2, minmax(0,1fr));
    gap:18px 22px;
  }

  .closingText{
    font-size:26px;
  }
}

@media (max-width: 640px){
  .landingRoot{
    padding:14px 14px 28px;
  }

  .landingNavInner{
    padding:7px 10px;
  }

  .navLink{
    padding:8px 12px;
    font-size:14px;
  }

  .heroSection{
    min-height:62vh;
    padding:30px 10px 14px;
  }

  .heroInner{
    border-radius:28px;
    padding:42px 14px 46px;
  }

  .titleLogo{
    width:min(300px, 76vw);
  }

  .heroSubtitle{
    font-size:16px;
  }

  .whiteSection,
  .greySection{
    border-radius:28px;
    margin-top:14px;
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

  .closingInner{
    padding-top:48px;
    padding-bottom:50px;
  }

  .closingText{
    font-size:22px;
  }
}
`;