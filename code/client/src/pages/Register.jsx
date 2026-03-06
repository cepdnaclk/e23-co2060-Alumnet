// src/pages/Register.jsx
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api";
import AuthLayout from "../components/AuthLayout";
import {
  titleStyle,
  subtitleStyle,
  labelStyle,
  inputStyle,
  selectStyle,
  btnPrimaryStyle,
  footerRowStyle,
  linkStyle,
  errorBoxStyle,
  uiCss,
} from "../styles/ui";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");

  // common
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // student fields
  const [batch, setBatch] = useState("");
  const [interests, setInterests] = useState("");
  const [aboutYourself, setAboutYourself] = useState("");
  const [whyNeedMentor, setWhyNeedMentor] = useState("");
  const [goals, setGoals] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  // alumni fields
  const [jobTitle, setJobTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [prefCapacity, setPrefCapacity] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = useMemo(() => {
    const common = {
      full_name: fullName,
      email,
      password,
      role,
    };

    if (role === "student") {
      return {
        ...common,
        batch,
        interests,
        about_yourself: aboutYourself,
        why_need_mentor: whyNeedMentor,
        goals,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        cv_url: cvUrl,
      };
    }

    return {
      ...common,
      job_title: jobTitle,
      company: organization,
      grad_year: gradYear,
      linkedin_url: linkedinUrl,
      interests,
      preferred_mentee_capacity: prefCapacity ? Number(prefCapacity) : null,
    };
  }, [
    role,
    fullName,
    email,
    password,
    batch,
    interests,
    aboutYourself,
    whyNeedMentor,
    goals,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    cvUrl,
    jobTitle,
    organization,
    gradYear,
    prefCapacity,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerUser(payload);
      localStorage.setItem("token", data.token);
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth={720}>
      <style>{uiCss}</style>

      <h1 style={titleStyle}>Create Account</h1>
      <p style={subtitleStyle}>Join the AlumNet mentorship community.</p>

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
              placeholder="••••••••••"
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

        <div style={{ height: 1, background: "rgba(11,42,111,0.12)", margin: "6px 0 14px" }} />

        {role === "student" ? (
          <>
            <h3 style={{ margin: "0 0 10px", color: "#0b2a6f" }}>Student Details</h3>

            <div className="grid2">
              <div>
                <label style={labelStyle}>Batch *</label>
                <input
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="e.g. E23"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Areas of Interest</label>
                <input
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="AI, Robotics etc."
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={labelStyle}>About Yourself</label>
            <textarea
              value={aboutYourself}
              onChange={(e) => setAboutYourself(e.target.value)}
              placeholder="Brief introduction..."
              style={{ ...inputStyle, minHeight: 90 }}
            />

            <div className="grid2">
              <div>
                <label style={labelStyle}>Why do you need a mentor? *</label>
                <textarea
                  value={whyNeedMentor}
                  onChange={(e) => setWhyNeedMentor(e.target.value)}
                  placeholder="Explain your motivation..."
                  required
                  style={{ ...inputStyle, minHeight: 90 }}
                />
              </div>
              <div>
                <label style={labelStyle}>What is your goal? *</label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Career/academic goals..."
                  required
                  style={{ ...inputStyle, minHeight: 90 }}
                />
              </div>
            </div>

            <h4 style={{ margin: "10px 0 6px", color: "#0b2a6f" }}>Links & Portfolio</h4>

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
                <label style={labelStyle}>Portfolio URL (Optional)</label>
                <input
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>CV Link (Google Drive)</label>
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
            <h3 style={{ margin: "0 0 10px", color: "#0b2a6f" }}>Mentor Profile</h3>

            <div className="grid2">
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
                <label style={labelStyle}>Organization *</label>
                <input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Rootcode"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Graduation Year (Batch)</label>
                <input
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="2012"
                  style={inputStyle}
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

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Primary Interests / Expertise *</label>
                <input
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="AI, Cyber Security, Career Guidance (comma separated)"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Preferred Mentee Capacity (Slots)</label>
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
            marginTop: 14,
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

      <div style={{ textAlign: "center", marginTop: 10 }}>
        <Link className="link" style={linkStyle} to="/">
          ← Back to Home
        </Link>
      </div>
    </AuthLayout>
  );
}