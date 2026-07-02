import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import AuthLayout from "../components/AuthLayout";
import {
  titleStyle,
  subtitleStyle,
  sectionTitleStyle,
  labelStyle,
  inputStyle,
  selectStyle,
  textareaStyle,
  btnPrimaryStyle,
  footerRowStyle,
  linkStyle,
  errorBoxStyle,
  dividerStyle,
  uiCss,
} from "../styles/ui";

const DEPARTMENTS = [
  "Chemical & Process Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Electrical and Electronic Engineering",
  "Mechanical Engineering",
  "Manufacturing and Industrial Engineering",
];

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [department, setDepartment] = useState("");

  // student
  const [batch, setBatch] = useState("");
  const [interests, setInterests] = useState("");
  const [bio, setBio] = useState("");
  const [whyNeedMentor, setWhyNeedMentor] = useState("");
  const [goals, setGoals] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  // alumni
  const [alumniBatch, setAlumniBatch] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [prefCapacity, setPrefCapacity] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = useMemo(() => {
    const common = {
      full_name: fullName,
      email,
      password,
      role,
      department,
    };

    if (role === "student") {
      return {
        ...common,
        batch,
        areas_of_interest: interests,
        bio,
        motivation: whyNeedMentor,
        goal: goals,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        cv_url: cvUrl,
      };
    }

    return {
      ...common,
      job_title: jobTitle,
      organization,
      graduation_year: alumniBatch ? Number(alumniBatch) : null,
      linkedin_url: linkedinUrl,
      primary_interests: interests,
      preferred_mentee_capacity: prefCapacity ? Number(prefCapacity) : null,
      bio,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth={760}>
      <style>{uiCss}</style>

      <h1 style={titleStyle}>Create Account</h1>
      <p style={subtitleStyle}>Join the Alumnet mentorship community.</p>

      <form onSubmit={handleSubmit}>
        <div className="grid2">
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="James Potter"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="james.potter@example.com"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>I am a...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={selectStyle}
            >
              <option value="student">Mentee (Student)</option>
              <option value="alumni">Mentor (Alumni)</option>
            </select>
          </div>
        </div>

        <div style={dividerStyle} />

        {role === "student" ? (
          <>
            <h3 style={sectionTitleStyle}>Student Details</h3>

            <div className="grid2">
              <div>
                <label style={labelStyle}>Batch *</label>
                <input
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="E23"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  style={selectStyle}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Areas of Interest</label>
                <input
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="AI, Robotics etc."
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={labelStyle}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief introduction..."
              style={textareaStyle}
            />

            <div className="grid2">
              <div>
                <label style={labelStyle}>Why do you need a mentor? *</label>
                <textarea
                  value={whyNeedMentor}
                  onChange={(e) => setWhyNeedMentor(e.target.value)}
                  placeholder="Explain your motivation..."
                  required
                  style={textareaStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>What is your goal? *</label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Career or academic goals..."
                  required
                  style={textareaStyle}
                />
              </div>
            </div>

            <h4 style={sectionTitleStyle}>Links</h4>

            <div className="grid2">
              <div>
                <label style={labelStyle}>LinkedIn URL</label>
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>GitHub URL</label>
                <input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Portfolio URL</label>
                <input
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>CV Link</label>
                <input
                  value={cvUrl}
                  onChange={(e) => setCvUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 style={sectionTitleStyle}>Mentor Profile</h3>

            <div className="grid2">
              <div>
                <label style={labelStyle}>Graduation Year (Batch)</label>
                <input
                  type="number"
                  value={alumniBatch}
                  onChange={(e) => setAlumniBatch(e.target.value)}
                  placeholder="2012"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  style={selectStyle}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Job Title *</label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Software Engineer"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Company *</label>
                <input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Google"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Primary Interests / Expertise *</label>
                <input
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="AI, Cyber Security, Career Guidance"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief introduction..."
                  style={textareaStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>LinkedIn Profile URL *</label>
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Preferred Mentee Capacity</label>
                <input
                  type="number"
                  value={prefCapacity}
                  onChange={(e) => setPrefCapacity(e.target.value)}
                  placeholder="3"
                  min="0"
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}

        {error && <div style={errorBoxStyle}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btnPrimary"
          style={{
            ...btnPrimaryStyle,
            marginTop: 16,
            opacity: loading ? 0.8 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <div style={footerRowStyle}>
        Already have an account?{" "}
        <Link className="link" style={linkStyle} to="/login">
          Login
        </Link>
      </div>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Link className="link" style={linkStyle} to="/">
          ← Back to Home
        </Link>
      </div>
    </AuthLayout>
  );
}
