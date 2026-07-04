import { useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { requestEndMentorship } from "../api";

export default function EndMentorship() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mentorName = location.state?.alumniName || "Selected mentor";
  const mentorAvatar = location.state?.alumniAvatar;
  const mentorInitial = mentorName?.slice(0, 1)?.toUpperCase() || "M";

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const sendRequest = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await requestEndMentorship(token, {
        alumni_user_id: Number(id),
        reason,
      });

      setSuccess(res.message || "End mentorship request sent");
      setReason("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="endPage">
      <style>{css}</style>

      <section className="endShell">
        <button
          className="closeButton"
          type="button"
          aria-label="Close request"
          onClick={() => navigate(-1)}
        >
          <X size={16} strokeWidth={2} />
        </button>

        <header className="endHeader">
          <h1>End Mentorship Form</h1>
        </header>

        <dl className="endMeta">
          <div>
            <dt>Mentor</dt>
            <dd className="mentorValue">
              {mentorAvatar ? (
                <img src={mentorAvatar} alt="" className="miniAvatar" />
              ) : (
                <span className="miniAvatar fallback">{mentorInitial}</span>
              )}
              <span>{mentorName}</span>
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span className="readyPill">Ready to send</span>
            </dd>
          </div>
        </dl>

        <section className="endPanel">
          <h2>Reason for Ending</h2>
          <p>
            Share the reason with your mentor. The mentorship ends only after they accept
            this request.
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you want to end this mentorship..."
          />

          {success && <div className="stateBox success">{success}</div>}
          {error && <div className="stateBox error">{error}</div>}
        </section>

        <div className="actionRow">
          <button
            className="endButton"
            type="button"
            onClick={sendRequest}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send End Request"}
          </button>
        </div>
      </section>
    </main>
  );
}

const css = `
.endPage{
  position:relative;
  min-height:100vh;
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  animation:pageDissolve .22s ease both;
  padding:30px 22px 44px;
  overflow-x:hidden;
  display:flex;
  justify-content:center;
  align-items:flex-start;
}

.endShell{
  position:relative;
  width:min(560px, 100%);
  margin:0 auto;
  border-radius:12px;
  padding:24px 28px 26px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.24);
}

.closeButton{
  position:absolute;
  top:14px;
  right:14px;
  width:30px;
  height:30px;
  display:grid;
  place-items:center;
  border-radius:999px;
  background:#ffffff;
  color:rgba(17,17,17,.62);
  box-shadow:0 8px 20px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
  transition:transform .18s ease, box-shadow .18s ease, color .18s ease;
}

.closeButton:hover{
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.17), 0 3px 8px rgba(0,0,0,.08);
}

.endHeader{
  margin-bottom:22px;
  padding-right:34px;
}

.endHeader h1{
  margin:0;
  font-size:18px;
  line-height:1.15;
  font-weight:500;
  letter-spacing:0;
}

.endMeta{
  display:grid;
  gap:14px;
  margin:0 0 22px;
}

.endMeta div{
  display:grid;
  grid-template-columns:96px minmax(0, 1fr);
  align-items:center;
  gap:14px;
}

.endMeta dt{
  color:rgba(17,17,17,.44);
  font-size:12px;
}

.endMeta dd{
  min-width:0;
  margin:0;
  color:#111111;
  font-size:13px;
  line-height:1.35;
}

.mentorValue{
  display:inline-flex;
  align-items:center;
  gap:8px;
}

.miniAvatar{
  width:22px;
  height:22px;
  border-radius:50%;
  object-fit:cover;
  display:inline-grid;
  place-items:center;
  flex:0 0 auto;
  background:#ecebe7;
  color:#111111;
  font-size:11px;
  font-weight:500;
}

.readyPill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  min-height:25px;
  padding:0 11px;
  border-radius:999px;
  background:rgba(47,95,245,.12);
  color:#244ee4;
  font-size:11px;
  line-height:1;
  white-space:nowrap;
  box-shadow:0 8px 18px rgba(47,95,245,.12);
}

.readyPill::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  background:#2f5ff5;
  flex:0 0 auto;
}

.endPanel{
  min-width:0;
  border-top:1px solid rgba(0,0,0,.08);
  padding-top:22px;
}

.endPanel h2{
  margin:0 0 7px;
  font-size:13px;
  font-weight:500;
  color:#111111;
}

.endPanel p{
  margin:0 0 13px;
  max-width:430px;
  color:rgba(17,17,17,.58);
  font-size:12px;
  line-height:1.45;
}

.endPanel textarea{
  width:100%;
  min-height:138px;
  resize:vertical;
  padding:12px 14px;
  border:1px solid rgba(0,0,0,.06);
  border-radius:10px;
  outline:0;
  background:#f3f5f8;
  color:#111111;
  font:inherit;
  font-size:13px;
  line-height:1.55;
}

.endPanel textarea::placeholder{
  color:rgba(17,17,17,.42);
}

.endPanel textarea:focus{
  border-color:rgba(47,95,245,.35);
  box-shadow:0 0 0 3px rgba(47,95,245,.08);
}

.actionRow{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:12px;
  margin-top:18px;
  padding-top:18px;
  border-top:1px solid rgba(0,0,0,.08);
}

.endButton{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  padding:0 12px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-family:"Google Sans";
  font-size:13px;
  line-height:1;
  box-shadow:0 10px 24px rgba(0,0,0,.18), 0 2px 7px rgba(0,0,0,.08);
  transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease;
}

.endButton:hover{
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

.endButton:disabled{
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
  background:rgba(215,38,61,.10);
  color:#b91c1c;
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
  .endPage{
    padding:14px 14px 36px;
  }

  .endShell{
    border-radius:14px;
    padding:22px 16px 20px;
  }

  .endMeta div{
    grid-template-columns:78px minmax(0, 1fr);
  }

  .actionRow{
    justify-content:stretch;
  }

  .endButton{
    width:100%;
  }
}
`;
