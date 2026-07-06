import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { getDirectory } from "../api";
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
import classIcon from "../assets/class.png";

export default function Directory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [appliedDepartment, setAppliedDepartment] = useState("");

  const loadDirectory = async (searchValue = search, departmentValue = appliedDepartment) => {
    setLoading(true);

    try {
      const data = await getDirectory(searchValue, departmentValue);
      setAlumni(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadDirectory(search, appliedDepartment);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search, appliedDepartment]);

  const getStatusIcon = (status) => {
    if (status === "verified") return verifiedIcon;
    if (status === "rejected") return rejectedIcon;
    return pendingIcon;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedDepartment(department);
    loadDirectory(search, department);
  };

  return (
    <main className="directoryPage">
      <style>{css}</style>

      <section className="directoryShell">
        <form className="directoryFilters" onSubmit={handleSearchSubmit}>
          <label className="directorySearch">
            <Search size={15} strokeWidth={2} />
            <input
              placeholder="Search alumni"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="departmentSelectWrap">
            <SlidersHorizontal size={15} strokeWidth={2} />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              <option>Chemical & Process Engineering</option>
              <option>Civil Engineering</option>
              <option>Computer Engineering</option>
              <option>Electrical and Electronic Engineering</option>
              <option>Mechanical Engineering</option>
              <option>Manufacturing and Industrial Engineering</option>
            </select>
          </label>

          <button className="searchButton" type="submit">
            Search
          </button>
        </form>

        {loading && !hasLoaded ? (
          <LoadingScreen text="Loading alumni..." />
        ) : alumni.length === 0 ? (
          <div className="directoryState">No alumni found.</div>
        ) : (
          <div className={`alumniList ${loading ? "refreshing" : ""}`}>
            {alumni.map((a) => {
              const capacity = Number(a.preferred_mentee_capacity || 0);
              const accepted = Number(a.accepted_mentees_count || 0);
              const remaining = Math.max(capacity - accepted, 0);
              const interests = getInterestTags(a.primary_interests);
              const departmentIcon = getDepartmentIcon(a.department);

              return (
                <article key={a.id} className="alumniItem">
                  <div className="avatarColumn">
                    {a.avatar_url ? (
                      <img src={a.avatar_url} alt={a.full_name} className="avatar" />
                    ) : (
                      <div className="avatar fallback">
                        {a.full_name?.slice(0, 1)?.toUpperCase() || "A"}
                      </div>
                    )}
                  </div>

                  <div className="alumniBody">
                    <div className="alumniTopLine">
                      <div className="identity">
                        <span className="nameRow">
                          <h2>{a.full_name}</h2>
                          <img
                            src={getStatusIcon(a.verification_status)}
                            alt={a.verification_status}
                            className="statusIcon"
                          />
                        </span>
                        <p>{formatRole(a.job_title, a.organization)}</p>
                      </div>

                    </div>

                    <div className="metaLine">
                      <span className="departmentMeta">
                        {departmentIcon && <img src={departmentIcon} alt="" />}
                        {a.department || "Department not set"}
                      </span>
                      <span className="classMeta">
                        <img src={classIcon} alt="" />
                        {a.graduation_year ? `Class of ${a.graduation_year}` : "Graduation year not set"}
                      </span>
                    </div>

                    <p className="bioText">{a.bio || "No bio has been added yet."}</p>

                    {interests.length > 0 && (
                      <div className="interestTags">
                        {interests.map((interest) => (
                          <span key={interest}>{interest}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="actionColumn">
                    <span className={`availability ${remaining > 0 ? "open" : "full"}`}>
                      {remaining > 0 ? `${remaining} available` : "Mentor full"}
                    </span>
                    <Link
                      to={`/directory/${a.id}`}
                      state={{ alumniName: a.full_name }}
                      className="viewLink"
                    >
                      View Profile
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function getInterestTags(value = "") {
  const input = value || "";

  return input
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function formatRole(title, organization) {
  if (title && organization) return `${title} at ${organization}`;
  return title || organization || "Alumni mentor";
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
.directoryPage{
  position:relative;
  min-height:100vh;
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  padding:24px 22px 34px;
  animation:directoryDissolve .22s ease both;
  overflow-x:hidden;
}

.directoryShell{
  width:min(1340px, 100%);
  margin:0 auto;
  border-radius:22px;
  padding:28px 34px 30px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.22);
}

.directoryFilters{
  display:grid;
  grid-template-columns:minmax(260px, 1fr) minmax(260px, 360px) auto;
  gap:12px;
  align-items:center;
  margin-bottom:22px;
}

.directorySearch,
.departmentSelectWrap{
  height:36px;
  min-width:0;
  padding:0 12px;
  display:flex;
  align-items:center;
  gap:8px;
  border-radius:999px;
  background:#f3f5f8;
  border:1px solid rgba(0,0,0,.05);
  color:rgba(17,17,17,.48);
}

.directorySearch input,
.departmentSelectWrap select{
  width:100%;
  min-width:0;
  border:0;
  outline:0;
  background:transparent;
  color:#111111;
  font:inherit;
  font-size:14px;
}

.departmentSelectWrap select{
  cursor:pointer;
}

.directorySearch input::placeholder{
  color:rgba(17,17,17,.44);
}

.searchButton{
  height:36px;
  padding:0 16px;
  border-radius:999px;
  background:#2f5ff5;
  color:#ffffff;
  font-size:13px;
  font-weight:500;
  box-shadow:0 10px 24px rgba(47,95,245,.22), 0 2px 7px rgba(0,0,0,.08);
  transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease, background .18s ease;
}

.searchButton:hover{
  transform:translateY(-1px);
  background:#244ee4;
  box-shadow:0 14px 30px rgba(47,95,245,.30), 0 3px 9px rgba(0,0,0,.10);
}

.directoryState{
  padding:28px 4px;
  border-top:1px solid rgba(0,0,0,.08);
  color:rgba(17,17,17,.52);
  font-size:14px;
  text-align:center;
}

.alumniList{
  border-top:1px solid rgba(0,0,0,.08);
  transition:opacity .18s ease;
  overflow:hidden;
  margin:0 -34px -30px;
}

.alumniList.refreshing{
  opacity:.62;
}

.alumniItem{
  display:grid;
  grid-template-columns:72px minmax(0, 1fr) 136px;
  gap:16px;
  padding:20px 48px;
  border-bottom:1px solid rgba(0,0,0,.08);
}

.alumniItem:nth-child(even){
  background:#fafbfc;
}

.alumniItem:nth-child(odd){
  background:#ffffff;
}

.avatarColumn{
  padding-top:2px;
}

.avatar{
  width:62px;
  height:62px;
  border-radius:50%;
  object-fit:cover;
  display:grid;
  place-items:center;
  background:#ecebe7;
  color:#111111;
  font-size:18px;
  font-weight:500;
}

.alumniBody{
  min-width:0;
}

.alumniTopLine{
  display:flex;
  justify-content:space-between;
  gap:14px;
  min-width:0;
}

.identity{
  min-width:0;
}

.nameRow{
  display:flex;
  align-items:center;
  gap:5px;
  min-width:0;
}

.nameRow h2{
  min-width:0;
  margin:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#111111;
  font-size:16px;
  line-height:1.2;
  font-weight:500;
  letter-spacing:0;
}

.statusIcon{
  width:16px;
  height:16px;
  object-fit:contain;
  flex:0 0 auto;
}

.identity p{
  margin:4px 0 0;
  color:rgba(17,17,17,.52);
  font-size:13px;
  line-height:1.35;
}

.metaLine{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:8px 16px;
  margin-top:7px;
  color:#2b59c3;
  font-size:12px;
  line-height:1.4;
}

.departmentMeta,
.classMeta{
  display:inline-flex;
  align-items:center;
  gap:5px;
  min-width:0;
}

.departmentMeta img,
.classMeta img{
  width:14px;
  height:14px;
  object-fit:contain;
  display:block;
  flex:0 0 auto;
}

.bioText{
  max-width:680px;
  margin:10px 0 0;
  color:#111111;
  font-size:13px;
  line-height:1.5;
}

.interestTags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin-top:10px;
}

.interestTags span{
  max-width:150px;
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

.actionColumn{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:10px;
}

.availability{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  min-height:22px;
  padding:0 9px;
  border-radius:999px;
  font-size:12px;
  white-space:nowrap;
}

.availability::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  flex:0 0 auto;
}

.availability.open{
  background:rgba(34,197,94,.16);
  color:#15803d;
  animation:availabilityPulse 1.8s ease-in-out infinite;
}

.availability.open::before{
  background:#22c55e;
}

.availability.full{
  background:rgba(215,38,61,.10);
  color:#b91c1c;
  animation:availabilityFullPulse 1.8s ease-in-out infinite;
}

.availability.full::before{
  background:#d7263d;
}

.viewLink{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  padding:0 12px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-size:13px;
  line-height:1;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
  transition:transform .18s ease, opacity .18s ease, box-shadow .18s ease;
}

.viewLink:hover{
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

@keyframes directoryDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@keyframes availabilityPulse{
  0%, 100%{ box-shadow:0 6px 16px rgba(21,128,61,.10); }
  50%{ box-shadow:0 7px 22px rgba(21,128,61,.28); }
}

@keyframes availabilityFullPulse{
  0%, 100%{ box-shadow:0 6px 16px rgba(185,28,28,.10); }
  50%{ box-shadow:0 7px 22px rgba(185,28,28,.26); }
}

@media (max-width:820px){
  .directoryFilters{
    grid-template-columns:1fr;
  }

  .searchButton{
    width:100%;
  }

  .alumniItem{
    grid-template-columns:60px minmax(0, 1fr);
  }

  .actionColumn{
    grid-column:2;
    flex-direction:row;
    align-items:center;
    justify-content:space-between;
  }

}

@media (max-width:560px){
  .directoryPage{
    padding:10px 14px 36px;
  }

  .directoryShell{
    border-radius:18px;
    padding:20px 14px 24px;
  }

  .alumniList{
    margin:0 -14px -24px;
  }

  .alumniItem{
    grid-template-columns:54px minmax(0, 1fr);
    gap:11px;
    padding:16px 24px;
  }

  .avatar{
    width:50px;
    height:50px;
    font-size:16px;
  }

  .alumniTopLine{
    display:block;
  }

  .actionColumn{
    gap:8px;
  }

  .viewLink{
    padding:0 10px;
  }
}
`;
