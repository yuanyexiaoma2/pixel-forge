import { useState, useEffect, useRef } from "react";

const PAGES = { HOME: "home", LIBRARY: "library", FAVORITES: "favorites", PRICING: "pricing", ADMIN: "admin" };

const MeshGradient = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, borderRadius: "inherit" }}>
    <div style={{
      position: "absolute", width: "140%", height: "140%", top: "-20%", left: "-20%",
      background: "radial-gradient(ellipse at 20% 50%, rgba(251,146,60,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.2) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(34,211,238,0.15) 0%, transparent 50%)",
      animation: "meshMove 12s ease-in-out infinite alternate",
    }} />
    <style>{`@keyframes meshMove { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-30px, 20px) scale(1.05); } }`}</style>
  </div>
);

const Icons = {
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  dollar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  sparkle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  uploadSm: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  chevronLeft: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  xSm: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  enhance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  image: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  zoomIn: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  edit: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
};

const MODELS = [
  {
    name:"Nano Banana Pro", modelId:"nano-banana-pro", vendor:"Google",
    tag:"Featured", color:"#fb923c", speed:3, supportsRefImage:true,
    desc:"Google 专业版，图像质量卓越，支持多种输出规格",
    options:{
      aspectRatios:["Auto","1:1","1:4","2:3","3:2","3:4","4:3","4:5","5:4","9:16","16:9","21:9"],
      resolutions:["1K","2K","4K"],
      outputFormats:["JPG","PNG"],
    },
  },
  {
    name:"Nano Banana 2", modelId:"nano-banana-2", vendor:"Google",
    tag:"Popular", color:"#a855f7", speed:3, supportsRefImage:true,
    desc:"Google 最新旗舰图像模型，高画质高理解力",
    options:{
      aspectRatios:["Auto","1:1","1:4","1:8","2:3","3:2","3:4","4:1","4:3","4:5","5:4","8:1","9:16","16:9","21:9"],
      resolutions:["1K","2K","4K"],
      outputFormats:["JPG","PNG"],
    },
  },
  {
    name:"Seedream 5.0 Lite", modelId:"seedream-5.0-lite", vendor:"ByteDance",
    tag:"New", color:"#22d3ee", speed:3, supportsRefImage:true,
    desc:"字节跳动出品，性价比极高的快速生成模型",
    options:{
      aspectRatios:["1:1","2:3","3:2","3:4","4:3","9:16","16:9"],
      qualities:[{value:"basic",label:"Basic (2K)"},{value:"high",label:"High (3K)"}],
    },
  },
  {
    name:"Seedream 4.5", modelId:"seedream-4.5", vendor:"ByteDance",
    tag:"", color:"#4ade80", speed:2, supportsRefImage:true,
    desc:"字节跳动出品，多风格场景生成",
    options:{
      aspectRatios:["1:1","2:3","3:2","3:4","4:3","9:16","16:9"],
      qualities:[{value:"basic",label:"Basic (2K)"},{value:"high",label:"High (4K)"}],
    },
  },
  {
    name:"gpt-image-1.5", modelId:"gpt-image-1.5", vendor:"OpenAI",
    tag:"", color:"#60a5fa", speed:2, supportsRefImage:true,
    desc:"OpenAI 图像模型，指令遵循与细节还原极强",
    options:{
      aspectRatios:["1:1","2:3","3:2"],
      qualities:[{value:"basic",label:"Basic"},{value:"high",label:"High"}],
    },
  },
  {
    name:"Z-Image", modelId:"z-image", vendor:"Qwen",
    tag:"", color:"#ec4899", speed:3, supportsRefImage:false,
    desc:"阿里通义出品，超低价格快速出图",
    options:{
      aspectRatios:["1:1","3:4","4:3","9:16","16:9"],
    },
  },
  {
    name:"Midjourney", modelId:"midjourney", vendor:"Midjourney",
    tag:"Featured", color:"#818cf8", speed:2, supportsRefImage:true,
    desc:"Midjourney v7，顶级艺术风格图像生成",
    options:{
      aspectRatios:["1:1","2:3","3:2","3:4","4:3","5:6","9:16","16:9"],
      speeds:[{value:"relax",label:"Relax"},{value:"fast",label:"Fast"},{value:"turbo",label:"Turbo"}],
    },
  },
  {
    name:"Grok Imagine", modelId:"grok-imagine", vendor:"xAI",
    tag:"New", color:"#f59e0b", speed:3, supportsRefImage:true,
    desc:"xAI 出品，高速图像生成，支持多种风格",
    options:{
      aspectRatios:["1:1","2:3","3:2","9:16","16:9"],
    },
  },
];

const SAMPLE_IMAGES = [
  { id: 1, prompt: "赛博朋克城市夜景，霓虹灯闪烁", model: "Flux Pro 1.1", ratio: "16:9", date: "2026-02-27", fav: false, color: "#1a1a2e" },
  { id: 2, prompt: "古风仙侠少女站在瀑布前", model: "SD 3.5", ratio: "2:3", date: "2026-02-26", fav: true, color: "#1e3a2f" },
  { id: 3, prompt: "极简主义客厅室内设计", model: "Recraft V3", ratio: "4:3", date: "2026-02-25", fav: false, color: "#2a1f1f" },
  { id: 4, prompt: "宇航员在火星上喝咖啡", model: "Ideogram 3.0", ratio: "1:1", date: "2026-02-25", fav: true, color: "#1f1a2e" },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--bg0:#111113;--bg1:#161618;--bg2:#1c1c1f;--bgc:#19191c;--bgh:#222225;--bd:#28282c;--bdl:#323236;--t1:#e8e8ea;--t2:#8a8a94;--t3:#56565e;--ac:#d4a574;--ach:#e0b88a;--acg:rgba(212,165,116,0.15);--pu:#9b8ec4;--cy:#7cb8c4;--gn:#7ec49b;--sw:220px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--bg0);color:var(--t1);-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--bd);border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 12px var(--acg)}50%{box-shadow:0 0 24px var(--acg)}}
@keyframes meshMove{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-30px,20px) scale(1.05)}}
.stg>*{animation:fadeUp .4s ease-out both}
.stg>*:nth-child(1){animation-delay:.03s}.stg>*:nth-child(2){animation-delay:.06s}.stg>*:nth-child(3){animation-delay:.09s}.stg>*:nth-child(4){animation-delay:.12s}.stg>*:nth-child(5){animation-delay:.15s}.stg>*:nth-child(6){animation-delay:.18s}
`;

function Sidebar({page,setPage,col,setCol,setTab,currentUser}){
  const nav=[{id:PAGES.HOME,icon:Icons.home,label:"首页"},{id:PAGES.LIBRARY,icon:Icons.grid,label:"我的作品"},{id:PAGES.FAVORITES,icon:Icons.heart,label:"收藏"},{id:PAGES.PRICING,icon:Icons.dollar,label:"定价"},...(currentUser?.role==='admin'?[{id:PAGES.ADMIN,icon:Icons.user,label:"管理面板"}]:[])
  ];
  const tools=[{icon:Icons.sparkle,label:"图像生成",tab:"generate"},{icon:Icons.enhance,label:"图像增强",tab:"enhance"}];
  return(
    <aside style={{width:col?56:"var(--sw)",minHeight:"100vh",background:"var(--bg1)",borderRight:"1px solid var(--bd)",display:"flex",flexDirection:"column",transition:"width .25s ease",position:"fixed",left:0,top:0,bottom:0,zIndex:100,overflow:"hidden"}}>
      <div style={{padding:col?"20px 0":"20px 20px",display:"flex",alignItems:"center",gap:3,justifyContent:col?"center":"flex-start",borderBottom:"1px solid var(--bd)",minHeight:60}}>
        <svg width="26" height="26" viewBox="0 0 36 36" style={{flexShrink:0}}>
          <path d="M4 6L16 30L18 18L10 6Z" fill="#d4a574"/>
          <path d="M10 6L18 18L16 30L22 6Z" fill="#b8956a"/>
          <path d="M22 6L18 18L16 30L28 10Z" fill="#9b8060"/>
          <path d="M19.5 11l-4.5 7h3.5l-1 5.5 4.5-7h-3.5l1-5.5z" fill="#e8e8ea"/>
        </svg>
        {!col&&<span style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:16,letterSpacing:"-.02em",whiteSpace:"nowrap",color:"var(--t1)"}}>PictureMe</span>}
      </div>
      <button onClick={()=>setCol(!col)} style={{position:"absolute",top:18,right:-10,width:20,height:20,borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--bd)",color:"var(--t3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,padding:0,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--ac)';e.currentTarget.style.color='var(--t1)';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.color='var(--t3)';}}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{transform:col?"rotate(180deg)":"none",transition:"transform .25s"}}><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <nav style={{padding:"14px 8px",flex:1,display:"flex",flexDirection:"column",gap:1}}>
        {!col&&<div style={{padding:"0 12px",marginBottom:8}}><span style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".1em",color:"var(--t3)"}}>导航</span></div>}
        {nav.map(it=>(
          <button key={it.id} onClick={()=>setPage(it.id)} style={{display:"flex",alignItems:"center",gap:10,padding:col?"9px 0":"9px 12px",justifyContent:col?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:page===it.id?"rgba(212,165,116,.1)":"transparent",color:page===it.id?"var(--ac)":"var(--t2)",fontFamily:"inherit",fontSize:13,fontWeight:500,transition:"all .15s",whiteSpace:"nowrap",width:"100%"}}>
            <span style={{display:"flex",flexShrink:0,opacity:page===it.id?1:.7}}>{it.icon}</span>{!col&&it.label}
          </button>
        ))}
        {!col&&<div style={{padding:"0 12px",margin:"16px 0 8px"}}><span style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".1em",color:"var(--t3)"}}>工具</span></div>}
        {tools.map((t,i)=>(
          <button key={i} onClick={()=>{setPage(PAGES.HOME);setTab(t.tab);}} style={{display:"flex",alignItems:"center",gap:10,padding:col?"9px 0":"9px 12px",justifyContent:col?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"var(--t2)",fontFamily:"inherit",fontSize:13,fontWeight:500,transition:"all .15s",whiteSpace:"nowrap",width:"100%"}}>
            <span style={{display:"flex",flexShrink:0,opacity:.7}}>{t.icon}</span>{!col&&t.label}
          </button>
        ))}
      </nav>
      {!col&&(
        <div style={{padding:14,borderTop:"1px solid var(--bd)"}}>
          <div style={{background:"var(--bg2)",borderRadius:10,padding:14,border:"1px solid var(--bd)"}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:4,color:"var(--t1)"}}>升级 Pro</div>
            <div style={{fontSize:11,color:"var(--t3)",lineHeight:1.5}}>无限生成，更多模型</div>
            <button onClick={()=>setPage(PAGES.PRICING)} style={{marginTop:10,width:"100%",padding:7,borderRadius:6,border:"none",cursor:"pointer",background:"var(--ac)",color:"var(--bg0)",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>查看方案</button>
          </div>
        </div>
      )}
    </aside>
  );
}

function ModelCard({model,selected,onClick}){
  const[h,sH]=useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{background:selected?"rgba(212,165,116,.06)":"var(--bgc)",border:selected?"1.5px solid var(--ac)":"1px solid var(--bd)",borderRadius:10,cursor:"pointer",transition:"all .2s ease",transform:h?"translateY(-2px)":"none",boxShadow:h?"0 8px 24px rgba(0,0,0,.2)":"none",overflow:"hidden",minWidth:190,flex:"0 0 auto"}}>
      <div style={{height:72,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${model.color}18,${model.color}06)`}}>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 40% 50%,${model.color}22,transparent 70%)`}}/>
        {model.tag&&<span style={{position:"absolute",top:8,left:8,background:"rgba(255,255,255,.08)",color:"var(--t2)",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:4,backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.06)"}}>{model.tag==="Featured"?"推荐":model.tag==="New"?"新":"热门"}</span>}
        {model.supportsRefImage&&<span style={{position:"absolute",bottom:6,right:8,fontSize:10,color:"var(--t3)",fontWeight:500}}>支持参考图</span>}
      </div>
      <div style={{padding:"10px 12px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <h4 style={{fontSize:13,fontWeight:600}}>{model.name}</h4>
          <span style={{fontSize:11,color:"var(--t3)",fontWeight:500}}>{model.vendor}</span>
        </div>
        <p style={{fontSize:11,color:"var(--t3)",lineHeight:1.5}}>{model.desc}</p>
      </div>
    </div>
  );
}

// 全屏查看器
function Lightbox({image,onClose,onEdit,apiFetch:apiFetchProp}){
  const apiFetch=apiFetchProp||fetch;
  const doDownload=async e=>{
    e.stopPropagation();
    if(!image.imageUrl)return;
    try{
      const res=await apiFetch(`/api/download?url=${encodeURIComponent(image.imageUrl)}`);
      const blob=await res.blob();
      const href=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=href;a.download=`pictureme-${image.id||Date.now()}.jpg`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(href);
    }catch(err){console.error('下载失败',err);}
  };
  useEffect(()=>{
    const h=e=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',h);return()=>document.removeEventListener('keydown',h);
  },[onClose]);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.92)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn .15s ease-out",cursor:"zoom-out"}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,width:36,height:36,borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>{Icons.x}</button>
      <div onClick={e=>e.stopPropagation()} style={{maxWidth:"min(90vw,960px)",width:"100%",display:"flex",flexDirection:"column",gap:12,animation:"scaleIn .2s ease-out",cursor:"default"}}>
        <img src={image.imageUrl} alt={image.prompt} style={{width:"100%",maxHeight:"76vh",objectFit:"contain",borderRadius:10}}/>
        <div style={{display:"flex",alignItems:"center",gap:14,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"12px 16px"}}>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:500,lineHeight:1.6,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{image.prompt}</p>
            <div style={{display:"flex",gap:12}}>
              <span style={{fontSize:11,color:"var(--t3)"}}>{image.model}</span>
              {image.ratio&&<span style={{fontSize:11,color:"var(--t3)",fontFamily:"'JetBrains Mono',monospace"}}>{image.ratio}</span>}
              <span style={{fontSize:11,color:"var(--t3)"}}>{image.date}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            {onEdit&&<button onClick={e=>{e.stopPropagation();onClose();onEdit(image);}} style={{padding:"8px 18px",borderRadius:6,border:"1px solid var(--bd)",background:"transparent",color:"var(--t2)",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              {Icons.edit}编辑
            </button>}
            <button onClick={doDownload} style={{padding:"8px 18px",borderRadius:6,border:"none",background:"var(--ac)",color:"var(--bg0)",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              {Icons.download}下载原图
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 图片编辑 Modal
function EditModal({image, onClose, onEditComplete, apiFetch:apiFetchProp}){
  const apiFetch=apiFetchProp||fetch;
  const[editPrompt,setEditPrompt]=useState('');
  const[editing,setEditing]=useState(false);
  const[error,setError]=useState(null);
  const[resultUrl,setResultUrl]=useState(null);

  useEffect(()=>{
    const h=e=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',h);return()=>document.removeEventListener('keydown',h);
  },[onClose]);

  const doEdit=async()=>{
    if(!editPrompt.trim()||editing)return;
    setEditing(true);setError(null);
    try{
      const res=await apiFetch('/api/edit',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({prompt:editPrompt,imageUrl:image.imageUrl,outputFormat:'png',imageSize:'1:1'}),
      });
      const{taskId,error:err}=await res.json();
      if(!taskId)throw new Error(err||'创建任务失败');
      let retries=0;const MAX_RETRIES=60;
      const poll=async()=>{
        if(++retries>MAX_RETRIES){setError('编辑超时，请重试');setEditing(false);return;}
        const s=await apiFetch(`/api/generate/status/${taskId}`);
        const d=await s.json();
        if(d.status==='success'){
          setResultUrl(d.images[0]||null);
          setEditing(false);
          onEditComplete?.(d.images,editPrompt);
        }else if(d.status==='failed'){
          setError(d.error||'编辑失败，请重试');setEditing(false);
        }else setTimeout(poll,3000);
      };
      setTimeout(poll,3000);
    }catch(e){setError(e.message);setEditing(false);}
  };

  const doDownload=async url=>{
    try{
      const res=await apiFetch(`/api/download?url=${encodeURIComponent(url)}`);
      const blob=await res.blob();
      const href=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=href;a.download=`edited-${Date.now()}.jpg`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(href);
    }catch(e){console.error(e);}
  };

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.88)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn .15s ease-out"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"min(92vw,860px)",background:"var(--bg1)",borderRadius:12,border:"1px solid var(--bd)",overflow:"hidden",animation:"scaleIn .2s ease-out"}}>
        {/* 标题栏 */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid var(--bd)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:"var(--ac)",display:"flex"}}>{Icons.edit}</span>
            <span style={{fontSize:16,fontWeight:700}}>AI 图片编辑</span>
            <span style={{fontSize:12,color:"var(--t3)",background:"var(--bg2)",padding:"2px 8px",borderRadius:6}}>Nano Banana Edit</span>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:"none",background:"var(--bgh)",color:"var(--t2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icons.x}</button>
        </div>

        {/* 内容区 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
          {/* 左：原图 */}
          <div style={{padding:24,borderRight:"1px solid var(--bd)"}}>
            <p style={{fontSize:12,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:12}}>原图</p>
            <div style={{borderRadius:14,overflow:"hidden",background:"#111",border:"1px solid var(--bd)"}}>
              <img src={image.imageUrl} alt="original" style={{width:"100%",maxHeight:320,objectFit:"contain",display:"block"}}/>
            </div>
            <p style={{fontSize:12,color:"var(--t3)",marginTop:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{image.prompt}</p>
          </div>

          {/* 右：编辑区 / 结果 */}
          <div style={{padding:24,display:"flex",flexDirection:"column",gap:14}}>
            {resultUrl?(
              <>
                <p style={{fontSize:12,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".06em"}}>编辑结果</p>
                <div style={{borderRadius:14,overflow:"hidden",background:"#111",border:"1px solid var(--bdl)"}}>
                  <img src={resultUrl} alt="edited" style={{width:"100%",maxHeight:320,objectFit:"contain",display:"block"}}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>doDownload(resultUrl)} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"var(--ac)",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    {Icons.download}下载
                  </button>
                  <button onClick={()=>setResultUrl(null)} style={{padding:"10px 16px",borderRadius:10,border:"1px solid var(--bd)",background:"transparent",color:"var(--t2)",fontFamily:"inherit",fontSize:13,cursor:"pointer"}}>再次编辑</button>
                </div>
              </>
            ):(
              <>
                <p style={{fontSize:12,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".06em"}}>编辑描述</p>
                <textarea
                  value={editPrompt}
                  onChange={e=>setEditPrompt(e.target.value)}
                  placeholder="描述你想要如何修改这张图片... 例如：将背景改为夕阳海滩，给人物添加太阳镜"
                  style={{flex:1,minHeight:160,resize:"none",background:"var(--bgc)",border:"1px solid var(--bd)",borderRadius:12,outline:"none",color:"var(--t1)",fontFamily:"inherit",fontSize:14,lineHeight:1.7,padding:"14px 16px"}}
                />
                {error&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",fontSize:13}}>{error}</div>}
                <button onClick={doEdit} disabled={!editPrompt.trim()||editing} style={{padding:"11px",borderRadius:8,border:"none",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:!editPrompt.trim()||editing?"not-allowed":"pointer",background:!editPrompt.trim()||editing?"var(--bgh)":"var(--ac)",color:!editPrompt.trim()||editing?"var(--t3)":"var(--bg0)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {editing?<><span style={{width:13,height:13,border:"2px solid rgba(0,0,0,.2)",borderTopColor:"var(--bg0)",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>编辑中...</>:"开始编辑"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageCard({image,onFav,onDelete,onEdit,apiFetch:apiFetchProp}){
  const apiFetch=apiFetchProp||fetch;
  const[h,sH]=useState(false);
  const[viewing,setViewing]=useState(false);
  const ar={"16:9":"16/9","9:16":"9/14","4:3":"4/3","3:4":"3/4","2:3":"2/3","3:2":"3/2","4:5":"4/5","5:4":"5/4","5:6":"5/6","1:1":"1/1","21:9":"21/9"}[image.ratio]||"1/1";

  const doDownload=async e=>{
    e.stopPropagation();
    if(!image.imageUrl)return;
    try{
      const res=await apiFetch(`/api/download?url=${encodeURIComponent(image.imageUrl)}`);
      const blob=await res.blob();
      const href=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=href;a.download=`pictureme-${image.id}.jpg`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(href);
    }catch(err){console.error('下载失败',err);}
  };

  return(
    <>
      <div onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{borderRadius:10,overflow:"hidden",position:"relative",background:"var(--bgc)",border:"1px solid var(--bd)",transition:"all .2s ease",transform:h?"translateY(-2px)":"none",boxShadow:h?"0 6px 20px rgba(0,0,0,.2)":"none"}}>
        <div onClick={()=>image.imageUrl&&setViewing(true)} style={{aspectRatio:ar,overflow:"hidden",background:"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",cursor:image.imageUrl?"zoom-in":"default"}}>
          {image.imageUrl
            ? <img src={image.imageUrl} alt={image.prompt} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
            : <span style={{color:"var(--t3)",display:"flex"}}>{Icons.image}</span>
          }
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.7),transparent 50%)",opacity:h?1:0,transition:"opacity .2s",display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:10}}>
            <div style={{display:"flex",gap:4}}>
              {[
                {icon:Icons.heart,act:e=>{e.stopPropagation();onFav?.(image.id);},bg:image.fav?"var(--ac)":"rgba(255,255,255,.12)"},
                {icon:Icons.download,act:image.imageUrl?doDownload:e=>e.stopPropagation()},
                ...(image.imageUrl&&onEdit?[{icon:Icons.edit,act:e=>{e.stopPropagation();onEdit(image);}}]:[]),
                {icon:Icons.trash,act:e=>{e.stopPropagation();onDelete?.(image.id);}},
              ].map((b,i)=>(
                <button key={i} onClick={b.act} style={{width:28,height:28,borderRadius:6,border:"none",background:b.bg||"rgba(255,255,255,.12)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>{b.icon}</button>
              ))}
            </div>
            <span style={{fontSize:10,color:"rgba(255,255,255,.5)",fontFamily:"'JetBrains Mono',monospace"}}>{image.ratio}</span>
          </div>
        </div>
        <div style={{padding:"10px 12px"}}>
          <p style={{fontSize:12,fontWeight:500,lineHeight:1.5,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--t1)"}}>{image.prompt}</p>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:10,color:"var(--t3)"}}>{image.model}</span>
            <span style={{fontSize:10,color:"var(--t3)"}}>{image.date}</span>
          </div>
        </div>
      </div>
      {viewing&&image.imageUrl&&<Lightbox image={image} onClose={()=>setViewing(false)} onEdit={onEdit} apiFetch={apiFetch}/>}
    </>
  );
}

function EnhanceTab({apiFetch:apiFetchProp}){
  const apiFetch=apiFetchProp||fetch;
  const fileInputRef=useRef(null);
  const[file,setFile]=useState(null);
  const[previewUrl,setPreviewUrl]=useState(null);
  const[factor,setFactor]=useState('2');
  const[enhancing,setEnhancing]=useState(false);
  const[error,setError]=useState(null);
  const[results,setResults]=useState([]);
  const[dragging,setDragging]=useState(false);
  const[progress,setProgress]=useState(0);
  const[viewingResult,setViewingResult]=useState(null);

  const handleFile=f=>{
    if(!f||!f.type.startsWith('image/'))return;
    setFile(f);setPreviewUrl(URL.createObjectURL(f));setError(null);setResults([]);
  };

  const doEnhance=async()=>{
    if(!file||enhancing)return;
    setEnhancing(true);setError(null);setProgress(0);
    try{
      const formData=new FormData();formData.append('file',file);
      const uploadRes=await apiFetch('/api/upload',{method:'POST',body:formData});
      const{url,error:upErr}=await uploadRes.json();
      if(!url)throw new Error(upErr||'图片上传失败');
      const enhRes=await apiFetch('/api/enhance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageUrl:url,upscaleFactor:factor})});
      const{taskId,error:taskErr}=await enhRes.json();
      if(!taskId)throw new Error(taskErr||'创建任务失败');
      let retries=0;const MAX_RETRIES=60;
      const poll=async()=>{
        if(++retries>MAX_RETRIES){setError('增强超时，请重试');setEnhancing(false);return;}
        const d=await(await apiFetch(`/api/enhance/status/${taskId}`)).json();
        if(d.status==='success'){setResults(d.images||[]);setEnhancing(false);}
        else if(d.status==='failed'){setError(d.error||'增强失败，请重试');setEnhancing(false);}
        else{setProgress(d.progress||0);setTimeout(poll,3000);}
      };
      setTimeout(poll,3000);
    }catch(e){setError(e.message);setEnhancing(false);}
  };

  const today=new Date().toISOString().slice(0,10);
  return(
    <div style={{marginBottom:28}}>
      <div onClick={()=>fileInputRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}} style={{background:dragging?"rgba(124,184,196,.04)":"var(--bgc)",border:`1.5px dashed ${dragging?"var(--cy)":"var(--bd)"}`,borderRadius:10,padding:previewUrl?0:"40px 36px",textAlign:"center",cursor:"pointer",transition:"all .2s",marginBottom:16,overflow:"hidden",position:"relative",minHeight:previewUrl?220:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        {previewUrl?(
          <><img src={previewUrl} alt="preview" style={{width:"100%",maxHeight:360,objectFit:"contain",display:"block",borderRadius:18}}/><div style={{position:"absolute",bottom:12,right:12,padding:"6px 14px",borderRadius:10,background:"rgba(0,0,0,.6)",border:"1px solid rgba(255,255,255,.12)",fontSize:12,color:"rgba(255,255,255,.7)",backdropFilter:"blur(8px)"}}>点击更换图片</div></>
        ):(
          <div>
            <div style={{width:56,height:56,borderRadius:12,margin:"0 auto 16px",background:"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--bd)",color:"var(--t3)"}}>{Icons.upload}</div>
            <h3 style={{fontSize:15,fontWeight:600,marginBottom:6}}>点击或拖拽上传图像</h3>
            <p style={{fontSize:12,color:"var(--t3)"}}>支持 JPG / PNG / WebP，最大 20MB</p>
          </div>
        )}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <span style={{fontSize:12,fontWeight:600,color:"var(--t3)",whiteSpace:"nowrap"}}>放大倍数</span>
        <div style={{display:"flex",gap:4,padding:3,background:"var(--bg2)",borderRadius:6}}>
          {[{v:'2',l:'2x 高清'},{v:'4',l:'4x 超清'}].map(o=>(
            <button key={o.v} onClick={()=>setFactor(o.v)} style={{padding:"7px 20px",borderRadius:4,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,transition:"all .15s",background:factor===o.v?"rgba(124,184,196,.1)":"transparent",color:factor===o.v?"var(--cy)":"var(--t3)",boxShadow:factor===o.v?"inset 0 0 0 1px var(--cy)":"none"}}>{o.l}</button>
          ))}
        </div>
        <button onClick={doEnhance} disabled={!file||enhancing} style={{marginLeft:"auto",padding:"8px 20px",borderRadius:6,border:"none",fontFamily:"inherit",fontSize:12,fontWeight:600,transition:"all .2s",cursor:!file||enhancing?"not-allowed":"pointer",background:!file||enhancing?"var(--bgh)":"var(--ac)",color:!file||enhancing?"var(--t3)":"var(--bg0)",display:"flex",alignItems:"center",gap:6}}>
          {enhancing?<><span style={{width:12,height:12,border:"2px solid rgba(0,0,0,.2)",borderTopColor:"var(--bg0)",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>增强中{progress>0?` ${progress}%`:"..."}</>:"开始增强"}
        </button>
      </div>
      {error&&<div style={{padding:"12px 16px",borderRadius:12,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",fontSize:13,marginBottom:16}}>{error}</div>}
      {results.length>0&&(
        <div style={{marginTop:8}}>
          <h4 style={{fontSize:14,fontWeight:700,marginBottom:12,color:"var(--cy)"}}>⚡ 增强完成</h4>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {results.map((url,i)=>{
              const img={id:Date.now()+i,imageUrl:url,prompt:`${factor}× 超分增强`,model:"Topaz Upscale",ratio:"",date:today,fav:false,color:"#1a1a20"};
              return(
                <div key={i} style={{borderRadius:14,overflow:"hidden",border:"1px solid var(--bdl)",background:"var(--bgc)"}}>
                  <div onClick={()=>setViewingResult(img)} style={{cursor:"zoom-in",position:"relative"}}>
                    <img src={url} alt="enhanced" style={{width:"100%",display:"block",maxHeight:320,objectFit:"contain",background:"#111"}}/>
                    <div style={{position:"absolute",top:10,right:10,padding:"4px 10px",borderRadius:8,background:"rgba(34,211,238,.15)",border:"1px solid var(--cy)",color:"var(--cy)",fontSize:11,fontWeight:700}}>{factor}× 超分</div>
                  </div>
                  <div style={{padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:"var(--t3)"}}>Topaz Upscale · {today}</span>
                    <button onClick={async()=>{try{const res=await apiFetch(`/api/download?url=${encodeURIComponent(url)}`);const blob=await res.blob();const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download=`enhanced-${factor}x-${Date.now()}.jpg`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(href);}catch(e){console.error(e);}}} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:9,border:"none",background:"var(--ac)",color:"#fff",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                      {Icons.download}下载
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {viewingResult&&<Lightbox image={viewingResult} onClose={()=>setViewingResult(null)}/>}
    </div>
  );
}

function HomePage({tab,setTab,images,addImages,loadingImages,toggleFav,deleteImage,apiFetch,currentUser,refreshCredits}){
  const refInputRef=useRef(null);

  const[prompt,setPrompt]=useState("");
  const[selModel,setSelModel]=useState(0);
  const[aspectRatio,setAspectRatio]=useState(MODELS[0].options.aspectRatios[0]);
  const[resolution,setResolution]=useState(MODELS[0].options.resolutions?.[0]??null);
  const[quality,setQuality]=useState(MODELS[0].options.qualities?.[0]?.value??null);
  const[outputFormat,setOutputFormat]=useState(MODELS[0].options.outputFormats?.[0]??null);
  const[speed,setSpeed]=useState(MODELS[0].options.speeds?.[1]?.value??null);
  const[gen,setGen]=useState(false);
  const[genError,setGenError]=useState(null);
  const[openDropdown,setOpenDropdown]=useState(null);
  // 参考图
  const[refImageUrl,setRefImageUrl]=useState(null);
  const[refPreview,setRefPreview]=useState(null);
  const[uploadingRef,setUploadingRef]=useState(false);
  // 编辑
  const[editImage,setEditImage]=useState(null);

  const opts=MODELS[selModel].options;
  const supportsRef=MODELS[selModel].supportsRefImage;

  useEffect(()=>{
    const o=MODELS[selModel].options;
    setAspectRatio(o.aspectRatios[0]);
    setResolution(o.resolutions?.[0]??null);
    setQuality(o.qualities?.[0]?.value??null);
    setOutputFormat(o.outputFormats?.[0]??null);
    setSpeed(o.speeds?.[1]?.value??null);
    setOpenDropdown(null);
    if(!MODELS[selModel].supportsRefImage){setRefImageUrl(null);setRefPreview(null);}
  },[selModel]);

  useEffect(()=>{
    const handler=e=>{if(!e.target.closest('[data-pill]'))setOpenDropdown(null);};
    document.addEventListener('click',handler);
    return ()=>document.removeEventListener('click',handler);
  },[]);

  const handleRefFile=async f=>{
    if(!f||!f.type.startsWith('image/'))return;
    if(refPreview)URL.revokeObjectURL(refPreview);
    setRefPreview(URL.createObjectURL(f));
    setUploadingRef(true);
    try{
      const fd=new FormData();fd.append('file',f);
      const res=await apiFetch('/api/upload',{method:'POST',body:fd});
      const{url,error:err}=await res.json();
      if(!url)throw new Error(err);
      setRefImageUrl(url);
    }catch(e){console.error('参考图上传失败',e);setRefPreview(null);}
    finally{setUploadingRef(false);}
  };

  const clearRef=e=>{e.stopPropagation();if(refPreview)URL.revokeObjectURL(refPreview);setRefImageUrl(null);setRefPreview(null);if(refInputRef.current)refInputRef.current.value='';};

  const doGen=async()=>{
    if(!prompt.trim()||gen)return;
    setGen(true);setGenError(null);
    try{
      const res=await apiFetch('/api/generate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          prompt,
          model:MODELS[selModel].modelId,
          aspectRatio:aspectRatio.toLowerCase(),
          ...(resolution&&{resolution}),
          ...(quality&&{quality}),
          ...(outputFormat&&{outputFormat:outputFormat.toLowerCase()}),
          ...(refImageUrl&&{refImageUrl}),
          ...(speed&&{speed}),
        }),
      });
      const{taskId,error:err}=await res.json();
      if(!taskId)throw new Error(err||'创建任务失败');
      const snapPrompt=prompt,snapModel=MODELS[selModel].name,snapRatio=aspectRatio,snapColor=MODELS[selModel].color;
      let retries=0;const MAX_RETRIES=60;
      const poll=async()=>{
        if(++retries>MAX_RETRIES){setGenError('生成超时，请重试');setGen(false);return;}
        const d=await(await apiFetch(`/api/generate/status/${taskId}`)).json();
        if(d.status==='success'){
          const newImgs=d.images.map((url,i)=>({
            id:crypto.randomUUID(),prompt:snapPrompt,model:snapModel,
            ratio:snapRatio,date:new Date().toISOString().slice(0,10),
            fav:false,imageUrl:url,color:snapColor,
          }));
          addImages(newImgs);
          setGen(false);
        }else if(d.status==='failed'){setGenError(d.error||'生成失败，请重试');setGen(false);}
        else setTimeout(poll,3000);
      };
      setTimeout(poll,3000);
    }catch(e){setGenError(e.message);setGen(false);}
  };

  const handleEditComplete=(urls,editedPrompt)=>{
    if(!urls?.length)return;
    const today=new Date().toISOString().slice(0,10);
    const newImgs=urls.map((url,i)=>({
      id:crypto.randomUUID(),prompt:editedPrompt,model:'Nano Banana Edit',
      ratio:editImage?.ratio||'1:1',date:today,fav:false,
      imageUrl:url,color:'#1a2030',
    }));
    addImages(newImgs);
  };

  return(
    <div className="stg" style={{maxWidth:1100,margin:"0 auto"}}>
      {/* Logo 标题 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",paddingTop:20,marginBottom:40}}>
        <span style={{fontFamily:"'Outfit',sans-serif",fontSize:36,fontWeight:800,letterSpacing:"-.03em",color:"var(--t1)"}}>PictureMe</span>
      </div>

      {tab==="generate"?(
        <>
          {/* ── 主输入区 ── */}
          <div style={{background:"var(--bgc)",borderRadius:12,border:"1px solid var(--bd)",marginBottom:14,position:"relative",zIndex:10}}>
            {/* hidden file input for ref image */}
            <input ref={refInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} onChange={e=>handleRefFile(e.target.files[0])}/>
            {/* 参考图预览（输入框内顶部，像附件一样） */}
            {refPreview&&(
              <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid var(--bd)",background:"rgba(212,165,116,.04)"}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <img src={refPreview} style={{width:44,height:44,borderRadius:8,objectFit:"cover",border:uploadingRef?"1.5px solid var(--t3)":"1.5px solid var(--ac)",opacity:uploadingRef?.6:1,display:"block"}}/>
                  {uploadingRef?(
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,background:"rgba(0,0,0,.5)"}}>
                      <span style={{width:12,height:12,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>
                    </div>
                  ):(
                    <button onClick={clearRef} title="移除参考图" style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",border:"none",background:"rgba(0,0,0,.75)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,fontSize:12,lineHeight:1,fontWeight:700}}>×</button>
                  )}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:uploadingRef?"var(--t3)":"var(--t1)"}}>{uploadingRef?"上传中...":"参考图已添加"}</div>
                  {!uploadingRef&&<div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>将作为参考传给模型 · 点击 × 移除</div>}
                </div>
              </div>
            )}
            {/* 提示词输入框 */}
            <textarea
              value={prompt}
              onChange={e=>setPrompt(e.target.value)}
              onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();doGen();}}}
              placeholder="描述你想要生成的图像...  例如：一只穿着宇航服的猫在月球上弹吉他，电影级光线，超写实风格"
              style={{width:"100%",minHeight:120,resize:"none",background:"transparent",border:"none",outline:"none",color:"var(--t1)",fontFamily:"inherit",fontSize:14,lineHeight:1.8,padding:"18px 20px 14px",display:"block"}}
            />
            {/* 参数栏 - krea.ai 风格 pill buttons */}
            <div style={{borderTop:"1px solid var(--bd)",padding:"7px 10px",display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,.12)",overflow:"visible"}}>
              {(()=>{
                const MODEL_EMOJI={"Nano Banana Pro":"","Nano Banana 2":"","Seedream 5.0 Lite":"","Seedream 4.5":"","gpt-image-1.5":"","Z-Image":"","Midjourney":"","Grok Imagine":""};
                const pillStyle=(active)=>({position:"relative",display:"flex",alignItems:"center",gap:5,height:32,padding:"0 12px",borderRadius:6,border:active?"1px solid rgba(212,165,116,.35)":"1px solid rgba(255,255,255,.07)",background:active?"rgba(212,165,116,.08)":"rgba(255,255,255,.04)",color:active?"var(--ach)":"var(--t2)",cursor:"pointer",fontSize:12,fontWeight:500,transition:"all .15s",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit"});
                const dropStyle={position:"absolute",top:"calc(100% + 4px)",left:0,minWidth:160,background:"var(--bg2)",border:"1px solid var(--bd)",borderRadius:8,padding:"4px",zIndex:100,boxShadow:"0 6px 24px rgba(0,0,0,.4)",animation:"scaleIn .1s ease-out"};
                const optStyle=(sel)=>({display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",borderRadius:6,border:"none",background:sel?"rgba(212,165,116,.1)":"transparent",color:sel?"var(--ach)":"var(--t2)",cursor:"pointer",fontSize:12,fontWeight:sel?600:400,fontFamily:"inherit",transition:"background .1s",textAlign:"left"});
                const chevron=<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.5}}><polyline points="6 9 12 15 18 9"/></svg>;

                return(
                  <>
                    {/* Model pill */}
                    <div style={{position:"relative"}} data-pill>
                      <button onClick={()=>setOpenDropdown(openDropdown==='model'?null:'model')} style={pillStyle(openDropdown==='model')}>
                        {MODELS[selModel].name}
                        {chevron}
                      </button>
                      {openDropdown==='model'&&(
                        <div style={dropStyle}>
                          {MODELS.map((m,i)=>{
                            const tl=m.tag==="Featured"?"推荐":m.tag==="New"?"新":m.tag==="Popular"?"热门":null;
                            return(
                              <button key={i} onClick={()=>{setSelModel(i);setOpenDropdown(null);}} style={optStyle(selModel===i)}>
                                <span style={{flex:1}}>{m.name}</span>
                                {tl&&<span style={{fontSize:10,padding:"1px 5px",borderRadius:4,background:"rgba(255,255,255,.05)",color:"var(--t3)",fontWeight:600}}>{tl}</span>}
                                {selModel===i&&<span style={{color:"var(--ac)",fontSize:12}}>&#10003;</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Image prompt pill */}
                    {supportsRef&&(
                      <div data-pill style={{position:"relative",display:"flex",alignItems:"center"}}>
                        {refPreview?(
                          <button onClick={()=>refInputRef.current?.click()} style={{...pillStyle(false),gap:6,paddingLeft:4}}>
                            <div style={{position:"relative",width:26,height:26,flexShrink:0}}>
                              <img src={refPreview} style={{width:26,height:26,borderRadius:10,objectFit:"cover",display:"block",opacity:uploadingRef?.5:1}}/>
                              {uploadingRef&&<span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{width:10,height:10,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/></span>}
                            </div>
                            {uploadingRef?"上传中...":"参考图"}
                            <button onClick={clearRef} style={{display:"flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",border:"none",background:"rgba(255,255,255,.12)",color:"var(--t3)",cursor:"pointer",padding:0,fontSize:10,lineHeight:1,fontWeight:700,marginLeft:2}}>×</button>
                          </button>
                        ):(
                          <button onClick={()=>refInputRef.current?.click()} style={pillStyle(false)}>
                            {Icons.uploadSm}
                            参考图
                          </button>
                        )}
                      </div>
                    )}

                    {/* Ratio pill */}
                    <div style={{position:"relative"}} data-pill>
                      <button onClick={()=>setOpenDropdown(openDropdown==='ratio'?null:'ratio')} style={pillStyle(openDropdown==='ratio')}>
                        <span style={{fontSize:12,opacity:.7}}>□</span>
                        {aspectRatio}
                        {chevron}
                      </button>
                      {openDropdown==='ratio'&&(
                        <div style={{...dropStyle,display:"grid",gridTemplateColumns:"1fr 1fr",minWidth:200,gap:2}}>
                          {opts.aspectRatios.map(r=>(
                            <button key={r} onClick={()=>{setAspectRatio(r);setOpenDropdown(null);}} style={optStyle(aspectRatio===r)}>
                              {r}
                              {aspectRatio===r&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Resolution pill */}
                    {opts.resolutions&&(
                      <div style={{position:"relative"}} data-pill>
                        <button onClick={()=>setOpenDropdown(openDropdown==='resolution'?null:'resolution')} style={pillStyle(openDropdown==='resolution')}>
                          <span style={{fontSize:11,opacity:.7}}>◈</span>
                          {resolution}
                          {chevron}
                        </button>
                        {openDropdown==='resolution'&&(
                          <div style={dropStyle}>
                            {opts.resolutions.map(r=>(
                              <button key={r} onClick={()=>{setResolution(r);setOpenDropdown(null);}} style={optStyle(resolution===r)}>
                                {r}
                                {resolution===r&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quality pill */}
                    {opts.qualities&&(
                      <div style={{position:"relative"}} data-pill>
                        <button onClick={()=>setOpenDropdown(openDropdown==='quality'?null:'quality')} style={pillStyle(openDropdown==='quality')}>
                          <span style={{fontSize:11,opacity:.7}}>◇</span>
                          {opts.qualities.find(q=>q.value===quality)?.label||quality}
                          {chevron}
                        </button>
                        {openDropdown==='quality'&&(
                          <div style={dropStyle}>
                            {opts.qualities.map(q=>(
                              <button key={q.value} onClick={()=>{setQuality(q.value);setOpenDropdown(null);}} style={optStyle(quality===q.value)}>
                                {q.label}
                                {quality===q.value&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Speed pill (Midjourney) */}
                    {opts.speeds&&(
                      <div style={{position:"relative"}} data-pill>
                        <button onClick={()=>setOpenDropdown(openDropdown==='speed'?null:'speed')} style={pillStyle(openDropdown==='speed')}>
                          <span style={{fontSize:11,opacity:.7}}>⚡</span>
                          {opts.speeds.find(s=>s.value===speed)?.label||speed}
                          {chevron}
                        </button>
                        {openDropdown==='speed'&&(
                          <div style={dropStyle}>
                            {opts.speeds.map(s=>(
                              <button key={s.value} onClick={()=>{setSpeed(s.value);setOpenDropdown(null);}} style={optStyle(speed===s.value)}>
                                {s.label}
                                {speed===s.value&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Format pill */}
                    {opts.outputFormats&&(
                      <div style={{position:"relative"}} data-pill>
                        <button onClick={()=>setOpenDropdown(openDropdown==='format'?null:'format')} style={pillStyle(openDropdown==='format')}>
                          <span style={{fontSize:11,opacity:.7}}>📄</span>
                          {outputFormat}
                          {chevron}
                        </button>
                        {openDropdown==='format'&&(
                          <div style={dropStyle}>
                            {opts.outputFormats.map(f=>(
                              <button key={f} onClick={()=>{setOutputFormat(f);setOpenDropdown(null);}} style={optStyle(outputFormat===f)}>
                                {f}
                                {outputFormat===f&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Generate button */}
                    <button onClick={doGen} disabled={gen} style={{marginLeft:"auto",padding:"0 18px",height:32,borderRadius:6,border:"none",cursor:gen?"not-allowed":"pointer",background:gen?"var(--bgh)":"var(--ac)",color:gen?"var(--t3)":"var(--bg0)",fontFamily:"inherit",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6,transition:"all .2s",flexShrink:0}}>
                      {gen?<><span style={{width:12,height:12,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>生成中...</>:"生成"}
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
          {genError&&<p style={{color:"#ef4444",fontSize:13,marginBottom:14}}>{genError}</p>}
        </>
      ):(
        <EnhanceTab apiFetch={apiFetch}/>
      )}

      {/* 最近生成 */}
      <div style={{marginTop:32}}>
        <h3 style={{fontSize:15,fontWeight:600,marginBottom:14,color:"var(--t2)"}}>最近生成</h3>
        {loadingImages?(
          <div style={{display:"flex",alignItems:"center",gap:10,color:"var(--t3)",fontSize:13,padding:"20px 0"}}>
            <span style={{width:16,height:16,border:"2px solid var(--bd)",borderTopColor:"var(--ac)",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>
            加载历史记录...
          </div>
        ):(
          <div className="stg" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
            {(images.length===0?SAMPLE_IMAGES.slice(0,4):images.slice(0,12)).map(img=>(
              <ImageCard key={img.id} image={img} onFav={toggleFav} onDelete={deleteImage} onEdit={img.imageUrl?setEditImage:undefined} apiFetch={apiFetch}/>
            ))}
          </div>
        )}
      </div>

      {editImage&&(
        <EditModal
          image={editImage}
          onClose={()=>setEditImage(null)}
          onEditComplete={handleEditComplete}
          apiFetch={apiFetch}
        />
      )}
    </div>
  );
}

function LibraryPage({favorites=false,images=[],toggleFav,deleteImage,apiFetch}){
  const[filter,setFilter]=useState("全部");
  const now=new Date();
  const weekAgo=new Date(now);weekAgo.setDate(now.getDate()-7);
  const monthAgo=new Date(now);monthAgo.setMonth(now.getMonth()-1);
  const base=favorites?images.filter(i=>i.fav):images;
  const displayed=base.filter(img=>{
    if(filter==="全部")return true;
    if(!img.date)return false;
    const d=new Date(img.date);
    if(filter==="本周")return d>=weekAgo;
    if(filter==="本月")return d>=monthAgo;
    return true;
  });
  return(
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:700,letterSpacing:"-.02em"}}>{favorites?"收藏":"我的作品"}</h2>
          <p style={{fontSize:13,color:"var(--t3)",marginTop:4}}>共 {displayed.length} 张图像</p>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["全部","本周","本月"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 14px",borderRadius:6,border:filter===f?"1px solid var(--ac)":"1px solid var(--bd)",background:filter===f?"rgba(212,165,116,.08)":"transparent",color:filter===f?"var(--ac)":"var(--t3)",fontFamily:"inherit",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all .15s"}}>{f}</button>)}
        </div>
      </div>
      {displayed.length===0?(
        <div style={{textAlign:"center",padding:"80px 0"}}><p style={{color:"var(--t3)",fontSize:14}}>还没有{favorites?"收藏":"作品"}，快去创作吧</p></div>
      ):(
        <div className="stg" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
          {displayed.map(img=><ImageCard key={img.id} image={img} onFav={toggleFav} onDelete={deleteImage} apiFetch={apiFetch}/>)}
        </div>
      )}
    </div>
  );
}

function PricingPage(){
  const plans=[
    {name:"Free",price:"¥0",period:"/月",color:"var(--t2)",features:["每日 10 次生成","基础模型","标准分辨率","水印","社区支持"],cta:"当前方案",disabled:true},
    {name:"Pro",price:"¥49",period:"/月",color:"var(--ac)",featured:true,features:["每日 200 次生成","全部模型","4K 分辨率","无水印","图像增强","优先队列","API 访问"],cta:"升级 Pro",disabled:false},
    {name:"Team",price:"¥149",period:"/月",color:"var(--pu)",features:["无限生成","全部模型 + 抢先体验","4K+ 分辨率","无水印","图像增强无限","最高优先级","API 访问","团队协作","专属客服"],cta:"联系我们",disabled:false},
  ];
  return(
    <div style={{maxWidth:860,margin:"0 auto",textAlign:"center"}}>
      <h2 style={{fontSize:26,fontWeight:700,letterSpacing:"-.03em",marginBottom:6}}>选择方案</h2>
      <p style={{fontSize:13,color:"var(--t3)",marginBottom:36}}>所有方案均可随时取消，无隐藏费用</p>
      <div className="stg" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,alignItems:"start"}}>
        {plans.map((p,i)=>(
          <div key={i} style={{background:"var(--bgc)",border:p.featured?"1.5px solid var(--ac)":"1px solid var(--bd)",borderRadius:12,padding:24,position:"relative",overflow:"hidden"}}>
            {p.featured&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"var(--ac)"}}/>}
            <div style={{fontSize:13,fontWeight:600,color:p.color,marginBottom:10}}>{p.name}</div>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:2,marginBottom:20}}>
              <span style={{fontSize:34,fontWeight:700,letterSpacing:"-.03em"}}>{p.price}</span>
              <span style={{fontSize:13,color:"var(--t3)"}}>{p.period}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,textAlign:"left",marginBottom:24}}>
              {p.features.map((f,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:p.color,display:"flex",flexShrink:0}}>{Icons.check}</span><span style={{fontSize:13,color:"var(--t2)"}}>{f}</span></div>)}
            </div>
            <button disabled={p.disabled} style={{width:"100%",padding:10,borderRadius:8,border:"none",cursor:p.disabled?"default":"pointer",background:p.featured?"var(--ac)":p.disabled?"var(--bgh)":"var(--bg2)",color:p.featured?"var(--bg0)":p.disabled?"var(--t3)":"var(--t1)",fontFamily:"inherit",fontSize:13,fontWeight:600,transition:"all .15s"}}>{p.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 密码输入框（带眼睛切换） ─────────────────────────────
function PasswordInput({value,onChange,placeholder,style:extStyle,...rest}){
  const[show,setShow]=useState(false);
  return(
    <div style={{position:"relative",width:"100%"}}>
      <input type={show?"text":"password"} value={value} onChange={onChange} placeholder={placeholder||"密码"} style={extStyle} {...rest}/>
      <button type="button" onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--t3)",display:"flex",alignItems:"center",padding:0}}>
        {show?Icons.eyeOff:Icons.eye}
      </button>
    </div>
  );
}

// ─── 全屏登录页 ──────────────────────────────────────────
function LoginPage({onLogin}){
  const[username,setUsername]=useState('');
  const[password,setPassword]=useState('');
  const[error,setError]=useState(null);
  const[loading,setLoading]=useState(false);

  const doLogin=async e=>{
    e.preventDefault();
    if(!username.trim()||!password.trim())return;
    setLoading(true);setError(null);
    try{
      const res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'登录失败');
      onLogin(data.token,data.user);
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  const inputStyle={padding:"12px 16px",borderRadius:8,border:"1px solid var(--bd)",background:"var(--bgc)",color:"var(--t1)",fontFamily:"inherit",fontSize:14,outline:"none",width:"100%"};
  return(
    <div style={{minHeight:"100vh",background:"var(--bg0)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{width:380,background:"var(--bg1)",borderRadius:14,border:"1px solid var(--bd)",padding:"40px 36px",animation:"scaleIn .25s ease-out",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:40,height:40,borderRadius:10,margin:"0 auto 16px",background:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"var(--bg0)"}}>P</div>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:800,letterSpacing:"-.02em"}}>PictureMe</h2>
          <p style={{fontSize:13,color:"var(--t3)",marginTop:6}}>登录以继续你的创作之旅</p>
        </div>
        <form onSubmit={doLogin} style={{display:"flex",flexDirection:"column",gap:12}}>
          <input placeholder="用户名" value={username} onChange={e=>setUsername(e.target.value)} style={inputStyle} autoFocus/>
          <PasswordInput value={password} onChange={e=>setPassword(e.target.value)} style={{...inputStyle,paddingRight:38}}/>
          {error&&<div style={{padding:"8px 12px",borderRadius:8,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.15)",color:"#ef4444",fontSize:12}}>{error}</div>}
          <button type="submit" disabled={loading} style={{padding:12,borderRadius:8,border:"none",background:"var(--ac)",color:"var(--bg0)",fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
            {loading?<><span style={{width:14,height:14,border:"2px solid rgba(0,0,0,.2)",borderTopColor:"var(--bg0)",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>登录中...</>:"登录"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── 管理员面板 ──────────────────────────────────────────
function AdminPage({apiFetch}){
  const[users,setUsers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[newUser,setNewUser]=useState({username:'',password:'',role:'user',credits:100});
  const[recharge,setRecharge]=useState({userId:'',amount:100});
  const[msg,setMsg]=useState(null);
  // 编辑用户状态：{id, username, password}
  const[editUser,setEditUser]=useState(null);

  const loadUsers=async()=>{
    try{
      const res=await apiFetch('/api/admin/users');
      const data=await res.json();
      setUsers(data.users||[]);
    }catch{}
    finally{setLoading(false);}
  };
  useEffect(()=>{loadUsers();},[]);

  const createUser=async e=>{
    e.preventDefault();setMsg(null);
    try{
      const res=await apiFetch('/api/admin/create-user',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newUser)});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error);
      setMsg({type:'ok',text:`用户 ${data.user.username} 创建成功`});
      setNewUser({username:'',password:'',role:'user',credits:100});
      loadUsers();
    }catch(e){setMsg({type:'err',text:e.message});}
  };

  const doRecharge=async e=>{
    e.preventDefault();setMsg(null);
    try{
      const res=await apiFetch('/api/admin/recharge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:Number(recharge.userId),amount:Number(recharge.amount)})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error);
      setMsg({type:'ok',text:`已为 ${data.user.username} 充值，当前积分 ${data.user.credits}`});
      loadUsers();
    }catch(e){setMsg({type:'err',text:e.message});}
  };

  const deleteUser=async id=>{
    if(!confirm('确定删除此用户？'))return;
    try{
      const res=await apiFetch(`/api/admin/users/${id}`,{method:'DELETE'});
      if(!res.ok){const d=await res.json();throw new Error(d.error);}
      loadUsers();
    }catch(e){setMsg({type:'err',text:e.message});}
  };

  const doUpdateUser=async e=>{
    e.preventDefault();setMsg(null);
    if(!editUser)return;
    const body={userId:editUser.id};
    if(editUser.username)body.username=editUser.username;
    if(editUser.password)body.password=editUser.password;
    if(!body.username&&!body.password){setMsg({type:'err',text:'请填写要修改的用户名或密码'});return;}
    try{
      const res=await apiFetch('/api/admin/update-user',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error);
      setMsg({type:'ok',text:`用户 ${data.user.username} 信息已更新`});
      setEditUser(null);
      loadUsers();
    }catch(e){setMsg({type:'err',text:e.message});}
  };

  const inputStyle={padding:"9px 12px",borderRadius:6,border:"1px solid var(--bd)",background:"var(--bgc)",color:"var(--t1)",fontFamily:"inherit",fontSize:12,outline:"none"};
  const btnStyle={padding:"9px 16px",borderRadius:6,border:"none",background:"var(--ac)",color:"var(--bg0)",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer"};

  return(
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:20}}>管理员面板</h2>

      {msg&&<div style={{padding:"12px 16px",borderRadius:12,marginBottom:20,background:msg.type==='ok'?"rgba(74,222,128,.1)":"rgba(239,68,68,.1)",border:msg.type==='ok'?"1px solid rgba(74,222,128,.3)":"1px solid rgba(239,68,68,.2)",color:msg.type==='ok'?"var(--gn)":"#ef4444",fontSize:13}}>{msg.text}</div>}

      {/* 创建用户 */}
      <div style={{background:"var(--bgc)",borderRadius:10,border:"1px solid var(--bd)",padding:20,marginBottom:20}}>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>创建用户</h3>
        <form onSubmit={createUser} style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"end"}}>
          <div><label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>用户名</label><input value={newUser.username} onChange={e=>setNewUser({...newUser,username:e.target.value})} style={{...inputStyle,width:160}} required/></div>
          <div><label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>密码</label><PasswordInput value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})} style={{...inputStyle,width:160,paddingRight:36}} required/></div>
          <div><label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>角色</label>
            <select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})} style={{...inputStyle,width:100}}>
              <option value="user">user</option><option value="admin">admin</option>
            </select>
          </div>
          <div><label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>积分</label><input value={newUser.credits} onChange={e=>setNewUser({...newUser,credits:e.target.value})} type="number" style={{...inputStyle,width:100}}/></div>
          <button type="submit" style={btnStyle}>创建</button>
        </form>
      </div>

      {/* 修改用户 */}
      {editUser&&(
        <div style={{background:"var(--bgc)",borderRadius:10,border:"1px solid rgba(212,165,116,.2)",padding:20,marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <h3 style={{fontSize:16,fontWeight:700}}>修改用户 — {editUser.origName} (ID:{editUser.id})</h3>
            <button onClick={()=>setEditUser(null)} style={{width:28,height:28,borderRadius:8,border:"none",background:"var(--bgh)",color:"var(--t2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icons.x}</button>
          </div>
          <form onSubmit={doUpdateUser} style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"end"}}>
            <div><label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>新用户名（留空不改）</label><input value={editUser.username} onChange={e=>setEditUser({...editUser,username:e.target.value})} placeholder={editUser.origName} style={{...inputStyle,width:180}}/></div>
            <div><label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>新密码（留空不改）</label><PasswordInput value={editUser.password} onChange={e=>setEditUser({...editUser,password:e.target.value})} placeholder="输入新密码" style={{...inputStyle,width:180,paddingRight:36}}/></div>
            <button type="submit" style={btnStyle}>保存修改</button>
          </form>
        </div>
      )}

      {/* 积分充值 */}
      <div style={{background:"var(--bgc)",borderRadius:10,border:"1px solid var(--bd)",padding:20,marginBottom:20}}>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>积分充值</h3>
        <form onSubmit={doRecharge} style={{display:"flex",gap:10,alignItems:"end"}}>
          <div><label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>用户 ID</label>
            <select value={recharge.userId} onChange={e=>setRecharge({...recharge,userId:e.target.value})} style={{...inputStyle,width:200}}>
              <option value="">选择用户</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.username} (ID:{u.id}, 积分:{u.credits})</option>)}
            </select>
          </div>
          <div><label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>充值数量</label><input value={recharge.amount} onChange={e=>setRecharge({...recharge,amount:e.target.value})} type="number" style={{...inputStyle,width:120}}/></div>
          <button type="submit" style={btnStyle}>充值</button>
        </form>
      </div>

      {/* 用户列表 */}
      <div style={{background:"var(--bgc)",borderRadius:10,border:"1px solid var(--bd)",padding:20}}>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>用户列表</h3>
        {loading?<p style={{color:"var(--t3)",fontSize:13}}>加载中...</p>:(
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:"1px solid var(--bd)",color:"var(--t3)",textAlign:"left"}}>
                <th style={{padding:"8px 12px"}}>ID</th><th style={{padding:"8px 12px"}}>用户名</th><th style={{padding:"8px 12px"}}>角色</th><th style={{padding:"8px 12px"}}>积分</th><th style={{padding:"8px 12px"}}>创建时间</th><th style={{padding:"8px 12px"}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} style={{borderBottom:"1px solid var(--bd)",background:editUser?.id===u.id?"rgba(212,165,116,.05)":"transparent"}}>
                  <td style={{padding:"10px 12px",color:"var(--t2)"}}>{u.id}</td>
                  <td style={{padding:"10px 12px",fontWeight:600}}>{u.username}</td>
                  <td style={{padding:"10px 12px"}}><span style={{padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,background:u.role==='admin'?"rgba(212,165,116,.15)":"rgba(255,255,255,.06)",color:u.role==='admin'?"var(--ac)":"var(--t2)"}}>{u.role}</span></td>
                  <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",color:"var(--ac)"}}>{u.credits}</td>
                  <td style={{padding:"10px 12px",color:"var(--t3)"}}>{u.created_at?.slice(0,10)}</td>
                  <td style={{padding:"10px 12px",display:"flex",gap:6}}>
                    <button onClick={()=>setEditUser({id:u.id,origName:u.username,username:'',password:''})} style={{padding:"4px 12px",borderRadius:6,border:"1px solid rgba(212,165,116,.3)",background:"rgba(212,165,116,.1)",color:"var(--ac)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>修改</button>
                    <button onClick={()=>deleteUser(u.id)} style={{padding:"4px 12px",borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.1)",color:"#ef4444",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function App(){
  const[page,setPage]=useState(PAGES.HOME);
  const[col,setCol]=useState(false);
  const[tab,setTab]=useState("generate");

  // ── Auth 状态 ──
  const[token,setToken]=useState(()=>localStorage.getItem('token'));
  const[currentUser,setCurrentUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(!!localStorage.getItem('token'));

  const logout=()=>{
    setToken(null);setCurrentUser(null);localStorage.removeItem('token');
  };

  // apiFetch: 自动带 Authorization header，401 自动登出
  const apiFetch=(url,opts={})=>{
    const headers={...opts.headers};
    if(token)headers['Authorization']=`Bearer ${token}`;
    return fetch(url,{...opts,headers}).then(res=>{
      if(res.status===401){logout();}
      return res;
    });
  };

  const handleLogin=(newToken,user)=>{
    localStorage.setItem('token',newToken);
    setToken(newToken);setCurrentUser(user);
    setPage(PAGES.HOME);
  };

  // 启动时用 token 获取用户信息
  useEffect(()=>{
    if(!token){setAuthLoading(false);return;}
    fetch('/api/auth/me',{headers:{'Authorization':`Bearer ${token}`}})
      .then(r=>{if(!r.ok)throw new Error();return r.json();})
      .then(data=>setCurrentUser(data.user))
      .catch(()=>{logout();})
      .finally(()=>setAuthLoading(false));
  },[token]);

  // 刷新积分
  const refreshCredits=()=>{
    if(!token)return;
    fetch('/api/auth/me',{headers:{'Authorization':`Bearer ${token}`}})
      .then(r=>r.ok?r.json():null)
      .then(data=>{if(data?.user)setCurrentUser(prev=>({...prev,credits:data.user.credits}));})
      .catch(()=>{});
  };

  // ── 共享图片状态 ──
  const[images,setImages]=useState([]);
  const[loadingImages,setLoadingImages]=useState(true);

  useEffect(()=>{
    if(!token)return;
    apiFetch('/api/images')
      .then(r=>r.json())
      .then(data=>{setImages(Array.isArray(data)?data:[]);})
      .catch(()=>{})
      .finally(()=>setLoadingImages(false));
  },[token]);

  const addImages=newImgs=>{
    setImages(prev=>[...newImgs,...prev]);
    apiFetch('/api/images',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({records:newImgs}),
    }).catch(()=>{});
    // 刷新积分
    setTimeout(refreshCredits,500);
  };

  const toggleFav=id=>{
    setImages(prev=>prev.map(i=>{
      if(i.id!==id)return i;
      const next={...i,fav:!i.fav};
      apiFetch(`/api/images/${id}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({fav:next.fav}),
      }).catch(()=>{});
      return next;
    }));
  };

  const deleteImage=id=>{
    setImages(prev=>prev.filter(i=>i.id!==id));
    apiFetch(`/api/images/${id}`,{method:'DELETE'}).catch(()=>{});
  };

  // 显示加载或登录页
  if(authLoading)return(<div style={{minHeight:"100vh",background:"var(--bg0)",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{CSS}</style><span style={{width:24,height:24,border:"3px solid var(--bd)",borderTopColor:"var(--ac)",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/></div>);
  if(!token)return <LoginPage onLogin={handleLogin}/>;

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg0)"}}>
      <style>{CSS}</style>
      <Sidebar page={page} setPage={setPage} col={col} setCol={setCol} setTab={setTab} currentUser={currentUser}/>
      <main style={{flex:1,marginLeft:col?56:"var(--sw)",transition:"margin-left .25s ease",minHeight:"100vh"}}>
        <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(17,17,19,.9)",backdropFilter:"blur(12px)",borderBottom:"1px solid var(--bd)",padding:"0 28px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"var(--t3)",fontWeight:500}}>{page===PAGES.HOME&&"首页"}{page===PAGES.LIBRARY&&"我的作品"}{page===PAGES.FAVORITES&&"收藏"}{page===PAGES.PRICING&&"定价方案"}{page===PAGES.ADMIN&&"管理面板"}</span>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:6,background:"var(--bg2)",border:"1px solid var(--bd)"}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600,color:"var(--ac)"}}>{currentUser?.credits?.toLocaleString()??'—'}</span>
              <span style={{fontSize:11,color:"var(--t3)"}}>积分</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:6,background:"var(--bg2)",border:"1px solid var(--bd)"}}>
              <span style={{display:"flex",color:"var(--t3)"}}>{Icons.user}</span>
              <span style={{fontSize:12,fontWeight:500,color:"var(--t2)"}}>{currentUser?.username}</span>
            </div>
            <button onClick={logout} style={{padding:"5px 12px",borderRadius:6,border:"1px solid var(--bd)",background:"transparent",color:"var(--t3)",fontFamily:"inherit",fontSize:12,cursor:"pointer",transition:"color .15s"}} onMouseEnter={e=>e.currentTarget.style.color='var(--t1)'} onMouseLeave={e=>e.currentTarget.style.color='var(--t3)'}>退出</button>
          </div>
        </header>
        <div style={{padding:"24px 28px 48px"}}>
          {page===PAGES.HOME&&<HomePage tab={tab} setTab={setTab} images={images} addImages={addImages} loadingImages={loadingImages} toggleFav={toggleFav} deleteImage={deleteImage} apiFetch={apiFetch} currentUser={currentUser} refreshCredits={refreshCredits}/>}
          {page===PAGES.LIBRARY&&<LibraryPage images={images} toggleFav={toggleFav} deleteImage={deleteImage} apiFetch={apiFetch}/>}
          {page===PAGES.FAVORITES&&<LibraryPage favorites images={images} toggleFav={toggleFav} deleteImage={deleteImage} apiFetch={apiFetch}/>}
          {page===PAGES.PRICING&&<PricingPage/>}
          {page===PAGES.ADMIN&&currentUser?.role==='admin'&&<AdminPage apiFetch={apiFetch}/>}
        </div>
      </main>
    </div>
  );
}
