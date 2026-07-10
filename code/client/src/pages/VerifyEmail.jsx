import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Check, Loader2, LogIn, MailCheck, X } from "lucide-react";
import { resendVerificationEmail, verifyEmail } from "../api";

export default function VerifyEmail() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState(token ? "loading" : "check-email");
  const [message, setMessage] = useState(
    "Please login if you already verified your email, or register again if the link expired."
  );
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let active = true;

    async function confirmEmail() {
      try {
        const data = await verifyEmail(token);

        if (!active) return;

        setStatus("success");
        localStorage.removeItem("token");
        setMessage(
          data.message || "Verification successful. Please login again to continue."
        );
      } catch {
        if (!active) return;

        setStatus("error");
        setMessage(
          "Please login if you already verified your email, or register again if the link expired."
        );
      }
    }

    if (!token) {
      setStatus("check-email");
      setMessage(location.state?.message || "");
    } else {
      confirmEmail();
    }

    return () => {
      active = false;
    };
  }, [location.state?.message, token]);

  const isSuccess = status === "success";
  const isError = status === "error";
  const isLoading = status === "loading";
  const isCheckEmail = status === "check-email";

  const goHome = () => {
    navigate("/");
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  };

  const handleResend = async () => {
    if (!email) return;

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

  const title = isLoading
    ? "Verifying email"
    : isSuccess
      ? "Verification successful"
      : isCheckEmail
        ? "Check your email"
        : "Verification failed";

  const body = isLoading
    ? "Please wait while we confirm your Alumnet account."
    : isCheckEmail && message
      ? message
    : isCheckEmail && email
      ? `We sent a verification link to ${email}. Open it to continue.`
      : isCheckEmail
        ? "We sent a verification link to your email. Open it to continue."
        : isSuccess
          ? "Verification successful. Please login again to continue."
          : isError
            ? message
            : message;

  return (
    <main className="verifyPage">
      <style>{css}</style>

      <section className={`verifyCard ${mounted ? "in" : ""}`}>
        <button className="iconButton" type="button" onClick={goHome}>
          {isLoading ? (
            <Loader2 className="spin" size={21} strokeWidth={2} />
          ) : isSuccess ? (
            <Check size={21} strokeWidth={2.2} />
          ) : isError ? (
            <X size={21} strokeWidth={2.2} />
          ) : (
            <MailCheck size={21} strokeWidth={2} />
          )}
        </button>

        <h1>{title}</h1>
        <p className="verifySubtitle">{body}</p>

        {!isLoading && !isCheckEmail && (
          <Link className="verifyButton" to="/login">
            <span>{isSuccess ? "Login again" : "Go to login"}</span>
            <ArrowRight size={15} strokeWidth={2.4} />
          </Link>
        )}

        {isCheckEmail && (
          <>
            {email && (
              <button
                className="verifyButton"
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <Loader2 className="spin" size={15} strokeWidth={2.2} />
                ) : (
                  <MailCheck size={15} strokeWidth={2.2} />
                )}
                <span>{resendLoading ? "Sending..." : "Resend verification email"}</span>
              </button>
            )}

            {resendMessage && <p className="resendMessage">{resendMessage}</p>}

            <Link className="secondaryButton" to="/login">
              <LogIn size={15} strokeWidth={2.2} />
              <span>Go to login</span>
            </Link>
          </>
        )}

        <Link className="backHomeLink" to="/" onClick={goHome}>
          Back to Home
        </Link>
      </section>
    </main>
  );
}

const css = `
.verifyPage{
  position:relative;
  min-height:100vh;
  display:grid;
  place-items:center;
  overflow:hidden;
  background:linear-gradient(180deg, #afd6ff 0%, #cfe7f7 34%, #f6e8ee 62%, #eef7fb 100%);
  color:#050505;
  font-family:"Google Sans";
  padding:24px;
}

.verifyPage::before{
  content:"";
  position:fixed;
  inset:0;
  background:
    linear-gradient(135deg, rgba(255,255,255,.52), rgba(255,255,255,0) 42%),
    radial-gradient(circle at 50% 28%, rgba(255,232,238,.72), rgba(255,232,238,0) 42%),
    radial-gradient(circle at 50% 20%, rgba(255,255,255,.72), rgba(255,255,255,0) 38%);
  pointer-events:none;
}

.verifyCard{
  position:relative;
  z-index:1;
  width:min(360px, calc(100vw - 42px));
  border-radius:18px;
  padding:28px 28px 24px;
  text-align:center;
  background:linear-gradient(180deg, rgba(231,250,255,.72), rgba(255,255,255,.82) 58%, rgba(255,255,255,.76));
  border:1px solid rgba(255,255,255,.58);
  box-shadow:0 18px 44px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.52);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  opacity:0;
  transform:translateY(14px) scale(.985);
  transition:opacity .55s ease, transform .55s ease;
}

.verifyCard.in{
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
  background:rgba(255,255,255,.60);
  border:1px solid rgba(0,0,0,.08);
  box-shadow:0 10px 24px rgba(0,0,0,.18);
  margin-bottom:17px;
  transition:transform .2s ease, box-shadow .2s ease, background-color .2s ease;
}

.iconButton:hover{
  transform:translateY(-1px);
  background:#ffffff;
  box-shadow:0 10px 22px rgba(0,0,0,.15);
}

.verifyCard h1{
  margin:0 0 8px;
  font-size:24px;
  line-height:1.15;
  font-weight:600;
  letter-spacing:-.02em;
}

.verifySubtitle{
  margin:0 auto 20px;
  max-width:290px;
  font-size:14px;
  line-height:1.45;
  color:rgba(0,0,0,.84);
}

.verifyButton{
  height:35px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  width:100%;
  border-radius:999px;
  border:1px solid rgba(0,0,0,.84);
  background:#050505;
  color:#ffffff;
  font:inherit;
  font-size:14px;
  font-weight:500;
  text-decoration:none;
  box-shadow:0 8px 18px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.20);
  transition:transform .2s ease, box-shadow .2s ease, opacity .2s ease;
}

.verifyButton:hover:not(:disabled){
  transform:translateY(-1px);
  box-shadow:0 10px 23px rgba(0,0,0,.27), inset 0 1px 0 rgba(255,255,255,.20);
}

.verifyButton:disabled{
  opacity:.72;
  cursor:not-allowed;
}

.secondaryButton{
  height:35px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  width:100%;
  margin-top:9px;
  border-radius:999px;
  background:rgba(255,255,255,.72);
  color:#111111;
  font:inherit;
  font-size:14px;
  font-weight:500;
  text-decoration:none;
  border:1px solid rgba(0,0,0,.12);
  transition:transform .2s ease, box-shadow .2s ease;
}

.secondaryButton:hover{
  transform:translateY(-1px);
  box-shadow:0 8px 18px rgba(0,0,0,.12);
}

.resendMessage{
  margin:10px 0 0;
  color:rgba(0,0,0,.78);
  font-size:13px;
  line-height:1.35;
}

.backHomeLink{
  display:inline-flex;
  margin-top:14px;
  color:rgba(17,17,17,.72);
  font-size:13px;
  text-decoration:none;
  transition:opacity .18s ease;
}

.backHomeLink:hover{
  opacity:.68;
}

.spin{
  animation:spin 900ms linear infinite;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

@media (max-width:640px){
  .verifyPage{
    padding:18px;
  }
}
`;
