import {
  Bell,
  ChevronRight,
  Pencil,
  Settings as SettingsIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const settingItems = [
  {
    title: "Edit profile",
    description:
      "Update your personal, academic and professional information.",
    icon: Pencil,
    path: "/edit-profile",
  },
  {
    title: "Notification preferences",
    description:
      "Choose which Alumnet updates you would like to receive by email.",
    icon: Bell,
    path: "/settings/email-notifications",
  },
];

export default function Settings() {
  const navigate = useNavigate();

  return (
    <main className="settingsPage">
      <style>{css}</style>

      <section className="settingsCard">
        <header className="settingsHero">
          <div className="settingsHeroContent">
            <div className="settingsHeroIcon" aria-hidden="true">
              <SettingsIcon size={21} strokeWidth={2} />
            </div>

            <div>
              <h1>Settings</h1>
              <p>
                Manage your profile and notification preferences.
              </p>
            </div>
          </div>
        </header>

        <div className="settingsContent">
          <div className="settingsSectionHeading">
            <h2>Account settings</h2>
            <p>
              Select an option to view or update your account settings.
            </p>
          </div>

          <div className="settingsList">
            {settingItems.map(
              ({ title, description, icon: Icon, path }) => (
                <button
                  key={path}
                  className="settingsItem"
                  type="button"
                  onClick={() => navigate(path)}
                >
                  <span
                    className="settingsItemIcon"
                    aria-hidden="true"
                  >
                    <Icon size={19} strokeWidth={2} />
                  </span>

                  <span className="settingsItemText">
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>

                  <ChevronRight
                    className="settingsChevron"
                    size={19}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </button>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

const css = `
.settingsPage{
  position:relative;
  min-height:100vh;
  padding:12px 22px 34px;
  background:transparent;
  color:#111111;
  font-family:"Google Sans",Arial,sans-serif;
  animation:settingsDissolve .22s ease both;
  overflow-x:hidden;
}

.settingsCard{
  width:min(1340px,100%);
  margin:0 auto;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.84);
  border-radius:22px;
  background:#ffffff;
  box-shadow:0 28px 72px rgba(0,0,0,.22);
}

.settingsHero{
  padding:34px;
  background:#fafbfc;
  border-bottom:1px solid rgba(0,0,0,.06);
}

.settingsHeroContent{
  display:flex;
  align-items:center;
  gap:15px;
}

.settingsHeroIcon{
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

.settingsHero h1{
  margin:0;
  font-size:22px;
  line-height:1.2;
  font-weight:500;
}

.settingsHero p{
  margin:6px 0 0;
  color:rgba(17,17,17,.54);
  font-size:13px;
  line-height:1.45;
}

.settingsContent{
  padding:28px 34px 34px;
}

.settingsSectionHeading{
  margin-bottom:16px;
}

.settingsSectionHeading h2{
  margin:0;
  font-size:14px;
  line-height:1.3;
  font-weight:600;
}

.settingsSectionHeading p{
  margin:6px 0 0;
  color:rgba(17,17,17,.52);
  font-size:13px;
  line-height:1.45;
}

.settingsList{
  overflow:hidden;
  border:1px solid rgba(0,0,0,.07);
  border-radius:14px;
  background:#ffffff;
}

.settingsItem{
  width:100%;
  min-height:82px;
  padding:16px 18px;
  border:0;
  border-bottom:1px solid rgba(0,0,0,.06);
  background:#ffffff;
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  gap:15px;
  color:#111111;
  text-align:left;
  cursor:pointer;
  transition:
    background .18s ease,
    transform .18s ease;
}

.settingsItem:last-child{
  border-bottom:0;
}

.settingsItem:hover{
  background:#f3f5f8;
}

.settingsItem:active{
  transform:scale(.998);
}

.settingsItemIcon{
  width:40px;
  height:40px;
  display:grid;
  place-items:center;
  border-radius:11px;
  background:#eef4ff;
  color:#2457d6;
}

.settingsItemText{
  min-width:0;
}

.settingsItemText strong{
  display:block;
  font-size:14px;
  line-height:1.35;
  font-weight:500;
}

.settingsItemText small{
  display:block;
  margin-top:5px;
  color:rgba(17,17,17,.52);
  font-size:12px;
  line-height:1.45;
}

.settingsChevron{
  color:rgba(17,17,17,.36);
  transition:
    transform .18s ease,
    color .18s ease;
}

.settingsItem:hover .settingsChevron{
  color:#111111;
  transform:translateX(3px);
}

@keyframes settingsDissolve{
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
  .settingsHero{
    padding:28px 20px 26px;
  }

  .settingsContent{
    padding:26px 20px;
  }
}

@media(max-width:640px){
  .settingsPage{
    padding:10px 14px 36px;
  }

  .settingsCard{
    border-radius:18px;
  }

  .settingsHero{
    padding:24px 14px 22px;
  }

  .settingsHeroIcon{
    width:40px;
    height:40px;
  }

  .settingsHero h1{
    font-size:20px;
  }

  .settingsContent{
    padding:22px 14px 24px;
  }

  .settingsItem{
    min-height:76px;
    padding:14px 13px;
    gap:11px;
  }

  .settingsItemIcon{
    width:36px;
    height:36px;
  }
}

@media(max-width:420px){
  .settingsItem{
    grid-template-columns:auto minmax(0,1fr);
  }

  .settingsChevron{
    display:none;
  }
}
`;