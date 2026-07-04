import { useState } from "react";
import { useParams } from "react-router-dom";
import { createMentorshipRequest } from "../api";

export default function RequestMentorship() {
  const { id } = useParams();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const sendRequest = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await createMentorshipRequest(token, {
        alumni_user_id: Number(id),
        message,
      });

      setSuccess(res.message);
      setMessage("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="requestPage">
      <style>{css}</style>

      <section className="requestMain">
        <header className="requestHeader">
          <h1>Request Mentorship</h1>
          <p>Send a mentorship request to this alumni</p>
        </header>

        <section className="requestPanel">
          <h2>Message to Mentor</h2>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Explain why you want mentorship..."
          />

          <div className="actionRow">
            <button
              className="requestButton"
              type="button"
              onClick={sendRequest}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>

          {success && <div className="stateBox success">{success}</div>}
          {error && <div className="stateBox error">{error}</div>}
        </section>
      </section>
    </main>
  );
}

const css = `
.requestPage{
  min-height:100vh;
  background:#fbfbfa;
  color:#111111;
  font-family:"Google Sans";
  animation:pageDissolve .22s ease both;
}

.requestMain{
  width:min(760px, 100%);
  margin:0 auto;
  padding:34px 28px;
}

.requestHeader{
  margin-bottom:22px;
}

.requestHeader h1{
  margin:0;
  font-size:16px;
  line-height:1.15;
  font-weight:500;
  letter-spacing:0;
}

.requestHeader p{
  margin:5px 0 0;
  color:rgba(17,17,17,.42);
  font-size:14px;
  line-height:1.4;
}

.requestPanel{
  min-width:0;
}

.requestPanel h2{
  margin:0 0 8px;
  font-size:13px;
  font-weight:600;
  color:#111111;
}

.requestPanel textarea{
  width:100%;
  min-height:168px;
  resize:vertical;
  padding:12px 0;
  border:0;
  border-top:1px solid rgba(0,0,0,.06);
  border-bottom:1px solid rgba(0,0,0,.06);
  outline:0;
  background:transparent;
  color:#111111;
  font:inherit;
  font-size:13px;
  line-height:1.55;
}

.requestPanel textarea::placeholder{
  color:rgba(17,17,17,.42);
}

.requestPanel textarea:focus{
  border-bottom-color:rgba(17,17,17,.22);
}

.actionRow{
  display:flex;
  align-items:center;
  gap:12px;
  margin-top:18px;
}

.requestButton{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:38px;
  padding:0 16px;
  border-radius:999px;
  font-family:"Google Sans";
  font-size:14px;
  transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease;
}

.requestButton{
  background:#050505;
  color:#ffffff;
  box-shadow:0 8px 18px rgba(25, 62, 182, 0.18);
}

.requestButton:hover,
.requestButton:hover{
  transform:translateY(-1px);
}

.requestButton:disabled{
  opacity:.68;
  cursor:not-allowed;
  transform:none;
}

.stateBox{
  margin-top:14px;
  padding:10px 12px;
  border-radius:7px;
  font-size:13px;
  line-height:1.45;
}

.stateBox.success{
  background:rgba(34,197,94,.14);
  color:#15803d;
}

.stateBox.error{
  background:rgba(215,38,61,.10);
  color:#b91c1c;
}

@keyframes pageDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@media (max-width:640px){
  .requestMain{
    padding:18px 16px 36px;
  }

}
`;
