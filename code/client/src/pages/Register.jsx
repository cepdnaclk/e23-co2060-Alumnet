import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Link as LinkIcon,
  Lock,
  Mail,
  User,
  Users,
} from "lucide-react";
import { registerUser } from "../api";
import heroBg from "../assets/bg.png";
import signUpIcon from "../assets/sign up.png";
import bufferingIcon from "../assets/buffering.png";

const DEPARTMENTS = [
  "Chemical & Process Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Electrical and Electronic Engineering",
  "Mechanical Engineering",
  "Manufacturing and Industrial Engineering",
];

const BATCHES = ["E20", "E21", "E22", "E23", "E24"];

function Field({ icon: Icon, children, className = "" }) {
  return (
    <label className={`fieldWrap ${className}`}>
      {Icon && <Icon size={15} strokeWidth={2.1} />}
      {children}
    </label>
  );
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidDomainUrl(value, allowedDomains) {
  if (!value.trim()) return true;

  try {
    const url = new URL(normalizeUrl(value));
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return allowedDomains.includes(host);
  } catch {
    return false;
  }
}

function isValidUrl(value) {
  if (!value.trim()) return true;

  try {
    new URL(normalizeUrl(value));
    return true;
  } catch {
    return false;
  }
}

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [interests, setInterests] = useState("");
  const [bio, setBio] = useState("");
  const [whyNeedMentor, setWhyNeedMentor] = useState("");
  const [goals, setGoals] = useState("");

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  const [alumniBatch, setAlumniBatch] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [prefCapacity, setPrefCapacity] = useState("");

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const payload = useMemo(() => {
    const common = {
      full_name: fullName.trim(),
      email: email.trim(),
      password,
      role,
      department,
    };

    if (role === "student") {
      return {
        ...common,
        batch,
        areas_of_interest: interests.trim(),
        bio: bio.trim(),
        motivation: whyNeedMentor.trim(),
        goal: goals.trim(),
        linkedin_url: normalizeUrl(linkedinUrl),
        github_url: normalizeUrl(githubUrl),
        portfolio_url: normalizeUrl(portfolioUrl),
        cv_url: normalizeUrl(cvUrl),
      };
    }

    return {
      ...common,
      job_title: jobTitle.trim(),
      organization: organization.trim(),
      graduation_year: alumniBatch ? Number(alumniBatch) : null,
      linkedin_url: normalizeUrl(linkedinUrl),
      primary_interests: interests.trim(),
      preferred_mentee_capacity: prefCapacity ? Number(prefCapacity) : null,
      bio: bio.trim(),
    };
  }, [
    fullName,
    email,
    password,
    role,
    department,
    batch,
    interests,
    bio,
    whyNeedMentor,
    goals,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    cvUrl,
    alumniBatch,
    jobTitle,
    organization,
    prefCapacity,
  ]);

  const validateLinks = () => {
    if (!isValidDomainUrl(linkedinUrl, ["linkedin.com"])) {
      return "Please enter a valid LinkedIn URL.";
    }

    if (role === "student" && !isValidDomainUrl(githubUrl, ["github.com"])) {
      return "Please enter a valid GitHub URL.";
    }

    if (role === "student" && !isValidUrl(portfolioUrl)) {
      return "Please enter a valid portfolio URL.";
    }

    if (role === "student" && !isValidUrl(cvUrl)) {
      return "Please enter a valid CV URL.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setStatusMessage("");

    const linkError = validateLinks();

    if (linkError) {
      setError(linkError);
      return;
    }

    setLoading(true);
    setStatusMessage("Please wait, your account is being created...");

    try {
      const data = await registerUser(payload);

      navigate("/verify-email", {
        state: {
          email,
          message: data.message || "Registration successful.",
        },
      });
    } catch (err) {
      setError(err.message || "Register failed");
      setStatusMessage("");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigate("/");
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  };

  return (
    <main className="registerPage">
      <style>{css}</style>
      <img src={heroBg} alt="" className="registerBg" />

      <section className={`registerCard ${mounted ? "in" : ""}`}>
        <button className="iconButton" type="button" onClick={goHome}>
          <img src={signUpIcon} alt="" />
        </button>

        <h1>Create account</h1>
        <p className="registerSubtitle">Join the Alumnet mentorship community.</p>

        <form onSubmit={handleSubmit} className="registerForm" noValidate>
          <div className="roleSwitch" aria-label="Account type">
            <button
              type="button"
              className={role === "student" ? "active" : ""}
              onClick={() => setRole("student")}
              disabled={loading}
            >
              Student
            </button>

            <button
              type="button"
              className={role === "alumni" ? "active" : ""}
              onClick={() => setRole("alumni")}
              disabled={loading}
            >
              Alumni
            </button>
          </div>

          <div className="formGrid">
            <Field icon={User}>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name *"
                required
                disabled={loading}
              />
            </Field>

            <Field icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email *"
                required
                disabled={loading}
              />
            </Field>

            <Field icon={Lock}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password *"
                required
                disabled={loading}
              />

              <button
                className="passwordToggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>

            {role === "student" ? (
              <Field icon={GraduationCap} className="selectField">
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select batch *</option>
                  {BATCHES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field icon={GraduationCap}>
                <input
                  type="number"
                  value={alumniBatch}
                  onChange={(e) => setAlumniBatch(e.target.value)}
                  placeholder="Graduation year"
                  disabled={loading}
                />
              </Field>
            )}

            <Field icon={Building2} className="span2 selectField">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select department *</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </Field>

            {role === "alumni" && (
              <>
                <Field icon={Briefcase}>
                  <input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Job title *"
                    required
                    disabled={loading}
                  />
                </Field>

                <Field icon={Building2}>
                  <input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Company *"
                    required
                    disabled={loading}
                  />
                </Field>
              </>
            )}

            <Field icon={Users} className="span2">
              <input
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder={
                  role === "student"
                    ? "Areas of interest"
                    : "Primary interests / expertise *"
                }
                required={role === "alumni"}
                disabled={loading}
              />
            </Field>

            <Field icon={FileText} className="span2 tall">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief introduction"
                disabled={loading}
              />
            </Field>

            {role === "student" ? (
              <>
                <Field className="tall">
                  <textarea
                    value={whyNeedMentor}
                    onChange={(e) => setWhyNeedMentor(e.target.value)}
                    placeholder="Why do you need a mentor? *"
                    required
                    disabled={loading}
                  />
                </Field>

                <Field className="tall">
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="What is your goal? *"
                    required
                    disabled={loading}
                  />
                </Field>

                <Field icon={LinkIcon}>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="GitHub URL"
                    disabled={loading}
                  />
                </Field>

                <Field icon={LinkIcon}>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="LinkedIn URL"
                    disabled={loading}
                  />
                </Field>

                <Field icon={LinkIcon} className="span2">
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="Portfolio URL"
                    disabled={loading}
                  />
                </Field>

                <Field icon={LinkIcon} className="span2">
                  <input
                    type="text"
                    value={cvUrl}
                    onChange={(e) => setCvUrl(e.target.value)}
                    placeholder="CV link"
                    disabled={loading}
                  />
                </Field>
              </>
            ) : (
              <Field icon={Users}>
                <input
                  type="number"
                  value={prefCapacity}
                  onChange={(e) => setPrefCapacity(e.target.value)}
                  placeholder="Preferred mentee capacity"
                  min="0"
                  disabled={loading}
                />
              </Field>
            )}

            {role === "alumni" && (
              <Field icon={LinkIcon}>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="LinkedIn URL *"
                  required
                  disabled={loading}
                />
              </Field>
            )}
          </div>

          {statusMessage && (
            <div className="statusBox">
              {loading && (
                <img src={bufferingIcon} alt="" className="bufferingIcon" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {error && <div className="errorBox">{error}</div>}

          <button className="createButton" type="submit" disabled={loading}>
            {loading && (
              <img src={bufferingIcon} alt="" className="buttonSpinner" />
            )}
            <span>{loading ? "Creating account..." : "Create account"}</span>
            {!loading && <ArrowRight size={15} strokeWidth={2.4} />}
          </button>
        </form>

        <div className="registerFooter">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>

        <Link className="backHomeLink" to="/" onClick={goHome}>
          Back to Home
        </Link>
      </section>
    </main>
  );
}

const css = `
.registerPage{
  position:relative;
  min-height:100vh;
  display:grid;
  place-items:center;
  overflow:hidden;
  background:#d8ecfb;
  color:#050505;
  font-family:"Google Sans", Arial, sans-serif;
  padding:26px;
}

.registerBg{
  position:fixed;
  top:0;
  left:50%;
  width:100%;
  height:auto;
  min-height:100%;
  transform:translateX(-50%);
  object-fit:cover;
  object-position:center top;
}

.registerCard{
  position:relative;
  z-index:1;
  width:min(650px, calc(100vw - 44px));
  max-height:calc(100vh - 52px);
  overflow:auto;
  border-radius:20px;
  padding:24px 26px 22px;
  text-align:center;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.24);
  opacity:0;
  transform:translateY(14px) scale(.985);
  transition:opacity .55s ease, transform .55s ease;
}

.registerCard.in{
  opacity:1;
  transform:translateY(0) scale(1);
}

.registerCard::-webkit-scrollbar{
  width:6px;
}

.registerCard::-webkit-scrollbar-thumb{
  background:rgba(0,0,0,.12);
  border-radius:999px;
}

.registerCard{
  scrollbar-width:thin;
  scrollbar-color:rgba(0,0,0,.16) transparent;
}

.iconButton{
  width:44px;
  height:44px;
  display:inline-grid;
  place-items:center;
  border-radius:14px;
  color:#111111;
  background:#ffffff;
  border:1px solid rgba(0,0,0,.08);
  box-shadow:0 14px 30px rgba(0,0,0,.18);
  margin-bottom:14px;
  transition:transform .2s ease, box-shadow .2s ease, background-color .2s ease;
}

.iconButton:hover{
  transform:translateY(-1px);
  background:#ffffff;
  box-shadow:0 10px 22px rgba(0,0,0,.15);
}

.iconButton img{
  width:24px;
  height:24px;
  object-fit:contain;
  display:block;
}

.registerCard h1{
  margin:0 0 5px;
  font-size:24px;
  line-height:1.15;
  font-weight:600;
  letter-spacing:-.02em;
}

.registerSubtitle{
  margin:0 0 16px;
  font-size:14px;
  line-height:1.35;
  color:rgba(0,0,0,.84);
}

.registerForm{
  display:grid;
  gap:11px;
}

.roleSwitch{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:5px;
  padding:4px;
  border-radius:999px;
  background:#eef1f5;
  border:1px solid rgba(0,0,0,.05);
}

.roleSwitch button{
  height:30px;
  border:none;
  border-radius:999px;
  background:transparent;
  color:rgba(17,17,17,.74);
  font:inherit;
  font-size:14px;
  cursor:pointer;
  transition:background .18s ease, box-shadow .18s ease, color .18s ease;
}

.roleSwitch button.active{
  background:#050505;
  color:#ffffff;
  box-shadow:0 7px 16px rgba(0,0,0,.18);
}

.formGrid{
  display:grid;
  grid-template-columns:repeat(2, minmax(0,1fr));
  gap:9px;
}

.fieldWrap{
  min-height:31px;
  display:flex;
  align-items:center;
  gap:7px;
  padding:0 10px;
  border-radius:8px;
  background:#eef1f5;
  border:1px solid rgba(0,0,0,.05);
  color:rgba(17,17,17,.70);
  transition:border-color .18s ease, box-shadow .18s ease, background .18s ease;
}

.fieldWrap:focus-within{
  background:#ffffff;
  border-color:rgba(0,0,0,.12);
  box-shadow:0 0 0 4px rgba(255,255,255,.28);
}

.fieldWrap.span2{
  grid-column:1 / -1;
}

.fieldWrap.tall{
  min-height:70px;
  align-items:flex-start;
  padding-top:9px;
  padding-bottom:9px;
}

.fieldWrap input,
.fieldWrap select,
.fieldWrap textarea{
  min-width:0;
  width:100%;
  border:none;
  outline:none;
  background:transparent;
  color:#111111;
  font:inherit;
  font-size:14px;
}

.fieldWrap input:disabled,
.fieldWrap select:disabled,
.fieldWrap textarea:disabled,
.roleSwitch button:disabled{
  opacity:.72;
  cursor:not-allowed;
}

.fieldWrap select{
  appearance:none;
  padding-right:24px;
}

.fieldWrap.selectField{
  position:relative;
}

.fieldWrap.selectField::after{
  content:">";
  position:absolute;
  right:12px;
  top:50%;
  transform:translateY(-50%) rotate(90deg);
  color:rgba(17,17,17,.62);
  font-size:15px;
  line-height:1;
  pointer-events:none;
}

.fieldWrap textarea{
  min-height:52px;
  resize:vertical;
}

.fieldWrap input::placeholder,
.fieldWrap textarea::placeholder{
  color:rgba(17,17,17,.64);
}

.passwordToggle{
  display:grid;
  place-items:center;
  flex:0 0 auto;
  width:22px;
  height:22px;
  border:none;
  background:transparent;
  border-radius:999px;
  color:rgba(17,17,17,.64);
  cursor:pointer;
  transition:background .18s ease, color .18s ease;
}

.passwordToggle:hover{
  background:rgba(255,255,255,.62);
  color:#111111;
}

.createButton{
  height:35px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  margin-top:2px;
  border-radius:999px;
  border:1px solid rgba(0,0,0,.84);
  background:#050505;
  color:#ffffff;
  font:inherit;
  font-size:14px;
  font-weight:500;
  box-shadow:0 8px 18px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.20);
  cursor:pointer;
  transition:transform .2s ease, box-shadow .2s ease, opacity .2s ease;
}

.createButton:hover:not(:disabled){
  transform:translateY(-1px);
  box-shadow:0 10px 23px rgba(0,0,0,.27), inset 0 1px 0 rgba(255,255,255,.20);
}

.createButton:disabled{
  opacity:.78;
  cursor:not-allowed;
}

.statusBox{
  display:flex;
  align-items:center;
  gap:9px;
  padding:8px 10px;
  border-radius:10px;
  background:rgba(17,17,17,.06);
  border:1px solid rgba(17,17,17,.08);
  color:#111111;
  font-size:13px;
  line-height:1.35;
  text-align:left;
}

.bufferingIcon,
.buttonSpinner{
  width:16px;
  height:16px;
  object-fit:contain;
  flex:0 0 auto;
  animation:spin .85s linear infinite;
}

.buttonSpinner{
  width:15px;
  height:15px;
  filter:brightness(0) invert(1);
}

@keyframes spin{
  from{
    transform:rotate(0deg);
  }
  to{
    transform:rotate(360deg);
  }
}

.errorBox{
  padding:8px 10px;
  border-radius:10px;
  background:rgba(239,68,68,.10);
  border:1px solid rgba(239,68,68,.18);
  color:#b91c1c;
  font-size:13px;
  line-height:1.35;
  text-align:left;
}

.registerFooter{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  margin-top:14px;
  padding-top:12px;
  border-top:1px dashed rgba(0,0,0,.10);
  color:rgba(17,17,17,.72);
  font-size:13px;
}

.registerFooter a,
.backHomeLink{
  color:#111111;
  text-decoration:none;
  transition:opacity .18s ease;
}

.registerFooter a:hover,
.backHomeLink:hover{
  opacity:.68;
}

.backHomeLink{
  display:inline-flex;
  margin-top:10px;
  color:rgba(17,17,17,.72);
  font-size:13px;
}

@media (max-width:700px){
  .registerPage{
    padding:18px;
    overflow:auto;
  }

  .registerBg{
    height:100%;
    width:auto;
    min-width:100%;
  }

  .registerCard{
    max-height:none;
    width:min(420px, calc(100vw - 36px));
    padding:22px 20px 20px;
  }

  .formGrid{
    grid-template-columns:1fr;
  }

  .fieldWrap.span2{
    grid-column:auto;
  }
}
`;