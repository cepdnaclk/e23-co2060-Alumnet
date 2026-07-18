import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentProfile } from "../api";
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
import githubIcon from "../assets/github.png";

export default function StudentPublicProfile() {
  const { id } = useParams();
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getStudentProfile(token, id);
        setProfile(data);
      } catch (e) {
        setErr(e.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, token]);

  const statusIcon =
    profile?.verification_status === "verified"
      ? verifiedIcon
      : profile?.verification_status === "rejected"
        ? rejectedIcon
        : pendingIcon;

  if (loading) {
    return <LoadingScreen text="Loading student profile..." />;
  }

  if (err || !profile) {
    return (
      <div className="profilePage">
        <style>{css}</style>
        <div className="stateBox error">{err || "No student profile found."}</div>
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
                  {profile.full_name?.slice(0, 1)?.toUpperCase() || "S"}
                </div>
              )}

              <div className="identityLine">
                <div className="identityCopy">
                  <div className="nameRow">
                    <h1>{profile.full_name || "Student"}</h1>
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

            {profile.mentorship_status && (
              <div className="identityActions">
                <div className={`statusPill ${normalizeStatus(profile.mentorship_status)}`}>
                  {getMentorshipStatusLabel(profile.mentorship_status)}
                </div>
              </div>
            )}
          </section>

          <section className="detailsGrid">
            <DetailPanel title="Personal Details">
              <InfoRow label="Role:" value="Student" />
              <InfoRow
                label="Department:"
                value={<DepartmentValue department={profile.department} />}
              />
              <InfoRow label="Batch:" value={profile.batch} />
              <InfoRow label="Bio:" value={profile.bio} multiline />
              <InfoRow label="Motivation:" value={profile.motivation} multiline />
              <InfoRow label="Goal:" value={profile.goal} multiline />
            </DetailPanel>

            <DetailPanel title="Professional Details">
              <InfoRow
                label="Areas of Interest:"
                value={<InterestTags value={profile.areas_of_interest} />}
              />
              <InfoRow
                label="LinkedIn:"
                value={profile.linkedin_url}
                isLink
                icon={linkedinIcon}
              />
              <InfoRow
                label="GitHub:"
                value={profile.github_url}
                isLink
                icon={githubIcon}
              />
              <InfoRow label="Portfolio:" value={profile.portfolio_url} isLink />
              <InfoRow label="CV:" value={profile.cv_url} isLink />
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

function normalizeStatus(status = "") {
  if (status === "accepted") return "accepted";
  if (status === "rejected") return "rejected";
  if (status === "ended") return "ended";
  if (status === "ending_requested") return "pending";
  return "pending";
}

function getMentorshipStatusLabel(status = "") {
  if (status === "ending_requested") return "End requested";
  if (status === "accepted") return "Active mentee";
  if (status === "pending") return "Mentorship request pending";
  if (status === "rejected") return "Request rejected";
  if (status === "ended") return "Mentorship ended";
  return status;
}

function getInterestTags(value = "") {
  const input = value || "";

  return input
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

.statusPill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:28px;
  padding:0 12px;
  border-radius:999px;
  font-size:13px;
  line-height:1;
  white-space:nowrap;
}

.statusPill.pending{
  background:#F4D35E;
  color:#000000;
}

.statusPill.accepted{
  background:#2f5ff5;
  color:#ffffff;
  box-shadow:0 10px 22px rgba(47,95,245,.18);
}

.statusPill.rejected{
  background:#fee8e8;
  color:#b42318;
}

.statusPill.ended{
  background:#eef1f4;
  color:rgba(17,17,17,.64);
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

  .identityActions{
    position:static;
    justify-content:center;
    max-width:none;
    margin-top:14px;
    transform:none;
  }
}

@media (max-width:640px){
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
}
`;
