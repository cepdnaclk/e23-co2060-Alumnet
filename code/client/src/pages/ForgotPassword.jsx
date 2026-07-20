import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, Loader2, Mail } from "lucide-react";
import { forgotPassword } from "../api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setMessage(data.message || "Password reset link sent to your email.");
    } catch (err) {
      setError(err.message || "Unable to send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigate("/");
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  };

  return (
    <main className="loginPage">
      <style>{css}</style>

      <section className={`loginCard ${mounted ? "in" : ""}`}>
        <button className="iconButton" type="button" onClick={goHome} aria-label="Back to home">
          <KeyRound size={21} strokeWidth={2} />
        </button>

        <h1>Forgot password?</h1>
        <p className="loginSubtitle">Enter your email and we’ll send you a secure reset link.</p>

        <form className="loginForm" onSubmit={handleSubmit}>
          <label className="inputWrap">
            <Mail size={15} strokeWidth={2.1} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
            />
          </label>

          {error && (
            <div className="errorBox">
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="successBox">
              <span>{message}</span>
            </div>
          )}

          <button className="signInButton" type="submit" disabled={loading || Boolean(message)}>
            {loading && <Loader2 className="spin" size={14} strokeWidth={2.2} />}
            <span>{loading ? "Sending link..." : message ? "Link Sent" : "Send reset link"}</span>
            {!loading && !message && <ArrowRight size={15} strokeWidth={2.4} />}
          </button>
        </form>

        <div className="loginFooter">
          <span>Remembered your password?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </section>
    </main>
  );
}

const css = `
.loginPage{
  position:relative;
  min-height:100vh;
  display:grid;
  place-items:center;
  overflow:hidden;
  background:
    linear-gradient(180deg, #afd6ff 0%, #cfe7f7 34%, #f6e8ee 62%, #eef7fb 100%);
  color:#050505;
  font-family:"Google Sans", Arial, sans-serif;
  padding:24px;
}

.loginPage::before{
  content:"";
  position:fixed;
  inset:0;
  background:
    linear-gradient(135deg, rgba(255,255,255,.52), rgba(255,255,255,0) 42%),
    radial-gradient(circle at 50% 28%, rgba(255,232,238,.72), rgba(255,232,238,0) 42%),
    radial-gradient(circle at 50% 20%, rgba(255,255,255,.72), rgba(255,255,255,0) 38%);
  pointer-events:none;
}

.loginCard{
  position:relative;
  z-index:1;
  width:min(360px, calc(100vw - 42px));
  border-radius:18px;
  padding:28px 28px 24px;
  text-align:center;
  background:rgba(255,255,255,.88);
  border:1px solid rgba(255,255,255,.78);
  box-shadow:0 28px 68px rgba(39,91,130,.18);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  opacity:0;
  transform:translateY(14px) scale(.985);
  transition:opacity .55s ease, transform .55s ease;
}

.loginCard.in{
  opacity:1;
  transform:translateY(0) scale(1);
}

.iconButton{
  width:44px;
  height:44px;
  display:inline-grid;
  place-items:center;
  border-radius:14px;
  color:#111111;
  background:#ffffff;
  border:1px solid rgba(0,0,0,.08);
  box-shadow:0 14px 30px rgba(0,0,0,.18);
  margin-bottom:17px;
  transition:transform .2s ease, box-shadow .2s ease, background-color .2s ease;
}

.iconButton:hover{
  transform:translateY(-1px);
  background:#ffffff;
  box-shadow:0 10px 22px rgba(39,91,130,.16);
}

.loginCard h1{
  margin:0 0 5px;
  font-size:24px;
  line-height:1.15;
  font-weight:600;
  letter-spacing:-.02em;
}

.loginSubtitle{
  margin:0 0 20px;
  font-size:14px;
  line-height:1.35;
  color:rgba(0,0,0,.84);
}

.loginForm{
  display:grid;
  gap:9px;
}

.inputWrap{
  height:30px;
  display:flex;
  align-items:center;
  gap:7px;
  padding:0 10px;
  border-radius:8px;
  background:#eef1f5;
  border:1px solid rgba(0,0,0,.05);
  color:rgba(17,17,17,.70);
  transition:border-color .18s ease, box-shadow .18s ease, background .18s ease;
}

.inputWrap:focus-within{
  background:#ffffff;
  border-color:rgba(54,127,145,.24);
  box-shadow:0 0 0 4px rgba(201,226,255,.42);
}

.inputWrap input{
  min-width:0;
  width:100%;
  border:none;
  outline:none;
  background:transparent;
  color:#111111;
  font:inherit;
  font-size:14px;
}

.inputWrap input::placeholder{
  color:rgba(17,17,17,.64);
}

.signInButton{
  height:33px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  margin-top:9px;
  border-radius:999px;
  border:1px solid rgba(0,0,0,.84);
  background:#050505;
  color:#ffffff;
  font:inherit;
  font-size:14px;
  font-weight:500;
  box-shadow:0 8px 18px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.20);
  transition:transform .2s ease, box-shadow .2s ease, opacity .2s ease;
}

.signInButton:hover:not(:disabled){
  transform:translateY(-1px);
  box-shadow:0 10px 23px rgba(0,0,0,.27), inset 0 1px 0 rgba(255,255,255,.20);
}

.signInButton:disabled{
  opacity:.72;
  cursor:not-allowed;
}

.errorBox{
  display:grid;
  gap:8px;
  padding:8px 10px;
  border-radius:10px;
  background:rgba(239,68,68,.10);
  border:1px solid rgba(239,68,68,.18);
  color:#b91c1c;
  font-size:13px;
  line-height:1.35;
  text-align:left;
}

.successBox{
  display:grid;
  gap:8px;
  padding:8px 10px;
  border-radius:10px;
  background:rgba(16,185,129,.10);
  border:1px solid rgba(16,185,129,.20);
  color:#047857;
  font-size:13px;
  line-height:1.35;
  text-align:left;
}

.spin{
  animation:spin 900ms linear infinite;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

.loginFooter{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  margin-top:14px;
  padding-top:12px;
  border-top:1px dashed rgba(0,0,0,.10);
  color:rgba(17,17,17,.72);
  font-size:13px;
}

.loginFooter a{
  color:#111111;
  font-weight:600;
  text-decoration:none;
  transition:opacity .18s ease;
}

.loginFooter a:hover{
  opacity:.68;
}

@media (max-width:640px){
  .loginPage{
    padding:18px;
  }
}
`;