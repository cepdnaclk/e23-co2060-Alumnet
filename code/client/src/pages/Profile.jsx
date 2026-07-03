import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getProfile } from "../api";

import bannerImage from "../assets/banner.png";
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
    return (
      <div className="profilePage">
        <style>{css}</style>
        <div className="stateBox">Loading profile...</div>
      </div>
    );
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
        <section className="profileHero">
          <img src={bannerImage} alt="" className="profileBanner" />

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
  min-height:100vh;
  background:#fbfbfa;
  color:#111111;
  font-family:"Google Sans";
  animation:pageDissolve .22s ease both;
}

.profileMain{
  max-width:1180px;
  margin:0 auto;
  padding:34px 28px 34px;
}

.profileHero{
  position:relative;
  margin-bottom:20px;
}

.profileBanner{
  width:100%;
  height:170px;
  object-fit:cover;
  border-radius:18px;
  display:block;
}

.identityBlock{
  position:relative;
  width:min(430px, 100%);
  margin:-52px 0 0 24px;
  text-align:left;
}

.profileAvatar{
  width:78px;
  height:78px;
  border-radius:50%;
  object-fit:cover;
  display:grid;
  place-items:center;
  margin:0 0 12px;
  border:3px solid #fbfbfa;
  background:#ecebe7;
  box-shadow:0 10px 24px rgba(0,0,0,.10);
}

.profileAvatar.fallback{
  color:#111111;
  font-size:30px;
}

.nameRow{
  display:flex;
  align-items:center;
  justify-content:flex-start;
  gap:4px;
}

.nameRow h1{
  margin:0;
  font-size:16px;
  line-height:1.15;
  font-weight:500;
  letter-spacing:0;
}

.verifiedBadge{
  width:17px;
  height:17px;
  object-fit:contain;
}

.emailText{
  display:inline-block;
  margin:5px 0 0;
  color:rgba(17,17,17,.42);
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

  .identityBlock{
    margin-left:20px;
  }
}

@media (max-width:640px){
  .profileMain{
    padding:18px 16px 36px;
  }

  .profileBanner{
    height:132px;
    border-radius:14px;
  }

  .identityBlock{
    width:100%;
    margin:-46px 0 0 16px;
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
}
`;
