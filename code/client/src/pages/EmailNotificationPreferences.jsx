import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getEmailPreferences,
  updateEmailPreferences,
} from "../api";

function getLoggedInRole() {
  try {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (storedUser?.role) {
      return storedUser.role;
    }
  } catch (error) {
    console.error("Failed to read stored user:", error);
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return "";
    }

    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return "";
    }

    const normalizedPayload = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      decodeURIComponent(
        window
          .atob(normalizedPayload)
          .split("")
          .map(
            (character) =>
              `%${character
                .charCodeAt(0)
                .toString(16)
                .padStart(2, "0")}`
          )
          .join("")
      )
    );

    return payload?.role || "";
  } catch (error) {
    console.error("Failed to read role from token:", error);
    return "";
  }
}

function getPreferenceOptions(role) {
  if (role === "student") {
    return [
      {
        key: "email_mentorship_notifications",
        title: "Mentorship emails",
        description:
          "Receive emails when your mentorship request is accepted or rejected, and when a mentorship ends.",
        icon: Users,
      },
      {
        key: "email_event_notifications",
        title: "Event emails",
        description:
          "Receive emails when new approved events are available for students.",
        icon: CalendarDays,
      },
      {
        key: "email_account_notifications",
        title: "Account emails",
        description:
          "Receive important emails about your Alumnet account status.",
        icon: ShieldCheck,
      },
    ];
  }

  if (role === "alumni") {
    return [
      {
        key: "email_mentorship_notifications",
        title: "Mentorship emails",
        description:
          "Receive emails about new mentorship requests and requests to end a mentorship.",
        icon: Users,
      },
      {
        key: "email_event_notifications",
        title: "Event emails",
        description:
          "Receive emails about event approval decisions and new student registrations for your events.",
        icon: CalendarDays,
      },
      {
        key: "email_account_notifications",
        title: "Account emails",
        description:
          "Receive important emails about your Alumnet account status.",
        icon: ShieldCheck,
      },
    ];
  }

  if (
    role === "university_admin" ||
    role === "system_admin"
  ) {
    return [
      {
        key: "email_event_notifications",
        title: "Event emails",
        description:
          "Receive emails when alumni submit new events that require administrator approval.",
        icon: CalendarDays,
      },
      {
        key: "email_account_notifications",
        title: "Account emails",
        description:
          "Receive important emails related to your Alumnet account.",
        icon: ShieldCheck,
      },
    ];
  }

  return [
    {
      key: "email_mentorship_notifications",
      title: "Mentorship emails",
      description:
        "Receive email updates related to mentorship activities.",
      icon: Users,
    },
    {
      key: "email_event_notifications",
      title: "Event emails",
      description:
        "Receive email updates related to events.",
      icon: CalendarDays,
    },
    {
      key: "email_account_notifications",
      title: "Account emails",
      description:
        "Receive important emails related to your account.",
      icon: ShieldCheck,
    },
  ];
}

export default function EmailNotificationPreferences() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = getLoggedInRole();

  const options = useMemo(
    () => getPreferenceOptions(role),
    [role]
  );

  const [preferences, setPreferences] = useState({
    email_mentorship_notifications: false,
    email_event_notifications: false,
    email_account_notifications: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEmailPreferences(token);

        setPreferences({
          email_mentorship_notifications: Boolean(
            data.email_mentorship_notifications
          ),
          email_event_notifications: Boolean(
            data.email_event_notifications
          ),
          email_account_notifications: Boolean(
            data.email_account_notifications
          ),
        });
      } catch (err) {
        setError(
          err.message ||
            "Failed to load email preferences"
        );
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      setError("Please log in to manage your preferences.");
      setLoading(false);
      return;
    }

    loadPreferences();
  }, [token]);

  const togglePreference = (key) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setMessage("");
    setError("");
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const data = await updateEmailPreferences(
        token,
        preferences
      );

      setMessage(
        data.message ||
          "Your email preferences have been saved."
      );

      window.setTimeout(() => {
        navigate("/home", { replace: true });
      }, 650);
    } catch (err) {
      setError(
        err.message ||
          "Failed to save email preferences"
      );
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = () => {
    if (role === "student") {
      return "Choose which student email updates you would like to receive.";
    }

    if (role === "alumni") {
      return "Choose which alumni email updates you would like to receive.";
    }

    if (
      role === "university_admin" ||
      role === "system_admin"
    ) {
      return "Choose which administrator email updates you would like to receive.";
    }

    return "Turn on only the email categories you want.";
  };

  return (
    <main className="emailPreferencePage">
      <style>{css}</style>

      <section className="emailPreferenceCard">
        <header className="emailPreferenceHero">
          <div className="emailPreferenceHeroContent">
            <div
              className="emailPreferenceHeroIcon"
              aria-hidden="true"
            >
              <Bell size={21} strokeWidth={2} />
            </div>

            <div>
              <h1>Email preferences</h1>

              <p>
                {getRoleLabel()} You can change these
                settings again at any time.
              </p>
            </div>
          </div>
        </header>

        <div className="emailPreferenceContent">
          {loading ? (
            <div className="loadingState">
              Loading preferences...
            </div>
          ) : (
            <>
              <div className="preferenceList">
                {options.map(
                  ({
                    key,
                    title,
                    description,
                    icon: Icon,
                  }) => {
                    const enabled = preferences[key];

                    return (
                      <button
                        key={key}
                        type="button"
                        className={`preferenceItem ${
                          enabled ? "enabled" : ""
                        }`}
                        onClick={() =>
                          togglePreference(key)
                        }
                        aria-pressed={enabled}
                      >
                        <span
                          className="preferenceIcon"
                          aria-hidden="true"
                        >
                          <Icon
                            size={19}
                            strokeWidth={2}
                          />
                        </span>

                        <span className="preferenceText">
                          <strong>{title}</strong>
                          <small>{description}</small>
                        </span>

                        <span
                          className={`toggleSwitch ${
                            enabled ? "active" : ""
                          }`}
                          aria-hidden="true"
                        >
                          <span />
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              <div className="informationBox">
                <CheckCircle2
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  Verification emails will always be sent.
                  In-app notifications will still appear when
                  optional email notifications are turned off.
                </span>
              </div>

              {error && (
                <div className="stateBox error">
                  {error}
                </div>
              )}

              {message && (
                <div className="stateBox success">
                  {message}
                </div>
              )}

              <div className="actionRow">
                <button
                  className="backButton"
                  type="button"
                  onClick={() => navigate("/settings")}
                  disabled={saving}
                >
                  Back
                </button>

                <button
                  className="saveButton"
                  type="button"
                  onClick={savePreferences}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

const css = `
.emailPreferencePage{
  position:relative;
  min-height:100vh;
  padding:12px 22px 34px;
  background:transparent;
  color:#111111;
  font-family:"Google Sans",Arial,sans-serif;
  animation:preferenceDissolve .22s ease both;
  overflow-x:hidden;
}

.emailPreferenceCard{
  width:min(1340px,100%);
  margin:0 auto;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.84);
  border-radius:22px;
  background:#ffffff;
  box-shadow:0 28px 72px rgba(0,0,0,.22);
}

.emailPreferenceHero{
  padding:34px;
  background:#fafbfc;
  border-bottom:1px solid rgba(0,0,0,.06);
}

.emailPreferenceHeroContent{
  display:flex;
  align-items:center;
  gap:15px;
}

.emailPreferenceHeroIcon{
  width:44px;
  height:44px;
  flex:0 0 auto;
  display:grid;
  place-items:center;
  border-radius:12px;
  background:#111111;
  color:#ffffff;
  box-shadow:0 10px 24px rgba(0,0,0,.14);
}

.emailPreferenceHero h1{
  margin:0;
  font-size:22px;
  line-height:1.2;
  font-weight:500;
}

.emailPreferenceHero p{
  margin:6px 0 0;
  color:rgba(17,17,17,.54);
  font-size:13px;
  line-height:1.45;
}

.emailPreferenceContent{
  padding:28px 34px 34px;
}

.preferenceList{
  display:grid;
  gap:12px;
}

.preferenceItem{
  width:100%;
  min-height:82px;
  padding:16px 18px;
  border:1px solid rgba(0,0,0,.06);
  border-radius:14px;
  background:#f3f5f8;
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  gap:15px;
  color:#111111;
  text-align:left;
  cursor:pointer;
  transition:
    transform .18s ease,
    border-color .18s ease,
    background .18s ease,
    box-shadow .18s ease;
}

.preferenceItem:hover{
  transform:translateY(-1px);
  border-color:rgba(47,95,245,.18);
  box-shadow:0 8px 18px rgba(0,0,0,.05);
}

.preferenceItem.enabled{
  background:rgba(47,95,245,.055);
  border-color:rgba(47,95,245,.22);
}

.preferenceIcon{
  width:40px;
  height:40px;
  display:grid;
  place-items:center;
  border-radius:11px;
  background:#ffffff;
  color:#2457d6;
  box-shadow:0 5px 14px rgba(0,0,0,.05);
}

.preferenceText{
  min-width:0;
}

.preferenceText strong{
  display:block;
  font-size:14px;
  line-height:1.35;
  font-weight:500;
}

.preferenceText small{
  display:block;
  margin-top:5px;
  color:rgba(17,17,17,.52);
  font-size:12px;
  line-height:1.45;
}

.toggleSwitch{
  position:relative;
  width:44px;
  height:25px;
  flex:0 0 auto;
  border-radius:999px;
  background:#d6dbe1;
  transition:background .2s ease;
}

.toggleSwitch span{
  position:absolute;
  top:3px;
  left:3px;
  width:19px;
  height:19px;
  border-radius:50%;
  background:#ffffff;
  box-shadow:0 2px 5px rgba(0,0,0,.18);
  transition:transform .2s ease;
}

.toggleSwitch.active{
  background:#111111;
}

.toggleSwitch.active span{
  transform:translateX(19px);
}

.informationBox{
  display:flex;
  align-items:flex-start;
  gap:9px;
  margin-top:16px;
  padding:13px 14px;
  border-radius:12px;
  background:#eef2f6;
  color:rgba(17,17,17,.58);
  font-size:12px;
  line-height:1.5;
}

.informationBox svg{
  flex:0 0 auto;
  margin-top:1px;
}

.loadingState{
  padding:40px 18px;
  border-radius:14px;
  background:#f3f5f8;
  color:rgba(17,17,17,.54);
  text-align:center;
  font-size:13px;
}

.stateBox{
  margin-top:14px;
  padding:11px 13px;
  border-radius:10px;
  font-size:12px;
  line-height:1.45;
}

.stateBox.success{
  border:1px solid rgba(23,151,92,.16);
  background:rgba(23,151,92,.10);
  color:#087443;
}

.stateBox.error{
  border:1px solid rgba(194,57,52,.15);
  background:rgba(194,57,52,.09);
  color:#b42318;
}

.actionRow{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:10px;
  margin-top:22px;
  padding-top:20px;
  border-top:1px solid rgba(0,0,0,.06);
}

.backButton,
.saveButton{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  padding:0 13px;
  border-radius:999px;
  font-family:"Google Sans",Arial,sans-serif;
  font-size:13px;
  font-weight:500;
  line-height:1;
  cursor:pointer;
  transition:
    transform .18s ease,
    box-shadow .18s ease,
    opacity .18s ease,
    background .18s ease,
    color .18s ease;
}

.backButton{
  border:1px solid rgba(0,0,0,.10);
  background:#ffffff;
  color:#111111;
}

.backButton:hover:not(:disabled){
  background:#eef1f4;
  transform:translateY(-1px);
}

.saveButton{
  border:1px solid #050505;
  background:#050505;
  color:#ffffff;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
}

.saveButton:hover:not(:disabled){
  border-color:#eef1f4;
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

.backButton:disabled,
.saveButton:disabled{
  cursor:not-allowed;
  opacity:.62;
}

@keyframes preferenceDissolve{
  from{
    opacity:0;
    transform:translateY(4px);
  }

  to{
    opacity:1;
    transform:translateY(0);
  }
}

@media(max-width:900px){
  .emailPreferenceHero{
    padding:28px 20px 26px;
  }

  .emailPreferenceContent{
    padding:26px 20px;
  }
}

@media(max-width:640px){
  .emailPreferencePage{
    padding:10px 14px 36px;
  }

  .emailPreferenceCard{
    border-radius:18px;
  }

  .emailPreferenceHero{
    padding:24px 14px 22px;
  }

  .emailPreferenceHeroIcon{
    width:40px;
    height:40px;
  }

  .emailPreferenceHero h1{
    font-size:20px;
  }

  .emailPreferenceContent{
    padding:22px 14px 24px;
  }

  .preferenceItem{
    min-height:76px;
    padding:14px 13px;
    gap:11px;
  }

  .preferenceIcon{
    width:36px;
    height:36px;
  }

  .actionRow{
    display:grid;
    grid-template-columns:1fr 1fr;
  }

  .backButton,
  .saveButton{
    width:100%;
  }
}

@media(max-width:420px){
  .preferenceItem{
    grid-template-columns:auto minmax(0,1fr);
  }

  .toggleSwitch{
    grid-column:2;
    justify-self:start;
    margin-top:2px;
  }

  .actionRow{
    grid-template-columns:1fr;
  }

  .saveButton{
    order:1;
  }

  .backButton{
    order:2;
  }
}
`;