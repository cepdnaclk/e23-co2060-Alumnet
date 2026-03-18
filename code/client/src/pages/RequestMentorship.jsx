import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { createMentorshipRequest } from "../api";

export default function RequestMentorship(){

const { id } = useParams();
const navigate = useNavigate();

const [message,setMessage] = useState("");
const [loading,setLoading] = useState(false);
const [error,setError] = useState("");
const [success,setSuccess] = useState("");

const token = localStorage.getItem("token");

const sendRequest = async ()=>{

 setLoading(true);
 setError("");
 setSuccess("");

 try{

  const res = await createMentorshipRequest(token,{
   alumni_user_id:Number(id),
   message
  });

  setSuccess(res.message);
  setMessage("");

 }catch(e){
  setError(e.message);
 }

 setLoading(false);

};

return(

<PageShell
title="Request Mentorship"
subtitle="Send a mentorship request to this alumni"
right={
<button onClick={()=>navigate(-1)} style={secondaryBtn}>
Back
</button>
}
>

<div style={pageWrap}>

<div style={card}>

<h3 style={sectionTitle}>Message to Mentor</h3>

<textarea
value={message}
onChange={(e)=>setMessage(e.target.value)}
placeholder="Explain why you want mentorship..."
style={textarea}
/>

<button
style={primaryBtn}
onClick={sendRequest}
disabled={loading}
>
{loading ? "Sending..." : "Send Request"}
</button>

{success && <div style={successBox}>{success}</div>}
{error && <div style={errorBox}>{error}</div>}

</div>

</div>

</PageShell>

);
}

const pageWrap={
paddingTop:10
}

const card={
padding:24,
borderRadius:16,
background:"rgba(255,255,255,0.7)",
border:"1px solid rgba(0,0,0,0.06)",
backdropFilter:"blur(6px)",
maxWidth:520
}

const sectionTitle={
margin:"0 0 14px",
fontSize:15,
fontWeight:400,
color:"#111"
}

const textarea={
width:"100%",
minHeight:140,
padding:14,
borderRadius:12,
border:"1px solid rgba(0,0,0,0.08)",
background:"rgba(255,255,255,0.7)",
resize:"vertical",
marginBottom:16,
fontFamily:'"Google Sans", Arial, sans-serif'
}

const primaryBtn={
background:"rgba(255,255,255,0.8)",
color:"#111",
padding:"10px 18px",
borderRadius:999,
border:"1px solid rgba(0,0,0,0.08)",
cursor:"pointer",
fontSize: 14,
fontFamily:'"Google Sans", Arial, sans-serif'
}

const secondaryBtn={
background:"rgba(255,255,255,0.7)",
color:"#111",
padding:"10px 16px",
borderRadius:999,
border:"1px solid rgba(0,0,0,0.06)",
cursor:"pointer",
fontSize: 14,
fontFamily:'"Google Sans", Arial, sans-serif'
}

const successBox={
background:"#dcfce7",
padding:12,
borderRadius:12,
marginTop:14
}

const errorBox={
background:"#fee2e2",
padding:12,
borderRadius:12,
marginTop:14
}