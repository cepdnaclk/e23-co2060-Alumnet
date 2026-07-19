import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import {
  getDirectory,
  getMyMentors,
  getRecommendedAlumni,
  getStudentRequests,
} from "../api";
import LoadingScreen from "../components/LoadingScreen";

import verifiedIcon from "../assets/verified.png";

const departments = [
  "Chemical & Process Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Electrical and Electronic Engineering",
  "Mechanical Engineering",
  "Manufacturing and Industrial Engineering",
];

export default function Directory() {
  const [alumni, setAlumni] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [availability, setAvailability] = useState("all");
  const [graduationFrom, setGraduationFrom] = useState("");
  const [graduationTo, setGraduationTo] = useState("");
  const [view, setView] = useState("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pendingRequestIds, setPendingRequestIds] = useState(new Set());
  const [mentorIds, setMentorIds] = useState(new Set());

  const token = useMemo(() => localStorage.getItem("token"), []);
  const currentUser = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  const isStudent = currentUser?.role === "student";
  const showSuggestions = view === "recommended" && isStudent;
  const [sortBy, setSortBy] = useState(isStudent ? "recommended" : "name");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [directoryData, recommendedData, mentors, requests] = await Promise.all([
          getDirectory(),
          isStudent ? getRecommendedAlumni(token).catch(() => []) : Promise.resolve([]),
          isStudent ? getMyMentors(token).catch(() => []) : Promise.resolve([]),
          isStudent ? getStudentRequests(token).catch(() => []) : Promise.resolve([]),
        ]);

        setAlumni(directoryData);
        setRecommendations(recommendedData);
        setMentorIds(new Set(mentors.map((mentor) => Number(mentor.id))));
        setPendingRequestIds(
          new Set(
            requests
              .filter((request) => request.status === "pending")
              .map((request) => Number(request.alumni_user_id))
          )
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isStudent, token]);

  const recommendationMap = useMemo(
    () => new Map(recommendations.map((item) => [Number(item.id), item])),
    [recommendations]
  );

  const visibleAlumni = useMemo(() => {
    const source = view === "recommended" && isStudent ? recommendations : alumni;
    const query = search.trim().toLowerCase();

    const filtered = source.filter((item) => {
      const capacity = Number(item.preferred_mentee_capacity || 0);
      const accepted = Number(item.accepted_mentees_count || 0);
      const hasSpace = capacity > accepted;
      const year = Number(item.graduation_year || 0);
      const haystack = [
        item.full_name,
        item.job_title,
        item.organization,
        item.primary_interests,
        item.department,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (query && !haystack.includes(query)) return false;
      if (department && item.department !== department) return false;
      if (availability === "available" && !hasSpace) return false;
      if (graduationFrom && (!year || year < Number(graduationFrom))) return false;
      if (graduationTo && (!year || year > Number(graduationTo))) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.full_name.localeCompare(b.full_name);
      if (sortBy === "graduation") {
        return Number(b.graduation_year || 0) - Number(a.graduation_year || 0);
      }

      const aScore = Number(a.recommendation_score || recommendationMap.get(Number(a.id))?.recommendation_score || 0);
      const bScore = Number(b.recommendation_score || recommendationMap.get(Number(b.id))?.recommendation_score || 0);
      if (bScore !== aScore) return bScore - aScore;
      return a.full_name.localeCompare(b.full_name);
    });
  }, [
    alumni,
    recommendations,
    view,
    isStudent,
    search,
    department,
    availability,
    graduationFrom,
    graduationTo,
    sortBy,
    recommendationMap,
  ]);

  const resetFilters = () => {
    setSearch("");
    setDepartment("");
    setAvailability("all");
    setGraduationFrom("");
    setGraduationTo("");
  };

  if (loading) {
    return <LoadingScreen text={isStudent ? "Finding alumni for you..." : "Loading alumni directory..."} />;
  }

  return (
    <main className="directoryPage">
      <style>{css}</style>

      <section className="directoryShell">
      <section className="directoryLayout">
        <aside className={`filterPanel ${mobileFiltersOpen ? "open" : ""}`}>
          <div className="filterPanelHeading">
            <div>
              <span>Filters</span>
              <small>Refine your results</small>
            </div>
            <button type="button" className="closeFilters" onClick={() => setMobileFiltersOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <FilterBlock title="Department">
            <div className="selectControl">
              <GraduationCap size={16} />
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="">All departments</option>
                {departments.map((item) => <option key={item}>{item}</option>)}
              </select>
              <ChevronDown size={15} />
            </div>
          </FilterBlock>

          {isStudent && (
            <FilterBlock title="Mentor availability">
              <label className="checkRow">
                <input
                  type="checkbox"
                  checked={availability === "available"}
                  onChange={(e) => setAvailability(e.target.checked ? "available" : "all")}
                />
                <span className="customCheck"><Check size={12} /></span>
                Available for requests
              </label>
            </FilterBlock>
          )}

          <FilterBlock title="Graduation year">
            <div className="yearGrid">
              <input
                type="number"
                placeholder="From"
                value={graduationFrom}
                onChange={(e) => setGraduationFrom(e.target.value)}
              />
              <input
                type="number"
                placeholder="To"
                value={graduationTo}
                onChange={(e) => setGraduationTo(e.target.value)}
              />
            </div>
          </FilterBlock>

          <button className="clearButton" type="button" onClick={resetFilters}>
            Clear all filters
          </button>
        </aside>

        <div className="resultsPanel">
          <div className="resultsPanelControls">
            <div className="searchToolbar">
              <label className="searchControl">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, job, company, skill, or interest"
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                    <X size={16} />
                  </button>
                )}
              </label>

              <button
                className="mobileFilterButton"
                type="button"
                onClick={() => setMobileFiltersOpen((open) => !open)}
              >
                <SlidersHorizontal size={17} /> Filters
              </button>
            </div>

            <div className="tabRow">
              {isStudent ? (
                <div className="tabs">
                  <button className={view === "all" ? "active" : ""} onClick={() => setView("all")}>
                    All alumni
                  </button>
                  <button className={view === "recommended" ? "active" : ""} onClick={() => setView("recommended")}>
                    <Sparkles size={15} /> Suggestions for you
                  </button>
                </div>
              ) : (
                <div className="resultsLabel">Browse alumni</div>
              )}

              <label className="sortControl">
                <span>Sort by</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {isStudent && <option value="recommended">Best match</option>}
                  <option value="name">Name</option>
                  <option value="graduation">Graduation year</option>
                </select>
                <ChevronDown size={14} />
              </label>
            </div>

            <div className="resultsHeading">
              <span>{visibleAlumni.length} result{visibleAlumni.length === 1 ? "" : "s"}</span>
              {showSuggestions && (
                <small>Matched using your department, interests, and career goal</small>
              )}
            </div>
          </div>

          <div className="resultsScroll">
            {visibleAlumni.length === 0 ? (
              <div className="emptyState">
                <Search size={28} />
                <h2>No alumni found</h2>
                <p>Try removing a filter or using a broader search term.</p>
                <button type="button" onClick={resetFilters}>Reset filters</button>
              </div>
            ) : (
              <div className="alumniResults">
                {visibleAlumni.map((alumnus) => (
                  <AlumniResult
                    key={alumnus.id}
                    alumnus={alumnus}
                    recommendation={recommendationMap.get(Number(alumnus.id))}
                    isMentor={mentorIds.has(Number(alumnus.id))}
                    isPending={pendingRequestIds.has(Number(alumnus.id))}
                    showMatchInfo={showSuggestions}
                    showMentorStatus={isStudent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </section>
      </section>
    </main>
  );
}

function FilterBlock({ title, children }) {
  return (
    <div className="filterBlock">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function AlumniResult({ alumnus, recommendation, isMentor, isPending, showMatchInfo, showMentorStatus }) {
  const capacity = Number(alumnus.preferred_mentee_capacity || 0);
  const accepted = Number(alumnus.accepted_mentees_count || 0);
  const remaining = Math.max(capacity - accepted, 0);
  const match = alumnus.recommendation_score ? alumnus : recommendation;
  const tags = getInterestTags(alumnus.primary_interests);

  let statusText = remaining > 0 ? `${remaining} mentor slot${remaining === 1 ? "" : "s"} left` : "Mentor capacity full";
  let statusClass = remaining > 0 ? "available" : "full";
  if (isPending) {
    statusText = "Request pending";
    statusClass = "pending";
  }
  if (isMentor) {
    statusText = "Already your mentor";
    statusClass = "mentor";
  }

  return (
    <article className="alumniResultCard">
      <Avatar alumnus={alumnus} />

      <div className="resultMain">
        <div className="resultTitleLine">
          <div>
            <div className="nameLine">
              <h2>{alumnus.full_name}</h2>
              {alumnus.verification_status === "verified" && (
                <img src={verifiedIcon} alt="Verified" />
              )}
              {showMatchInfo && match?.recommendation_score > 0 && (
                <span className="matchBadge"><Sparkles size={12} /> {match.recommendation_score}% match</span>
              )}
            </div>
            <p className="roleLine">
              <BriefcaseBusiness size={14} />
              {formatRole(alumnus.job_title)}
            </p>
          </div>
        </div>

        <div className="detailRow">
          <span><GraduationCap size={14} /> {alumnus.department || "Department not set"}</span>
          {alumnus.graduation_year && <span><Users size={14} /> Class of {alumnus.graduation_year}</span>}
          {alumnus.organization && <span><Building2 size={14} /> {alumnus.organization}</span>}
        </div>

        <p className="resultBio">{alumnus.bio || "This alumni member has not added a bio yet."}</p>

        <div className="chipRow">
          {showMatchInfo && match?.recommendation_reasons?.map((reason) => (
            <span
              className={`reasonChip ${getReasonChipClass(reason)}`}
              key={reason}
            >
              {reason}
            </span>
          ))}
          {tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>

      <div className="resultActions">
        {showMentorStatus && (
          <span className={`availabilityBadge ${statusClass}`}>{statusText}</span>
        )}
        <Link to={`/directory/${alumnus.id}`} state={{ alumniName: alumnus.full_name }}>
          View profile
        </Link>
      </div>
    </article>
  );
}

function Avatar({ alumnus, small = false }) {
  if (alumnus.avatar_url) {
    return <img className={`resultAvatar ${small ? "small" : ""}`} src={alumnus.avatar_url} alt={alumnus.full_name} />;
  }

  return (
    <div className={`resultAvatar fallback ${small ? "small" : ""}`}>
      {alumnus.full_name?.slice(0, 1)?.toUpperCase() || "A"}
    </div>
  );
}

function getInterestTags(value = "") {
  return String(value || "")
    .split(/[,|;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function getReasonChipClass(reason = "") {
  const normalized = String(reason).trim().toLowerCase();

  if (
    normalized.includes("shared interest") ||
    normalized.includes("career goal") ||
    normalized.includes("same department") ||
    normalized.includes("department match")
  ) {
    return "matchReason";
  }

  if (
    normalized.includes("available for mentoring") ||
    normalized.includes("mentor availability")
  ) {
    return "availabilityReason";
  }

  return "";
}

function formatRole(title) {
  return title || "Alumni mentor";
}


const css = `
.directoryPage{
  --directory-chrome:98px;
  position:relative;
  height:calc(100dvh - var(--directory-chrome));
  max-height:calc(100dvh - var(--directory-chrome));
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  padding:16px 22px 20px;
  animation:directoryDissolve .22s ease both;
  overflow:hidden;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
}

.directoryShell{
  width:min(1340px, 100%);
  height:100%;
  margin:0 auto;
  border-radius:22px;
  padding:0 28px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.22);
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
  min-height:0;
  overflow:hidden;
}

.directoryHeader{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:20px;
  padding-bottom:22px;
  border-bottom:1px solid rgba(0,0,0,.08);
}

.directoryHeader h1{
  margin:8px 0 7px;
  font-size:22px;
  line-height:1.2;
  letter-spacing:0;
  font-weight:600;
  color:#111111;
}

.directoryHeader p{
  margin:0;
  color:rgba(17,17,17,.52);
  font-size:14px;
  line-height:1.45;
}

.eyebrow{
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:rgba(17,17,17,.52);
  font-size:13px;
  font-weight:500;
}

.directoryLayout{
  display:grid;
  grid-template-columns:220px minmax(0,1fr);
  align-items:stretch;
  min-width:0;
  min-height:0;
  flex:1;
  overflow:hidden;
}


.filterPanel{
  min-width:0;
  min-height:0;
  padding:22px 20px 24px 0;
  border-right:1px solid rgba(0,0,0,.08);
  background:#ffffff;
  overflow-y:auto;
  scrollbar-width:thin;
}

.filterPanelHeading{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  padding-bottom:16px;
  border-bottom:1px solid rgba(0,0,0,.08);
}

.filterPanelHeading span{
  display:block;
  font-size:14px;
  font-weight:500;
}

.filterPanelHeading small{
  display:block;
  margin-top:4px;
  color:rgba(17,17,17,.52);
  font-size:12px;
}

.closeFilters{
  display:none;
}

.filterBlock{
  padding:18px 0;
  border-bottom:1px solid rgba(0,0,0,.07);
}

.filterBlock h3{
  margin:0 0 10px;
  font-size:12px;
  font-weight:600;
  color:rgba(17,17,17,.58);
  text-transform:uppercase;
}

.selectControl{
  height:36px;
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  gap:7px;
  padding:0 10px;
  border-radius:8px;
  border:1px solid rgba(0,0,0,.07);
  background:#f3f5f8;
  color:rgba(17,17,17,.48);
}

.selectControl select,
.sortControl select{
  width:100%;
  min-width:0;
  border:0;
  outline:0;
  appearance:none;
  background:transparent;
  color:#111111;
  font:inherit;
  font-size:13px;
}

.checkRow{
  display:flex;
  align-items:center;
  gap:8px;
  color:rgba(17,17,17,.66);
  font-size:13px;
  cursor:pointer;
}

.checkRow input{
  position:absolute;
  opacity:0;
  pointer-events:none;
}

.customCheck{
  width:16px;
  height:16px;
  display:grid;
  place-items:center;
  flex:0 0 auto;
  border-radius:4px;
  border:1px solid rgba(0,0,0,.16);
  background:#ffffff;
  color:transparent;
}

.checkRow input:checked + .customCheck{
  border-color:#2f5ff5;
  background:#2f5ff5;
  color:#ffffff;
}

.yearGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
}

.yearGrid input{
  width:100%;
  height:36px;
  min-width:0;
  padding:0 10px;
  border-radius:8px;
  border:1px solid rgba(0,0,0,.07);
  outline:0;
  background:#f3f5f8;
  color:#111111;
  font:inherit;
  font-size:13px;
}

.clearButton{
  margin-top:16px;
  color:#244ee4;
  font-size:13px;
  font-weight:500;
}

.resultsPanel{
  min-width:0;
  min-height:0;
  padding:22px 24px 0;
  background:#ffffff;
  display:flex;
  flex-direction:column;
  overflow:hidden;
}

.resultsPanelControls{
  flex:0 0 auto;
}

.resultsScroll{
  min-height:0;
  flex:1;
  overflow-y:auto;
  overflow-x:hidden;
  overscroll-behavior:contain;
  scrollbar-gutter:stable;
  margin-right:-18px;
  padding-right:18px;
  -webkit-overflow-scrolling:touch;
}

.resultsScroll::-webkit-scrollbar,
.filterPanel::-webkit-scrollbar{
  width:7px;
}

.resultsScroll::-webkit-scrollbar-thumb,
.filterPanel::-webkit-scrollbar-thumb{
  background:rgba(17,17,17,.18);
  border-radius:999px;
}

.resultsScroll::-webkit-scrollbar-track,
.filterPanel::-webkit-scrollbar-track{
  background:transparent;
}


.searchToolbar{
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:16px;
}

.searchControl{
  height:36px;
  width:100%;
  padding:0 12px;
  display:flex;
  align-items:center;
  gap:8px;
  border-radius:999px;
  border:1px solid rgba(0,0,0,.05);
  background:#f3f5f8;
  color:rgba(17,17,17,.46);
}

.searchControl input{
  width:100%;
  min-width:0;
  border:0;
  outline:0;
  background:transparent;
  color:#111111;
  font:inherit;
  font-size:14px;
}

.searchControl input::placeholder{
  color:rgba(17,17,17,.42);
}

.searchControl button{
  display:grid;
  place-items:center;
  color:rgba(17,17,17,.48);
}

.tabRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  padding-bottom:14px;
  border-bottom:1px solid rgba(0,0,0,.08);
}

.tabs{
  display:flex;
  align-items:center;
  gap:6px;
}

.resultsLabel{
  color:rgba(17,17,17,.58);
  font-size:13px;
  font-weight:500;
}

.tabs button{
  min-height:30px;
  padding:0 12px;
  display:inline-flex;
  align-items:center;
  gap:6px;
  border-radius:999px;
  background:#ffffff;
  color:#111111;
  font-family:"Google Sans";
  font-size:13px;
  line-height:1;
  box-shadow:0 10px 24px rgba(0,0,0,.14),0 2px 7px rgba(0,0,0,.06);
  transition:transform .18s ease,box-shadow .18s ease,background .18s ease,color .18s ease;
}

.tabs button:hover{
  transform:translateY(-1px);
}

.tabs button.active{
  background:#2f5ff5;
  color:#ffffff;
  box-shadow:0 10px 24px rgba(47,95,245,.22),0 2px 7px rgba(0,0,0,.08);
}

.sortControl{
  height:32px;
  min-width:145px;
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  gap:7px;
  padding:0 10px;
  border-radius:8px;
  border:1px solid rgba(0,0,0,.07);
  background:#f3f5f8;
  color:rgba(17,17,17,.48);
  font-size:12px;
}

.resultsHeading{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:15px 0 8px;
}

.resultsHeading span{
  color:rgba(17,17,17,.58);
  font-size:12px;
  font-weight:600;
  text-transform:uppercase;
}

.resultsHeading small{
  color:rgba(17,17,17,.52);
  font-size:13px;
}


.alumniResults{
  display:flex;
  flex-direction:column;
  gap:12px;
  padding:4px 2px 24px;
}


.alumniResultCard{
  min-width:0;
  display:grid;
  grid-template-columns:54px minmax(0,1fr) auto;
  gap:14px;
  padding:18px;
  border:1px solid rgba(0,0,0,.07);
  border-radius:14px;
  background:#ffffff;
  box-shadow:0 7px 20px rgba(0,0,0,.045);
  align-items:start;
  transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}

.alumniResultCard:hover{
  transform:translateY(-1px);
  border-color:rgba(47,95,245,.18);
  box-shadow:0 12px 28px rgba(0,0,0,.07);
}


.alumniResultCard:nth-child(odd),
.alumniResultCard:nth-child(even){
  background:#ffffff;
}

.resultAvatar{
  width:50px;
  height:50px;
  border-radius:50%;
  object-fit:cover;
  background:#eef1f4;
}

.resultAvatar.fallback{
  display:grid;
  place-items:center;
  font-size:17px;
  font-weight:500;
}

.resultAvatar.small{
  width:36px;
  height:36px;
  font-size:13px;
}

.nameLine{
  min-width:0;
  display:flex;
  align-items:center;
  gap:6px;
  flex-wrap:wrap;
}

.nameLine h2{
  min-width:0;
  margin:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:16px;
  line-height:1.2;
  font-weight:500;
  color:#111111;
}

.nameLine>img{
  width:14px;
  height:14px;
  object-fit:contain;
}

.matchBadge{
  display:inline-flex;
  align-items:center;
  gap:4px;
  padding:4px 8px;
  border-radius:999px;
  background:rgba(47,95,245,.10);
  border:1px solid rgba(47,95,245,.14);
  color:#244ee4;
  font-size:12px;
  font-weight:500;
}

.roleLine{
  display:flex;
  align-items:center;
  gap:6px;
  margin-top:4px;
  color:rgba(17,17,17,.52);
  font-size:13px;
  line-height:1.35;
}

.detailRow{
  display:flex;
  flex-wrap:wrap;
  gap:7px 12px;
  margin-top:10px;
  color:#2b59c3;
  font-size:12px;
  line-height:1.4;
}

.detailRow span{
  display:flex;
  align-items:center;
  gap:5px;
}

.resultBio{
  margin-top:12px;
  color:#111111;
  font-size:13px;
  line-height:1.5;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.chipRow{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin-top:10px;
}

.chipRow span{
  padding:4px 9px;
  border-radius:7px;
  border:1px solid rgba(0,0,0,.08);
  background:#eef1f4;
  color:rgba(17,17,17,.64);
  font-size:12px;
  line-height:1.1;
}

.chipRow .reasonChip{
  background:rgba(47,95,245,.10);
  border-color:rgba(47,95,245,.14);
  color:#244ee4;
}

.chipRow .reasonChip.matchReason{
  background:#eaf8ef;
  border-color:rgba(37,114,64,.17);
  color:#257240;
}

.chipRow .reasonChip.availabilityReason{
  background:#e9efff;
  border-color:rgba(47,95,245,.15);
  color:#244ee4;
}


.resultActions{
  grid-column:3;
  grid-row:1;
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  justify-content:flex-start;
  gap:10px;
  margin-top:0;
}

.resultActions:not(:has(.availabilityBadge)){
  justify-content:flex-end;
}

.resultActions>a{
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
  white-space:nowrap;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
  transition:transform .18s ease,box-shadow .18s ease,background .18s ease,color .18s ease;
}

.resultActions>a:hover{
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

.availabilityBadge{
  max-width:185px;
  min-height:25px;
  padding:5px 10px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  gap:7px;
  font-size:12px;
  line-height:1.1;
  font-weight:500;
  white-space:nowrap;
  animation:statusSoftPulse 1.8s ease-in-out infinite;
}

.availabilityBadge::before{
  content:"";
  width:7px;
  height:7px;
  flex:0 0 7px;
  border-radius:50%;
  background:currentColor;
  animation:statusDotPulse 1.8s ease-out infinite;
}

.availabilityBadge.available{
  background:#eaf8ef;
  color:#257240;
}

.availabilityBadge.full{
  background:#f0f1f3;
  color:#666666;
}

.availabilityBadge.pending{
  background:#fff4d9;
  color:#9a6500;
}

.availabilityBadge.mentor{
  background:#e9efff;
  color:#2b59c3;
}

.availabilityBadge.pending,
.availabilityBadge.pending::before{
  animation-duration:1.25s;
}

@keyframes statusSoftPulse{
  0%,100%{
    opacity:1;
    transform:scale(1);
  }
  50%{
    opacity:.76;
    transform:scale(1.018);
  }
}

@keyframes statusDotPulse{
  0%{
    transform:scale(.9);
    box-shadow:0 0 0 0 currentColor;
  }
  65%{
    transform:scale(1.12);
    box-shadow:0 0 0 6px transparent;
  }
  100%{
    transform:scale(.9);
    box-shadow:0 0 0 0 transparent;
  }
}

@media (prefers-reduced-motion: reduce){
  .availabilityBadge,
  .availabilityBadge::before{
    animation:none;
  }
}


.emptyState{
  padding:70px 24px;
  text-align:center;
  color:rgba(17,17,17,.52);
  border-top:1px solid rgba(0,0,0,.08);
}

.emptyState h2{
  margin:9px 0 6px;
  color:#111111;
  font-size:19px;
  font-weight:600;
}

.emptyState p{
  margin:0;
  font-size:14px;
}

.emptyState button{
  margin-top:14px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  padding:0 12px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-size:13px;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
}

.mobileFilterButton{
  display:none;
  align-items:center;
  gap:7px;
  padding:0 12px;
  height:30px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-size:13px;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
}



.resultsScroll,
.filterPanel{
  scrollbar-width:thin;
  scrollbar-color:rgba(17,17,17,.18) transparent;
}

.resultsScroll::-webkit-scrollbar,
.filterPanel::-webkit-scrollbar{
  width:7px;
}

.resultsScroll::-webkit-scrollbar-thumb,
.filterPanel::-webkit-scrollbar-thumb{
  background:rgba(17,17,17,.18);
  border-radius:999px;
}
@media(max-width:1120px){
  .directoryLayout{
    grid-template-columns:210px minmax(0,1fr);
  }
}

@media(max-width:860px){
  .directoryPage{
    width:100%;
    height:auto;
    max-height:none;
    min-height:calc(100dvh - var(--directory-chrome));
    padding:18px 14px 28px;
    overflow:visible;
    display:block;
  }

  .directoryShell{
    height:auto;
    min-height:calc(100dvh - var(--directory-chrome) - 46px);
    overflow:visible;
    border-radius:18px;
    padding:24px 20px 26px;
    display:block;
  }

  .directoryLayout{
    display:block;
    min-height:auto;
    overflow:visible;
  }

  .mobileFilterButton{
    display:flex;
  }

  .filterPanel{
    display:none;
    position:fixed;
    z-index:60;
    left:18px;
    right:18px;
    top:84px;
    max-height:calc(100vh - 104px);
    overflow:auto;
    padding:20px;
    border:1px solid rgba(0,0,0,.08);
    border-radius:16px;
    background:#ffffff;
    box-shadow:0 24px 60px rgba(0,0,0,.22);
  }

  .filterPanel.open{
    display:block;
  }

  .closeFilters{
    display:grid;
    place-items:center;
  }

  .resultsPanel{
    min-height:auto;
    padding:20px 0 0;
    overflow:visible;
    display:block;
  }

  .resultsPanelControls{
    position:relative;
  }

  .resultsScroll{
    min-height:auto;
    height:auto;
    max-height:none;
    overflow:visible;
    overscroll-behavior:auto;
    scrollbar-gutter:auto;
    margin-right:0;
    padding-right:0;
    -webkit-overflow-scrolling:auto;
  }

  .alumniResults{
    margin:0 -20px -26px;
  }
}

@media(max-width:560px){
  .directoryPage{
    padding:10px 14px 36px;
  }

  .directoryShell{
    padding:20px 14px 24px;
  }

  .alumniResults{
    margin:0 -14px -24px;
  }
}

@media(max-width:680px){
  .directoryHeader{
    align-items:center;
  }

  .directoryHeader h1{
    font-size:20px;
  }

  .directoryHeader p{
    display:none;
  }

  .tabRow{
    align-items:flex-start;
    flex-direction:column;
  }

  .sortControl{
    width:100%;
  }

  .alumniResults{
    grid-template-columns:1fr;
  }

  .alumniResultCard{
    grid-template-columns:54px minmax(0,1fr);
  }

  .resultActions{
    grid-column:1/-1;
    grid-row:auto;
    flex-direction:row;
    align-items:center;
    justify-content:space-between;
  }

  .alumniResultCard:nth-child(even){
    background:#fafbfc;
  }

  .alumniResultCard:nth-child(odd){
    background:#ffffff;
  }

  .resultsHeading small{
    display:none;
  }
}

@media(max-width:460px){
  .directoryHeader h1{
    font-size:18px;
  }

  .eyebrow{
    font-size:12px;
  }

  .tabs{
    width:100%;
  }

  .tabs button{
    flex:1;
    justify-content:center;
    padding:0 8px;
    font-size:12px;
  }

  .alumniResultCard{
    grid-template-columns:44px minmax(0,1fr);
    padding:16px 12px;
  }

  .resultAvatar{
    width:42px;
    height:42px;
  }

  .resultActions{
    align-items:flex-start;
    flex-direction:column;
  }
}

@keyframes directoryDissolve{
  from{opacity:0;transform:translateY(5px);}
  to{opacity:1;transform:translateY(0);}
}
`;

