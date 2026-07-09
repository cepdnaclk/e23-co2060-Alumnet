import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;

      if (currentScrollY <= 40) {
        setHideNav(false);
      } else if (scrollDifference > 5) {
        setHideNav(true);
        setMobileMenuOpen(false);
      } else if (scrollDifference < -5) {
        setHideNav(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="landingRoot">
      <style>{css}</style>

      <header
        className={`landingNav ${mounted ? "in" : ""} ${
          hideNav ? "hide" : ""
        }`}
      >
        <div className="landingNavInner">
          <button
            className="brandMark"
            onClick={() => {
              nav("/");
              closeMobileMenu();
            }}
          >
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
            <button
              className="pillButton pillButtonDark"
              onClick={() => nav("/register")}
            >
              Register
            </button>

            <button
              className="pillButton pillButtonLight"
              onClick={() => nav("/login")}
            >
              Login
            </button>
          </div>

          <button
            className="mobileMenuButton"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X size={21} strokeWidth={2} />
            ) : (
              <Menu size={21} strokeWidth={2} />
            )}
          </button>
        </div>

        <div
          className={`mobileMenu ${
            mobileMenuOpen ? "mobileMenuOpen" : ""
          }`}
        >
          <a
            className="mobileNavLink"
            href="#about"
            onClick={closeMobileMenu}
          >
            About
          </a>

          <a
            className="mobileNavLink"
            href="#features"
            onClick={closeMobileMenu}
          >
            Features
          </a>

          <a
            className="mobileNavLink"
            href="#alumni"
            onClick={closeMobileMenu}
          >
            For alumni
          </a>

          <a
            className="mobileNavLink"
            href="#students"
            onClick={closeMobileMenu}
          >
            For students
          </a>

          <div className="mobileActions">
            <button
              className="pillButton pillButtonDark mobileActionButton"
              onClick={() => {
                nav("/register");
                closeMobileMenu();
              }}
            >
              Register
            </button>

            <button
              className="pillButton pillButtonLight mobileActionButton"
              onClick={() => {
                nav("/login");
                closeMobileMenu();
              }}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <main className={`landingMain ${mounted ? "in" : ""}`}>
        <section className="heroSection">
          <img src={heroBg} alt="" className="heroImage" />

          <div className="heroContent">
            <h1 className="heroTitle">
              Reconnect. Mentor. Inspire.
            </h1>

            <p className="heroSubtitle">
              Empowering alumni and students to build meaningful connections,
              share knowledge, and grow together.
            </p>

            <button
              className="pillButton pillButtonDark heroCta"
              onClick={() => nav("/register")}
            >
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
                    <span className="stepNumber">
                      {step.number}
                    </span>

                    <span className="stepTitle">
                      {step.title}
                    </span>
                  </div>

                  <p className="stepText">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="whiteSection whiteSectionLast"
          id="alumni"
        >
          <div className="sectionInner audienceInner">
            <div className="audienceBlock">
              <p className="audienceLabel">
                For alumni
              </p>

              <h2 className="audienceTitle">
                Share experience that opens doors.
              </h2>

              <p className="audienceText">
                Guide students through mentoring, events, and professional
                conversations shaped by real career journeys.
              </p>
            </div>

            <div
              className="audienceBlock"
              id="students"
            >
              <p className="audienceLabel">
                For students
              </p>

              <h2 className="audienceTitle">
                Find people who have walked ahead.
              </h2>

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
*,
*::before,
*::after{
  box-sizing:border-box;
}

html{
  scroll-behavior:smooth;
}

body{
  margin:0;
}

button,
a{
  -webkit-tap-highlight-color:transparent;
}

button{
  font-family:inherit;
  cursor:pointer;
}

a{
  text-decoration:none;
}

.landingRoot{
  width:100%;
  min-height:100vh;
  background:#eef7fb;
  color:#111111;
  overflow-x:hidden;
  font-family:"Google Sans", Arial, sans-serif;
}

.landingNav{
  position:fixed;
  z-index:50;
  top:0;
  left:0;
  width:100%;
  opacity:0;
  transform:translateY(-10px);
  will-change:transform, opacity;
  transition:
    opacity .28s ease,
    transform .28s ease;
}

.landingNav.in{
  opacity:1;
  transform:translateY(0);
}

.landingNav.in.hide{
  opacity:0;
  transform:translateY(-110%);
  pointer-events:none;
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
  padding:0;
  border:0;
  background:transparent;
  transition:
    transform .2s ease,
    opacity .2s ease;
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
  transition:
    opacity .18s ease,
    transform .18s ease;
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
  white-space:nowrap;
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    background-color .2s ease,
    opacity .2s ease;
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

.mobileMenuButton{
  display:none;
  align-items:center;
  justify-content:center;
  width:42px;
  height:42px;
  padding:0;
  border:0;
  border-radius:50%;
  background:rgba(255,255,255,.88);
  color:#111111;
  box-shadow:0 5px 16px rgba(0,0,0,.10);
}

.mobileMenu{
  display:none;
}

.landingMain{
  width:100%;
  opacity:0;
  transform:translateY(16px);
  transition:
    opacity .7s ease .05s,
    transform .7s ease .05s;
}

.landingMain.in{
  opacity:1;
  transform:translateY(0);
}

.heroSection{
  position:relative;
  width:100%;
  min-height:min(760px, 100svh);
  display:flex;
  align-items:flex-start;
  justify-content:center;
  padding:168px 24px 0;
  overflow:hidden;
}

.heroImage{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  max-width:none;
  object-fit:cover;
  object-position:top center;
}

.heroContent{
  position:relative;
  z-index:1;
  width:min(760px, 100%);
  text-align:center;
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
  line-height:1.45;
  color:#000000;
  font-weight:300;
}

.heroCta{
  min-width:148px;
}

.whiteSection{
  width:100%;
  background:#f8fbf9;
}

.greySection{
  width:100%;
  background:#e9f2f4;
}

.whiteSectionLast{
  scroll-margin-top:90px;
}

.sectionInner{
  width:100%;
  max-width:1120px;
  margin:0 auto;
  padding:70px 30px 76px;
}

.introInner{
  max-width:820px;
  text-align:center;
}

.sectionTitle{
  margin:0 0 16px;
  font-size:42px;
  line-height:1.08;
  letter-spacing:-0.04em;
  color:#111111;
  font-weight:400;
}

.sectionText{
  max-width:760px;
  margin:0 auto;
  font-size:17px;
  line-height:1.75;
  color:rgba(17,17,17,.68);
}

.stepsGrid{
  display:grid;
  grid-template-columns:repeat(4, minmax(0, 1fr));
  gap:24px;
}

.stepItem{
  min-width:0;
  padding:24px 22px;
  border:1px solid rgba(0,0,0,.07);
  border-radius:8px;
  background:rgba(255,255,255,.52);
  transition:
    transform .18s ease,
    opacity .18s ease;
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
  flex-shrink:0;
  font-size:18px;
  color:#111111;
}

.stepTitle{
  font-size:20px;
  line-height:1.1;
  color:#111111;
}

.stepText{
  margin:0;
  font-size:14px;
  line-height:1.7;
  color:rgba(17,17,17,.62);
}

.audienceInner{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:28px;
}

.audienceBlock{
  min-width:0;
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
  margin:0;
  font-size:16px;
  line-height:1.7;
  color:rgba(17,17,17,.66);
}

/* TABLET */

@media (max-width:960px){

  .landingNavInner{
    grid-template-columns:1fr auto;
    padding:20px 24px 0;
  }

  .landingNavLinks{
    display:none;
  }

  .brandMark{
    width:108px;
  }

  .heroSection{
    min-height:700px;
    padding-top:155px;
  }

  .heroTitle{
    font-size:44px;
  }

  .sectionTitle{
    font-size:36px;
  }

  .stepsGrid{
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:18px;
  }

  .audienceTitle{
    font-size:29px;
  }
}

/* MOBILE */

@media (max-width:640px){

  .landingNav{
    padding:0 12px;
  }

  .landingNavInner{
    display:grid;
    grid-template-columns:1fr auto;
    padding:14px 4px 0;
    gap:12px;
  }

  .brandMark{
    width:96px;
  }

  .landingNavLinks,
  .navActions{
    display:none;
  }

  .mobileMenuButton{
    display:inline-flex;
  }

  .mobileMenu{
    display:flex;
    position:absolute;
    top:68px;
    left:12px;
    right:12px;
    flex-direction:column;
    padding:12px;
    border:1px solid rgba(0,0,0,.06);
    border-radius:22px;
    background:rgba(248,251,249,.94);
    box-shadow:0 18px 45px rgba(0,0,0,.12);
    backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);

    opacity:0;
    visibility:hidden;
    pointer-events:none;
    transform:translateY(-8px) scale(.98);

    transition:
      opacity .2s ease,
      visibility .2s ease,
      transform .2s ease;
  }

  .mobileMenuOpen{
    opacity:1;
    visibility:visible;
    pointer-events:auto;
    transform:translateY(0) scale(1);
  }

  .mobileNavLink{
    display:flex;
    align-items:center;
    min-height:46px;
    padding:0 14px;
    border-radius:13px;
    color:#111111;
    font-size:15px;
    font-weight:400;
  }

  .mobileNavLink:hover{
    background:rgba(0,0,0,.04);
  }

  .mobileActions{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:8px;
    padding-top:10px;
    margin-top:6px;
    border-top:1px solid rgba(0,0,0,.06);
  }

  .mobileActionButton{
    width:100%;
    min-height:43px;
    font-size:13px;
  }

  .heroSection{
    min-height:620px;
    padding:130px 20px 0;
  }

  .heroImage{
    object-position:center top;
  }

  .heroContent{
    width:100%;
  }

  .heroTitle{
    max-width:390px;
    margin:0 auto 14px;
    font-size:clamp(34px, 10vw, 42px);
    line-height:1.04;
    letter-spacing:-0.045em;
  }

  .heroSubtitle{
    max-width:340px;
    margin:0 auto 20px;
    font-size:15px;
    line-height:1.5;
  }

  .heroCta{
    min-width:142px;
    padding:12px 18px 13px;
    font-size:13px;
  }

  .sectionInner{
    padding:52px 20px 56px;
  }

  .sectionTitle{
    max-width:420px;
    margin-left:auto;
    margin-right:auto;
    font-size:30px;
    line-height:1.12;
    letter-spacing:-0.035em;
  }

  .sectionText{
    max-width:390px;
    font-size:15px;
    line-height:1.65;
  }

  .stepsGrid{
    grid-template-columns:1fr;
    gap:12px;
  }

  .stepItem{
    padding:22px 20px;
    border-radius:12px;
  }

  .stepHeading{
    margin-bottom:8px;
  }

  .stepNumber{
    font-size:17px;
  }

  .stepTitle{
    font-size:19px;
  }

  .stepText{
    font-size:14px;
    line-height:1.6;
  }

  .audienceInner{
    grid-template-columns:1fr;
    gap:46px;
  }

  .audienceLabel{
    margin-bottom:12px;
    font-size:14px;
  }

  .audienceTitle{
    max-width:400px;
    font-size:28px;
    line-height:1.1;
  }

  .audienceText{
    max-width:400px;
    font-size:15px;
    line-height:1.65;
  }
}

/* SMALL PHONES */

@media (max-width:380px){

  .landingNav{
    padding:0 10px;
  }

  .brandMark{
    width:88px;
  }

  .mobileMenuButton{
    width:39px;
    height:39px;
  }

  .heroSection{
    min-height:580px;
    padding:118px 16px 0;
  }

  .heroTitle{
    font-size:32px;
  }

  .heroSubtitle{
    font-size:14px;
  }

  .sectionInner{
    padding:46px 16px 50px;
  }

  .sectionTitle{
    font-size:27px;
  }

  .stepItem{
    padding:20px 18px;
  }

  .audienceTitle{
    font-size:26px;
  }
}
`;