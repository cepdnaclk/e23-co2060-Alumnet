import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getAlumniProfile, getMyMentors } from "../api";
import LoadingScreen from "../components/LoadingScreen";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";
import chemicalIcon from "../assets/chemical.png";
import civilIcon from "../assets/civil.png";
import computerIcon from "../assets/computer.png";
import electricalIcon from "../assets/elec.png";
import manufacturingIcon from "../assets/manu.png";
import mechanicalIcon from "../assets/mechanical.png";
import linkedinIcon from "../assets/linkedin.png";

export default function AlumniPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [mentorConnection, setMentorConnection] = useState(null);
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

        if (token && currentUser?.role === "student") {
          const mentors = await getMyMentors(token);
          setMentorConnection(
            mentors.find((mentor) => Number(mentor.id) === Number(id)) || null
          );
        } else {
          setMentorConnection(null);
        }
      } catch (e) {
        setErr(e.message || "Failed to load alumni profile");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, token, currentUser?.role]);

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
  const hasEndedMentorship = mentorConnection?.mentorship_status === "ended";
  const canRequest =
    token &&
    isStudent &&
    !isOwnProfile &&
    isVerified &&
    remainingSlots > 0 &&
    (!mentorConnection || hasEndedMentorship);
  const hasMentorConnection = Boolean(mentorConnection) && !hasEndedMentorship;
  const hasPendingEndRequest = mentorConnection?.mentorship_status === "ending_requested";

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
                  {acceptedCount} / {capacity} slots left
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
                  {hasEndedMentorship ? "Request Mentorship Again" : "Request Mentorship"}
                </button>
              )}

              {hasMentorConnection && !hasPendingEndRequest && (
                <div className="alreadyMentorPill">Already your mentor</div>
              )}

              {hasPendingEndRequest && (
                <div className="endPendingPill">End requested</div>
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
              <InfoRow
                label="Department:"
                value={<DepartmentValue department={profile.department} />}
              />
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
                value={<InterestTags value={profile.primary_interests} />}
              />
              <InfoRow
                label="LinkedIn:"
                value={profile.linkedin_url}
                isLink
                icon={linkedinIcon}
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

function InfoRow({ label, value, isLink = false, multiline = false, icon }) {
  return (
    <div className="infoRow">
      <div className="infoLabel">{label}</div>
      <div className={`infoValue ${multiline ? "multiline" : ""}`}>
        {value ? (
          isLink ? (
            <a href={value} target="_blank" rel="noreferrer" className={icon ? "iconLink" : ""}>
              {icon && <img src={icon} alt="" />}
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

function DepartmentValue({ department }) {
  const icon = getDepartmentIcon(department);

  return (
    <span className="departmentValue">
      {icon && <img src={icon} alt="" />}
      <span>{department || "-"}</span>
    </span>
  );
}

function InterestTags({ value = "" }) {
  const interests = getInterestTags(value);
  if (interests.length === 0) return "-";

  return (
    <span className="profileInterestTags">
      {interests.map((interest) => (
        <span key={interest}>{interest}</span>
      ))}
    </span>
  );
}

function getInterestTags(value = "") {
  return value
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function getDepartmentIcon(department = "") {
  const normalized = department.toLowerCase();

  if (normalized.includes("chemical")) return chemicalIcon;
  if (normalized.includes("civil")) return civilIcon;
  if (normalized.includes("computer")) return computerIcon;
  if (normalized.includes("electrical") || normalized.includes("electronic")) {
    return electricalIcon;
  }
  if (normalized.includes("manufacturing") || normalized.includes("industrial")) {
    return manufacturingIcon;
  }
  if (normalized.includes("mechanical")) return mechanicalIcon;

  return null;
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
  padding:0 18px 28px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.22);
  overflow:hidden;
}

.profileHero{
  position:relative;
  margin:0 -18px 30px;
  padding:34px 18px 28px;
  background:#fafbfc;
  border-bottom:1px solid rgba(0,0,0,.06);
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
  color:#244ee4;
  text-decoration:none;
  border-bottom:1px solid rgba(47,95,245,.24);
}

.infoValue a:hover{
  color:#1f45cc;
  border-bottom-color:rgba(47,95,245,.42);
}

.infoValue a.iconLink{
  display:inline-flex;
  align-items:center;
  gap:6px;
  max-width:100%;
}

.infoValue a.iconLink img{
  width:14px;
  height:14px;
  object-fit:contain;
  flex:0 0 auto;
}

.departmentValue{
  display:inline-flex;
  align-items:center;
  gap:6px;
  min-width:0;
}

.departmentValue img{
  width:14px;
  height:14px;
  object-fit:contain;
  flex:0 0 auto;
}

.profileInterestTags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}

.profileInterestTags span{
  max-width:170px;
  min-width:0;
  padding:4px 9px;
  border-radius:7px;
  border:1px solid rgba(0,0,0,.08);
  background:#eef1f4;
  color:rgba(17,17,17,.64);
  font-size:12px;
  line-height:1.1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.identityActions{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:8px;
  justify-content:center;
  flex-wrap:nowrap;
  position:absolute;
  top:50%;
  right:34px;
  max-width:360px;
  transform:translateY(-50%);
}

.menteeCount{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  min-height:25px;
  padding:0 11px;
  border-radius:999px;
  font-size:13px;
  line-height:1;
  white-space:nowrap;
  box-shadow:0 8px 18px rgba(0,0,0,.08);
}

.menteeCount::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  flex:0 0 auto;
}

.menteeCount.available{
  background:#d8f8e4;
  color:#047a31;
  animation:availablePulse 1.8s ease-in-out infinite;
}

.menteeCount.available::before{
  background:#22c55e;
}

.menteeCount.full{
  background:#fee8e8;
  color:#b42318;
}

.menteeCount.full::before{
  background:#d7263d;
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

.endPendingPill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  min-height:25px;
  padding:0 11px;
  border-radius:999px;
  background:rgba(245,158,11,.14);
  color:#92400e;
  font-size:13px;
  white-space:nowrap;
}

.alreadyMentorPill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:30px;
  padding:0 12px;
  border-radius:999px;
  background:#2f5ff5;
  color:#ffffff;
  font-size:13px;
  line-height:1;
  white-space:nowrap;
  box-shadow:0 10px 22px rgba(47,95,245,.18);
}

.endPendingPill::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  background:#f59e0b;
}

@media (max-width:640px){
  .profileMain{
    padding:10px 14px 36px;
  }

  .profileCard{
    border-radius:18px;
    padding:0 14px 22px;
  }

  .profileHero{
    margin:0 -14px 28px;
    padding:26px 14px 24px;
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
