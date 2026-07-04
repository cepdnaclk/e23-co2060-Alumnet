import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getProfile } from "../api";
import LoadingScreen from "../components/LoadingScreen";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = useMemo(() => localStorage.getItem("token"), []);

  const isAdmin = useMemo(() => {
    try {
      if (!token) return false;
      const decoded = jwtDecode(token);
      return (
        decoded?.role === "system_admin" ||
        decoded?.role === "university_admin"
      );
    } catch {
      return false;
    }
  }, [token]);

  useEffect(() => {
    const run = async () => {
      try {
        const t = localStorage.getItem("token");
        if (!t) {
          navigate("/login");
          return;
        }

        try {
          const decoded = jwtDecode(t);
          if (
            decoded?.role === "system_admin" ||
            decoded?.role === "university_admin"
          ) {
            navigate("/admin", { replace: true });
            return;
          }
        } catch {
          // Continue to profile loading so the existing error handling can respond.
        }

        const data = await getProfile(t);
        setProfile(data);
      } catch (e) {
        setErr(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate]);

  const statusIcon =
    profile?.verification_status === "verified"
      ? verifiedIcon
      : profile?.verification_status === "rejected"
        ? rejectedIcon
        : pendingIcon;

  const isStudent = profile?.role === "student";
  const isAlumni = profile?.role === "alumni";

  if (loading) {
    return <LoadingScreen text="Loading profile..." />;
  }

  if (err || !profile) {
    return (
      <div className="profilePage">
        <style>{css}</style>
        <div className="stateBox error">{err || "No profile found."}</div>
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
                    <h1>{profile.full_name || "User"}</h1>
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
          </section>

          <section className="detailsGrid">
            <DetailPanel title="Personal Details">
              {isStudent && (
                <>
                  <InfoRow label="Role:" value="Student" />
                  <InfoRow label="Department:" value={profile.department} />
                  <InfoRow label="Batch:" value={profile.batch} />
                  <InfoRow label="Bio:" value={profile.bio} multiline />
                  <InfoRow label="Motivation:" value={profile.motivation} multiline />
                  <InfoRow label="Goal:" value={profile.goal} multiline />
                </>
              )}

              {isAlumni && (
                <>
                  <InfoRow label="Role:" value="Alumni" />
                  <InfoRow label="Department:" value={profile.department} />
                  <InfoRow label="Graduation Year:" value={profile.graduation_year} />
                  <InfoRow label="Bio:" value={profile.bio} multiline />
                  <InfoRow
                    label="Mentee Capacity:"
                    value={profile.preferred_mentee_capacity}
                  />
                </>
              )}
            </DetailPanel>

            <DetailPanel title="Professional Details">
              {isStudent && (
                <>
                  <InfoRow
                    label="Areas of Interest:"
                    value={profile.areas_of_interest}
                    multiline
                  />
                  <InfoRow label="LinkedIn:" value={profile.linkedin_url} isLink />
                  <InfoRow label="GitHub:" value={profile.github_url} isLink />
                  <InfoRow label="Portfolio:" value={profile.portfolio_url} isLink />
                  <InfoRow label="CV:" value={profile.cv_url} isLink />
                </>
              )}

              {isAlumni && (
                <>
                  <InfoRow label="Job Title:" value={profile.job_title} />
                  <InfoRow label="Company:" value={profile.organization} />
                  <InfoRow
                    label="Expertise/Interests:"
                    value={profile.primary_interests}
                    multiline
                  />
                  <InfoRow label="LinkedIn:" value={profile.linkedin_url} isLink />
                </>
              )}
            </DetailPanel>
          </section>

          {isAdmin && (
            <Link to="/admin" className="adminLink">
              User Verification
            </Link>
          )}
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
  padding:12px 22px 34px;
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

.adminLink{
  display:inline-flex;
  margin-top:26px;
  padding:10px 16px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  text-decoration:none;
  font-size:14px;
  box-shadow:0 8px 18px rgba(25, 62, 182, 0.18);
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

@media (max-width:900px){
  .detailsGrid{
    grid-template-columns:1fr;
    gap:28px;
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

  .detailsGrid{
    padding:0 4px;
  }

  .infoRow{
    grid-template-columns:1fr;
    gap:5px;
  }

  .identityLine{
    align-items:flex-start;
    gap:12px;
  }
}
`;
