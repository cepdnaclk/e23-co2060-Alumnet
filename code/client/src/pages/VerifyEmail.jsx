import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { verifyEmail } from "../api";
import alumnetLogo from "../assets/alumnet-logo.png";
import AuthLayout from "../components/AuthLayout";
import {
  titleStyle,
  subtitleStyle,
  btnPrimaryStyle,
  linkStyle,
  uiCss,
} from "../styles/ui";

const logoStyle = {
  display: "block",
  width: 140,
  maxWidth: "70%",
  height: "auto",
  margin: "0 auto 28px",
};

export default function VerifyEmail() {
  const { token } = useParams();
  const location = useLocation();
  const email = location.state?.email;
  const [status, setStatus] = useState(token ? "loading" : "check-email");
  const [message, setMessage] = useState(
    "Please login if you already verified your email, or register again if the link expired."
  );

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
      } catch (err) {
        if (!active) return;

        setStatus("error");
        setMessage(
          "Please login if you already verified your email, or register again if the link expired."
        );
      }
    }

    if (!token) {
      setStatus("check-email");
      setMessage("");
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

  return (
    <AuthLayout maxWidth={520}>
      <style>{uiCss}</style>
      <img src={alumnetLogo} alt="Alumnet" style={logoStyle} />

      <h1 style={titleStyle}>
        {isLoading
          ? "Verifying Email"
          : isSuccess
            ? "Verification Successful"
            : isCheckEmail
              ? "Check Your Email"
              : ""}
      </h1>
      <p style={subtitleStyle}>
        {isLoading
          ? "Please wait while we confirm your Alumnet account."
          : isCheckEmail && email
            ? `We sent a verification link to ${email}. Open it to continue.`
          : isSuccess
              ? "Verification successful. Please login again to continue."
              : isError
                ? message
              : message}
      </p>

      {!isLoading && !isCheckEmail && (
        <Link
          className="btnPrimary"
          to="/login"
          style={{
            ...btnPrimaryStyle,
            display: "block",
            textAlign: "center",
            textDecoration: "none",
            marginTop: 16,
          }}
        >
          {isSuccess ? "Login Again to Continue" : "Go to Login"}
        </Link>
      )}

      <div style={{ textAlign: "center", marginTop: 14 }}>
        <Link className="link" style={linkStyle} to="/">
          Back to Home
        </Link>
      </div>
    </AuthLayout>
  );
}
