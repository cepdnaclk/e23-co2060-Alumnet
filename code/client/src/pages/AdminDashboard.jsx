// src/pages/AdminDashboard.jsx
import { useEffect,useState } from "react";
import PageShell from "../components/PageShell";
import { Link,useNavigate } from "react-router-dom";
import { theme } from "../styles/ui";

export default function AdminDashboard(){

const navigate = useNavigate();

const [pending,setPending] = useState([]);
const [loading,setLoading] = useState(true);
const [err,setErr] = useState("");

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const loadUsers = async()=>{
 try{
  const token = localStorage.getItem("token");
  if(!token) return navigate("/login");

  const res = await fetch(`${API_URL}/api/auth/admin/pending`,{
   headers:{Authorization:`Bearer ${token}`}
  });

  const data = await res.json();
  if(!res.ok) throw new Error(data.message);

  setPending(data.users||data);

 }catch(e){
  setErr(e.message);
 }finally{
  setLoading(false);
 }
};

const verifyUser = async(id)=>{
 try{

  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/api/auth/admin/verify/${id}`,{
   method:"PATCH",
   headers:{Authorization:`Bearer ${token}`}
  });

  loadUsers();

 }catch(e){
  setErr(e.message);
 }
};

useEffect(()=>{
 loadUsers();
},[]);

return(

<PageShell
title="User Verification"
subtitle="Approve alumni and student accounts"
right={
 <Link to="/profile" style={backBtn}>
  Back to Profile
 </Link>
}
>

{err && <div style={error}>{err}</div>}

{loading ? (
 <div>Loading...</div>
) : pending.length===0 ? (
 <div>No pending users 🎉</div>
) : (

<div style={list}>

{pending.map((u)=>(
<div key={u.user_id||u.id} style={card}>

<div>
<div style={name}>{u.full_name}</div>
<div>{u.email}</div>
<div style={{fontSize:13}}>Role: {u.role}</div>
</div>

<button
style={verifyBtn}
onClick={()=>verifyUser(u.user_id||u.id)}
>
Verify User
</button>

</div>
))}

</div>

)}

</PageShell>

);
}

const list={
 display:"grid",
 gap:12
}

const card={
 background:"white",
 padding:16,
 borderRadius:12,
 border:"1px solid rgba(11,42,111,0.12)",
 display:"flex",
 justifyContent:"space-between",
 alignItems:"center"
}

const name={
 fontWeight:700,
 color:theme.blue
}

const verifyBtn={
 background:theme.blue,
 color:"white",
 border:"none",
 padding:"10px 14px",
 borderRadius:8,
 cursor:"pointer"
}

const backBtn={
 background:theme.blue,
 color:"white",
 padding:"10px 14px",
 borderRadius:8,
 textDecoration:"none"
}

const error={
 background:"#fee2e2",
 padding:10,
 borderRadius:8,
 marginBottom:10
}