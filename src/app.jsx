import React, { useState, useRef, useCallback, useEffect } from "react";

const SUPA_URL = "https://nuzhulvwjjjnqabcvxrf.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51emh1bHZ3ampqbnFhYmN2eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODg3NjMsImV4cCI6MjA5MTI2NDc2M30.3LXnq6lsrXIIO8fX_B2fUMaXtGjWiEYytqr3Wy_OBN4";
const H = {"Content-Type":"application/json","apikey":SUPA_KEY,"Authorization":`Bearer ${SUPA_KEY}`,"Prefer":"return=representation"};

const db = {
  get: async (table, extra="") => {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?order=id${extra}`, {headers:H});
    const d = await r.json();
    if (!r.ok || (d && d.code)) throw new Error(`${table}: ${d.message||d.hint||r.status}`);
    return d;
  },
  upsert: async (table, row) => {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {method:"POST", headers:{...H,"Prefer":"resolution=merge-duplicates,return=minimal"}, body:JSON.stringify(row)});
    if (!r.ok) { const d=await r.json().catch(()=>{}); throw new Error(`Upsert ${table}: ${d && d.message ? d.message : r.status}`); }
  },
  update: async (table, id, patch) => {
    await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {method:"PATCH", headers:H, body:JSON.stringify(patch)});
  },
  del: async (table, id) => {
    await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {method:"DELETE", headers:H});
  },
  upsertKey: async (key, value) => {
    await fetch(`${SUPA_URL}/rest/v1/lachi_config`, {method:"POST", headers:{...H,"Prefer":"resolution=merge-duplicates,return=minimal"}, body:JSON.stringify({key, value})});
  },
  getKey: async (key) => {
    const r = await fetch(`${SUPA_URL}/rest/v1/lachi_config?key=eq.${key}`, {headers:H});
    const d = await r.json();
    if (!Array.isArray(d)) return null;
    return d[0] && d[0].value ? d[0].value : null;
  },
};

const sort = arr => [...arr].sort((a,b) => a.name.localeCompare(b.name));
const sortLowFirst = arr => [...arr.filter(i=>i.low).sort((a,b)=>a.name.localeCompare(b.name)), ...arr.filter(i=>!i.low).sort((a,b)=>a.name.localeCompare(b.name))];
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = s => { if (!s) return ""; const d=new Date(s+"T00:00:00"); return d.toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"}); };
const addDays = (s,n) => { const d=new Date(s+"T00:00:00"); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const diffDays = s => { const d=new Date(s+"T00:00:00"); const t=new Date(); t.setHours(0,0,0,0); return Math.floor((t-d)/86400000); };

const HH0 = sort([
  {id:1,name:"Baking Paper",emoji:"📄",low:false},{id:2,name:"Bin Bags",emoji:"🗑️",low:false},
  {id:3,name:"Cling Wrap",emoji:"📦",low:false},{id:4,name:"Dish Wash",emoji:"🍽️",low:false},
  {id:5,name:"Foil",emoji:"✨",low:false},{id:6,name:"Freezer Bag",emoji:"🧊",low:false},
  {id:7,name:"Gloves",emoji:"🧤",low:false},{id:8,name:"Hand Wash",emoji:"🧴",low:false},
  {id:9,name:"Laundry Conditioner",emoji:"🧺",low:false},{id:10,name:"Laundry Detergent",emoji:"🧺",low:false},
  {id:11,name:"Paper Towel",emoji:"🧻",low:false},{id:12,name:"Tissue Box",emoji:"🤧",low:false},
  {id:13,name:"Toilet Tissue",emoji:"🧻",low:false},{id:14,name:"Toothpaste",emoji:"🦷",low:false},
  {id:15,name:"Zip Bag L",emoji:"🔒",low:false},{id:16,name:"Zip Bag M",emoji:"🔒",low:false},{id:17,name:"Zip Bag S",emoji:"🔒",low:false},
]);

const PP0 = [
  {id:101,name:"Black Vinegar",category:"Sauces (Dry)",emoji:"",low:false},{id:102,name:"Chilli Oil",category:"Sauces (Dry)",emoji:"",low:false},
  {id:103,name:"Chinese Wine",category:"Sauces (Dry)",emoji:"",low:false},{id:104,name:"Dark Soy Sauce",category:"Sauces (Dry)",emoji:"",low:false},
  {id:105,name:"Fish Sauce",category:"Sauces (Dry)",emoji:"",low:false},{id:106,name:"Japanese Soy",category:"Sauces (Dry)",emoji:"",low:false},
  {id:107,name:"Mirin",category:"Sauces (Dry)",emoji:"",low:false},{id:108,name:"Oyster Sauce",category:"Sauces (Dry)",emoji:"",low:false},
  {id:109,name:"Sake",category:"Sauces (Dry)",emoji:"",low:false},{id:110,name:"Sesame Oil",category:"Sauces (Dry)",emoji:"",low:false},
  {id:111,name:"Soba Sauce",category:"Sauces (Dry)",emoji:"",low:false},{id:112,name:"Soy Sauce",category:"Sauces (Dry)",emoji:"",low:false},
  {id:113,name:"Sukiyaki Sauce",category:"Sauces (Dry)",emoji:"",low:false},{id:114,name:"Worcestershire",category:"Sauces (Dry)",emoji:"",low:false},
  {id:201,name:"Dijon Mustard",category:"Sauces (Fridge)",emoji:"",low:false},{id:202,name:"Korean Gochujang",category:"Sauces (Fridge)",emoji:"",low:false},
  {id:203,name:"Korean Doenjang",category:"Sauces (Fridge)",emoji:"",low:false},{id:204,name:"Lao Gan Ma",category:"Sauces (Fridge)",emoji:"",low:false},
  {id:205,name:"Multigrain Mustard",category:"Sauces (Fridge)",emoji:"",low:false},{id:206,name:"Thai Red Curry",category:"Sauces (Fridge)",emoji:"",low:false},
  {id:207,name:"XO Sauce",category:"Sauces (Fridge)",emoji:"",low:false},{id:208,name:"叉燒醬",category:"Sauces (Fridge)",emoji:"",low:false},
  {id:209,name:"柱侯醬",category:"Sauces (Fridge)",emoji:"",low:false},{id:210,name:"海鮮醬",category:"Sauces (Fridge)",emoji:"",low:false},
  {id:211,name:"黃豆醬",category:"Sauces (Fridge)",emoji:"",low:false},{id:212,name:"豆瓣醬",category:"Sauces (Fridge)",emoji:"",low:false},
  {id:301,name:"出前一丁",category:"Dry Goods",emoji:"🍜",low:false},{id:302,name:"Penne",category:"Dry Goods",emoji:"🍝",low:false},
  {id:303,name:"Spaghetti",category:"Dry Goods",emoji:"🍝",low:false},{id:304,name:"米線",category:"Dry Goods",emoji:"🍜",low:false},{id:305,name:"韓撈面",category:"Dry Goods",emoji:"🍜",low:false},
  {id:401,name:"Bread Flour",category:"Seasoning",emoji:"🫙",low:false},{id:402,name:"Cake Flour",category:"Seasoning",emoji:"🫙",low:false},
  {id:403,name:"Chicken MSG",category:"Seasoning",emoji:"🫙",low:false},{id:404,name:"Chicken Salt",category:"Seasoning",emoji:"🧂",low:false},
  {id:405,name:"Cinnamon",category:"Seasoning",emoji:"🟤",low:false},{id:406,name:"Corn Flour",category:"Seasoning",emoji:"🫙",low:false},
  {id:407,name:"Dried Thyme",category:"Seasoning",emoji:"🌿",low:false},{id:408,name:"Five Spice",category:"Seasoning",emoji:"🌿",low:false},
  {id:409,name:"Garlic Powder",category:"Seasoning",emoji:"🧄",low:false},{id:410,name:"Ginger Powder",category:"Seasoning",emoji:"🫚",low:false},
  {id:411,name:"Korean MSG",category:"Seasoning",emoji:"🫙",low:false},{id:412,name:"Mixed Herbs",category:"Seasoning",emoji:"🌿",low:false},
  {id:413,name:"Plain Flour",category:"Seasoning",emoji:"🫙",low:false},{id:414,name:"Salt",category:"Seasoning",emoji:"🧂",low:false},
  {id:415,name:"Smoked Paprika",category:"Seasoning",emoji:"🌶️",low:false},{id:416,name:"Sugar",category:"Seasoning",emoji:"🍬",low:false},
  {id:417,name:"Turmeric",category:"Seasoning",emoji:"🟡",low:false},{id:418,name:"White Pepper",category:"Seasoning",emoji:"🫙",low:false},{id:419,name:"鹽酥雞粉",category:"Seasoning",emoji:"🫙",low:false},
  {id:501,name:"Apple",category:"Veg & Fruit",emoji:"🍎",low:false},{id:502,name:"Spinach",category:"Veg & Fruit",emoji:"🥬",low:false},
  {id:601,name:"Bacon",category:"Meat",emoji:"🥓",low:false},{id:602,name:"Beef Mince",category:"Meat",emoji:"🥩",low:false},
  {id:603,name:"Boiled Scallop",category:"Meat",emoji:"🐚",low:false},{id:604,name:"Chicken Breast",category:"Meat",emoji:"🍗",low:false},
  {id:605,name:"Pipi",category:"Meat",emoji:"🐚",low:false},{id:606,name:"Pork Bone",category:"Meat",emoji:"🦴",low:false},{id:607,name:"Prawn",category:"Meat",emoji:"🦐",low:false},
  {id:801,name:"Pork Shoulder",category:"Frozen Goods",emoji:"🥩",low:false},{id:802,name:"Tobiko",category:"Frozen Goods",emoji:"🟠",low:false},
  {id:803,name:"White Fish Ball",category:"Frozen Goods",emoji:"⚪",low:false},{id:804,name:"Yakisoba",category:"Frozen Goods",emoji:"🍜",low:false},
];

const PCATS = ["All","Sauces (Dry)","Sauces (Fridge)","Dry Goods","Seasoning","Veg & Fruit","Meat","Soup Base","Frozen Goods"];
const SCATS = ["Sauces (Dry)","Sauces (Fridge)"];
const TABS = ["🏠 Household","🥬 Pantry","👨‍🍳 Recipes","🐾 Lachi"];
const RMODES = [{id:"existing",label:"Use what I have",desc:"Strictly current ingredients"},{id:"suggest",label:"Suggest extras",desc:"Pantry + up to 2 to buy"}];

function useLongPress(onLong, onClick, ms=600) {
  const timer = useRef(null); const fired = useRef(false);
  const start = useCallback(()=>{ fired.current=false; timer.current=setTimeout(()=>{ fired.current=true; onLong(); },ms); },[onLong,ms]);
  const clear = useCallback(()=>clearTimeout(timer.current),[]);
  const click = useCallback(()=>{ if(!fired.current) onClick(); },[onClick]);
  return {onMouseDown:start,onMouseUp:clear,onMouseLeave:clear,onTouchStart:start,onTouchEnd:()=>{clear();click();},onClick:()=>{}};
}

const bP = {background:"#1C1C28",color:"#F0EDE4",border:"none",borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:600,cursor:"pointer"};
const bS = {background:"#EBEBEB",color:"#555",border:"none",borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:600,cursor:"pointer"};

function EditModal({item,type,onSave,onDelete,onClose}) {
  const [d,setD] = useState({...item});
  const isSauce = SCATS.includes(d.category);
  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",width:"100%",maxWidth:480,margin:"0 auto",borderRadius:"20px 20px 0 0",padding:"20px 18px 36px"}}>
        <div style={{width:36,height:4,background:"#DDD",borderRadius:2,margin:"0 auto 16px"}}/>
        <div style={{fontWeight:700,fontSize:15,color:"#1C1C28",marginBottom:16}}>Edit Item</div>
        <div style={{marginBottom:10}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>Name</div>
          <input value={d.name} onChange={e=>setD(x=>({...x,name:e.target.value}))} style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
        </div>
        {type==="household"&&<div style={{marginBottom:10}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>Emoji</div>
          <input value={d.emoji} onChange={e=>setD(x=>({...x,emoji:e.target.value}))} style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
        </div>}
        {type==="pantry"&&<>
          <div style={{marginBottom:10}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>Category</div>
            <select value={d.category} onChange={e=>setD(x=>({...x,category:e.target.value,emoji:SCATS.includes(e.target.value)?"":x.emoji||"🫙"}))} style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,fontFamily:"inherit",background:"#fff"}}>
              {PCATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          {!isSauce&&<div style={{marginBottom:10}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>Emoji</div>
            <input value={d.emoji} onChange={e=>setD(x=>({...x,emoji:e.target.value}))} style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
          </div>}
        </>}
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={()=>onSave(d)} style={bP}>Save</button>
          <button onClick={onClose} style={bS}>Cancel</button>
          <button onClick={()=>onDelete(item.id)} style={{...bS,marginLeft:"auto",background:"#FFF0F0",color:"#FF5A5A"}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function ShoppingPanel({items,onClose,onTick,onTickAll,onAddManual,onRemove}) {
  const [nm,setNm]=useState(""); const [nc,setNc]=useState("Household");
  const pending=items.filter(i=>!i.done); const done=items.filter(i=>i.done);
  const byCat=pending.reduce((a,i)=>{ (a[i.category]||(a[i.category]=[])).push(i); return a; },{});
  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#F7F6F2",width:"100%",maxWidth:480,margin:"0 auto",borderRadius:"20px 20px 0 0",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 18px 0"}}>
          <div style={{width:36,height:4,background:"#DDD",borderRadius:2,margin:"0 auto 14px"}}/>
          <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:16,color:"#1C1C28"}}>Shopping List</div>
            {pending.length>0&&<button onClick={onTickAll} style={{marginLeft:"auto",background:"#1C1C28",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Tick all</button>}
          </div>
          <div style={{display:"flex",gap:7,marginBottom:12}}>
            <input value={nm} onChange={e=>setNm(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nm.trim()){onAddManual(nm.trim(),nc);setNm("");}}} placeholder="Add item manually..." style={{flex:1,padding:"8px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:13,fontFamily:"inherit"}}/>
            <select value={nc} onChange={e=>setNc(e.target.value)} style={{padding:"8px",borderRadius:8,border:"1px solid #DDD",fontSize:12,fontFamily:"inherit",background:"#fff"}}>
              <option>Household</option>
              {PCATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
            </select>
            <button onClick={()=>{if(nm.trim()){onAddManual(nm.trim(),nc);setNm("");}}} style={{...bP,padding:"8px 12px"}}>+</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:"0 18px 36px",flex:1}}>
          {pending.length===0&&done.length===0&&<div style={{color:"#AAA",fontSize:13,textAlign:"center",padding:"30px 0"}}>Empty. Tap any item to mark low and add it here.</div>}
          {Object.entries(byCat).map(([cat,its])=>(
            <div key={cat}>
              <div style={{fontSize:10,fontWeight:700,color:"#AAA",textTransform:"uppercase",letterSpacing:0.8,margin:"10px 0 6px"}}>{cat}</div>
              {its.map(it=>(
                <div key={it.id} style={{background:"#fff",borderRadius:12,padding:"12px 14px",marginBottom:7,display:"flex",alignItems:"center",gap:10,border:"1px solid #E8E8E8"}}>
                  <button onClick={()=>onTick(it.id)} style={{width:22,height:22,borderRadius:"50%",border:"2px solid #CCC",background:"#fff",cursor:"pointer",flexShrink:0}}/>
                  <div style={{flex:1,fontSize:14,fontWeight:500,color:"#1C1C28"}}>{it.name}</div>
                  <button onClick={()=>onRemove(it.id)} style={{background:"none",border:"none",color:"#CCC",fontSize:16,cursor:"pointer"}}>x</button>
                </div>
              ))}
            </div>
          ))}
          {done.length>0&&<>
            <div style={{fontSize:10,color:"#AAA",fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,margin:"14px 0 8px"}}>Done ({done.length})</div>
            {done.map(it=>(
              <div key={it.id} style={{background:"#F5F5F5",borderRadius:12,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,opacity:0.6}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"#4CAF50",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff",fontSize:12}}>✓</div>
                <div style={{flex:1,fontSize:13,color:"#888",textDecoration:"line-through"}}>{it.name}</div>
                <button onClick={()=>onRemove(it.id)} style={{background:"none",border:"none",color:"#CCC",fontSize:16,cursor:"pointer"}}>x</button>
              </div>
            ))}
          </>}
        </div>
      </div>
    </div>
  );
}

function LowPanel({items,onClose}) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",width:"100%",maxWidth:480,margin:"0 auto",borderRadius:"20px 20px 0 0",padding:"20px 18px 36px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#DDD",borderRadius:2,margin:"0 auto 16px"}}/>
        <div style={{fontWeight:700,fontSize:15,color:"#1C1C28",marginBottom:14}}>Running Low ({items.length})</div>
        {items.map(i=>(
          <div key={i.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #F0F0F0"}}>
            {i.emoji?<span style={{fontSize:20}}>{i.emoji}</span>:<span style={{fontSize:12,color:"#888"}}>●</span>}
            <span style={{fontSize:14,color:"#1C1C28"}}>{i.name}</span>
            {i.category&&<span style={{fontSize:11,color:"#AAA"}}>{i.category}</span>}
            <span style={{marginLeft:"auto",background:"#FFF0F0",color:"#FF5A5A",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>low</span>
          </div>
        ))}
        {items.length===0&&<div style={{color:"#AAA",fontSize:13,textAlign:"center",padding:"20px 0"}}>All good!</div>}
      </div>
    </div>
  );
}

function Tile({item,onToggle,onEdit}) {
  const lp = useLongPress(()=>onEdit(item),()=>onToggle(item.id));
  return (
    <div style={{position:"relative"}}>
      <button {...lp} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:80,height:80,borderRadius:14,border:item.low?"2px solid #FF5A5A":"1.5px solid #E8E8E8",background:item.low?"#FFF0F0":"#fff",cursor:"pointer",gap:3,transition:"all 0.2s",WebkitUserSelect:"none",userSelect:"none"}}>
        <span style={{fontSize:24}}>{item.emoji}</span>
        {item.low&&<span style={{fontSize:9,fontWeight:700,color:"#FF5A5A"}}>low</span>}
      </button>
      {item.low&&<div style={{position:"absolute",top:-4,right:-4,width:12,height:12,background:"#FF5A5A",borderRadius:"50%",pointerEvents:"none"}}/>}
      <div style={{fontSize:9,color:item.low?"#FF5A5A":"#888",textAlign:"center",marginTop:3,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:item.low?700:400}}>{item.name}</div>
    </div>
  );
}

function Pill({item,onToggle,onEdit}) {
  const lp = useLongPress(()=>onEdit(item),()=>onToggle(item.id));
  return (
    <button {...lp} style={{padding:"7px 13px",borderRadius:20,fontSize:13,fontWeight:item.low?700:400,background:item.low?"#FF5A5A":"#fff",color:item.low?"#fff":"#333",border:item.low?"none":"1.5px solid #DDD",cursor:"pointer",transition:"all 0.2s",WebkitUserSelect:"none",userSelect:"none",marginBottom:2}}>
      {item.name}{item.low&&<span style={{fontSize:10,marginLeft:4}}>low</span>}
    </button>
  );
}

export default function App() {
  const [tab,setTab]=useState(0);
  const [hh,setHh]=useState(HH0);
  const [pp,setPp]=useState(PP0);
  const [pf,setPf]=useState("All");
  const [addHH,setAddHH]=useState(false);
  const [addPP,setAddPP]=useState(false);
  const [ni,setNi]=useState({name:"",emoji:"🛒",category:"Sauces (Dry)"});
  const [editing,setEditing]=useState(null);
  const [cart,setCart]=useState([]);
  const [showCart,setShowCart]=useState(false);
  const [showLow,setShowLow]=useState(false);
  const [hist,setHist]=useState([]);
  const [recipes,setRecipes]=useState([]);
  const [loadR,setLoadR]=useState(false);
  const [recipeErr,setRecipeErr]=useState("");
  const [recipeNote,setRecipeNote]=useState("");
  const [recipeMode,setRecipeMode]=useState("existing");
  const [toast,setToast]=useState("");
  const [loading,setLoading]=useState(true);
  const [dbStatus,setDbStatus]=useState("ok");
  const [dbErr,setDbErr]=useState("");
  const [food,setFood]=useState({purchaseDate:"2026-04-08",totalDays:24});
  const [editFood,setEditFood]=useState(false);
  const [tmpFood,setTmpFood]=useState("");
  const [ng,setNg]=useState({purchaseDate:"",portions:3,reminderDaysBefore:7});
  const [editNg,setEditNg]=useState(false);
  const [tmpNg,setTmpNg]=useState({purchaseDate:"",portions:3,reminderDaysBefore:7});
  const [vax,setVax]=useState([]);
  const [addVax,setAddVax]=useState(false);
  const [nvax,setNvax]=useState({name:"",date:"",nextDue:"",notes:""});

  const toast2 = msg => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const loadAll = async () => {
    try {
      const [h,p,sl,hi,vs,fc,nc] = await Promise.all([
        db.get("household_items"), db.get("pantry_items"), db.get("shopping_list"),
        db.get("household_history","&order=id.desc"), db.get("vaccines"),
        db.getKey("lachi_food"), db.getKey("nexgard"),
      ]);
      if (Array.isArray(h) && h.length>0) setHh(h); else setHh(HH0);
      if (Array.isArray(p) && p.length>0) setPp(p); else setPp(PP0);
      if (Array.isArray(sl)) setCart(sl.map(i=>({...i,sourceId:i.source_id})));
      if (Array.isArray(hi)) setHist(hi);
      if (Array.isArray(vs)) setVax(vs);
      if (fc) setFood(fc);
      if (nc) setNg(nc);
      setDbStatus("ok");
      return true;
    } catch(e) {
      console.error("Supabase error:", e.message);
      setDbErr(e.message || "Unknown error");
      setDbStatus("error");
      return false;
    }
  };

  const seedDB = async () => {
    setDbStatus("seeding");
    try {
      for (const i of HH0) await db.upsert("household_items",i);
      for (const i of PP0) await db.upsert("pantry_items",i);
      setHh(HH0); setPp(PP0);
      setDbStatus("ok");
      toast2("Data saved to Supabase!");
    } catch(e) {
      setDbStatus("error");
      toast2("Seed failed — check SQL tables exist");
    }
  };

  useEffect(()=>{ loadAll().then(()=>setLoading(false)); },[]);

  useEffect(()=>{
    const t = setInterval(async()=>{
      try {
        const [h,p,sl,hi,vs] = await Promise.all([
          db.get("household_items"), db.get("pantry_items"), db.get("shopping_list"),
          db.get("household_history","&order=id.desc"), db.get("vaccines"),
        ]);
        if (Array.isArray(h)&&h.length>0) setHh(h);
        if (Array.isArray(p)&&p.length>0) setPp(p);
        if (Array.isArray(sl)) setCart(sl.map(i=>({...i,sourceId:i.source_id})));
        if (Array.isArray(hi)) setHist(hi);
        if (Array.isArray(vs)) setVax(vs);
      } catch {}
    }, 15000);
    return ()=>clearInterval(t);
  },[]);

  const allLow = [...hh.filter(i=>i.low),...pp.filter(i=>i.low)];
  const pending = cart.filter(i=>!i.done).length;

  const toggleHH = async id => {
    const item = hh.find(i=>i.id===id); if(!item) return;
    const low2 = !item.low;
    setHh(h=>h.map(i=>i.id===id?{...i,low:low2}:i));
    try { await db.update("household_items",id,{low:low2}); } catch {}
    if (low2) {
      if (!cart.find(s=>s.sourceId===id&&!s.done)) {
        const e={id:Date.now(),name:item.name,category:"Household",source_id:id,done:false};
        try { await db.upsert("shopping_list",e); } catch {}
        setCart(c=>[...c,{...e,sourceId:id}]);
        toast2("Added to shopping list");
      }
    } else {
      const e=cart.find(s=>s.sourceId===id&&!s.done);
      if (e) { try { await db.del("shopping_list",e.id); } catch {} setCart(c=>c.filter(s=>s.id!==e.id)); }
    }
  };

  const togglePP = async id => {
    const item = pp.find(i=>i.id===id); if(!item) return;
    const low2 = !item.low;
    setPp(p=>p.map(i=>i.id===id?{...i,low:low2}:i));
    try { await db.update("pantry_items",id,{low:low2}); } catch {}
    if (low2) {
      if (!cart.find(s=>s.sourceId===id&&!s.done)) {
        const e={id:Date.now(),name:item.name,category:item.category,source_id:id,done:false};
        try { await db.upsert("shopping_list",e); } catch {}
        setCart(c=>[...c,{...e,sourceId:id}]);
        toast2("Added to shopping list");
      }
    } else {
      const e=cart.find(s=>s.sourceId===id&&!s.done);
      if (e) { try { await db.del("shopping_list",e.id); } catch {} setCart(c=>c.filter(s=>s.id!==e.id)); }
    }
  };

  const saveEdit = async draft => {
    if (editing.type==="household") {
      setHh(h=>sort(h.map(i=>i.id===draft.id?draft:i)));
      try { await db.upsert("household_items",draft); } catch {}
    } else {
      const isSauce=SCATS.includes(draft.category);
      const fin={...draft,emoji:isSauce?"":draft.emoji};
      setPp(p=>p.map(i=>i.id===draft.id?fin:i));
      try { await db.upsert("pantry_items",fin); } catch {}
    }
    setEditing(null); toast2("Saved");
  };

  const delEdit = async id => {
    if (editing.type==="household") { setHh(h=>h.filter(i=>i.id!==id)); try { await db.del("household_items",id); } catch {} }
    else { setPp(p=>p.filter(i=>i.id!==id)); try { await db.del("pantry_items",id); } catch {} }
    setEditing(null); toast2("Removed");
  };

  const addRestock = async name => {
    const e={id:Date.now(),name,date:todayStr()};
    try { await db.upsert("household_history",e); } catch {}
    setHist(h=>[e,...h].slice(0,100));
  };

  const tickCart = async sid => {
    const item=cart.find(i=>i.id===sid); if(!item) return;
    setCart(c=>c.map(i=>i.id===sid?{...i,done:true}:i));
    try { await db.update("shopping_list",sid,{done:true}); } catch {}
    if (item.sourceId) {
      setHh(h=>h.map(i=>{ if(i.id===item.sourceId&&i.low){ db.update("household_items",i.id,{low:false}).catch(()=>{}); addRestock(i.name); return {...i,low:false}; } return i; }));
      setPp(p=>p.map(i=>{ if(i.id===item.sourceId){ db.update("pantry_items",i.id,{low:false}).catch(()=>{}); return {...i,low:false}; } return i; }));
    }
    if (!item.sourceId&&item.category==="Household") addRestock(item.name);
  };

  const tickAll = async () => {
    const pend=cart.filter(i=>!i.done);
    setCart(c=>c.map(i=>({...i,done:true})));
    for (const item of pend) {
      try { await db.update("shopping_list",item.id,{done:true}); } catch {}
      if (item.sourceId) {
        setHh(h=>h.map(i=>{ if(i.id===item.sourceId&&i.low){ db.update("household_items",i.id,{low:false}).catch(()=>{}); addRestock(i.name); return {...i,low:false}; } return i; }));
        setPp(p=>p.map(i=>{ if(i.id===item.sourceId){ db.update("pantry_items",i.id,{low:false}).catch(()=>{}); return {...i,low:false}; } return i; }));
      }
      if (!item.sourceId&&item.category==="Household") addRestock(item.name);
    }
  };

  const rmCart = async id => {
    setCart(c=>c.filter(i=>i.id!==id));
    try { await db.del("shopping_list",id); } catch {}
  };

  const addManual = async (name,cat) => {
    const e={id:Date.now(),name,category:cat,source_id:null,done:false};
    try { await db.upsert("shopping_list",e); } catch {}
    setCart(c=>[...c,{...e,sourceId:null}]);
  };

  const addHHItem = async () => {
    if (!ni.name.trim()) return;
    const item={...ni,id:Date.now(),low:false};
    setHh(h=>sort([...h,item]));
    try { await db.upsert("household_items",item); } catch {}
    setAddHH(false); toast2("Added");
  };

  const addPPItem = async () => {
    if (!ni.name.trim()) return;
    const isSauce=SCATS.includes(ni.category);
    const item={...ni,id:Date.now(),low:false,emoji:isSauce?"":(ni.emoji||"🫙")};
    setPp(p=>[...p,item]);
    try { await db.upsert("pantry_items",item); } catch {}
    setAddPP(false); toast2("Added");
  };

  const saveFood = async date => {
    const u={...food,purchaseDate:date};
    setFood(u); try { await db.upsertKey("lachi_food",u); } catch {}
    setEditFood(false); toast2("Updated!");
  };

  const saveNg = async data => {
    setNg(data); try { await db.upsertKey("nexgard",data); } catch {}
    setEditNg(false); toast2("NexGard updated!");
  };

  const addVaccine = async () => {
    if (!nvax.name.trim()) return;
    const v={...nvax,id:Date.now()};
    setVax(vs=>[...vs,v]);
    try { await db.upsert("vaccines",v); } catch {}
    setNvax({name:"",date:"",nextDue:"",notes:""}); setAddVax(false); toast2("Vaccine logged!");
  };

  const delVax = async id => {
    setVax(vs=>vs.filter(v=>v.id!==id));
    try { await db.del("vaccines",id); } catch {}
  };

  const fetchRecipes = async () => {
    setLoadR(true); setRecipeErr(""); setRecipes([]);
    const avail=pp.map(i=>i.name).join(", ");
    const mi=recipeMode==="existing"?"Use ONLY listed ingredients. 'extra' must be empty array.":"Use listed ingredients. Suggest up to 2 easy extras in 'extra'.";
    const prompt=`I have: ${avail}.\n${recipeNote?`Preferences: ${recipeNote}\n`:""}${mi}\nSuggest 3 dishes. Reply ONLY valid JSON:\n[{"name":"Dish","time":"20 mins","ingredients":["x"],"extra":["y"],"steps":["Step 1"]}]`;
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await r.json();
      setRecipes(JSON.parse(data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim()));
    } catch { setRecipeErr("Could not get suggestions. Please try again."); }
    setLoadR(false);
  };

  const fdu=food.purchaseDate?diffDays(food.purchaseDate):0;
  const fdl=Math.max(0,food.totalDays-fdu);
  const fpct=Math.min(100,Math.round((fdu/food.totalDays)*100));
  const fnb=fdu>=(food.totalDays-4);
  const fbr=food.purchaseDate?addDays(food.purchaseDate,food.totalDays-4):"";
  const ngtd=ng.portions*30;
  const ngdu=ng.purchaseDate?diffDays(ng.purchaseDate):0;
  const ngdl=Math.max(0,ngtd-ngdu);
  const ngpct=ng.purchaseDate?Math.min(100,Math.round((ngdu/ngtd)*100)):0;
  const ngnb=ng.purchaseDate&&ngdu>=(ngtd-ng.reminderDaysBefore);
  const ngbr=ng.purchaseDate?addDays(ng.purchaseDate,ngtd-ng.reminderDaysBefore):"";
  const ngms=ng.purchaseDate?Array.from({length:ng.portions},(_,i)=>({month:i+1,date:addDays(ng.purchaseDate,i*30),done:ngdu>=i*30})):[];

  if (loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#F7F6F2",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:40,marginBottom:16}}>🏡</div>
      <div style={{fontSize:15,color:"#666",fontWeight:600}}>Loading your home...</div>
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans','Helvetica Neue',sans-serif",background:"#F7F6F2",minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"#1C1C28",padding:"22px 20px 0",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <span style={{fontSize:26}}>🏡</span>
          <div>
            <div style={{color:"#F0EDE4",fontSize:17,fontWeight:700}}>Home Manager</div>
            <div style={{color:"#6B6B88",fontSize:11}}>Stock · Pantry · Recipes · Lachi</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
            {allLow.length>0&&<button onClick={()=>setShowLow(true)} style={{background:"#FF5A5A",color:"#fff",borderRadius:10,padding:"4px 10px",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>⚠️ {allLow.length}</button>}
            <button onClick={()=>setShowCart(true)} style={{background:"#4CAF50",color:"#fff",borderRadius:10,padding:"4px 12px",fontSize:11,fontWeight:700,border:"none",cursor:"pointer",position:"relative",display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:14}}>🛒</span><span>List</span>
              {pending>0&&<span style={{position:"absolute",top:-5,right:-5,background:"#FF5A5A",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{pending}</span>}
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:3}}>
          {TABS.map((t,i)=><button key={i} onClick={()=>setTab(i)} style={{flex:1,padding:"9px 2px",fontSize:10,fontWeight:tab===i?700:400,background:tab===i?"#F0EDE4":"transparent",color:tab===i?"#1C1C28":"#6B6B88",border:"none",borderRadius:"8px 8px 0 0",cursor:"pointer"}}>{t}</button>)}
        </div>
      </div>

      <div style={{padding:"14px 14px 90px"}}>

        {/* DB Status Banner */}
        {dbStatus==="error"&&(
          <div style={{background:"#FFF3CD",border:"1px solid #FFD93D",borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:13}}>
            <div style={{fontWeight:700,color:"#856404",marginBottom:6}}>⚠️ Could not connect to Supabase</div>
            <div style={{color:"#856404",marginBottom:8,fontSize:12}}>Error: {dbErr || "Check SQL tables are created and RLS policies allow public access."}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={seedDB} disabled={dbStatus==="seeding"} style={{...bP,padding:"6px 14px",fontSize:12}}>Seed data to Supabase</button>
              <button onClick={()=>loadAll()} style={{...bS,padding:"6px 14px",fontSize:12}}>Retry</button>
            </div>
          </div>
        )}

        {/* TAB 0: Household */}
        {tab===0&&<>
          <div style={{fontSize:11,color:"#AAA",marginBottom:10}}>Tap to mark low → auto adds to shopping list · Long press to edit</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:16}}>
            {sortLowFirst(hh).map(item=><Tile key={item.id} item={item} onToggle={toggleHH} onEdit={i=>setEditing({item:i,type:"household"})}/>)}
          </div>
          {addHH?(
            <div style={{background:"#fff",borderRadius:12,padding:16,border:"1px dashed #CCC",marginBottom:16}}>
              <div style={{fontWeight:700,marginBottom:12,color:"#1C1C28",fontSize:14}}>Add Household Item</div>
              {[["Item name","name"],["Emoji","emoji"]].map(([l,k])=>(
                <div key={k} style={{marginBottom:9}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>{l}</div>
                  <input value={ni[k]||""} onChange={e=>setNi(n=>({...n,[k]:e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
                </div>
              ))}
              <div style={{display:"flex",gap:8}}><button onClick={addHHItem} style={bP}>Confirm</button><button onClick={()=>setAddHH(false)} style={bS}>Cancel</button></div>
            </div>
          ):<button onClick={()=>{setAddHH(true);setNi({name:"",emoji:"🛒"});}} style={{...bP,marginBottom:24}}>+ Add item</button>}
          <div style={{borderTop:"1px solid #E8E8E8",paddingTop:16}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1C1C28",marginBottom:10}}>Restock History</div>
            {hist.length===0?<div style={{color:"#CCC",fontSize:13}}>No restock events yet.</div>:
              hist.map(h=>(
                <div key={h.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #F5F5F5"}}>
                  <span style={{fontSize:13,color:"#333"}}>✅ {h.name}</span>
                  <span style={{fontSize:11,color:"#AAA"}}>{fmtDate(h.date)}</span>
                </div>
              ))
            }
          </div>
        </>}

        {/* TAB 1: Pantry */}
        {tab===1&&<>
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
            {PCATS.map(c=><button key={c} onClick={()=>setPf(c)} style={{padding:"5px 11px",borderRadius:20,fontSize:11,fontWeight:pf===c?700:400,background:pf===c?"#1C1C28":"#E8E8E8",color:pf===c?"#fff":"#666",border:"none",cursor:"pointer"}}>{c}</button>)}
          </div>
          <div style={{fontSize:11,color:"#AAA",marginBottom:10}}>Tap to mark low → auto adds to shopping list · Long press to edit</div>
          {(pf==="All"||SCATS.includes(pf))&&SCATS.filter(c=>pf==="All"||pf===c).map(c=>(
            <div key={c}>
              {pf==="All"&&<div style={{fontSize:11,fontWeight:700,color:"#AAA",letterSpacing:0.8,textTransform:"uppercase",marginBottom:8,marginTop:4}}>{c}</div>}
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
                {sortLowFirst(pp.filter(i=>i.category===c)).map(item=><Pill key={item.id} item={item} onToggle={togglePP} onEdit={i=>setEditing({item:i,type:"pantry"})}/>)}
              </div>
            </div>
          ))}
          {(pf==="All"||!SCATS.includes(pf))&&(pf==="All"?PCATS.filter(c=>c!=="All"&&!SCATS.includes(c)):[pf]).map(c=>{
            const its=sortLowFirst(pp.filter(i=>i.category===c));
            if(its.length===0&&pf!==c) return null;
            return <div key={c}>
              {pf==="All"&&<div style={{fontSize:11,fontWeight:700,color:"#AAA",letterSpacing:0.8,textTransform:"uppercase",marginBottom:8}}>{c}</div>}
              <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:14}}>
                {its.map(item=><Tile key={item.id} item={item} onToggle={togglePP} onEdit={i=>setEditing({item:i,type:"pantry"})}/>)}
                {its.length===0&&<div style={{color:"#CCC",fontSize:12,padding:"10px 0"}}>No items yet</div>}
              </div>
            </div>;
          })}
          {addPP?(
            <div style={{background:"#fff",borderRadius:12,padding:16,border:"1px dashed #CCC",marginTop:4}}>
              <div style={{fontWeight:700,marginBottom:12,color:"#1C1C28",fontSize:14}}>Add Ingredient</div>
              {[["Name","name"],["Emoji (skip for sauces)","emoji"]].map(([l,k])=>(
                <div key={k} style={{marginBottom:9}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>{l}</div>
                  <input value={ni[k]||""} onChange={e=>setNi(n=>({...n,[k]:e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
                </div>
              ))}
              <div style={{marginBottom:9}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>Category</div>
                <select value={ni.category} onChange={e=>setNi(n=>({...n,category:e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,fontFamily:"inherit",background:"#fff"}}>
                  {PCATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:8}}><button onClick={addPPItem} style={bP}>Confirm</button><button onClick={()=>setAddPP(false)} style={bS}>Cancel</button></div>
            </div>
          ):<button onClick={()=>{setAddPP(true);setNi({name:"",emoji:"",category:"Sauces (Dry)"});}} style={{...bP,marginTop:4}}>+ Add ingredient</button>}
        </>}

        {/* TAB 2: Recipes */}
        {tab===2&&<>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {RMODES.map(m=><button key={m.id} onClick={()=>setRecipeMode(m.id)} style={{flex:1,padding:"10px 8px",borderRadius:12,cursor:"pointer",background:recipeMode===m.id?"#1C1C28":"#fff",color:recipeMode===m.id?"#F0EDE4":"#555",border:recipeMode===m.id?"none":"1px solid #E0E0E0",fontWeight:recipeMode===m.id?700:400}}>
              <div style={{fontSize:13}}>{m.label}</div><div style={{fontSize:10,opacity:0.65,marginTop:2}}>{m.desc}</div>
            </button>)}
          </div>
          <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:12,border:"1px solid #E8E8E8"}}>
            <div style={{fontWeight:600,fontSize:13,color:"#1C1C28",marginBottom:7}}>Taste preferences <span style={{fontWeight:400,color:"#AAA"}}>(optional)</span></div>
            <textarea value={recipeNote} onChange={e=>setRecipeNote(e.target.value)} placeholder="e.g. Cantonese home-style, mild, no spicy..." style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:13,minHeight:60,resize:"none",boxSizing:"border-box",color:"#333",fontFamily:"inherit"}}/>
          </div>
          <button onClick={fetchRecipes} disabled={loadR} style={{...bP,width:"100%",marginBottom:14,padding:"13px",fontSize:14,opacity:loadR?0.65:1}}>
            {loadR?"Generating...":"Suggest recipes from my pantry"}
          </button>
          {recipeErr&&<div style={{background:"#FFF0F0",borderRadius:10,padding:12,color:"#C00",fontSize:13,marginBottom:12}}>{recipeErr}</div>}
          {recipes.map((r,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:14,padding:16,marginBottom:12,border:"1px solid #E8E8E8"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{fontWeight:700,fontSize:16,color:"#1C1C28"}}>{r.name}</div>
                <div style={{background:"#EEF2FF",color:"#4055D8",borderRadius:8,padding:"3px 9px",fontSize:11,fontWeight:600}}>{r.time}</div>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#AAA",fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",marginBottom:5}}>From your pantry</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{r.ingredients.map((g,j)=><span key={j} style={{background:"#E8F5E9",color:"#2E7D32",borderRadius:6,padding:"3px 9px",fontSize:12}}>{g}</span>)}</div>
              </div>
              {r.extra?.length>0&&<div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#AAA",fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",marginBottom:5}}>Suggested to buy</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{r.extra.map((e,j)=><span key={j} style={{background:"#FFF8E1",color:"#E65100",borderRadius:6,padding:"3px 9px",fontSize:12}}>{e}</span>)}</div>
              </div>}
              <div>
                <div style={{fontSize:10,color:"#AAA",fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",marginBottom:7}}>Steps</div>
                {r.steps.map((s,j)=>(
                  <div key={j} style={{display:"flex",gap:9,marginBottom:6}}>
                    <span style={{background:"#1C1C28",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>{j+1}</span>
                    <span style={{fontSize:13,color:"#444",lineHeight:1.55}}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!loadR&&recipes.length===0&&!recipeErr&&<div style={{textAlign:"center",color:"#BBB",fontSize:13,marginTop:36,lineHeight:1.9}}><div style={{fontSize:46,marginBottom:10}}>👨‍🍳</div><div>Tap the button above for AI recipe ideas.</div></div>}
        </>}

        {/* TAB 3: Lachi */}
        {tab===3&&<>
          <div style={{fontWeight:700,fontSize:15,color:"#1C1C28",marginBottom:10}}>🍖 Dog Food</div>
          <div style={{background:fnb?"#FFF0F0":"#F0FFF4",border:`1.5px solid ${fnb?"#FF5A5A":"#4CAF50"}`,borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div><div style={{fontSize:13,color:"#666"}}>Started: <strong>{fmtDate(food.purchaseDate)}</strong></div>
                <div style={{fontSize:12,color:"#AAA",marginTop:2}}>2 packs × 12 days = {food.totalDays} days total</div>
              </div>
              {fnb?<div style={{background:"#FF5A5A",color:"#fff",borderRadius:10,padding:"4px 11px",fontSize:11,fontWeight:700}}>Buy Now!</div>:<div style={{background:"#E8F5E9",color:"#2E7D32",borderRadius:10,padding:"4px 11px",fontSize:11,fontWeight:700}}>{fdl}d left</div>}
            </div>
            <div style={{background:"#E0E0E0",borderRadius:8,height:10,overflow:"hidden",marginBottom:6}}>
              <div style={{height:"100%",borderRadius:8,width:`${fpct}%`,background:fpct>=83?"#FF5A5A":fpct>=60?"#FF9800":"#4CAF50",transition:"width 0.5s"}}/>
            </div>
            <div style={{fontSize:11,color:"#AAA",marginBottom:10}}>Day {fdu} of {food.totalDays}</div>
            <div style={{background:fnb?"#FFE0E0":"#E8F5E9",borderRadius:10,padding:"9px 12px",fontSize:12}}>
              {fnb?<span style={{color:"#C00",fontWeight:700}}>~4 portions left — buy a new bag soon!</span>:<span style={{color:"#2E7D32"}}>Buy reminder: <strong>{fmtDate(fbr)}</strong></span>}
            </div>
            {editFood?(
              <div style={{marginTop:12}}>
                <div style={{fontSize:11,color:"#888",marginBottom:3}}>New purchase date</div>
                <input type="date" value={tmpFood} onChange={e=>setTmpFood(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}}/>
                <div style={{display:"flex",gap:8}}><button onClick={()=>saveFood(tmpFood)} style={bP}>Confirm</button><button onClick={()=>setEditFood(false)} style={bS}>Cancel</button></div>
              </div>
            ):<button onClick={()=>{setTmpFood("");setEditFood(true);}} style={{...bP,marginTop:12,fontSize:12}}>Log new purchase</button>}
          </div>

          <div style={{fontWeight:700,fontSize:15,color:"#1C1C28",marginBottom:10}}>💊 NexGard</div>
          {!ng.purchaseDate&&!editNg?(
            <div style={{background:"#fff",borderRadius:16,border:"1.5px dashed #CCC",padding:16,textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:13,color:"#AAA",marginBottom:10}}>No NexGard record yet</div>
              <button onClick={()=>{setTmpNg({purchaseDate:"",portions:3,reminderDaysBefore:7});setEditNg(true);}} style={bP}>+ Set up NexGard</button>
            </div>
          ):editNg?(
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #E8E8E8",padding:16,marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:14,color:"#1C1C28",marginBottom:12}}>NexGard Setup</div>
              {[["Purchase / start date","purchaseDate","date"],["Number of portions bought","portions","number"],["Remind me X days before last dose","reminderDaysBefore","number"]].map(([l,k,t])=>(
                <div key={k} style={{marginBottom:9}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>{l}</div>
                  <input type={t} value={tmpNg[k]} onChange={e=>setTmpNg(n=>({...n,[k]:t==="number"?Number(e.target.value):e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
                </div>
              ))}
              <div style={{display:"flex",gap:8}}><button onClick={()=>saveNg(tmpNg)} style={bP}>Save</button><button onClick={()=>setEditNg(false)} style={bS}>Cancel</button></div>
            </div>
          ):(
            <div style={{background:ngnb?"#FFF0F0":"#F0F4FF",border:`1.5px solid ${ngnb?"#FF5A5A":"#4055D8"}`,borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div><div style={{fontSize:13,color:"#666"}}>Started: <strong>{fmtDate(ng.purchaseDate)}</strong></div>
                  <div style={{fontSize:12,color:"#AAA",marginTop:2}}>{ng.portions} portions · 1 per month</div>
                </div>
                {ngnb?<div style={{background:"#FF5A5A",color:"#fff",borderRadius:10,padding:"4px 11px",fontSize:11,fontWeight:700}}>Buy Now!</div>:<div style={{background:"#EEF2FF",color:"#4055D8",borderRadius:10,padding:"4px 11px",fontSize:11,fontWeight:700}}>{ngdl}d left</div>}
              </div>
              <div style={{background:"#E0E0E0",borderRadius:8,height:10,overflow:"hidden",marginBottom:6}}>
                <div style={{height:"100%",borderRadius:8,width:`${ngpct}%`,background:ngnb?"#FF5A5A":"#4055D8",transition:"width 0.5s"}}/>
              </div>
              <div style={{fontSize:11,color:"#AAA",marginBottom:12}}>Day {ngdu} of {ngtd}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Monthly Doses</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
                {ngms.map(m=>(
                  <div key={m.month} style={{borderRadius:10,padding:"6px 10px",fontSize:11,textAlign:"center",background:m.done?"#1C1C28":"#F0F0F0",color:m.done?"#fff":"#888",minWidth:54}}>
                    <div style={{fontWeight:700}}>M{m.month}</div>
                    <div style={{fontSize:9,marginTop:2,opacity:0.8}}>{fmtDate(m.date).replace(/\s\d{4}$/,"")}</div>
                    {m.done&&<div style={{fontSize:9,marginTop:1}}>✓</div>}
                  </div>
                ))}
              </div>
              <div style={{background:ngnb?"#FFE0E0":"#EEF2FF",borderRadius:10,padding:"9px 12px",fontSize:12,marginBottom:10}}>
                {ngnb?<span style={{color:"#C00",fontWeight:700}}>Running low — restock NexGard soon!</span>:<span style={{color:"#4055D8"}}>Restock reminder: <strong>{fmtDate(ngbr)}</strong></span>}
              </div>
              <button onClick={()=>{setTmpNg({...ng});setEditNg(true);}} style={{...bS,fontSize:12}}>Edit / Log new purchase</button>
            </div>
          )}

          <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
            <div style={{fontWeight:700,fontSize:15,color:"#1C1C28"}}>💉 Vaccinations</div>
            <button onClick={()=>setAddVax(true)} style={{...bP,marginLeft:"auto",padding:"5px 12px",fontSize:12}}>+ Add</button>
          </div>
          {vax.length===0&&!addVax&&<div style={{background:"#fff",borderRadius:16,border:"1.5px dashed #CCC",padding:16,textAlign:"center",marginBottom:16}}><div style={{fontSize:13,color:"#AAA"}}>No vaccination records yet. Tap + Add to log.</div></div>}
          {vax.map(v=>{
            const du=v.nextDue?diffDays(v.nextDue)*-1:null;
            const ov=du!==null&&du<0; const ds=du!==null&&du>=0&&du<=30;
            return <div key={v.id} style={{background:ov?"#FFF0F0":ds?"#FFFDE7":"#fff",borderRadius:14,padding:14,marginBottom:10,border:`1px solid ${ov?"#FF5A5A":ds?"#FFD700":"#E8E8E8"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{fontWeight:700,fontSize:14,color:"#1C1C28"}}>💉 {v.name}</div>
                <div style={{display:"flex",gap:6}}>
                  {ov&&<span style={{background:"#FF5A5A",color:"#fff",borderRadius:8,padding:"2px 8px",fontSize:10,fontWeight:700}}>Overdue</span>}
                  {ds&&!ov&&<span style={{background:"#FF9800",color:"#fff",borderRadius:8,padding:"2px 8px",fontSize:10,fontWeight:700}}>Due soon</span>}
                  <button onClick={()=>delVax(v.id)} style={{background:"none",border:"none",color:"#CCC",fontSize:14,cursor:"pointer"}}>x</button>
                </div>
              </div>
              <div style={{fontSize:12,color:"#666",marginTop:6}}>Last given: <strong>{fmtDate(v.date)}</strong></div>
              {v.nextDue&&<div style={{fontSize:12,color:ov?"#FF5A5A":ds?"#E65100":"#666",marginTop:2}}>Next due: <strong>{fmtDate(v.nextDue)}</strong>{du!==null&&<span style={{marginLeft:6,fontSize:11}}>({du>=0?`in ${du} days`:`${Math.abs(du)} days ago`})</span>}</div>}
              {v.notes&&<div style={{fontSize:11,color:"#AAA",marginTop:4}}>{v.notes}</div>}
            </div>;
          })}
          {addVax&&<div style={{background:"#fff",borderRadius:14,padding:16,border:"1px dashed #CCC",marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1C1C28",marginBottom:12}}>Add Vaccination</div>
            {[["Vaccine name","name","text"],["Date given","date","date"],["Next due date","nextDue","date"],["Notes (optional)","notes","text"]].map(([l,k,t])=>(
              <div key={k} style={{marginBottom:9}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>{l}</div>
                <input type={t} value={nvax[k]} onChange={e=>setNvax(n=>({...n,[k]:e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #DDD",fontSize:14,boxSizing:"border-box",fontFamily:"inherit"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:8}}><button onClick={addVaccine} style={bP}>Save</button><button onClick={()=>setAddVax(false)} style={bS}>Cancel</button></div>
          </div>}
        </>}
      </div>

      {showLow&&<LowPanel items={allLow} onClose={()=>setShowLow(false)}/>}
      {showCart&&<ShoppingPanel items={cart} onClose={()=>setShowCart(false)} onTick={tickCart} onTickAll={tickAll} onAddManual={addManual} onRemove={rmCart}/>}
      {editing&&<EditModal item={editing.item} type={editing.type} onSave={saveEdit} onDelete={delEdit} onClose={()=>setEditing(null)}/>}
      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#1C1C28",color:"#fff",padding:"10px 20px",borderRadius:20,fontSize:13,fontWeight:600,zIndex:400,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>{toast}</div>}
    </div>
  );
}
