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

import signUpIcon from "../assets/sign up.png";
import bufferingIcon from "../assets/buffering.png";
import tipIcon from "../assets/tip.png";

const DEPARTMENTS = [
  "Chemical & Process Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Electrical and Electronic Engineering",
  "Mechanical Engineering",
  "Manufacturing and Industrial Engineering",
];

const BATCHES = ["E20", "E21", "E22", "E23", "E24"];

const REGISTER_DRAFT_KEY = "alumnet.registerDraft.v1";
const REGISTER_DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function loadRegisterDraft() {
  try {
    const savedDraft = JSON.parse(localStorage.getItem(REGISTER_DRAFT_KEY));

    if (!savedDraft || Date.now() - savedDraft.savedAt > REGISTER_DRAFT_MAX_AGE) {
      localStorage.removeItem(REGISTER_DRAFT_KEY);
      return {};
    }

    return savedDraft.values || {};
  } catch {
    localStorage.removeItem(REGISTER_DRAFT_KEY);
    return {};
  }
}

function Field({ icon: Icon, children, className = "" }) {
  return (
    <label className={`fieldWrap ${className}`}>
      {Icon && <Icon size={15} strokeWidth={2.1} />}
      {children}
    </label>
  );
}

function InfoField({
  icon: Icon,
  tip,
  isOpen,
  onToggle,
  children,
}) {
  return (
    <div className="infoFieldGroup">
      {isOpen && (
        <div className="fieldTip">
          <img src={tipIcon} alt="" className="fieldTipIcon" />

          <span>{tip}</span>
        </div>
      )}

      <label className="fieldWrap infoField">
        {Icon && <Icon size={15} strokeWidth={2.1} />}

        {children}

        <button
          type="button"
          className="infoMark"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggle();
          }}
          aria-label="Show field information"
          aria-expanded={isOpen}
        >
          !
        </button>
      </label>
    </div>
  );
}

function normalizeUrl(value) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isValidDomainUrl(value, allowedDomains) {
  if (!value.trim()) return true;

  try {
    const url = new URL(normalizeUrl(value));

    const host = url.hostname
      .toLowerCase()
      .replace(/^www\./, "");

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

  const [initialDraft] = useState(loadRegisterDraft);

  const [role, setRole] = useState(initialDraft.role || "student");

  const [fullName, setFullName] = useState(initialDraft.fullName || "");
  const [email, setEmail] = useState(initialDraft.email || "");
  const [password, setPassword] = useState("");

  const [department, setDepartment] = useState(initialDraft.department || "");
  const [batch, setBatch] = useState(initialDraft.batch || "");
  const [interests, setInterests] = useState(initialDraft.interests || "");
  const [bio, setBio] = useState(initialDraft.bio || "");
  const [whyNeedMentor, setWhyNeedMentor] = useState(initialDraft.whyNeedMentor || "");
  const [goals, setGoals] = useState(initialDraft.goals || "");

  const [linkedinUrl, setLinkedinUrl] = useState(initialDraft.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(initialDraft.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialDraft.portfolioUrl || "");
  const [cvUrl, setCvUrl] = useState(initialDraft.cvUrl || "");

  const [alumniBatch, setAlumniBatch] = useState(initialDraft.alumniBatch || "");
  const [jobTitle, setJobTitle] = useState(initialDraft.jobTitle || "");
  const [organization, setOrganization] = useState(initialDraft.organization || "");
  const [prefCapacity, setPrefCapacity] = useState(initialDraft.prefCapacity || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [openTip, setOpenTip] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 40);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(
        REGISTER_DRAFT_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          values: {
            role,
            fullName,
            email,
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
          },
        })
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [
    role,
    fullName,
    email,
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
      graduation_year: alumniBatch
        ? Number(alumniBatch)
        : null,
      linkedin_url: normalizeUrl(linkedinUrl),
      primary_interests: interests.trim(),
      preferred_mentee_capacity: prefCapacity
        ? Number(prefCapacity)
        : null,
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
    if (
      !isValidDomainUrl(linkedinUrl, [
        "linkedin.com",
      ])
    ) {
      return "Please enter a valid LinkedIn URL.";
    }

    if (
      role === "student" &&
      !isValidDomainUrl(githubUrl, ["github.com"])
    ) {
      return "Please enter a valid GitHub URL.";
    }

    if (
      role === "student" &&
      !isValidUrl(portfolioUrl)
    ) {
      return "Please enter a valid portfolio URL.";
    }

    if (
      role === "student" &&
      !isValidUrl(cvUrl)
    ) {
      return "Please enter a valid CV Drive URL.";
    }

    return "";
  };

  const toggleTip = (tipName) => {
    setOpenTip((currentTip) =>
      currentTip === tipName ? null : tipName
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setOpenTip(null);

    const linkError = validateLinks();

    if (linkError) {
      setError(linkError);
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser(payload);

      localStorage.removeItem(REGISTER_DRAFT_KEY);

      navigate("/verify-email", {
        state: {
          email,
          message:
            data.message ||
            "Registration successful.",
        },
      });
    } catch (err) {
      setError(
        err.message || "Register failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigate("/");

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
      });
    });
  };

  return (
    <main className="registerPage">
      <style>{css}</style>

      <section
        className={`registerCard ${
          mounted ? "in" : ""
        }`}
      >
        <button
          className="iconButton"
          type="button"
          onClick={goHome}
        >
          <img src={signUpIcon} alt="" />
        </button>

        <h1>Create account</h1>

        <p className="registerSubtitle">
          Join the Alumnet mentorship community.
        </p>

        <form
          onSubmit={handleSubmit}
          className="registerForm"
        >
          <div
            className="roleSwitch"
            aria-label="Account type"
          >
            <button
              type="button"
              className={
                role === "student" ? "active" : ""
              }
              onClick={() => {
                setRole("student");
                setOpenTip(null);
              }}
              disabled={loading}
            >
              Student
            </button>

            <button
              type="button"
              className={
                role === "alumni" ? "active" : ""
              }
              onClick={() => {
                setRole("alumni");
                setOpenTip(null);
              }}
              disabled={loading}
            >
              Alumni
            </button>
          </div>

          <div className="formGrid">
            <Field icon={User}>
              <input
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Full name *"
                required
                disabled={loading}
              />
            </Field>

            <Field icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Email *"
                required
                disabled={loading}
              />
            </Field>

            <Field icon={Lock}>
              <input
                type={
                  showPassword ? "text" : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Password *"
                required
                disabled={loading}
              />

              <button
                className="passwordToggle"
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff
                    size={15}
                    strokeWidth={2.1}
                  />
                ) : (
                  <Eye
                    size={15}
                    strokeWidth={2.1}
                  />
                )}
              </button>
            </Field>

            {role === "student" ? (
              <Field
                icon={GraduationCap}
                className="selectField"
              >
                <select
                  value={batch}
                  onChange={(event) =>
                    setBatch(event.target.value)
                  }
                  required
                  disabled={loading}
                >
                  <option value="">
                    Select batch *
                  </option>

                  {BATCHES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
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
                  onChange={(event) =>
                    setAlumniBatch(
                      event.target.value
                    )
                  }
                  placeholder="Graduation year"
                  disabled={loading}
                />
              </Field>
            )}

            <Field
              icon={Building2}
              className="span2 selectField"
            >
              <select
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value)
                }
                required
                disabled={loading}
              >
                <option value="">
                  Select department *
                </option>

                {DEPARTMENTS.map((dept) => (
                  <option
                    key={dept}
                    value={dept}
                  >
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
                    onChange={(event) =>
                      setJobTitle(event.target.value)
                    }
                    placeholder="Job title *"
                    required
                    disabled={loading}
                  />
                </Field>

                <Field icon={Building2}>
                  <input
                    value={organization}
                    onChange={(event) =>
                      setOrganization(
                        event.target.value
                      )
                    }
                    placeholder="Company *"
                    required
                    disabled={loading}
                  />
                </Field>
              </>
            )}

            <Field
              icon={Users}
              className="span2"
            >
              <input
                value={interests}
                onChange={(event) =>
                  setInterests(event.target.value)
                }
                placeholder={
                  role === "student"
                    ? "Areas of interest"
                    : "Primary interests / expertise *"
                }
                required={role === "alumni"}
                disabled={loading}
              />
            </Field>

            <Field
              icon={FileText}
              className="span2 tall"
            >
              <textarea
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
                placeholder="Brief introduction"
                disabled={loading}
              />
            </Field>

            {role === "student" ? (
              <>
                <Field className="tall">
                  <textarea
                    value={whyNeedMentor}
                    onChange={(event) =>
                      setWhyNeedMentor(
                        event.target.value
                      )
                    }
                    placeholder="Why do you need a mentor? *"
                    required
                    disabled={loading}
                  />
                </Field>

                <Field className="tall">
                  <textarea
                    value={goals}
                    onChange={(event) =>
                      setGoals(event.target.value)
                    }
                    placeholder="What is your goal? *"
                    required
                    disabled={loading}
                  />
                </Field>

                <Field icon={LinkIcon}>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(event) =>
                      setGithubUrl(event.target.value)
                    }
                    placeholder="GitHub URL"
                    disabled={loading}
                  />
                </Field>

                <Field icon={LinkIcon}>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(event) =>
                      setLinkedinUrl(
                        event.target.value
                      )
                    }
                    placeholder="LinkedIn URL"
                    disabled={loading}
                  />
                </Field>

                <InfoField
                  icon={LinkIcon}
                  tip="Add your portfolio, personal website, or project showcase link."
                  isOpen={openTip === "portfolio"}
                  onToggle={() =>
                    toggleTip("portfolio")
                  }
                >
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(event) =>
                      setPortfolioUrl(
                        event.target.value
                      )
                    }
                    placeholder="Portfolio URL"
                    disabled={loading}
                  />
                </InfoField>

                <InfoField
                  icon={LinkIcon}
                  tip="Upload your CV to Google Drive, allow anyone with the link to view it, then paste the Drive link here."
                  isOpen={openTip === "cv"}
                  onToggle={() => toggleTip("cv")}
                >
                  <input
                    type="text"
                    value={cvUrl}
                    onChange={(event) =>
                      setCvUrl(event.target.value)
                    }
                    placeholder="CV Drive link"
                    disabled={loading}
                  />
                </InfoField>
              </>
            ) : (
              <Field icon={Users}>
                <input
                  type="number"
                  value={prefCapacity}
                  onChange={(event) =>
                    setPrefCapacity(
                      event.target.value
                    )
                  }
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
                  onChange={(event) =>
                    setLinkedinUrl(
                      event.target.value
                    )
                  }
                  placeholder="LinkedIn URL *"
                  required
                  disabled={loading}
                />
              </Field>
            )}
          </div>

          {error && (
            <div className="errorBox">
              {error}
            </div>
          )}

          <button
            className="createButton"
            type="submit"
            disabled={loading}
          >
            {loading && (
              <img
                src={bufferingIcon}
                alt=""
                className="buttonSpinner"
              />
            )}

            <span>
              {loading
                ? "Please wait, your account is being created..."
                : "Create account"}
            </span>

            {!loading && (
              <ArrowRight
                size={15}
                strokeWidth={2.4}
              />
            )}
          </button>
        </form>

        <div className="registerFooter">
          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Login
          </Link>
        </div>

        <Link
          className="backHomeLink"
          to="/"
          onClick={goHome}
        >
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
  background:
    linear-gradient(180deg, #afd6ff 0%, #cfe7f7 34%, #f6e8ee 62%, #eef7fb 100%);
  color:#050505;
  font-family:"Google Sans", Arial, sans-serif;
  padding:26px;
}

.registerPage::before{
  content:"";
  position:fixed;
  inset:0;
  background:
    linear-gradient(135deg, rgba(255,255,255,.52), rgba(255,255,255,0) 42%),
    radial-gradient(circle at 50% 28%, rgba(255,232,238,.72), rgba(255,232,238,0) 42%),
    radial-gradient(circle at 50% 18%, rgba(255,255,255,.72), rgba(255,255,255,0) 40%);
  pointer-events:none;
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
  background:rgba(255,255,255,.88);
  border:1px solid rgba(255,255,255,.78);
  box-shadow:0 28px 72px rgba(39,91,130,.18);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  opacity:0;
  transform:translateY(14px) scale(.985);
  transition:
    opacity .55s ease,
    transform .55s ease;
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
  scrollbar-color:
    rgba(0,0,0,.16)
    transparent;
}

.iconButton{
  width:44px;
  height:44px;
  display:inline-grid;
  place-items:center;
  border-radius:14px;
  background:#ffffff;
  border:1px solid rgba(0,0,0,.08);
  box-shadow:0 14px 30px rgba(0,0,0,.18);
  margin-bottom:14px;
  cursor:pointer;
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
}

.roleSwitch button.active{
  background:#050505;
  color:#ffffff;
  box-shadow:0 7px 16px rgba(0,0,0,.18);
}

.formGrid{
  display:grid;
  grid-template-columns:
    repeat(2, minmax(0,1fr));
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
  transition:
    border-color .18s ease,
    box-shadow .18s ease,
    background .18s ease;
}

.fieldWrap:focus-within{
  background:#ffffff;
  border-color:rgba(54,127,145,.24);
  box-shadow:
    0 0 0 4px rgba(201,226,255,.42);
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
  transform:
    translateY(-50%)
    rotate(90deg);
  color:rgba(17,17,17,.62);
  font-size:15px;
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

.infoFieldGroup{
  position:relative;
  min-width:0;
}

.infoField{
  width:100%;
}

.infoMark{
  width:20px;
  height:20px;
  flex:0 0 20px;
  padding:0;
  display:grid;
  place-items:center;
  border:0;
  border-radius:50%;
  background: #c9e2ff;
  color:#111111;
  font-family:inherit;
  font-size:12px;
  font-weight:800;
  line-height:1;
  cursor:pointer;
  user-select:none;
  transition:
    transform .16s ease,
    opacity .16s ease;
}

.infoMark:hover{
  opacity:.78;
}

.infoMark:active{
  transform:scale(.90);
}

.fieldTip{
  display:flex;
  align-items:center;
  gap:8px;
  width:100%;
  margin-bottom:6px;
  padding:8px 10px;
  border-radius:8px;
  background:#e8f3ff;
  border:1px solid #c9e2ff;
  color:#1769aa;
  font-size:12px;
  line-height:1.4;
  text-align:left;
  animation:
    tipAppear .2s ease both;
}

.fieldTipIcon{
  width:22px;
  height:22px;
  flex:0 0 22px;
  object-fit:contain;
}

@keyframes tipAppear{
  from{
    opacity:0;
    transform:translateY(4px);
  }

  to{
    opacity:1;
    transform:translateY(0);
  }
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
}

.createButton{
  min-height:35px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  margin-top:2px;
  padding:8px 16px;
  border-radius:999px;
  border:1px solid rgba(0,0,0,.84);
  background:#050505;
  color:#ffffff;
  font:inherit;
  font-size:14px;
  font-weight:500;
  box-shadow:
    0 8px 18px rgba(0,0,0,.24),
    inset 0 1px 0 rgba(255,255,255,.20);
  cursor:pointer;
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    opacity .2s ease;
}

.createButton:hover:not(:disabled){
  transform:translateY(-1px);
  box-shadow:
    0 10px 23px rgba(0,0,0,.27),
    inset 0 1px 0 rgba(255,255,255,.20);
}

.createButton:disabled{
  opacity:.78;
  cursor:not-allowed;
}

.buttonSpinner{
  width:15px;
  height:15px;
  object-fit:contain;
  flex:0 0 auto;
  filter:
    brightness(0)
    invert(1);
  animation:
    spin .85s linear infinite;
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
  border-top:
    1px dashed rgba(0,0,0,.10);
  color:rgba(17,17,17,.72);
  font-size:13px;
}

.registerFooter a,
.backHomeLink{
  color:#111111;
  text-decoration:none;
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
  .registerCard{
    max-height:none;
    width:min(
      420px,
      calc(100vw - 36px)
    );
    padding:22px 20px 20px;
  }

  .formGrid{
    grid-template-columns:1fr;
  }

  .fieldWrap.span2{
    grid-column:auto;
  }

  .infoFieldGroup{
    width:100%;
  }

  .fieldTip{
    font-size:12px;
    padding:9px 10px;
  }

  .fieldTipIcon{
    width:24px;
    height:24px;
    flex-basis:24px;
  }

  .infoMark{
    width:22px;
    height:22px;
    flex-basis:22px;
  }

  .createButton{
    min-height:40px;
    padding-left:12px;
    padding-right:12px;
    font-size:13px;
  }
}

@media (max-width:380px){
  .registerPage{
    padding:12px;
  }

  .registerCard{
    width:calc(100vw - 24px);
    padding:20px 14px;
  }

  .fieldTip{
    align-items:flex-start;
    font-size:11px;
  }

  .createButton{
    font-size:12px;
  }
}
`;
