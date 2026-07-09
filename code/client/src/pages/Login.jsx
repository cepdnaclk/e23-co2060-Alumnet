import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, LogIn, Mail, Lock } from "lucide-react";
import { loginUser, resendVerificationEmail } from "../api";
import heroBg from "../assets/bg.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNeedsEmailVerification(false);
    setResendMessage("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      navigate("/profile");
    } catch (err) {
      const message = err.message || "Login failed";
      setError(message);
      setNeedsEmailVerification(message.toLowerCase().includes("verify your email"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");

    try {
      const data = await resendVerificationEmail(email);
      setResendMessage(data.message || "Verification email sent. Please check your inbox.");
    } catch (err) {
      setResendMessage(err.message || "Failed to send verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const goHome = () => {
    navigate("/");
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  };

  return (
    <main className="loginPage">
      <style>{css}</style>
      <img src={heroBg} alt="" className="loginBg" />

      <section className={`loginCard ${mounted ? "in" : ""}`}>
        <button className="iconButton" type="button" onClick={goHome}>
          <LogIn size={21} strokeWidth={2} />
        </button>

        <h1>Sign in</h1>
        <p className="loginSubtitle">Continue your Alumnet mentorship journey.</p>

        <form onSubmit={handleSubmit} className="loginForm">
          <label className="inputWrap">
            <Mail size={15} strokeWidth={2.1} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </label>

          <label className="inputWrap">
            <Lock size={15} strokeWidth={2.1} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button
              className="passwordToggle"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} strokeWidth={2.1} /> : <Eye size={15} strokeWidth={2.1} />}
            </button>
          </label>

          {error && (
            <div className="errorBox">
              <span>{error}</span>
              {needsEmailVerification && email && (
                <button type="button" onClick={handleResend} disabled={resendLoading}>
                  {resendLoading ? (
                    <Loader2 className="spin" size={13} strokeWidth={2.2} />
                  ) : null}
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
              )}
              {resendMessage && <small>{resendMessage}</small>}
            </div>
          )}

          <button className="signInButton" type="submit" disabled={loading}>
            <span>{loading ? "Signing in..." : "Sign in"}</span>
            {!loading && <ArrowRight size={15} strokeWidth={2.4} />}
          </button>
        </form>

        <div className="loginFooter">
          <span>New here?</span>
          <Link to="/register">Register</Link>
        </div>

        <Link className="backHomeLink" to="/" onClick={goHome}>
          Back to Home
        </Link>
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
  background:#d8ecfb;
  color:#050505;
  font-family:"Google Sans";
  padding:24px;
}

.loginBg{
  position:fixed;
  top:0;
  left:50%;
  width:100%;
  height:auto;
  min-height:100%;
  transform:translateX(-50%);
  object-fit:cover;
  object-position:center top;
}

.loginCard{
  position:relative;
  z-index:1;
  width:min(360px, calc(100vw - 42px));
  border-radius:18px;
  padding:28px 28px 24px;
  text-align:center;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 68px rgba(0,0,0,.24);
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
  box-shadow:0 10px 22px rgba(0,0,0,.15);
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
  border-color:rgba(0,0,0,.12);
  box-shadow:0 0 0 4px rgba(255,255,255,.28);
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

.passwordToggle{
  display:grid;
  place-items:center;
  flex:0 0 auto;
  width:22px;
  height:22px;
  border-radius:999px;
  color:rgba(17,17,17,.64);
  transition:background .18s ease, color .18s ease;
}

.passwordToggle:hover{
  background:rgba(255,255,255,.62);
  color:#111111;
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

.errorBox button{
  justify-self:start;
  display:inline-flex;
  align-items:center;
  gap:6px;
  min-height:28px;
  padding:0 10px;
  border-radius:999px;
  border:1px solid rgba(185,28,28,.18);
  background:#ffffff;
  color:#991b1b;
  font:inherit;
  font-size:12px;
  cursor:pointer;
}

.errorBox button:disabled{
  opacity:.72;
  cursor:not-allowed;
}

.errorBox small{
  color:#7f1d1d;
  font-size:12px;
  line-height:1.35;
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
  text-decoration:none;
  transition:opacity .18s ease;
}

.loginFooter a:hover,
.backHomeLink:hover{
  opacity:.68;
}

.backHomeLink{
  display:inline-flex;
  margin-top:10px;
  color:rgba(17,17,17,.72);
  font-size:13px;
  text-decoration:none;
  transition:opacity .18s ease;
}

@media (max-width:640px){
  .loginPage{
    padding:18px;
  }

  .loginBg{
    height:100%;
    width:auto;
    min-width:100%;
  }
}
`;
