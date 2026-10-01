import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, Download,
  Droplets, Home, Menu, Plus, RotateCcw, Settings, Sparkles, Trash2,
  Waves, X, BarChart3, Bell, Pencil, Clock3
} from "lucide-react";
import "./styles.css";

const KEY="hairWashDay.v1";
const todayISO=()=>new Date().toISOString().slice(0,10);
const fmt=(iso, opts={day:"numeric",month:"long",year:"numeric"}) =>
  new Date(iso+"T12:00:00").toLocaleDateString("en-US",opts);
const addDays=(iso,n)=>{const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const diffDays=(a,b)=>Math.round((new Date(a+"T12:00:00")-new Date(b+"T12:00:00"))/86400000);

const defaults={
  name:"Tithi", frequency:3, reminder:true, reminderTime:"09:00",
  washes:[], plans:[], routine:{}, theme:"light"
};

function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return defaults}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
function App(){
  const [state,setState]=useState(load);
  const [tab,setTab]=useState("home");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(todayISO());
  const [month,setMonth]=useState(new Date());
  useEffect(()=>save(state),[state]);

  const latest=[...state.washes].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const next=latest?addDays(latest.date,Number(state.frequency)):addDays(todayISO(),Number(state.frequency));
  const daysSince=latest?Math.max(0,diffDays(todayISO(),latest.date)):0;

  const update=(patch)=>setState(s=>({...s,...patch}));
  const logWash=(record)=>{
    update({washes:[...state.washes.filter(x=>x.id!==record.id),record].sort((a,b)=>a.date.localeCompare(b.date))});
    setModal(null);
  };
  const deleteWash=id=>update({washes:state.washes.filter(x=>x.id!==id)});
  const planDate=iso=>update({plans:[...new Set([...state.plans,iso])]});

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Waves size={21}/></div><div><b>Hair Wash Day</b><span>Track • Plan • Love</span></div></div>
      <Nav tab={tab} setTab={setTab}/>
      <div className="sidebar-bottom"><div className="mini-tip"><Sparkles size={16}/><span>Small routines become habits.</span></div></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="icon-btn mobile-only" onClick={()=>setModal({type:"menu"})}><Menu/></button>
        <div><div className="eyebrow">{new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}</div><h1>{tab==="home"?"Your hair-care space":tab==="calendar"?"Wash calendar":tab==="wash"?"Wash history":tab==="stats"?"Your progress":"Settings & routine"}</h1></div>
        <button className="avatar" onClick={()=>setTab("settings")}>{(state.name||"U").slice(0,1).toUpperCase()}</button>
      </header>

      {tab==="home" && <HomePage state={state} latest={latest} next={next} daysSince={daysSince} onLog={()=>setModal({type:"wash"})} onPlan={()=>setModal({type:"plan"})} setTab={setTab}/>}
      {tab==="calendar" && <CalendarPage state={state} month={month} setMonth={setMonth} selected={selected} setSelected={setSelected} onLog={d=>setModal({type:"wash",date:d})} onPlan={d=>{setSelected(d);setModal({type:"plan",date:d})}} deleteWash={deleteWash}/>}
      {tab==="wash" && <HistoryPage state={state} onLog={()=>setModal({type:"wash"})} onEdit={r=>setModal({type:"wash",record:r})} deleteWash={deleteWash}/>}
      {tab==="stats" && <StatsPage state={state}/>}
      {tab==="settings" && <SettingsPage state={state} update={update}/>}
    </main>

    <NavMobile tab={tab} setTab={setTab}/>
    {modal?.type==="wash" && <WashModal state={state} record={modal.record} initialDate={modal.date} onClose={()=>setModal(null)} onSave={logWash}/>}
    {modal?.type==="plan" && <PlanModal date={modal.date||selected} state={state} onClose={()=>setModal(null)} onPlan={d=>{planDate(d);setModal(null)}}/>}
    {modal?.type==="menu" && <div className="mobile-menu"><button className="close" onClick={()=>setModal(null)}><X/></button><Nav tab={tab} setTab={x=>{setTab(x);setModal(null)}}/></div>}
  </div>
}

function Nav({tab,setTab}){return <nav className="nav">{[
  ["home","Home",Home],["calendar","Calendar",CalendarDays],["wash","Wash",Droplets],["stats","Stats",BarChart3],["settings","Settings",Settings]
].map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={19}/><span>{label}</span></button>)}</nav>}
function NavMobile({tab,setTab}){return <div className="bottom-nav">{[["home","Home",Home],["calendar","Calendar",CalendarDays],["wash","Wash",Droplets],["stats","Stats",BarChart3],["settings","Settings",Settings]].map(([id,l,I])=><button className={tab===id?"active":""} onClick={()=>setTab(id)} key={id}><I size={19}/><span>{l}</span></button>)}</div>}

function HomePage({state,latest,next,daysSince,onLog,onPlan,setTab}){
  const remaining=diffDays(next,todayISO());
  return <section className="content">
    <div className="welcome"><div><p className="eyebrow">GOOD EVENING, {state.name?.toUpperCase()||"BEAUTY"} ✨</p><h2>Let’s keep your hair-care routine consistent.</h2></div><div className="sparkle"><Sparkles/></div></div>
    <div className="hero-card">
      <div className="hero-copy"><span className="label"><Droplets size={15}/> NEXT HAIR WASH</span><strong>{fmt(next,{weekday:"long",day:"numeric",month:"long"})}</strong><p>{remaining<=0?"It’s wash day ✨":`Wash in ${remaining} ${remaining===1?"day":"days"}`}</p>
      <div className="hero-actions"><button className="primary" onClick={onLog}><Plus size={18}/> Log Wash</button><button className="secondary" onClick={onPlan}><CalendarDays size={17}/> Plan Wash</button></div></div>
      <div className="ring"><div className="ring-inner"><b>{daysSince}</b><span>days<br/>since wash</span></div></div>
    </div>
    {!latest?<div className="empty-card"><div className="empty-icon">🫧</div><h3>Your hair journey starts here ✨</h3><p>Log your first wash day to start tracking your routine.</p><button className="primary" onClick={onLog}>Log First Wash</button></div>:
    <div className="grid-2"><div className="card"><div className="card-head"><div><span className="eyebrow">LAST WASH</span><h3>{fmt(latest.date,{day:"numeric",month:"long"})}</h3></div><div className="soft-icon"><Check/></div></div><p className="muted">{latest.type} · {latest.condition}</p><div className="chips">{latest.products?.map(x=><span key={x}>{x}</span>)}</div></div>
    <div className="card clickable" onClick={()=>setTab("calendar")}><div className="card-head"><div><span className="eyebrow">PLANNED DAYS</span><h3>{state.plans.length}</h3></div><div className="soft-icon"><CalendarDays/></div></div><p className="muted">Keep your routine visible on the calendar.</p></div></div>}
    <RoutinePreview state={state} update={()=>setTab("settings")}/>
  </section>
}

function RoutinePreview({state,update}){const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];return <div className="card routine-card"><div className="card-head"><div><span className="eyebrow">WEEKLY ROUTINE</span><h3>Your little ritual</h3></div><button className="text-btn" onClick={update}>Edit routine</button></div><div className="routine-row">{days.map(d=><div className="routine-day" key={d}><b>{d}</b><span>{state.routine[d]||"—"}</span></div>)}</div></div>}

function CalendarPage({state,month,setMonth,selected,setSelected,onLog,onPlan,deleteWash}){
  const y=month.getFullYear(),m=month.getMonth(), first=new Date(y,m,1), last=new Date(y,m+1,0);
  const start=(first.getDay()+6)%7, days=[];
  for(let i=0;i<start;i++)days.push(null); for(let d=1;d<=last.getDate();d++)days.push(new Date(y,m,d));
  const iso=d=>d.toISOString().slice(0,10), washes=new Map(state.washes.map(x=>[x.date,x])), plans=new Set(state.plans);
  return <section className="content"><div className="section-head"><div><p className="eyebrow">MONTH VIEW</p><h2>{month.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</h2></div><div className="month-nav"><button className="icon-btn" onClick={()=>setMonth(new Date(y,m-1,1))}><ChevronLeft/></button><button className="icon-btn" onClick={()=>setMonth(new Date(y,m+1,1))}><ChevronRight/></button></div></div>
    <div className="calendar card"><div className="weekdays">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=><b key={x}>{x}</b>)}</div><div className="calendar-grid">{days.map((d,i)=>{if(!d)return <div key={i} className="day blank"/>;const k=iso(d), w=washes.get(k), p=plans.has(k), isToday=k===todayISO(),isSel=k===selected;return <button key={k} className={`day ${isToday?"today":""} ${isSel?"selected":""}`} onClick={()=>setSelected(k)}><span>{d.getDate()}</span>{w&&<i className="wash-dot">💧</i>}{p&&!w&&<i className="plan-dot"/>}</button>})}</div></div>
    <div className="calendar-actions"><button className="primary" onClick={()=>onLog(selected)}><Plus size={18}/> Log on {fmt(selected,{month:"short",day:"numeric"})}</button><button className="secondary" onClick={()=>onPlan(selected)}><CalendarDays size={17}/> Plan this day</button></div>
    {washes.get(selected)&&<div className="card detail-card"><div className="card-head"><div><span className="eyebrow">SELECTED DAY</span><h3>{fmt(selected)}</h3></div><button className="icon-btn danger" onClick={()=>deleteWash(washes.get(selected).id)}><Trash2 size={17}/></button></div><p><b>{washes.get(selected).type}</b> · {washes.get(selected).condition}</p><div className="chips">{washes.get(selected).products?.map(x=><span key={x}>{x}</span>)}</div>{washes.get(selected).notes&&<p className="note">“{washes.get(selected).notes}”</p>}</div>}
  </section>
}

function HistoryPage({state,onLog,onEdit,deleteWash}){const records=[...state.washes].sort((a,b)=>b.date.localeCompare(a.date));return <section className="content"><div className="section-head"><div><p className="eyebrow">YOUR JOURNEY</p><h2>Wash history</h2></div><button className="primary" onClick={onLog}><Plus size={18}/> Log wash</button></div>{records.length===0?<div className="empty-card"><div className="empty-icon">🧴</div><h3>No wash days yet</h3><p>Your history will appear here after your first log.</p><button className="primary" onClick={onLog}>Log First Wash</button></div>:<div className="history-list">{records.map(r=><div className="card history-card" key={r.id}><div className="history-date"><div className="date-badge"><b>{new Date(r.date+"T12:00:00").getDate()}</b><span>{new Date(r.date+"T12:00:00").toLocaleDateString("en-US",{month:"short"})}</span></div><div><h3>{r.type}</h3><p className="muted">{r.condition} · {r.oiling}</p></div></div><div className="chips">{r.products?.map(x=><span key={x}>{x}</span>)}</div>{r.notes&&<p className="note">{r.notes}</p>}<div className="history-actions"><button onClick={()=>onEdit(r)}><Pencil size={15}/> Edit</button><button className="danger-text" onClick={()=>confirm("Delete this wash record?")&&deleteWash(r.id)}><Trash2 size={15}/> Delete</button></div></div>)}</div>}</section>}

function StatsPage({state}){const records=[...state.washes].sort((a,b)=>a.date.localeCompare(b.date));const now=new Date();const ym=now.toISOString().slice(0,7);const month=records.filter(x=>x.date.startsWith(ym)).length;const gaps=records.slice(1).map((x,i)=>diffDays(x.date,records[i].date));const avg=gaps.length?(gaps.reduce((a,b)=>a+b,0)/gaps.length).toFixed(1):"—";const longest=gaps.length?Math.max(...gaps):"—";let streak=0;if(records.length){let cursor=todayISO();for(let i=records.length-1;i>=0;i--){if(diffDays(cursor,records[i].date)<=Number(state.frequency)+1){streak++;cursor=records[i].date}else break}}const weeks=[0,1,2,3,4].map(w=>{const end=new Date(now);end.setDate(end.getDate()-w*7);const start=new Date(end);start.setDate(start.getDate()-6);return records.filter(r=>{const d=new Date(r.date+"T12:00:00");return d>=start&&d<=end}).length}).reverse();const max=Math.max(1,...weeks);return <section className="content"><div className="section-head"><div><p className="eyebrow">CONSISTENCY</p><h2>Your progress</h2></div><div className="soft-pill"><Sparkles size={15}/> Based on your logs</div></div><div className="stats-grid"><Stat title="Washes this month" value={month}/><Stat title="Average wash gap" value={avg==="—"?"—":avg+"d"}/><Stat title="Longest gap" value={longest==="—"?"—":longest+"d"}/><Stat title="Current streak" value={streak}/></div><div className="card chart-card"><div className="card-head"><div><span className="eyebrow">RECENT WEEKS</span><h3>Wash rhythm</h3></div><BarChart3/></div><div className="bars">{weeks.map((n,i)=><div className="bar-col" key={i}><div className="bar-wrap"><div className="bar" style={{height:`${Math.max(8,n/max*100)}%`}}/></div><span>W{i+1}</span><b>{n}</b></div>)}</div></div><div className="card insight"><Sparkles/><div><h3>Keep it simple</h3><p>These numbers describe your recorded routine only. They are not medical recommendations.</p></div></div></section>}
function Stat({title,value}){return <div className="card stat-card"><span className="eyebrow">{title}</span><strong>{value}</strong></div>}

function SettingsPage({state,update}){const [name,setName]=useState(state.name||"");const [custom,setCustom]=useState("");const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];const acts=["🌿 Oil","🧴 Hair Wash","✨ Hair Mask","🫧 Scalp Care","• Other"];function saveName(){update({name:name.trim()||"You"})}function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="hair-wash-day-data.json";a.click();URL.revokeObjectURL(a.href)}function clear(){if(confirm("Clear all Hair Wash Day data? This cannot be undone."))update({...defaults,name:""})}return <section className="content"><div className="section-head"><div><p className="eyebrow">PERSONALIZE</p><h2>Settings & routine</h2></div></div><div className="settings-grid"><div className="card settings-card"><h3>Profile</h3><label>Your name<input value={name} onChange={e=>setName(e.target.value)} onBlur={saveName}/></label><label>Wash frequency<select value={state.frequency} onChange={e=>update({frequency:Number(e.target.value)})}>{[2,3,4,5,7].map(n=><option key={n} value={n}>Every {n} days</option>)}<option value={1}>Custom — use 1 day</option></select></label></div>
<div className="card settings-card"><h3>Reminder</h3><div className="setting-row"><div><b>Wash reminder</b><span>Show an in-app reminder near wash day.</span></div><label className="switch"><input type="checkbox" checked={state.reminder} onChange={e=>update({reminder:e.target.checked})}/><span/></label></div><label>Reminder time<input type="time" value={state.reminderTime} onChange={e=>update({reminderTime:e.target.value})}/></label><p className="small-muted"><Bell size={14}/> Browser notification support depends on device permissions.</p></div>
<div className="card settings-card routine-settings"><div className="card-head"><h3>Weekly routine</h3><span className="soft-pill">Tap a day</span></div><div className="routine-editor">{days.map(d=><div key={d} className="routine-edit"><b>{d}</b><select value={state.routine[d]||""} onChange={e=>update({routine:{...state.routine,[d]:e.target.value}})}><option value="">—</option>{acts.map(a=><option key={a}>{a}</option>)}</select></div>)}</div></div>
<div className="card settings-card"><h3>Data</h3><div className="data-buttons"><button className="secondary" onClick={exportData}><Download size={17}/> Export JSON</button><button className="danger-button" onClick={clear}><Trash2 size={17}/> Clear all data</button></div><p className="small-muted">Your records stay in this browser using localStorage. No account or backend is required.</p></div></div></section>}

function WashModal({state,record,initialDate,onClose,onSave}){const [date,setDate]=useState(record?.date||initialDate||todayISO());const [type,setType]=useState(record?.type||"Regular Wash");const [products,setProducts]=useState(record?.products||["Shampoo","Conditioner"]);const [oiling,setOiling]=useState(record?.oiling||"No");const [condition,setCondition]=useState(record?.condition||"Normal");const [notes,setNotes]=useState(record?.notes||"");const [photo,setPhoto]=useState(record?.photo||"");const toggle=x=>setProducts(p=>p.includes(x)?p.filter(y=>y!==x):[...p,x]);const save=()=>{if(!date)return;onSave({id:record?.id||crypto.randomUUID(),date,type,products,oiling,condition,notes,photo})};return <Modal title={record?"Edit wash day":"Log hair wash"} onClose={onClose}><div className="form-grid"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Wash type<select value={type} onChange={e=>setType(e.target.value)}>{["Regular Wash","Deep Wash","Clarifying Wash"].map(x=><option key={x}>{x}</option>)}</select></label></div><FieldTitle>Products used</FieldTitle><div className="choice-grid">{["Shampoo","Conditioner","Hair Mask","Leave-in Conditioner","Other"].map(x=><button key={x} className={products.includes(x)?"choice selected": "choice"} onClick={()=>toggle(x)}>{products.includes(x)&&<Check size={15}/>} {x}</button>)}</div><FieldTitle>Oiling</FieldTitle><div className="choice-grid">{["No","Yes — Coconut Oil","Yes — Rosemary Oil","Yes — Other"].map(x=><button key={x} className={oiling===x?"choice selected":"choice"} onClick={()=>setOiling(x)}>{x}</button>)}</div><FieldTitle>Hair condition</FieldTitle><div className="choice-grid">{["Dry","Normal","Oily","Frizzy","Soft","Other"].map(x=><button key={x} className={condition===x?"choice selected":"choice"} onClick={()=>setCondition(x)}>{x}</button>)}</div><label>Notes<textarea rows="3" placeholder="How did your hair feel?" value={notes} onChange={e=>setNotes(e.target.value)}/></label><label className="photo-upload">Optional photo<input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=()=>setPhoto(r.result);r.readAsDataURL(f)}}}/>{photo&&<img src={photo} alt="Hair progress"/></label><button className="primary full" onClick={save}><Check size={18}/> Save Wash Day</button></Modal>}
function PlanModal({date,onClose,onPlan}){const [d,setD]=useState(date||todayISO());return <Modal title="Plan a wash day" onClose={onClose}><div className="plan-big"><CalendarDays/><h3>{fmt(d)}</h3><p>Add this date to your calendar as a planned wash.</p></div><label>Date<input type="date" value={d} onChange={e=>setD(e.target.value)}/></label><button className="primary full" onClick={()=>onPlan(d)}>Plan Wash Day</button></Modal>}
function Modal({title,onClose,children}){return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><X/></button></div>{children}</div></div>}
function FieldTitle({children}){return <p className="field-title">{children}</p>}

createRoot(document.getElementById("root")).render(<App/>);
