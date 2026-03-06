// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getProfile } from "../api";
import { jwtDecode } from "jwt-decode";
import { badge, theme } from "../styles/ui";

export default function Profile(){

const navigate = useNavigate();
const [profile,setProfile] = useState(null);
const [loading,setLoading] = useState(true);
const [err,setErr] = useState("");

const token = useMemo(()=>localStorage.getItem("token"),[]);

const isAdmin = useMemo(()=>{
 try{
  if(!token) return false;
  const decoded = jwtDecode(token);
  return decoded?.role==="admin";
 }catch{return false}
},[token]);

useEffect(()=>{
 const run = async()=>{
  try{
   const t = localStorage.getItem("token");
   if(!t) return navigate("/login");

   const data = await getProfile(t);
   setProfile(data);
  }catch(e){
   setErr(e.message);
  }finally{
   setLoading(false);
  }
 };
 run();
},[navigate]);

const status = profile?.verification_status==="verified" ? "verified":"pending";

return(

<PageShell
title="My Profile"
subtitle="Your registration information"
right={
 isAdmin && (
   <Link to="/admin" style={adminBtn}>
     User Verification
   </Link>
 )
}
>

{err && <div style={error}>{err}</div>}

{loading ? (
 <div>Loading...</div>
) : (
 <div style={card}>

  <div style={{textAlign:"center",marginBottom:18}}>
    <span style={badge(status)}>
      {status==="verified"?"Verified":"Pending"}
    </span>
  </div>

  <div style={grid}>

    <Info label="Name" value={profile.full_name}/>
    <Info label="Email" value={profile.email}/>
    <Info
      label="Role"
      value={profile.role === "alumni" ? "Mentor (Alumni)" : "Mentee (Student)"}
    />

    {profile.role === "student" && (
      <>
        <Info label="Batch" value={profile.batch}/>
        <Info label="Interests" value={profile.interests}/>
        <Info label="About Yourself" value={profile.about_yourself}/>
        <Info label="Why Need Mentor" value={profile.why_need_mentor}/>
        <Info label="Goals" value={profile.goals}/>
        <Info label="LinkedIn" value={profile.linkedin_url}/>
        <Info label="GitHub" value={profile.github_url}/>
        <Info label="Portfolio" value={profile.portfolio_url}/>
        <Info label="CV" value={profile.cv_url}/>
      </>
    )}

    {profile.role === "alumni" && (
      <>
        <Info label="Job Title" value={profile.job_title}/>
        <Info label="Company" value={profile.company}/>
        <Info label="Graduation Year" value={profile.grad_year}/>
        <Info label="LinkedIn" value={profile.linkedin_url}/>
        <Info label="Expertise / Interests" value={profile.interests}/>
        <Info label="Preferred Mentee Capacity" value={profile.prefCapacity}/>
      </>
    )}

  </div>

 </div>
)}

</PageShell>

);
}

function Info({label,value}){
return(
<div style={info}>
<div style={labelStyle}>{label}</div>
<div style={valueStyle}>{value||"-"}</div>
</div>
)
}

const card={
 background:"white",
 padding:24,
 borderRadius:14,
 border:"1px solid rgba(11,42,111,0.12)"
}

const grid={
 display:"grid",
 gridTemplateColumns:"repeat(2,1fr)",
 gap:14
}

const info={
 background:"#f9fafc",
 padding:14,
 borderRadius:10,
 border:"1px solid rgba(11,42,111,0.08)"
}

const labelStyle={
 fontSize:12,
 textTransform:"uppercase",
 opacity:.7
}

const valueStyle={
 fontWeight:600,
 color:theme.blue
}

const adminBtn={
 background:theme.blue,
 color:"white",
 padding:"10px 16px",
 borderRadius:8,
 textDecoration:"none",
 fontWeight:600
}

const error={
 background:"#fee2e2",
 padding:10,
 borderRadius:8
}