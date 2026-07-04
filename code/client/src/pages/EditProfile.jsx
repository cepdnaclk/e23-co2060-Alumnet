import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import LoadingScreen from "../components/LoadingScreen";
import { getProfile, updateProfile } from "../api";
import { supabase } from "../supabase";

const DEPARTMENTS = [
  "Chemical & Process Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Electrical and Electronic Engineering",
  "Mechanical Engineering",
  "Manufacturing and Industrial Engineering",
];

export default function EditProfile() {
  const token = localStorage.getItem("token");

  const currentUser = useMemo(() => {
    try {
      if (!token) return null;
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  const role = currentUser?.role || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    avatar_url: "",
    department: "",

    batch: "",
    areas_of_interest: "",
    bio: "",
    motivation: "",
    goal: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    cv_url: "",

    graduation_year: "",
    job_title: "",
    organization: "",
    primary_interests: "",
    preferred_mentee_capacity: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getProfile(token);

        setForm({
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
          department: data.department || "",

          batch: data.batch || "",
          areas_of_interest: data.areas_of_interest || "",
          bio: data.bio || "",
          motivation: data.motivation || "",
          goal: data.goal || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          portfolio_url: data.portfolio_url || "",
          cv_url: data.cv_url || "",

          graduation_year: data.graduation_year || "",
          job_title: data.job_title || "",
          organization: data.organization || "",
          primary_interests: data.primary_interests || "",
          preferred_mentee_capacity: data.preferred_mentee_capacity || "",
        });
      } catch (e) {
        setErr(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErr("");

      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setForm((prev) => ({
        ...prev,
        avatar_url: publicData.publicUrl,
      }));
    } catch (e) {
      setErr(e.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErr("");
      setSuccess("");

      const payload =
        role === "student"
          ? {
              full_name: form.full_name,
              avatar_url: form.avatar_url,
              department: form.department,
              batch: form.batch,
              bio: form.bio,
              interests: form.areas_of_interest,
              motivation: form.motivation,
              goal: form.goal,
              linkedin_url: form.linkedin_url,
              github_url: form.github_url,
              portfolio_url: form.portfolio_url,
              cv_url: form.cv_url,
            }
          : {
              full_name: form.full_name,
              avatar_url: form.avatar_url,
              department: form.department,
              graduation_year: form.graduation_year
                ? Number(form.graduation_year)
                : null,
              job_title: form.job_title,
              organization: form.organization,
              bio: form.bio,
              interests: form.primary_interests,
              preferred_mentee_capacity: form.preferred_mentee_capacity
                ? Number(form.preferred_mentee_capacity)
                : null,
              linkedin_url: form.linkedin_url,
            };

      const data = await updateProfile(token, payload);
      setSuccess(data.message || "Profile updated successfully");
    } catch (e) {
      setErr(e.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen text="Loading profile..." />;
  }

  const isStudent = role === "student";
  const isAlumni = role === "alumni";

  return (
    <main className="editProfilePage">
      <style>{css}</style>
      <section className="editProfileCard">
      <form onSubmit={handleSubmit} className="editProfileForm">
        <div className="editProfileHero">
          <div className="editProfileIdentity">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="avatar" style={avatar} />
            ) : (
              <div style={avatarFallback}>
                {form.full_name?.slice(0, 1)?.toUpperCase() || "U"}
              </div>
            )}

            <div style={uploadArea}>
              <div style={uploadTitle}>Profile Picture</div>
              <div style={uploadSub}>Upload a profile image for your account.</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={fileInput}
              />
              {uploading && <div style={smallText}>Uploading...</div>}
            </div>
          </div>

          <div className="editProfileActions">
            <div style={noteText}>*Email and password cannot be changed here.</div>

            <button
              className="saveProfileBtn"
              type="submit"
              disabled={saving || uploading}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            {success && <div style={successBox}>{success}</div>}
            {err && <div style={errorBox}>{err}</div>}
          </div>
        </div>

        <div className="editDetailsGrid">
          <section>
            <h3 style={sectionTitle}>Personal Details</h3>
            <div style={editRowsWrap}>
              <EditRow label="Full Name">
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  style={input}
                />
              </EditRow>

              <EditRow label="Department">
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  style={input}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </EditRow>

              {isStudent && (
                <>
                  <EditRow label="Batch">
                    <input
                      name="batch"
                      value={form.batch}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>

                  <EditRow label="Bio">
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      style={textarea}
                    />
                  </EditRow>

                  <EditRow label="Motivation">
                    <textarea
                      name="motivation"
                      value={form.motivation}
                      onChange={handleChange}
                      style={textarea}
                    />
                  </EditRow>

                  <EditRow label="Goal">
                    <textarea
                      name="goal"
                      value={form.goal}
                      onChange={handleChange}
                      style={textarea}
                    />
                  </EditRow>
                </>
              )}

              {isAlumni && (
                <>
                  <EditRow label="Graduation Year">
                    <input
                      type="number"
                      name="graduation_year"
                      value={form.graduation_year}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>

                  <EditRow label="Bio">
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      style={textarea}
                    />
                  </EditRow>

                  <EditRow label="Mentee Capacity">
                    <input
                      type="number"
                      min="0"
                      name="preferred_mentee_capacity"
                      value={form.preferred_mentee_capacity}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>
                </>
              )}
            </div>
          </section>

          <section>
            <h3 style={sectionTitle}>Professional Details</h3>
            <div style={editRowsWrap}>
              {isStudent && (
                <>
                  <EditRow label="Areas of Interest">
                    <input
                      name="areas_of_interest"
                      value={form.areas_of_interest}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>

                  <EditRow label="LinkedIn">
                    <input
                      name="linkedin_url"
                      value={form.linkedin_url}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>

                  <EditRow label="GitHub">
                    <input
                      name="github_url"
                      value={form.github_url}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>

                  <EditRow label="Portfolio">
                    <input
                      name="portfolio_url"
                      value={form.portfolio_url}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>

                  <EditRow label="CV">
                    <input
                      name="cv_url"
                      value={form.cv_url}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>
                </>
              )}

              {isAlumni && (
                <>
                  <EditRow label="Job Title">
                    <input
                      name="job_title"
                      value={form.job_title}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>

                  <EditRow label="Company">
                    <input
                      name="organization"
                      value={form.organization}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>

                  <EditRow label="Expertise / Interests">
                    <textarea
                      name="primary_interests"
                      value={form.primary_interests}
                      onChange={handleChange}
                      style={textarea}
                    />
                  </EditRow>

                  <EditRow label="LinkedIn URL">
                    <input
                      name="linkedin_url"
                      value={form.linkedin_url}
                      onChange={handleChange}
                      style={input}
                    />
                  </EditRow>
                </>
              )}
            </div>
          </section>
        </div>
      </form>
      </section>
    </main>
  );
}

function EditRow({ label, children }) {
  return (
    <div className="editRow">
      <div className="editRowLabel">{label}</div>
      <div>{children}</div>
    </div>
  );
}

const css = `
.editProfilePage{
  position:relative;
  min-height:100vh;
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  padding:12px 22px 34px;
  animation:editProfileDissolve .22s ease both;
  overflow-x:hidden;
}

.editProfileCard{
  width:min(1340px, 100%);
  margin:0 auto;
  border-radius:22px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.22);
  overflow:hidden;
}

.editProfileForm{
  padding:0 34px 30px;
}

.editProfileHero{
  display:grid;
  grid-template-columns:minmax(0, 1fr) auto;
  align-items:center;
  gap:18px;
  margin:0 -34px 28px;
  padding:34px 34px 30px;
  background:#fafbfc;
  border-bottom:1px solid rgba(0,0,0,.06);
}

.editProfileIdentity{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:18px;
  flex-wrap:wrap;
  min-width:0;
}

.editProfileActions{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:10px;
  max-width:360px;
}

.saveProfileBtn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  padding:0 12px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-family:"Google Sans";
  font-size:13px;
  font-weight:500;
  line-height:1;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease, opacity .18s ease;
}

.saveProfileBtn:hover:not(:disabled){
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

.saveProfileBtn:disabled{
  opacity:.68;
  cursor:not-allowed;
}

.editDetailsGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:26px;
}

.editRow{
  display:grid;
  grid-template-columns:180px minmax(0, 1fr);
  gap:16px;
  padding:7px 0;
  border-bottom:1px solid rgba(0,0,0,.06);
}

.editRowLabel{
  color:rgba(17,17,17,.50);
  font-size:13px;
}

@keyframes editProfileDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@media (max-width:900px){
  .editDetailsGrid{
    grid-template-columns:1fr;
    gap:28px;
  }

  .editProfileForm{
    padding:0 20px 26px;
  }

  .editProfileHero{
    grid-template-columns:1fr;
    margin:0 -20px 26px;
    padding:28px 20px 26px;
  }

  .editProfileActions{
    align-items:center;
    max-width:100%;
  }
}

@media (max-width:640px){
  .editProfilePage{
    padding:10px 14px 36px;
  }

  .editProfileCard{
    border-radius:18px;
  }

  .editProfileForm{
    padding:0 14px 24px;
  }

  .editProfileHero{
    margin:0 -14px 24px;
    padding:24px 14px 22px;
  }

  .editDetailsGrid{
    gap:24px;
  }

  .editRow{
    grid-template-columns:1fr;
    gap:5px;
  }
}
`;

const avatar = {
  width: 74,
  height: 74,
  borderRadius: "50%",
  objectFit: "cover",
  border: "1px solid rgba(0,0,0,0.06)",
};

const avatarFallback = {
  width: 74,
  height: 74,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#ecebe7",
  color: "#111111",
  fontSize: 26,
  fontWeight: 400,
};

const uploadArea = {
  display: "grid",
  gap: 6,
};

const uploadTitle = {
  fontSize: 14,
  color: "#111111",
};

const uploadSub = {
  fontSize: 13,
  color: "rgba(17,17,17,0.54)",
};

const fileInput = {
  width: "100%",
  maxWidth: 300,
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.05)",
  background: "#f3f5f8",
  fontFamily: '"Google Sans"',
  fontSize: 14,
};

const smallText = {
  fontSize: 13,
  color: "rgba(17,17,17,0.54)",
};

const sectionTitle = {
  margin: "0 0 8px",
  fontSize: 13,
  fontWeight: 600,
  color: "#111111",
};

const editRowsWrap = {
  display: "grid",
};

const input = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.05)",
  background: "#f3f5f8",
  color: "#111111",
  fontFamily: '"Google Sans"',
  fontSize: 13,
  outline: "none",
};

const textarea = {
  ...input,
  minHeight: 96,
  resize: "vertical",
};

const noteText = {
  fontSize: 14,
  color: "rgba(199, 52, 52, 0.99)",
  textAlign: "right",
};

const successBox = {
  background: "rgba(220,252,231,0.92)",
  padding: "8px 11px",
  borderRadius: 999,
  marginTop: 0,
  color: "#166534",
  border: "1px solid rgba(34,197,94,0.14)",
  fontSize: 13,
  lineHeight: 1.2,
};

const errorBox = {
  background: "rgba(254,226,226,0.94)",
  padding: "8px 11px",
  borderRadius: 999,
  marginTop: 0,
  color: "#b91c1c",
  border: "1px solid rgba(239,68,68,0.12)",
  fontSize: 13,
  lineHeight: 1.2,
};
