import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { getMyRegisteredEvents } from "../api";

export default function MyEvents(){

const token = localStorage.getItem("token");

const [events,setEvents] = useState([]);
const [loading,setLoading] = useState(true);
const [err,setErr] = useState("");

useEffect(()=>{

const load = async()=>{

 try{
  setLoading(true);
  setErr("");

  const data = await getMyRegisteredEvents(token);
  setEvents(data);

 }catch(e){
  setErr(e.message || "Failed to load registered events");
 }
 finally{
  setLoading(false);
 }

};

load();

},[token]);

return(

<PageShell
title="My Events"
subtitle="Events you have joined"
>

{err && <div style={errorBox}>{err}</div>}

{loading ? (
<div>Loading...</div>
) : events.length === 0 ? (
<div>You have not joined any events yet.</div>
) : (

<div style={grid}>

{events.map(event=>(

<div key={event.id} style={card}>

<h3 style={title}>{event.title}</h3>
<br></br>

<div style={meta}>Date: {event.event_date}</div>
<div style={meta}>Time: {event.event_time}</div>
<div style={meta}>Venue: {event.venue}</div>
<div style={meta}>Created By: {event.created_by_name}</div>

<div style={meta}>
Registered At: {new Date(event.registered_at).toLocaleString()}
</div>
<br></br>
{event.description && <p style={desc}>{event.description}</p>}
<br></br>
</div>

))}

</div>

)}

</PageShell>

);

}

const grid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
gap:20
};

const card={
padding:20,
borderRadius:16,
background:"rgba(255,255,255,0.7)",
border:"1px solid rgba(0,0,0,0.06)",
backdropFilter:"blur(6px)"
};

const title={
margin:0,
fontSize:18,
fontWeight: 500
};

const meta={
marginTop:6,
fontSize:14,
color:"rgba(17,17,17,0.72)"
};

const desc={
marginTop:10,
fontSize:14,
color:"rgba(12, 11, 11, 0.86)"
};

const errorBox={
background:"#fee2e2",
padding:12,
borderRadius:12,
marginBottom:14
};