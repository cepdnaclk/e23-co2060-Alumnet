import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import alumnetLogo from "../assets/alumnet-logo.png";
import image1 from "../assets/1.png";
import image1Mobile from "../assets/1_mobile.png";
import image3 from "../assets/3.png";
import studentIcon from "../assets/students.png";
import alumniIcon from "../assets/alumni.png";
import adminIcon from "../assets/admins.png";

const steps = [
  {
    number: "001",
    title: "Discover",
    text: "Browse verified alumni by batch, department, profession, and skills.",
  },
  {
    number: "002",
    title: "Connect",
    text: "Send a focused mentorship request to the alumni who match your goals.",
  },
  {
    number: "003",
    title: "Mentor",
    text: "Share experience, ask questions, and build meaningful university connections.",
  },
  {
    number: "004",
    title: "Grow",
    text: "Stay close to events, opportunities, and the wider alumni community.",
  },
];

const cards = [
  {
    title: "For students",
    text: "Find people who have walked ahead and request mentorship with a clear purpose.",
    icon: studentIcon,
  },
  {
    title: "For alumni",
    text: "Share career experience, support students, and stay connected to the university.",
    icon: alumniIcon,
  },
  {
    title: "For admins",
    text: "Approve users, manage events, and keep the community secure and organized.",
    icon: adminIcon,
  },
];

export default function Landing() {
  const nav = useNavigate();
  const rootRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const y = window.scrollY;
      const mockup = document.querySelector(".heroMockup");
      const gradient = document.querySelector(".heroGradient");

      if (mockup && window.innerWidth > 560) {
        mockup.style.transform = `translateY(${Math.min(y * -0.045, 0)}px) scale(1)`;
      }

      if (gradient) {
        gradient.style.transform = `translateY(${Math.min(y * 0.08, 55)}px)`;
      }

      if (y <= 40) {
        setHideNav(false);
      } else if (y - lastScrollY > 6) {
        setHideNav(true);
        setMobileMenuOpen(false);
      } else if (y - lastScrollY < -6) {
        setHideNav(false);
      }

      lastScrollY = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -70px 0px" }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const goTo = (path) => {
    setMobileMenuOpen(false);
    nav(path);
  };

  return (
    <div ref={rootRef} className="landingRoot">
      <style>{css}</style>

      <header className={`landingNav ${mounted ? "in" : ""} ${hideNav ? "hide" : ""}`}>
        <div className="landingNavInner">
          <button className="brandMark" onClick={() => goTo("/")} aria-label="Alumnet home">
            <img src={alumnetLogo} alt="Alumnet" />
          </button>

          <nav className="landingNavLinks">
            <a href="#platform">Platform</a>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#connect">Connect</a>
          </nav>

          <div className="navActions">
            <button className="navPill navRegister" onClick={() => goTo("/register")}>
              Register
            </button>
            <button className="navPill navLogin" onClick={() => goTo("/login")}>
              Login
            </button>
          </div>

          <button
            className="mobileMenuButton"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className={`mobileMenu ${mobileMenuOpen ? "mobileMenuOpen" : ""}`}>
          <a href="#platform" onClick={() => setMobileMenuOpen(false)}>
            Platform
          </a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>
            Features
          </a>
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>
            How it works
          </a>
          <button className="mobileRegisterBtn" onClick={() => goTo("/register")}>Register</button>
          <button className="mobileLoginBtn" onClick={() => goTo("/login")}>Login</button>
        </div>
      </header>

      <main className={`landingMain ${mounted ? "in" : ""}`}>
        <section className="heroSection">
          <div className="heroGradient" />

          <div className="heroTextWrap">
            <h1 className="heroTitle">
              <span>Reconnect.</span> <span>Mentor.</span> <span>Inspire.</span>
            </h1>

            <p className="heroSubtitle">
              A university alumni network for meaningful mentorship, verified connections, and
              community events.
            </p>

            <div className="heroActions">
              <button className="primaryPill heroGetStarted" onClick={() => goTo("/register")}>
                Get started
              </button>
            </div>
          </div>

          <div className="heroMockup" aria-hidden="true">
            <div className="browserDots">
              <i />
              <i />
              <i />
            </div>
            <div className="phoneSpeaker" />
            <picture>
              <source media="(max-width: 560px)" srcSet={image1Mobile} />
              <img src={image1} alt="" />
            </picture>
          </div>
        </section>

        <section id="platform" className="introSection reveal">
          <h2>One place for the people, stories, and guidance behind your university journey.</h2>
          <p>
            Alumnet brings students, alumni, and university administrators into one secure space
            for discovery, mentorship, events, and engagement.
          </p>
        </section>

        <section id="features" className="featureSection">
          <div className="featureGrid reveal">
            {steps.map((step) => (
              <article className="featureRow" key={step.number}>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                <span>{step.number}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="claritySection reveal">
          <div className="clarityTitle">
            <h2>Built for clarity</h2>
            <h2 className="sansTitle">Designed for connection</h2>
          </div>

          <div className="cardsGrid">
            {cards.map((card) => (
              <article className="infoCard" key={card.title}>
                <img className="cardIconImage" src={card.icon} alt="" />
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="splitSection reveal">
          <div className="splitImage">
            <img src={image3} alt="" />
          </div>

          <div className="splitCopy">
            <p className="label">HOW IT WORKS</p>
            <h2>From discovery to mentorship in a few focused steps.</h2>
            <p>
              Students can search alumni, send a mentorship request, and stay engaged with
              approved university events. Alumni can manage their profile and support students
              through structured connections.
            </p>
            <button className="primaryPill connectButton" onClick={() => goTo("/register")}>
              Start connecting
            </button>
          </div>
        </section>

        <section className="quoteSection reveal">
          <div className="quoteIcon">“</div>
          <h2>The right connection can turn a university memory into a future opportunity.</h2>
          <p>ALUMNET — CONNECT. MENTOR. INSPIRE.</p>
        </section>

        <section id="connect" className="ctaSection reveal">
          <h2>Ready to build stronger university connections?</h2>
          <button className="getStartedButton" onClick={() => goTo("/register")}>
            Get started
          </button>

          <div className="footerLogoWrap">
            <img src={alumnetLogo} alt="Alumnet" />
          </div>
        </section>
      </main>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
}

button {
  font-family: inherit;
  cursor: pointer;
}

a {
  text-decoration: none;
  color: inherit;
}

.landingRoot {
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    #afd6ff 0%,
    #cfe7f7 24%,
    #f6e8ee 42%,
    #eef7fb 68%,
    #f8fbff 100%
  );
  color: #000;
  overflow: hidden;
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
}

.landingNav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  width: 100%;
  opacity: 0;
  transform: translateY(-60px);
  transition:
    opacity 0.75s cubic-bezier(.2,.8,.2,1),
    transform 0.75s cubic-bezier(.2,.8,.2,1);
}

.landingNav.in {
  opacity: 1;
  transform: translateY(0);
}

.landingNav.hide {
  opacity: 0;
  transform: translateY(-110%);
  pointer-events: none;
}

.landingNavInner {
  height: 60px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
}

.brandMark {
  border: 0;
  background: transparent;
  padding: 0;
  width: 122px;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.brandMark:hover {
  opacity: 0.72;
  transform: translateY(-2px);
}

.brandMark img {
  width: 100%;
  display: block;
}

.landingNavLinks,
.navActions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.landingNavLinks a {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #000;
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.landingNavLinks a:hover {
  opacity: 0.6;
  transform: translateY(-1px);
}

.navActions {
  gap: 12px;
}

.navPill,
.primaryPill,
.secondaryPill,
.getStartedButton {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  border: 0;
  border-radius: 999px;
  font-weight: 500;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    color 0.25s ease;
}

.navPill {
  padding: 10px 20px;
  font-size: 15px;
}

.navRegister,
.primaryPill {
  background: #000;
  color: #fff;
}

.navLogin,
.secondaryPill {
  background: rgba(255,255,255,1);
  color: #111;
}

.navPill:hover,
.primaryPill:hover,
.secondaryPill:hover,
.getStartedButton:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 23px rgba(0,0,0,.27), inset 0 1px 0 rgba(255,255,255,.20);
}

.navRegister:hover,
.primaryPill:hover,
.getStartedButton:hover {
  background: #050505;
  color: #fff;
}

.navLogin:hover,
.secondaryPill:hover {
  background: rgba(255,255,255,0.86);
  color: #000000;
}

.mobileMenuButton {
  display: none;
  border: 0;
  background: #000;
  color: #fff;
  border-radius: 999px;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
}

.mobileMenu {
  display: none;
}

.landingMain {
  opacity: 0;
  transition: opacity 0.6s ease;
}

.landingMain.in {
  opacity: 1;
}

.heroSection {
  position: relative;
  min-height: 760px;
  padding: 140px 20px 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    #afd6ff 0%,
    #cfe7f7 30%,
    #f6e8ee 55%,
    #eef7fb 86%,
    rgba(238,247,251,0) 100%
  );
}

.heroGradient {
  position: absolute;
  inset: 0 0 auto 0;
  height: 72%;
  background: linear-gradient(
    180deg,
    #afd6ff 0%,
    #cfe7f7 34%,
    #f6e8ee 60%,
    #eef7fb 90%,
    rgba(255,255,255,0) 100%
  );
  will-change: transform;
}

.heroTextWrap {
  position: relative;
  z-index: 2;
  max-width: 1100px;
  width: 100%;
  text-align: center;
  opacity: 0;
  transform: translateY(150px);
  animation: heroTextIn 1s cubic-bezier(.16,1,.3,1) 0.15s forwards;
}

.heroTitle {
  font-family: "Instrument Serif", serif;
  font-weight: 400;
  font-size: clamp(56px, 8.4vw, 112px);
  line-height: 0.9;
  letter-spacing: -0.055em;
  margin: 0 0 18px;
  color: #000;
}

.heroTitle span {
  display: inline-block;
  animation: wordFloat 2.8s ease-in-out infinite;
}

.heroTitle span:nth-child(2) {
  animation-delay: 0.14s;
}

.heroTitle span:nth-child(3) {
  animation-delay: 0.28s;
}

.heroSubtitle {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 18px;
  line-height: 1.45;
  letter-spacing: -0.02em;
  max-width: 620px;
  margin: 0 auto 26px;
}

.heroActions {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.primaryPill,
.secondaryPill {
  padding: 12px 24px;
  font-size: 15px;
}

.heroGetStarted {
  min-width: 132px;
  padding: 13px 30px;
  border: 1px solid rgba(0,0,0,.84);
  box-shadow: 0 8px 18px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.20);
}

.heroMockup {
  position: relative;
  z-index: 3;
  margin-top: 52px;
  width: min(960px, 82vw);
  aspect-ratio: 1920 / 1216;
  border: 12px solid #000;
  border-radius: 24px;
  background: #000;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(0,0,0,0.2);
  opacity: 0;
  transform: translateY(50px) scale(0.5);
  animation: mockupIn 1.15s cubic-bezier(.16,1,.3,1) 0.48s forwards;
  will-change: transform;
}

.heroMockup picture {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.heroMockup img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  border-radius: 10px;
  filter: saturate(0.96);
}

.browserDots {
  position: absolute;
  z-index: 4;
  left: 14px;
  top: 16px;
  display: grid;
  gap: 6px;
}

.browserDots i {
  width: 6px;
  height: 6px;
  background: #777;
  border-radius: 50%;
  display: block;
}

.phoneSpeaker {
  display: none;
}

.reveal {
  opacity: 0;
  transform: translateY(150px);
  transition:
    opacity 0.9s cubic-bezier(.16,1,.3,1),
    transform 0.9s cubic-bezier(.16,1,.3,1);
}

.reveal.show {
  opacity: 1;
  transform: translateY(0);
}

.introSection {
  padding: 92px 20px 72px;
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}

.introSection,
.featureSection,
.splitSection {
  background: transparent;
}

.introSection h2,
.featureSection h2,
.claritySection h2,
.splitCopy h2,
.quoteSection h2,
.ctaSection h2 {
  font-family: "Instrument Serif", serif;
  font-weight: 400;
  letter-spacing: -0.05em;
  line-height: 0.96;
  margin: 0;
}

.introSection h2 {
  font-size: clamp(42px, 5vw, 72px);
}

.introSection p {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 20px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #555;
  margin: 22px auto 0;
}

.featureSection {
  padding: 30px 20px 100px;
}

.wideImage {
  max-width: 1500px;
  height: 500px;
  margin: 0 auto 40px;
  border-radius: 20px;
  overflow: hidden;
}

.wideImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featureGrid {
  max-width: 980px;
  margin: 0 auto;
}

.featureRow {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  padding: 28px 0;
  border-top: 1px solid #dbe0ec;
  transition: padding 0.25s ease, opacity 0.25s ease;
}

.featureRow:last-child {
  border-bottom: 1px solid #dbe0ec;
}

.featureRow::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(.16,1,.3,1);
}

.featureRow:nth-child(1)::before {
  background: #dcecff;
}

.featureRow:nth-child(2)::before {
  background: #fff0bd;
}

.featureRow:nth-child(3)::before {
  background: #e2dcff;
}

.featureRow:nth-child(4)::before {
  background: #d9f4e5;
}

.featureRow:hover {
  padding-left: 22px;
  padding-right: 22px;
}

.featureRow:hover::before {
  transform: scaleX(1);
}

.featureRow h3 {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 22px;
  line-height: 1;
  margin: 0 0 10px;
  font-weight: 700;
}

.featureRow p {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 18px;
  line-height: 1.45;
  letter-spacing: -0.02em;
  margin: 0;
  color: #222;
}

.featureRow span {
  font-family: monospace;
  color: #6c6c6c;
  font-size: 14px;
}

.claritySection {
  position: relative;
  padding: 100px 20px;
  background: linear-gradient(180deg, rgba(227,242,255,0.82), rgba(248,251,255,0.92));
  color: #000;
}

.clarityTitle {
  max-width: 1500px;
  margin: 0 auto 40px;
  text-align: right;
}

.claritySection h2 {
  font-size: clamp(48px, 7vw, 96px);
  color: #000;
}

.claritySection .sansTitle {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: -0.06em;
  color: #000;
}

.cardsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 1500px;
  margin: 0 auto;
}

.infoCard {
  background: rgba(227,242,255,0.82);
  color: #000;
  border-radius: 16px;
  padding: 40px;
  min-height: 250px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.infoCard:hover {
  transform: translateY(-8px);
  box-shadow: 0 22px 55px rgba(0,0,0,0.08);
}

.cardIconImage {
  width: 58px;
  height: 58px;
  object-fit: contain;
  margin-bottom: 28px;
  transition: transform 0.3s ease;
}

.infoCard:hover .cardIconImage {
  transform: translateY(-5px) rotate(-4deg) scale(1.08);
}

.infoCard h3 {
  font-family: "Instrument Serif", serif;
  font-size: 22px;
  line-height: 1;
  margin: 0 0 12px;
}

.infoCard p {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.45;
  letter-spacing: -0.02em;
  margin: 0;
}

.splitSection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1500px;
  margin: 0 auto;
  padding: 120px 20px;
  align-items: center;
}

.splitImage {
  height: 540px;
  border-radius: 20px;
  overflow: hidden;
}

.splitImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.splitCopy {
  max-width: 520px;
}

.label {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #555;
  margin: 0 0 20px;
}

.splitCopy h2 {
  font-size: clamp(44px, 5vw, 76px);
}

.splitCopy p:not(.label) {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 18px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #333;
  margin: 24px 0;
}

.arrowButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #000;
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 18px;
  font-weight: 500;
  padding: 0;
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.arrowButton:hover {
  transform: translateY(-2px);
  opacity: 0.76;
}


.connectButton {
  padding: 13px 27px;
  border: 1px solid rgba(0,0,0,.84);
  background: #050505;
  color: #fff;
  box-shadow: 0 8px 18px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.20);
}

.connectButton:hover {
  background: #050505;
  color: #fff;
}

.quoteSection {
  padding: 110px 20px;
  text-align: center;
  background: linear-gradient(180deg, rgba(248,251,255,0.78), rgba(218,236,251,0.88));
}

.quoteIcon {
  font-family: "Instrument Serif", serif;
  font-size: 74px;
  line-height: 0.6;
}

.quoteSection h2 {
  font-size: clamp(40px, 5.8vw, 82px);
  max-width: 1050px;
  margin: 0 auto;
}

.quoteSection p {
  font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
  font-size: 12px;
  letter-spacing: 0.08em;
  margin-top: 26px;
  color: #6c6c6c;
}

.ctaSection {
  background: linear-gradient(180deg, #d8ecfb, #b7d9fb);
  color: #050505;
  padding: 80px 20px 44px;
  text-align: center;
}

.ctaSection h2 {
  color: #050505;
  font-size: clamp(42px, 6vw, 82px);
  max-width: 1180px;
  margin: 0 auto 28px;
}

.getStartedButton {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 14px 25px;
  border: 1px solid rgba(0,0,0,.84);
  background: #050505;
  color: #fff;
  font-size: 17px;
  box-shadow: 0 8px 18px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.20);
}

.footerLogoWrap {
  width: min(920px, 88vw);
  margin: 44px auto 0;
  opacity: 0.9;
}

.footerLogoWrap img {
  width: 100%;
  display: block;
}

@keyframes heroTextIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes mockupIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes wordFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}


@media (min-width: 901px) {
  .heroSection::after {
    content: "";
    position: absolute;
    width: 520px;
    height: 520px;
    right: -180px;
    top: 170px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.42), rgba(255,255,255,0));
    animation: softDrift 8s ease-in-out infinite alternate;
    pointer-events: none;
  }

  .heroMockup:hover {
    transform: translateY(-10px) scale(1.01) !important;
    box-shadow: 0 34px 90px rgba(0,0,0,0.26);
  }

  .splitImage img {
    transition: transform 0.8s cubic-bezier(.16,1,.3,1), filter 0.8s cubic-bezier(.16,1,.3,1);
  }

  .splitImage:hover img {
    transform: scale(1.045);
    filter: saturate(1.05);
  }

  .featureGrid.show .featureRow {
    animation: rowRise 0.65s cubic-bezier(.16,1,.3,1) both;
  }

  .featureGrid.show .featureRow:nth-child(2) { animation-delay: 0.08s; }
  .featureGrid.show .featureRow:nth-child(3) { animation-delay: 0.16s; }
  .featureGrid.show .featureRow:nth-child(4) { animation-delay: 0.24s; }
}

@keyframes softDrift {
  from { transform: translate3d(0,0,0) scale(1); }
  to { transform: translate3d(-70px,55px,0) scale(1.1); }
}

@keyframes rowRise {
  from { opacity: 0; transform: translateY(26px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes phoneMockupIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 900px) {
  .landingNavLinks,
  .navActions {
    display: none;
  }

  .mobileMenuButton {
    display: flex;
  }

  .mobileMenu {
    display: flex;
    position: absolute;
    top: 66px;
    left: 14px;
    right: 14px;
    flex-direction: column;
    gap: 4px;
    padding: 14px;
    border-radius: 20px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-10px) scale(0.98);
    transition: 0.22s ease;
  }

  .mobileMenuOpen {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0) scale(1);
  }

  .mobileMenu a,
  .mobileMenu button {
    border: 0;
    text-align: left;
    padding: 14px;
    font-size: 18px;
    border-radius: 12px;
    color: #000;
    font-family: "Google Sans", "DM Sans", system-ui, sans-serif;
    transition: transform 0.22s ease, background 0.22s ease, color 0.22s ease, box-shadow 0.22s ease;
  }

  .mobileMenu a {
    background: transparent;
  }

  .mobileMenu a:hover {
    background: #f2f2f2;
    transform: translateX(3px);
  }

  .mobileMenu .mobileRegisterBtn,
  .mobileMenu .mobileLoginBtn {
    text-align: center;
    border-radius: 999px;
    font-weight: 500;
    margin-top: 8px;
  }

  .mobileMenu .mobileRegisterBtn {
    background: #000;
    color: #fff;
    box-shadow: 0 8px 18px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.20);
  }

  .mobileMenu .mobileLoginBtn {
    background: #fff;
    color: #111;
    box-shadow: 0 8px 18px rgba(0,0,0,.10);
  }

  .mobileMenu .mobileRegisterBtn:hover,
  .mobileMenu .mobileLoginBtn:hover {
    transform: translateY(-2px);
  }

  .cardsGrid,
  .splitSection {
    grid-template-columns: 1fr;
  }

  .splitSection {
    padding: 80px 20px;
  }

  .splitCopy {
    max-width: 680px;
  }

  .splitImage {
    height: 420px;
  }
}

@media (max-width: 560px) {
  .brandMark {
    width: 108px;
  }

  .heroSection {
    min-height: 650px;
    padding: 112px 15px 56px;
    background: linear-gradient(
      180deg,
      #afd6ff 0%,
      #cfe7f7 34%,
      #f6e8ee 60%,
      #eef7fb 94%
    );
  }

  .heroTitle {
    font-size: clamp(43px, 13vw, 70px);
    line-height: 0.88;
  }

  .heroSubtitle {
    font-size: 16px;
    max-width: 330px;
  }

  .heroActions {
    gap: 10px;
  }

  .primaryPill,
  .secondaryPill {
    padding: 11px 22px;
  }

  .heroMockup {
    display: block;
    width: min(260px, 70vw);
    aspect-ratio: 390 / 780;
    margin-top: 34px;
    border: 7px solid #111;
    border-radius: 46px;
    background: #111;
    box-shadow:
      0 18px 44px rgba(0,0,0,0.24),
      inset 0 0 0 1px rgba(255,255,255,0.12);
    animation: phoneMockupIn 0.95s cubic-bezier(.16,1,.3,1) 0.42s forwards;
  }

  .heroMockup img {
    border-radius: 38px;
    object-fit: cover;
    object-position: center top;
  }

  .browserDots {
    display: none;
  }

  .phoneSpeaker {
    display: block;
    position: absolute;
    z-index: 5;
    top: 10px;
    left: 50%;
    width: 78px;
    height: 23px;
    border-radius: 999px;
    background: #050505;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
    transform: translateX(-50%);
  }

  .wideImage {
    height: 270px;
    border-radius: 14px;
  }

  .featureSection {
    padding: 20px 15px 70px;
  }

  .introSection {
    padding: 72px 18px 55px;
  }

  .introSection p,
  .featureRow p,
  .infoCard p,
  .splitCopy p:not(.label) {
    font-size: 17px;
  }

  .featureRow {
    gap: 14px;
  }

  .claritySection {
    padding: 70px 15px;
  }

  .clarityTitle {
    text-align: left;
  }

  .cardsGrid {
    grid-template-columns: 1fr;
  }

  .infoCard {
    padding: 30px;
    min-height: 210px;
  }

  .splitImage {
    height: 300px;
  }

  .quoteSection {
    padding: 80px 18px;
  }

  .ctaSection {
    padding-top: 64px;
  }
}
`;
