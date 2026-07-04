import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getAlumniProfile } from "../api";
import LoadingScreen from "../components/LoadingScreen";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";

export default function AlumniPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = useMemo(() => localStorage.getItem("token"), []);

  const currentUser = useMemo(() => {
    try {
      if (!token) return null;
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  const isStudent = currentUser?.role === "student";
  const isOwnProfile = Number(currentUser?.id) === Number(id);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getAlumniProfile(id);
        setProfile(data);
      } catch (e) {
        setErr(e.message || "Failed to load alumni profile");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const statusIcon =
    profile?.verification_status === "verified"
      ? verifiedIcon
      : profile?.verification_status === "rejected"
        ? rejectedIcon
        : pendingIcon;

  const acceptedCount = Number(profile?.accepted_mentees_count || 0);
  const capacity = Number(profile?.preferred_mentee_capacity || 0);
  const remainingSlots = Math.max(capacity - acceptedCount, 0);
  const isVerified = profile?.verification_status === "verified";
  const canRequest =
    token &&
    isStudent &&
    !isOwnProfile &&
    isVerified &&
    remainingSlots > 0;

  if (loading) {
    return <LoadingScreen text="Loading alumni profile..." />;
  }

  if (err || !profile) {
    return (
      <div className="profilePage">
        <style>{css}</style>
        <div className="stateBox error">{err || "No alumni profile found."}</div>
      </div>
    );
  }

  return (
    <div className="profilePage">
      <style>{css}</style>
      <main className="profileMain">
        <section className="profileCard">
          <section className="profileHero">
            <div className="identityBlock">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="profileAvatar"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="profileAvatar fallback">
                  {profile.full_name?.slice(0, 1)?.toUpperCase() || "U"}
                </div>
              )}

              <div className="identityLine">
                <div className="identityCopy">
                  <div className="nameRow">
                    <h1>{profile.full_name || "Alumni"}</h1>
                    <img
                      src={statusIcon}
                      alt={profile.verification_status || "pending"}
                      className="verifiedBadge"
                    />
                  </div>
                  <a href={`mailto:${profile.email}`} className="emailText">
                    {profile.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="identityActions">
              {isVerified && (
                <div
                  className={`menteeCount ${remainingSlots > 0 ? "available" : "full"}`}
                  title={remainingSlots > 0 ? "Available" : "Mentor full"}
                >
                  {acceptedCount} / {capacity} left
                </div>
              )}

              {canRequest && (
                <button
                  className="requestButton"
                  type="button"
                  onClick={() =>
                    navigate(`/request-mentorship/${id}`, {
                      state: {
                        alumniName: profile.full_name,
                        alumniAvatar: profile.avatar_url,
                      },
                    })
                  }
                >
                  Request Mentorship
                </button>
              )}

              {!token && (
                <Link to="/login" className="secondaryLink">
                  Login to request mentorship
                </Link>
              )}
            </div>
          </section>

          {!isVerified && (
            <div className="noticeBox">This mentor is not verified yet.</div>
          )}

          {isVerified && remainingSlots <= 0 && (
            <div className="noticeBox">This mentor has reached their mentee capacity.</div>
          )}

          <section className="detailsGrid">
            <DetailPanel title="Personal Details">
              <InfoRow label="Role:" value="Alumni" />
              <InfoRow label="Department:" value={profile.department} />
              <InfoRow label="Graduation Year:" value={profile.graduation_year} />
              <InfoRow label="Bio:" value={profile.bio} multiline />
              <InfoRow
                label="Mentee Capacity:"
                value={profile.preferred_mentee_capacity}
              />
            </DetailPanel>

            <DetailPanel title="Professional Details">
              <InfoRow label="Job Title:" value={profile.job_title} />
              <InfoRow label="Company:" value={profile.organization} />
              <InfoRow
                label="Expertise/Interests:"
                value={profile.primary_interests}
                multiline
              />
            </DetailPanel>
          </section>
        </section>
      </main>
    </div>
  );
}

function DetailPanel({ title, children }) {
  return (
    <section className="detailPanel">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function InfoRow({ label, value, isLink = false, multiline = false }) {
  return (
    <div className="infoRow">
      <div className="infoLabel">{label}</div>
      <div className={`infoValue ${multiline ? "multiline" : ""}`}>
        {value ? (
          isLink ? (
            <a href={value} target="_blank" rel="noreferrer">
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          "-"
        )}
      </div>
    </div>
  );
}

const css = `
.profilePage{
  position:relative;
  min-height:100vh;
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  animation:pageDissolve .22s ease both;
  overflow-x:hidden;
}

.profileMain{
  position:relative;
  z-index:1;
  max-width:1340px;
  margin:0 auto;
  padding:24px 22px 34px;
}

.profileCard{
  position:relative;
  width:100%;
  margin:0 auto;
  border-radius:22px;
  padding:34px 18px 28px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.22);
}

.profileHero{
  position:relative;
  margin-bottom:30px;
}

.identityBlock{
  position:relative;
  width:min(560px, 100%);
  margin:0 auto;
  text-align:center;
}

.profileAvatar{
  width:78px;
  height:78px;
  border-radius:50%;
  object-fit:cover;
  display:grid;
  place-items:center;
  margin:0 auto 12px;
  border:0;
  background:#ecebe7;
  box-shadow:0 10px 24px rgba(0,0,0,.14);
}

.profileAvatar.fallback{
  color:#111111;
  font-size:30px;
}

.identityLine{
  display:flex;
  align-items:flex-start;
  justify-content:center;
  gap:0;
}

.identityCopy{
  min-width:0;
}

.nameRow{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:5px;
}

.nameRow h1{
  margin:0;
  font-size:18px;
  line-height:1.15;
  font-weight:500;
  letter-spacing:0;
}

.verifiedBadge{
  width:18px;
  height:18px;
  object-fit:contain;
}

.emailText{
  display:inline-block;
  margin:8px 0 0;
  color:rgba(17,17,17,.58);
  font-size:14px;
  line-height:1;
  text-decoration:none;
  transition:color .18s ease;
}

.emailText:hover{
  color:rgba(17,17,17,.62);
}

.noticeBox{
  display:inline-flex;
  margin:0 16px 18px;
  padding:9px 12px;
  border-radius:7px;
  background:#fee6c7;
  color:#ca240e;
  font-size:13px;
}

.detailsGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:26px;
  padding:0 16px;
}

.detailPanel{
  min-width:0;
}

.detailPanel h2{
  margin:0 0 8px;
  font-size:13px;
  font-weight:600;
  color:#111111;
}

.infoRow{
  display:grid;
  grid-template-columns:180px minmax(0, 1fr);
  gap:16px;
  padding:7px 0;
  border-bottom:1px solid rgba(0,0,0,.06);
}

.infoLabel{
  color:rgba(17,17,17,.50);
  font-size:13px;
}

.infoValue{
  color:#111111;
  font-size:13px;
  line-height:1.55;
  word-break:break-word;
}

.infoValue.multiline{
  white-space:pre-wrap;
}

.infoValue a{
  color:#111111;
  text-decoration:none;
  border-bottom:1px solid rgba(17,17,17,.18);
}

.identityActions{
  display:flex;
  align-items:center;
  gap:8px;
  justify-content:flex-end;
  flex-wrap:wrap;
  position:absolute;
  top:0;
  right:16px;
  max-width:360px;
  transform:none;
}

.menteeCount{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:25px;
  padding:0 11px;
  border-radius:999px;
  font-size:13px;
  line-height:1;
  white-space:nowrap;
  box-shadow:0 8px 18px rgba(0,0,0,.08);
}

.menteeCount.available{
  background:#d8f8e4;
  color:#047a31;
  animation:availablePulse 1.8s ease-in-out infinite;
}

.menteeCount.full{
  background:#fee8e8;
  color:#b42318;
}

.requestButton{
  display:inline-flex;
  align-items:center;
  height:30px;
  padding:0 12px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-family:"Google Sans";
  font-size:13px;
  line-height:1;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease;
}

.requestButton:hover{
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

.secondaryLink{
  display:inline-flex;
  align-items:center;
  min-height:34px;
  color:#111111;
  text-decoration:none;
  font-size:14px;
  border-bottom:1px solid rgba(17,17,17,.14);
}

.stateBox{
  position:relative;
  z-index:1;
  max-width:520px;
  margin:120px auto;
  padding:18px 20px;
  border-radius:16px;
  background:rgba(255,255,255,.82);
  border:1px solid rgba(0,0,0,.06);
  text-align:center;
}

.stateBox.error{
  color:#b91c1c;
  background:rgba(254,226,226,.86);
}

@keyframes pageDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@keyframes availablePulse{
  0%, 100%{ box-shadow:0 8px 18px rgba(4,122,49,.12); }
  50%{ box-shadow:0 8px 24px rgba(4,122,49,.28); }
}

@media (max-width:900px){
  .detailsGrid{
    grid-template-columns:1fr;
    gap:28px;
  }

  .identityActions{
    position:static;
    justify-content:center;
    max-width:none;
    margin-top:14px;
    transform:none;
  }
}

@media (max-width:640px){
  .profileMain{
    padding:10px 14px 36px;
  }

  .profileCard{
    border-radius:18px;
    padding:26px 14px 22px;
  }

  .identityBlock{
    width:100%;
    margin:0 auto;
  }

  .profileAvatar{
    width:68px;
    height:68px;
    margin-bottom:10px;
  }

  .infoRow{
    grid-template-columns:1fr;
    gap:5px;
  }

  .identityLine{
    align-items:flex-start;
    gap:12px;
  }

  .requestButton,
  .secondaryLink{
    font-size:13px;
  }
}
`;
