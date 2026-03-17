import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import * as api from "./api.js";

const PAGES = { HOME: "home", LIBRARY: "library", FAVORITES: "favorites", AI_PROMPT: "ai_prompt", PROMPT_LIB: "prompt_lib", ADMIN: "admin" };

const extFromBlob = (blob) => {
  const t = blob.type || '';
  if (t.includes('png')) return 'png';
  if (t.includes('webp')) return 'webp';
  if (t.includes('gif')) return 'gif';
  return 'jpg';
};

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
  video: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  key: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  edit: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  // pill bar icons (14x14, stroke style)
  pillModel: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  pillRatio: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="10" y1="3" x2="10" y2="21"/></svg>,
  pillRes: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V4h4"/><path d="M16 4h4v4"/><path d="M20 16v4h-4"/><path d="M8 20H4v-4"/></svg>,
  pillQuality: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  pillSpeed: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  pillFormat: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  pillRef: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16l-4-4-4 4"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>,
  pillDuration: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pillSound: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  pillMute: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  pillLens: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  pillLensLock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  pillMode: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>,
  pillVideo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  pillStar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1C10 7 7 10 1 10c6 0 9 3 9 9 0-6 3-9 9-9-6 0-9-3-9-9z"/><path d="M18 13c0 3.5-1.5 5-5 5 3.5 0 5 1.5 5 5 0-3.5 1.5-5 5-5-3.5 0-5-1.5-5-5z"/></svg>,
  pillSend: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  wand: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h0"/><path d="M17.8 6.2L19 5"/><path d="M11 6.2L9.7 5"/><path d="M11 11.8L9.7 13"/><line x1="3" y1="21" x2="15" y2="9"/></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  book: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  copy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
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
      aspectRatios:["1:1","2:3","3:2","3:4","4:3","9:16","16:9","21:9"],
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
      aspectRatios:["1:1","1:2","2:1","2:3","3:2","3:4","4:3","5:6","6:5","9:16","16:9","9:2"],
      speeds:[{value:"relaxed",label:"Relaxed"},{value:"fast",label:"Fast"},{value:"turbo",label:"Turbo"}],
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

const VIDEO_MODELS = [
  {
    name:"Kling 3.0", modelId:"kling-3.0", vendor:"Kling",
    tag:"Featured", color:"#60a5fa", desc:"Kling 最新旗舰视频模型，画质顶级",
    modes:["text2video","img2video"],
    options:{
      aspectRatios:["16:9","9:16","1:1"],
      durations:["3","4","5","6","7","8","9","10","11","12","13","14","15"],
      hasSound:true,
      qualityModes:[{v:"pro",l:"高清"},{v:"std",l:"标准"}],
    },
  },
  {
    name:"Kling 2.6", modelId:"kling-2.6", vendor:"Kling",
    tag:"", color:"#a78bfa", desc:"高性价比视频生成，5 秒起步",
    modes:["text2video","img2video"],
    options:{
      aspectRatios:["16:9","9:16","1:1"],
      durations:["5","10"],
      hasSound:true,
    },
  },
  {
    name:"Hailuo 2.3", modelId:"hailuo-2.3", vendor:"Hailuo",
    tag:"", color:"#f472b6", desc:"海螺 AI 视频，仅支持图生视频",
    modes:["img2video"],
    options:{
      aspectRatios:["16:9","9:16","1:1"],
      durations:["6","10"],
      resolutions:[{v:"768P",l:"768P"},{v:"1080P",l:"1080P"}],
    },
  },
  {
    name:"Seedance 1.5 Pro", modelId:"seedance-1.5-pro", vendor:"ByteDance",
    tag:"New", color:"#34d399", desc:"字节跳动旗舰视频模型，支持音频生成与固定镜头",
    modes:["text2video","img2video"],
    options:{
      aspectRatios:["16:9","9:16","1:1","4:3","3:4","21:9"],
      durations:["4","8","12"],
      hasSound:true,
      resolutions:[{v:"480p",l:"480P"},{v:"720p",l:"720P"},{v:"1080p",l:"1080P"}],
      hasFixedLens:true,
    },
  },
  {
    name:"Sora 2 Pro", modelId:"sora-2-pro-storyboard", vendor:"OpenAI",
    tag:"Featured", color:"#10b981", desc:"OpenAI Sora 多场景分镜视频，最长 25 秒",
    modes:["text2video","img2video"],
    options:{
      aspectRatios:["16:9","9:16"],
      durations:["10","15","25"],
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
:root{--bg0:#111113;--bg1:#161618;--bg2:#1c1c1f;--bgc:#19191c;--bgh:#222225;--bd:#28282c;--bdl:#323236;--t1:#e8e8ea;--t2:#8a8a94;--t3:#56565e;--ac:#d4a574;--ach:#e0b88a;--acg:rgba(212,165,116,0.15);--pu:#9b8ec4;--cy:#7cb8c4;--gn:#7ec49b;--sw:220px;--ui-zoom:1}
@media(min-width:2560px){:root{--ui-zoom:1.2;--sw:250px}}
@media(min-width:3840px){:root{--ui-zoom:1.5;--sw:280px}}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--bg0);color:var(--t1);-webkit-font-smoothing:antialiased}
#root{zoom:var(--ui-zoom)}
@supports not (zoom:1){#root{transform:scale(var(--ui-zoom));transform-origin:top left;width:calc(100% / var(--ui-zoom));height:calc(100vh / var(--ui-zoom))}}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--bd);border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 12px var(--acg)}50%{box-shadow:0 0 24px var(--acg)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes meshMove{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-30px,20px) scale(1.05)}}
.stg>*{animation:fadeUp .4s ease-out both}
.stg>*:nth-child(1){animation-delay:.03s}.stg>*:nth-child(2){animation-delay:.06s}.stg>*:nth-child(3){animation-delay:.09s}.stg>*:nth-child(4){animation-delay:.12s}.stg>*:nth-child(5){animation-delay:.15s}.stg>*:nth-child(6){animation-delay:.18s}
.convo-item:hover .convo-del{opacity:1!important}
`;

function ApiKeyModal({onClose}){
  const[key,setKey]=useState('');
  const[maskedKey,setMaskedKey]=useState('');
  const[hasKey,setHasKey]=useState(false);
  const[needKey,setNeedKey]=useState(false);
  const[saving,setSaving]=useState(false);
  const[msg,setMsg]=useState('');

  useEffect(()=>{
    api.apiKey.get().then(r=>r.json()).then(d=>{
      setMaskedKey(d.apiKey||'');
      setHasKey(d.hasKey);
      setNeedKey(d.needKey);
    }).catch(()=>{});
  },[]);

  const save=async()=>{
    setSaving(true);setMsg('');
    try{
      const res=await api.apiKey.set(key);
      const d=await res.json();
      if(d.ok){setMsg('保存成功');setHasKey(!!key);setNeedKey(false);setMaskedKey(key?key.slice(0,4)+'****'+key.slice(-4):'');setKey('');}
      else setMsg(d.error||'保存失败');
    }catch(e){setMsg(e.message);}
    finally{setSaving(false);}
  };

  const clear=async()=>{
    setSaving(true);setMsg('');
    try{
      const res=await api.apiKey.clear();
      const d=await res.json();
      if(d.ok){setMsg('已清除');setHasKey(false);setMaskedKey('');setKey('');}
      else setMsg(d.error||'清除失败');
    }catch(e){setMsg(e.message);}
    finally{setSaving(false);}
  };

  return createPortal(
    <div onClick={needKey&&!hasKey?undefined:onClose} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.65)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn .15s ease-out"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:14,padding:28,width:"100%",maxWidth:420,animation:"scaleIn .2s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <h3 style={{fontSize:16,fontWeight:700,color:"var(--t1)",margin:0}}>{needKey&&!hasKey?'配置 API Key':'自定义 API Key'}</h3>
          {!(needKey&&!hasKey)&&<button onClick={onClose} style={{width:28,height:28,borderRadius:6,border:"1px solid var(--bd)",background:"transparent",color:"var(--t3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>{Icons.x}</button>}
        </div>
        {needKey&&!hasKey&&<div style={{padding:"10px 14px",borderRadius:8,background:"rgba(251,146,60,.08)",border:"1px solid rgba(251,146,60,.2)",color:"#fb923c",fontSize:12,lineHeight:1.6,marginBottom:16}}>使用前需要配置你的 API Key，请前往 <a href="https://kie.ai" target="_blank" rel="noreferrer" style={{color:"var(--ac)",fontWeight:600}}>kie.ai</a> 获取。</div>}
        <p style={{fontSize:12,color:"var(--t3)",lineHeight:1.6,marginBottom:16}}>
          输入你的 <a href="https://kie.ai" target="_blank" rel="noreferrer" style={{color:"var(--ac)"}}>kie.ai</a> API Key，将优先使用你的 Key 调用接口。留空则使用系统默认 Key。
        </p>
        {hasKey&&<div style={{fontSize:12,color:"var(--t2)",marginBottom:12,padding:"8px 12px",background:"rgba(212,165,116,.06)",borderRadius:8,border:"1px solid rgba(212,165,116,.15)"}}>当前 Key：<span style={{fontFamily:"monospace",fontWeight:600}}>{maskedKey}</span></div>}
        <input
          type="password"
          value={key}
          onChange={e=>setKey(e.target.value)}
          placeholder="sk-..."
          style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid var(--bd)",background:"var(--bg2)",color:"var(--t1)",fontSize:13,fontFamily:"monospace",outline:"none",boxSizing:"border-box",marginBottom:12}}
        />
        {msg&&<p style={{fontSize:12,color:msg==='保存成功'||msg==='已清除'?"#34d399":"#ef4444",marginBottom:12}}>{msg}</p>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={save} disabled={saving||!key.trim()} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:saving||!key.trim()?"not-allowed":"pointer",background:saving||!key.trim()?"var(--bgh)":"var(--ac)",color:saving||!key.trim()?"var(--t3)":"var(--bg0)",fontSize:13,fontWeight:600,fontFamily:"inherit",transition:"all .15s"}}>
            {saving?'保存中...':'保存'}
          </button>
          {hasKey&&(
            <button onClick={clear} disabled={saving} style={{padding:"9px 16px",borderRadius:8,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.06)",color:"#ef4444",fontSize:13,fontWeight:600,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",transition:"all .15s"}}>
              清除
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function Sidebar({page,setPage,col,setCol,tab,setTab,currentUser}){
  const nav=[{id:PAGES.HOME,icon:Icons.home,label:"首页"},{id:PAGES.LIBRARY,icon:Icons.grid,label:"我的作品"},{id:PAGES.FAVORITES,icon:Icons.heart,label:"收藏"},...(currentUser?.role==='admin'?[{id:PAGES.ADMIN,icon:Icons.user,label:"管理面板"}]:[])
  ];
  const tools=[{icon:Icons.sparkle,label:"图像生成",tab:"generate"},{icon:Icons.video,label:"视频生成",tab:"video"},{icon:Icons.enhance,label:"图像增强",tab:"enhance"},{icon:Icons.chat,label:"AI 对话",page:PAGES.AI_PROMPT},{icon:Icons.book,label:"提示词模板",page:PAGES.PROMPT_LIB}];
  const[toolActive,setToolActive]=useState(false);
  const[showApiModal,setShowApiModal]=useState(false);
  const[showContact,setShowContact]=useState(false);
  return(
    <aside style={{width:col?56:"var(--sw)",height:"100vh",background:"var(--bg1)",borderRight:"1px solid var(--bd)",display:"flex",flexDirection:"column",transition:"width .25s ease",position:"fixed",left:0,top:0,bottom:0,zIndex:100,overflowX:"hidden",overflowY:"auto"}}>
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
        {nav.map(it=>{const act=page===it.id&&!(it.id===PAGES.HOME&&toolActive);return(
          <button key={it.id} onClick={()=>{setPage(it.id);if(it.id===PAGES.HOME){setTab("generate");}setToolActive(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:col?"9px 0":"9px 12px",justifyContent:col?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:act?"rgba(212,165,116,.1)":"transparent",color:act?"var(--ac)":"var(--t2)",fontFamily:"inherit",fontSize:13,fontWeight:500,transition:"all .15s",whiteSpace:"nowrap",width:"100%"}}>
            <span style={{display:"flex",flexShrink:0,opacity:act?1:.7}}>{it.icon}</span>{!col&&it.label}
          </button>
        );})}
        {!col&&<div style={{padding:"0 12px",margin:"16px 0 8px"}}><span style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".1em",color:"var(--t3)"}}>工具</span></div>}
        {tools.map((t,i)=>{const active=t.page?page===t.page:(page===PAGES.HOME&&tab===t.tab);return(
          <button key={i} onClick={()=>{if(t.page){setPage(t.page);setToolActive(true);}else{setPage(PAGES.HOME);setTab(t.tab);setToolActive(true);}}} style={{display:"flex",alignItems:"center",gap:10,padding:col?"9px 0":"9px 12px",justifyContent:col?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:active?"rgba(212,165,116,.1)":"transparent",color:active?"var(--ac)":"var(--t2)",fontFamily:"inherit",fontSize:13,fontWeight:500,transition:"all .15s",whiteSpace:"nowrap",width:"100%"}}>
            <span style={{display:"flex",flexShrink:0,opacity:active?1:.7}}>{t.icon}</span>{!col&&t.label}
          </button>
        );})}
        {!col&&<div style={{padding:"0 12px",margin:"16px 0 8px"}}><span style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".1em",color:"var(--t3)"}}>设置</span></div>}
        <button onClick={()=>setShowApiModal(true)} style={{display:"flex",alignItems:"center",gap:10,padding:col?"9px 0":"9px 12px",justifyContent:col?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"var(--t2)",fontFamily:"inherit",fontSize:13,fontWeight:500,transition:"all .15s",whiteSpace:"nowrap",width:"100%"}}>
          <span style={{display:"flex",flexShrink:0,opacity:.7}}>{Icons.key}</span>{!col&&"自定义 API"}
        </button>
        <button onClick={()=>setShowContact(true)} style={{display:"flex",alignItems:"center",gap:10,padding:col?"9px 0":"9px 12px",justifyContent:col?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"var(--t2)",fontFamily:"inherit",fontSize:13,fontWeight:500,transition:"all .15s",whiteSpace:"nowrap",width:"100%"}}>
          <span style={{display:"flex",flexShrink:0,opacity:.7}}>{Icons.mail}</span>{!col&&"联系我们"}
        </button>
      </nav>
      {showApiModal&&<ApiKeyModal onClose={()=>setShowApiModal(false)}/>}
      {showContact&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}} onClick={()=>setShowContact(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"var(--bg2)",border:"1px solid var(--bd)",borderRadius:14,padding:"28px 32px",minWidth:320,maxWidth:400,boxShadow:"0 16px 48px rgba(0,0,0,.5)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:700,color:"var(--t1)"}}>联系我们</h3>
              <button onClick={()=>setShowContact(false)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--t3)",padding:0,display:"flex"}}>{Icons.x}</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{color:"var(--ac)",display:"flex"}}>{Icons.mail}</span>
                <div>
                  <div style={{fontSize:11,color:"var(--t3)",marginBottom:2}}>邮箱</div>
                  <div style={{fontSize:14,color:"var(--t1)",fontWeight:500}}>yuanyexuaima2@gmail.com</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div>
                  <div style={{fontSize:11,color:"var(--t3)",marginBottom:2}}>手机</div>
                  <div style={{fontSize:14,color:"var(--t1)",fontWeight:500}}>18537195048</div>
                </div>
              </div>
            </div>
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
function Lightbox({image,onClose,onEdit,onUseAsRef,onUseAsVideoRef}){
  const[zoomed,setZoomed]=useState(false);
  const[pos,setPos]=useState({x:0,y:0});
  const[promptExpanded,setPromptExpanded]=useState(false);
  const[copied,setCopied]=useState(false);
  const[imgMeta,setImgMeta]=useState(null);
  const dragging=useRef(false);
  const lastPt=useRef({x:0,y:0});
  const containerRef=useRef(null);

  useEffect(()=>{
    if(!image.imageUrl)return;
    const img=new Image();
    img.onload=()=>{
      const url=image.imageUrl.toLowerCase();
      let fmt='JPG';
      if(url.includes('.png')||url.includes('format=png'))fmt='PNG';
      else if(url.includes('.webp')||url.includes('format=webp'))fmt='WEBP';
      setImgMeta({w:img.naturalWidth,h:img.naturalHeight,fmt});
    };
    img.src=image.imageUrl;
  },[image.imageUrl]);

  const doDownload=async e=>{
    e.stopPropagation();
    if(!image.imageUrl)return;
    try{
      const res=await api.download(image.imageUrl);
      const blob=await res.blob();
      const href=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=href;a.download=`pictureme-${image.id||Date.now()}.${extFromBlob(blob)}`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(href);
    }catch(err){console.error('下载失败',err);}
  };

  const toggleZoom=e=>{
    e.stopPropagation();
    if(!zoomed){
      setPos({x:0,y:0});
      setZoomed(true);
    }else{
      setZoomed(false);setPos({x:0,y:0});
    }
  };

  const onPointerDown=e=>{if(!zoomed)return;e.preventDefault();dragging.current=true;lastPt.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);};
  const onPointerMove=e=>{if(!dragging.current)return;const dx=e.clientX-lastPt.current.x;const dy=e.clientY-lastPt.current.y;lastPt.current={x:e.clientX,y:e.clientY};setPos(p=>({x:p.x+dx,y:p.y+dy}));};
  const onPointerUp=()=>{dragging.current=false;};

  const onWheel=e=>{
    if(!zoomed)return;
    e.stopPropagation();
    setPos(p=>({x:p.x-e.deltaX,y:p.y-e.deltaY}));
  };

  useEffect(()=>{
    const h=e=>{if(e.key==='Escape'){if(zoomed){setZoomed(false);setPos({x:0,y:0});}else onClose();}};
    document.addEventListener('keydown',h);return()=>document.removeEventListener('keydown',h);
  },[onClose,zoomed]);

  return createPortal(
    <div onClick={zoomed?()=>{setZoomed(false);setPos({x:0,y:0});}:onClose} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.65)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",display:"flex",alignItems:"center",justifyContent:"center",padding:zoomed?0:24,animation:"fadeIn .15s ease-out",cursor:zoomed?"grab":"zoom-out",overflow:"hidden"}}>
      <button onClick={e=>{e.stopPropagation();if(zoomed){setZoomed(false);setPos({x:0,y:0});}else onClose();}} style={{position:"absolute",top:16,right:16,width:36,height:36,borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>{Icons.x}</button>
      {/* 放大模式提示 */}
      {zoomed&&<div style={{position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",padding:"6px 16px",borderRadius:8,background:"rgba(0,0,0,.7)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.7)",fontSize:12,zIndex:10,pointerEvents:"none"}}>拖拽平移 · 点击退出放大 · Esc 返回</div>}
      {zoomed?(
        <div ref={containerRef} onClick={e=>e.stopPropagation()} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onWheel={onWheel} style={{position:"absolute",inset:0,overflow:"hidden",cursor:dragging.current?"grabbing":"grab",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src={image.imageUrl} alt={image.prompt} draggable={false} style={{transformOrigin:"center center",transform:`translate(${pos.x}px,${pos.y}px)`,maxWidth:"none",maxHeight:"none",userSelect:"none",pointerEvents:"none"}}/>
        </div>
      ):(
        <div onClick={e=>e.stopPropagation()} style={{maxWidth:"min(90vw,960px)",width:"100%",maxHeight:"calc(100vh - 48px)",display:"flex",flexDirection:"column",gap:12,animation:"scaleIn .2s ease-out",cursor:"default",overflowY:"auto"}}>
          <div ref={containerRef} onClick={toggleZoom} style={{cursor:"zoom-in",position:"relative"}}>
            <img src={image.imageUrl} alt={image.prompt} style={{width:"100%",maxHeight:"70vh",objectFit:"contain",borderRadius:10}}/>
            <div style={{position:"absolute",bottom:10,right:10,padding:"5px 12px",borderRadius:8,background:"rgba(0,0,0,.6)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.7)",fontSize:11,display:"flex",alignItems:"center",gap:5,pointerEvents:"none"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              点击放大查看原图
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
            {/* 提示词区域 */}
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:500,lineHeight:1.6,margin:0,...(promptExpanded?{whiteSpace:"pre-wrap",wordBreak:"break-word",maxHeight:"25vh",overflowY:"auto",paddingRight:4}:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"})}}>{image.prompt}</p>
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0,marginTop:1}}>
                <button onClick={e=>{e.stopPropagation();navigator.clipboard.writeText(image.prompt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);}).catch(()=>{});}} title="复制提示词" style={{width:30,height:30,borderRadius:6,border:"1px solid rgba(255,255,255,.1)",background:copied?"rgba(52,211,153,.12)":"transparent",color:copied?"#34d399":"var(--t2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                  {copied?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                </button>
                <button onClick={e=>{e.stopPropagation();setPromptExpanded(v=>!v);}} title={promptExpanded?"收起提示词":"展开提示词"} style={{width:30,height:30,borderRadius:6,border:"1px solid rgba(255,255,255,.1)",background:promptExpanded?"rgba(212,165,116,.12)":"transparent",color:promptExpanded?"var(--ac)":"var(--t2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:promptExpanded?"rotate(180deg)":"none",transition:"transform .2s"}}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            </div>
            {/* 元信息 + 操作按钮 */}
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{flex:1,display:"flex",gap:12,alignItems:"center",minWidth:0}}>
                <span style={{fontSize:11,color:"var(--t3)"}}>{image.model}</span>
                {image.ratio&&<span style={{fontSize:11,color:"var(--t3)",fontFamily:"'JetBrains Mono',monospace"}}>{image.ratio}</span>}
                {imgMeta&&<span style={{fontSize:11,color:"var(--t3)",fontFamily:"'JetBrains Mono',monospace"}}>{imgMeta.w}×{imgMeta.h}</span>}
                {imgMeta&&<span style={{fontSize:11,color:"var(--t3)",fontFamily:"'JetBrains Mono',monospace"}}>{imgMeta.fmt}</span>}
                <span style={{fontSize:11,color:"var(--t3)"}}>{image.date}</span>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                {onUseAsRef&&<button onClick={e=>{e.stopPropagation();onClose();onUseAsRef(image);}} style={{padding:"8px 18px",borderRadius:6,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"var(--t2)",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  {Icons.edit}编辑
                </button>}
                {onUseAsVideoRef&&<button onClick={e=>{e.stopPropagation();onClose();onUseAsVideoRef(image);}} style={{padding:"8px 18px",borderRadius:6,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"var(--t2)",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  {Icons.video}生成视频
                </button>}
                <button onClick={doDownload} style={{padding:"8px 18px",borderRadius:6,border:"1px solid rgba(255,255,255,.1)",background:"var(--ac)",color:"var(--bg0)",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  {Icons.download}下载原图
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

// 图片编辑 Modal
function EditModal({image, onClose, onEditComplete}){
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
      const res=await api.edit.create({prompt:editPrompt,imageUrl:image.imageUrl,outputFormat:'png',imageSize:'1:1'});
      const{taskId,error:err}=await res.json();
      if(!taskId)throw new Error(err||'创建任务失败');
      let retries=0;const MAX_RETRIES=60;
      const poll=async()=>{
        if(++retries>MAX_RETRIES){setError('编辑超时，请重试');setEditing(false);return;}
        const s=await api.edit.status(taskId);
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
      const res=await api.download(url);
      const blob=await res.blob();
      const href=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=href;a.download=`edited-${Date.now()}.${extFromBlob(blob)}`;
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

function ImageCard({image,onFav,onDelete,onEdit,onUseAsRef,onUseAsVideoRef}){
  const[h,sH]=useState(false);
  const[viewing,setViewing]=useState(false);
  const ar={"16:9":"16/9","9:16":"9/14","4:3":"4/3","3:4":"3/4","2:3":"2/3","3:2":"3/2","4:5":"4/5","5:4":"5/4","5:6":"5/6","1:1":"1/1","21:9":"21/9"}[image.ratio]||"1/1";

  const doDownload=async e=>{
    e.stopPropagation();
    if(!image.imageUrl)return;
    try{
      const res=await api.download(image.imageUrl);
      const blob=await res.blob();
      const href=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=href;a.download=`pictureme-${image.id}.${extFromBlob(blob)}`;
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
      {viewing&&image.imageUrl&&<Lightbox image={image} onClose={()=>setViewing(false)} onEdit={onEdit} onUseAsRef={onUseAsRef} onUseAsVideoRef={onUseAsVideoRef}/>}
    </>
  );
}

function EnhanceTab({addImages,refreshCredits}){
  const fileInputRef=useRef(null);
  const[file,setFile]=useState(null);
  const[previewUrl,setPreviewUrl]=useState(null);
  const[factor,setFactor]=useState('2');
  const[enhancing,setEnhancing]=useState(false);
  const[error,setError]=useState(null);
  const[results,setResults]=useState([]);
  const[dragging,setDragging]=useState(false);
  const[progress,setProgress]=useState(0);

  const handleFile=f=>{
    if(!f||!f.type.startsWith('image/'))return;
    setFile(f);setError(null);setResults([]);
    const reader=new FileReader();reader.onload=()=>setPreviewUrl(reader.result);reader.readAsDataURL(f);
  };

  const doEnhance=async()=>{
    if(!file||enhancing)return;
    setEnhancing(true);setError(null);setProgress(0);
    try{
      const formData=new FormData();formData.append('file',file);
      const uploadRes=await api.upload(formData);
      const{url,error:upErr}=await uploadRes.json();
      if(!url)throw new Error(upErr||'图片上传失败');
      const enhRes=await api.enhance.create({imageUrl:url,upscaleFactor:factor});
      const{taskId,error:taskErr}=await enhRes.json();
      if(!taskId)throw new Error(taskErr||'创建任务失败');
      let retries=0;const MAX_RETRIES=60;
      const poll=async()=>{
        if(++retries>MAX_RETRIES){setError('增强超时，请重试');setEnhancing(false);return;}
        const d=await(await api.enhance.status(taskId)).json();
        if(d.status==='success'){
          const urls=d.images||[];
          setResults(urls);setEnhancing(false);
          if(addImages&&urls.length>0){
            const today=new Date().toISOString().slice(0,10);
            addImages(urls.map((u,j)=>({id:crypto.randomUUID(),prompt:`${factor}× 超分增强`,model:'Topaz Upscale',ratio:'',date:today,fav:false,imageUrl:u,color:'#1a1a20',type:'enhance'})));
          }
          refreshCredits?.();
        }
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
          <><img src={previewUrl} alt="preview" style={{width:"100%",maxHeight:360,objectFit:"contain",display:"block",borderRadius:18}}/><div style={{position:"absolute",bottom:12,right:12,display:"flex",gap:6}}><div style={{padding:"6px 14px",borderRadius:10,background:"rgba(0,0,0,.6)",border:"1px solid rgba(255,255,255,.12)",fontSize:12,color:"rgba(255,255,255,.7)",backdropFilter:"blur(8px)"}}>点击更换图片</div><div onClick={e=>{e.stopPropagation();setFile(null);setPreviewUrl(null);setResults([]);setError(null);}} style={{padding:"6px 14px",borderRadius:10,background:"rgba(239,68,68,.6)",border:"1px solid rgba(239,68,68,.4)",fontSize:12,color:"#fff",backdropFilter:"blur(8px)",cursor:"pointer"}}>删除</div></div></>
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
    </div>
  );
}

function VideoTab({refreshCredits,addImages,pendingVideoTasks,setPendingVideoTasks,pendingRefImage,clearPendingRef}){
  const refInputRef=useRef(null);
  const[selModel,setSelModel]=useState(0);
  const[prompt,setPrompt]=useState('');
  const[mode,setMode]=useState('text2video');
  const[aspectRatio,setAspectRatio]=useState(VIDEO_MODELS[0].options.aspectRatios[0]);
  const[duration,setDuration]=useState(VIDEO_MODELS[0].options.durations[0]);
  const[sound,setSound]=useState(false);
  const[qualityMode,setQualityMode]=useState('pro');
  const[resolution,setResolution]=useState('768P');
  const[fixedLens,setFixedLens]=useState(false);
  const[refImageUrl,setRefImageUrl]=useState(null);
  const[refPreview,setRefPreview]=useState(null);
  const[uploadingRef,setUploadingRef]=useState(false);
  const[openDropdown,setOpenDropdown]=useState(null);
  const[dragging,setDragging]=useState(false);
  const dragCounter=useRef(0);

  useEffect(()=>{
    const m=VIDEO_MODELS[selModel];
    setAspectRatio(m.options.aspectRatios[0]);
    setDuration(m.options.durations[0]);
    // 如果有参考图，保持 img2video；否则按模型默认模式
    if(refImageUrl&&m.modes.includes('img2video')){
      setMode('img2video');
    }else{
      setMode(m.modes.includes('text2video')?'text2video':m.modes[0]);
    }
    setSound(false);setFixedLens(false);
    if(m.options.qualityModes)setQualityMode(m.options.qualityModes[0].v);
    if(m.options.resolutions)setResolution(m.options.resolutions[0].v);
    if(!m.modes.includes('img2video')){setRefImageUrl(null);setRefPreview(null);}
    setOpenDropdown(null);
  },[selModel]);

  useEffect(()=>{
    const handler=e=>{if(!e.target.closest('[data-pill]'))setOpenDropdown(null);};
    document.addEventListener('click',handler);
    return ()=>document.removeEventListener('click',handler);
  },[]);

  // 消费从其他页面传入的参考图
  useEffect(()=>{
    if(!pendingRefImage||pendingRefImage.target!=='video')return;
    const url=pendingRefImage.url;
    // 如果当前模型不支持 img2video，切到第一个支持的
    const curModel=VIDEO_MODELS[selModel];
    if(!curModel.modes.includes('img2video')){
      const idx=VIDEO_MODELS.findIndex(m=>m.modes.includes('img2video'));
      if(idx>=0)setSelModel(idx);
    }
    setMode('img2video');
    setRefPreview(url);
    setRefImageUrl(url);
    clearPendingRef();
  },[pendingRefImage]);

  const handleRefFile=async f=>{
    if(!f||!f.type.startsWith('image/'))return;
    const reader=new FileReader();reader.onload=()=>setRefPreview(reader.result);reader.readAsDataURL(f);
    setUploadingRef(true);
    try{
      const fd=new FormData();fd.append('file',f);
      const res=await api.upload(fd);
      const{url,error:err}=await res.json();
      if(!url)throw new Error(err);
      setRefImageUrl(url);
    }catch(e){console.error('参考图上传失败',e);setRefPreview(null);}
    finally{setUploadingRef(false);}
  };

  const clearRef=e=>{e?.stopPropagation();setRefImageUrl(null);setRefPreview(null);if(refInputRef.current)refInputRef.current.value='';};

  // 拖拽到提示词框：自动上传 + 切换到图生视频模式
  const handleDropFile=f=>{
    if(!f||!f.type.startsWith('image/'))return;
    // 如果当前模型不支持 img2video，自动切到第一个支持的模型
    const curModel=VIDEO_MODELS[selModel];
    if(!curModel.modes.includes('img2video')){
      const idx=VIDEO_MODELS.findIndex(m=>m.modes.includes('img2video'));
      if(idx>=0)setSelModel(idx);
      else return; // 没有任何模型支持，忽略
    }
    setMode('img2video');
    handleRefFile(f);
  };
  const handleVideoDragEnter=e=>{e.preventDefault();e.stopPropagation();dragCounter.current++;setDragging(true);};
  const handleVideoDragLeave=e=>{e.preventDefault();e.stopPropagation();dragCounter.current--;if(dragCounter.current<=0){dragCounter.current=0;setDragging(false);}};
  const handleVideoDragOver=e=>{e.preventDefault();e.stopPropagation();};
  const handleVideoDrop=e=>{e.preventDefault();e.stopPropagation();dragCounter.current=0;setDragging(false);const files=e.dataTransfer?.files;if(files?.[0])handleDropFile(files[0]);};

  const doGenerate=async()=>{
    if(!prompt.trim())return;
    const taskUid=crypto.randomUUID();
    const snapPrompt=prompt,snapModel=VIDEO_MODELS[selModel].name,snapRatio=aspectRatio,snapDuration=duration,snapColor=VIDEO_MODELS[selModel].color;
    const pendingTask={id:taskUid,prompt:snapPrompt,model:snapModel,ratio:snapRatio,duration:snapDuration,color:snapColor,status:'generating',error:null,progress:0};
    setPendingVideoTasks(prev=>[pendingTask,...prev]);
    try{
      const vm=VIDEO_MODELS[selModel];
      const body={
        prompt:snapPrompt,
        model:vm.modelId,
        mode:mode==='img2video'&&refImageUrl?'img2video':'text2video',
        aspectRatio,
        duration,
      };
      if(vm.options.hasSound)body.sound=sound;
      if(vm.options.qualityModes)body.qualityMode=qualityMode;
      if(vm.options.resolutions)body.resolution=resolution;
      if(vm.options.hasFixedLens)body.fixedLens=fixedLens;
      if(mode==='img2video'&&refImageUrl)body.refImageUrl=refImageUrl;
      const res=await api.video.create(body);
      const{taskId,error:err}=await res.json();
      if(!taskId)throw new Error(err||'创建任务失败');
      let retries=0;const MAX_RETRIES=120;
      const poll=async()=>{
        if(++retries>MAX_RETRIES){setPendingVideoTasks(prev=>prev.map(t=>t.id===taskUid?{...t,status:'failed',error:'生成超时'}:t));return;}
        const d=await(await api.video.status(taskId)).json();
        if(d.status==='success'){
          setPendingVideoTasks(prev=>prev.filter(t=>t.id!==taskUid));
          if(addImages){
            const videoItems=d.videos.map(url=>({url,prompt:snapPrompt,model:snapModel,ratio:snapRatio,duration:snapDuration,color:snapColor}));
            const today=new Date().toISOString().slice(0,10);
            addImages(videoItems.map(v=>({id:crypto.randomUUID(),prompt:v.prompt,model:v.model,ratio:v.ratio,date:today,fav:false,imageUrl:v.url,color:v.color,type:'video'})));
          }
          refreshCredits?.();
        }else if(d.status==='failed'){
          setPendingVideoTasks(prev=>prev.map(t=>t.id===taskUid?{...t,status:'failed',error:d.error||'视频生成失败'}:t));
        }else{
          setPendingVideoTasks(prev=>prev.map(t=>t.id===taskUid?{...t,progress:d.progress||0}:t));
          setTimeout(poll,5000);
        }
      };
      setTimeout(poll,5000);
    }catch(e){
      setPendingVideoTasks(prev=>prev.map(t=>t.id===taskUid?{...t,status:'failed',error:e.message}:t));
    }
  };

  const vm=VIDEO_MODELS[selModel];
  const supportsImg2Video=vm.modes.includes('img2video');
  const supportsText2Video=vm.modes.includes('text2video');

  const pillStyle=(active)=>({position:"relative",display:"flex",alignItems:"center",gap:5,height:32,padding:"0 12px",borderRadius:6,border:active?"1px solid rgba(212,165,116,.35)":"1px solid rgba(255,255,255,.07)",background:active?"rgba(212,165,116,.08)":"rgba(255,255,255,.04)",color:active?"var(--ach)":"var(--t2)",cursor:"pointer",fontSize:12,fontWeight:500,transition:"all .15s",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit"});
  const dropStyle={position:"absolute",top:"calc(100% + 4px)",left:0,minWidth:160,background:"var(--bg2)",border:"1px solid var(--bd)",borderRadius:8,padding:"4px",zIndex:200,boxShadow:"0 6px 24px rgba(0,0,0,.4)",animation:"scaleIn .1s ease-out"};
  const optStyle=(sel)=>({display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",borderRadius:6,border:"none",background:sel?"rgba(212,165,116,.1)":"transparent",color:sel?"var(--ach)":"var(--t2)",cursor:"pointer",fontSize:12,fontWeight:sel?600:400,fontFamily:"inherit",transition:"background .1s",textAlign:"left"});
  const chevron=<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.5}}><polyline points="6 9 12 15 18 9"/></svg>;

  return(
    <div style={{marginBottom:28,position:"relative"}}>
      <input ref={refInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} onChange={e=>handleRefFile(e.target.files[0])}/>

      {/* 提示词输入框 + 参数栏（与图像生成一致） */}
      <div onDragEnter={handleVideoDragEnter} onDragLeave={handleVideoDragLeave} onDragOver={handleVideoDragOver} onDrop={handleVideoDrop} style={{background:"var(--bgc)",borderRadius:12,border:dragging?"1.5px dashed var(--ac)":"1px solid var(--bd)",marginBottom:14,position:"relative",zIndex:50,transition:"border .15s"}}>
        {/* 拖拽提示遮罩 */}
        {dragging&&(
          <div style={{position:"absolute",inset:0,borderRadius:12,background:"rgba(212,165,116,.08)",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <span style={{fontSize:15,fontWeight:600,color:"var(--ac)"}}>松开以添加参考图，自动切换为图生视频</span>
          </div>
        )}
        {/* 参考图预览（img2video 模式，输入框内顶部，与图像生成一致） */}
        {mode==='img2video'&&refPreview&&(
          <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid var(--bd)",background:"rgba(212,165,116,.04)",flexWrap:"wrap"}}>
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
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:2,marginLeft:4}}>
              <div style={{fontSize:13,fontWeight:500,color:uploadingRef?"var(--t3)":"var(--t1)"}}>{uploadingRef?"上传中...":"1 张参考图"}</div>
              {!uploadingRef&&<div style={{display:"flex",alignItems:"center",gap:8}}>
                <span onClick={()=>refInputRef.current?.click()} style={{fontSize:11,color:"var(--ac)",cursor:"pointer"}}>更换</span>
                <span onClick={clearRef} style={{fontSize:11,color:"var(--t3)",cursor:"pointer"}}>移除</span>
              </div>}
            </div>
          </div>
        )}
        <textarea
          value={prompt}
          onChange={e=>setPrompt(e.target.value)}
          onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();doGenerate();}}}
          placeholder="描述你想要生成的视频场景... 例如：一只金毛犬在海边奔跑，夕阳西下，慢动作镜头"
          style={{width:"100%",minHeight:120,resize:"none",background:"transparent",border:"none",outline:"none",color:"var(--t1)",fontFamily:"inherit",fontSize:14,lineHeight:1.8,padding:"18px 20px 14px",display:"block"}}
        />

        {/* 参数栏 - pill buttons 风格 */}
        <div style={{borderTop:"1px solid var(--bd)",padding:"7px 10px",display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,.12)",overflow:"visible"}}>
          {/* 模型选择 pill */}
          <div style={{position:"relative"}} data-pill>
            <button onClick={()=>setOpenDropdown(openDropdown==='model'?null:'model')} style={pillStyle(openDropdown==='model')}>
              {VIDEO_MODELS[selModel].name}
              {chevron}
            </button>
            {openDropdown==='model'&&(
              <div style={dropStyle}>
                {VIDEO_MODELS.map((m,i)=>{
                  const tl=m.tag==="Featured"?"推荐":m.tag==="New"?"新":null;
                  return(
                    <button key={i} onClick={()=>{setSelModel(i);setOpenDropdown(null);}} style={optStyle(selModel===i)}>
                      <span style={{flex:1}}>{m.name}</span>
                      <span style={{fontSize:10,color:"var(--t3)"}}>{m.vendor}</span>
                      {tl&&<span style={{fontSize:10,padding:"1px 5px",borderRadius:4,background:"rgba(255,255,255,.05)",color:"var(--t3)",fontWeight:600}}>{tl}</span>}
                      {selModel===i&&<span style={{color:"var(--ac)",fontSize:12}}>&#10003;</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 模式切换 pill */}
          {vm.modes.length>1?(
            <div style={{position:"relative"}} data-pill>
              <button onClick={()=>setOpenDropdown(openDropdown==='mode'?null:'mode')} style={pillStyle(openDropdown==='mode')}>
                {mode==='text2video'?'文生视频':'图生视频'}
                {chevron}
              </button>
              {openDropdown==='mode'&&(
                <div style={dropStyle}>
                  {vm.modes.map(m=>({v:m,l:m==='text2video'?'文字生成视频':'图片生成视频'})).map(o=>(
                    <button key={o.v} onClick={()=>{setMode(o.v);if(o.v==='text2video')clearRef();setOpenDropdown(null);}} style={optStyle(mode===o.v)}>
                      {o.l}
                      {mode===o.v&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ):(
            <div data-pill>
              <span style={{...pillStyle(false),cursor:"default",opacity:.7}}>
                {vm.modes[0]==='img2video'?'图生视频':'文生视频'}
              </span>
            </div>
          )}

          {/* 参考图 pill（img2video 模式） */}
          {mode==='img2video'&&(
            <div data-pill style={{position:"relative",display:"flex",alignItems:"center"}}>
              {refPreview?(
                <button onClick={()=>refInputRef.current?.click()} style={pillStyle(false)}>
                  {Icons.pillRef}
                  {uploadingRef?"上传中...":"参考图 1"}
                  <button onClick={clearRef} style={{display:"flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",border:"none",background:"rgba(255,255,255,.12)",color:"var(--t3)",cursor:"pointer",padding:0,fontSize:10,lineHeight:1,fontWeight:700,marginLeft:2}}>×</button>
                </button>
              ):(
                <button onClick={()=>refInputRef.current?.click()} style={pillStyle(false)}>
                  {Icons.pillRef}
                  参考图
                </button>
              )}
            </div>
          )}

          {/* 比例 pill */}
          <div style={{position:"relative"}} data-pill>
            <button onClick={()=>setOpenDropdown(openDropdown==='ratio'?null:'ratio')} style={pillStyle(openDropdown==='ratio')}>
              {Icons.pillRatio}
              {aspectRatio}
              {chevron}
            </button>
            {openDropdown==='ratio'&&(
              <div style={dropStyle}>
                {vm.options.aspectRatios.map(r=>(
                  <button key={r} onClick={()=>{setAspectRatio(r);setOpenDropdown(null);}} style={optStyle(aspectRatio===r)}>
                    {r}
                    {aspectRatio===r&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 时长 pill */}
          <div style={{position:"relative"}} data-pill>
            <button onClick={()=>setOpenDropdown(openDropdown==='duration'?null:'duration')} style={pillStyle(openDropdown==='duration')}>
              {Icons.pillDuration}
              {duration}s
              {vm.options.durations.length>1&&chevron}
            </button>
            {openDropdown==='duration'&&vm.options.durations.length>1&&(
              <div style={dropStyle}>
                {vm.options.durations.map(d=>(
                  <button key={d} onClick={()=>{setDuration(d);setOpenDropdown(null);}} style={optStyle(duration===d)}>
                    {d} 秒
                    {duration===d&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 声音开关 pill */}
          {vm.options.hasSound&&(
            <div data-pill>
              <button onClick={()=>setSound(!sound)} style={pillStyle(sound)}>
                {sound?Icons.pillSound:Icons.pillMute}
                {sound?'有声':'静音'}
              </button>
            </div>
          )}

          {/* 固定镜头 pill（Seedance） */}
          {vm.options.hasFixedLens&&(
            <div data-pill>
              <button onClick={()=>setFixedLens(!fixedLens)} style={pillStyle(fixedLens)}>
                {fixedLens?Icons.pillLensLock:Icons.pillLens}
                {fixedLens?'固定镜头':'动态镜头'}
              </button>
            </div>
          )}

          {/* 画质模式 pill（Kling 3.0） */}
          {vm.options.qualityModes&&(
            <div style={{position:"relative"}} data-pill>
              <button onClick={()=>setOpenDropdown(openDropdown==='quality'?null:'quality')} style={pillStyle(openDropdown==='quality')}>
                {Icons.pillStar}
                {vm.options.qualityModes.find(q=>q.v===qualityMode)?.l||qualityMode}
                {chevron}
              </button>
              {openDropdown==='quality'&&(
                <div style={dropStyle}>
                  {vm.options.qualityModes.map(q=>(
                    <button key={q.v} onClick={()=>{setQualityMode(q.v);setOpenDropdown(null);}} style={optStyle(qualityMode===q.v)}>
                      {q.l}
                      {qualityMode===q.v&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 分辨率 pill（Hailuo 2.3） */}
          {vm.options.resolutions&&(
            <div style={{position:"relative"}} data-pill>
              <button onClick={()=>setOpenDropdown(openDropdown==='resolution'?null:'resolution')} style={pillStyle(openDropdown==='resolution')}>
                {Icons.pillRes}
                {resolution}
                {chevron}
              </button>
              {openDropdown==='resolution'&&(
                <div style={dropStyle}>
                  {vm.options.resolutions.map(r=>(
                    <button key={r.v} onClick={()=>{setResolution(r.v);setOpenDropdown(null);}} style={optStyle(resolution===r.v)}>
                      {r.l}
                      {resolution===r.v&&<span style={{color:"var(--ac)",marginLeft:"auto"}}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 生成按钮 */}
          <button onClick={doGenerate} style={{marginLeft:"auto",padding:"0 18px",height:32,borderRadius:6,border:"none",cursor:"pointer",background:"var(--ac)",color:"var(--bg0)",fontFamily:"inherit",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6,transition:"all .2s",flexShrink:0}}>
            {Icons.pillSend}
            生成视频
          </button>
        </div>
      </div>

    </div>
  );
}

function HomePage({tab,setTab,images,addImages,loadingImages,toggleFav,deleteImage,currentUser,refreshCredits,pendingRefImage,clearPendingRef,useImageAsRef,useImageAsVideoRef}){
  const refInputRef=useRef(null);
  const promptRef=useRef(null);

  const[prompt,setPrompt]=useState("");
  const[selModel,setSelModel]=useState(0);
  const[aspectRatio,setAspectRatio]=useState(MODELS[0].options.aspectRatios[0]);
  const[resolution,setResolution]=useState(MODELS[0].options.resolutions?.[0]??null);
  const[quality,setQuality]=useState(MODELS[0].options.qualities?.[0]?.value??null);
  const[outputFormat,setOutputFormat]=useState(MODELS[0].options.outputFormats?.[0]??null);
  const[speed,setSpeed]=useState(MODELS[0].options.speeds?.[1]?.value??null);
  const[pendingTasks,setPendingTasks]=useState([]);
  const[pendingVideoTasks,setPendingVideoTasks]=useState([]);
  const[openDropdown,setOpenDropdown]=useState(null);
  // 参考图（多张）
  const[refImages,setRefImages]=useState([]); // [{url, preview, uploading}]
  const[dragging,setDragging]=useState(false);
  const dragCounter=useRef(0);
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
    if(!MODELS[selModel].supportsRefImage){setRefImages([]);}
  },[selModel]);

  useEffect(()=>{
    const handler=e=>{if(!e.target.closest('[data-pill]'))setOpenDropdown(null);};
    document.addEventListener('click',handler);
    return ()=>document.removeEventListener('click',handler);
  },[]);

  // 消费从其他页面传入的参考图
  useEffect(()=>{
    if(!pendingRefImage||pendingRefImage.target!=='generate')return;
    if(!pendingRefImage.promptOnly){
      const url=pendingRefImage.url;
      // 如果当前模型不支持参考图，切到第一个支持的
      if(!MODELS[selModel].supportsRefImage){
        const idx=MODELS.findIndex(m=>m.supportsRefImage);
        if(idx>=0)setSelModel(idx);
      }
      setRefImages(prev=>[...prev,{id:crypto.randomUUID(),preview:url,url,uploading:false}]);
    }
    if(pendingRefImage.prompt)setPrompt(pendingRefImage.prompt);
    clearPendingRef();
    // 滚动到提示词框并聚焦
    setTimeout(()=>{
      if(promptRef.current){
        promptRef.current.scrollIntoView({behavior:'smooth',block:'center'});
        promptRef.current.focus();
      }
    },100);
  },[pendingRefImage]);

  const readAsDataUrl=f=>new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(f);});

  const handleRefFiles=async files=>{
    const validFiles=[...files].filter(f=>f.type.startsWith('image/'));
    if(!validFiles.length)return;
    // 为每个文件创建临时预览项（用 data URL 兼容 Electron）
    const previews=await Promise.all(validFiles.map(f=>readAsDataUrl(f)));
    const newItems=validFiles.map((f,i)=>({id:crypto.randomUUID(),preview:previews[i],url:null,uploading:true}));
    setRefImages(prev=>[...prev,...newItems]);
    // 批量上传
    const fd=new FormData();
    validFiles.forEach(f=>fd.append('file',f));
    try{
      const res=await api.upload(fd);
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      const urls=data.urls||[data.url];
      setRefImages(prev=>prev.map(item=>{
        const idx=newItems.findIndex(n=>n.id===item.id);
        if(idx>=0&&urls[idx])return{...item,url:urls[idx],uploading:false};
        if(idx>=0)return{...item,uploading:false}; // 上传失败的保留预览
        return item;
      }));
    }catch(e){
      console.error('参考图上传失败',e);
      // 上传失败时保留预览，标记为未上传状态
      setRefImages(prev=>prev.map(item=>{
        const idx=newItems.findIndex(n=>n.id===item.id);
        if(idx>=0)return{...item,uploading:false,uploadFailed:true};
        return item;
      }));
    }
    if(refInputRef.current)refInputRef.current.value='';
  };

  const removeRefImage=(e,id)=>{e.stopPropagation();setRefImages(prev=>prev.filter(r=>r.id!==id));};
  const clearAllRefs=e=>{e.stopPropagation();setRefImages([]);if(refInputRef.current)refInputRef.current.value='';};

  const handleDragEnter=e=>{e.preventDefault();e.stopPropagation();dragCounter.current++;if(supportsRef)setDragging(true);};
  const handleDragLeave=e=>{e.preventDefault();e.stopPropagation();dragCounter.current--;if(dragCounter.current<=0){dragCounter.current=0;setDragging(false);}};
  const handleDragOver=e=>{e.preventDefault();e.stopPropagation();};
  const handleDrop=e=>{e.preventDefault();e.stopPropagation();dragCounter.current=0;setDragging(false);if(!supportsRef)return;const files=e.dataTransfer?.files;if(files?.length)handleRefFiles(files);};

  const removePendingTask=id=>setPendingTasks(prev=>prev.filter(t=>t.id!==id));

  const doGen=async()=>{
    if(!prompt.trim())return;
    const taskUid=crypto.randomUUID();
    const snapPrompt=prompt,snapModel=MODELS[selModel].name,snapRatio=aspectRatio,snapColor=MODELS[selModel].color;
    const pendingTask={id:taskUid,prompt:snapPrompt,model:snapModel,ratio:snapRatio,color:snapColor,status:'generating',error:null};
    setPendingTasks(prev=>[pendingTask,...prev]);
    try{
      const res=await api.generate.create({
          prompt:snapPrompt,
          model:MODELS[selModel].modelId,
          aspectRatio:aspectRatio.toLowerCase(),
          ...(resolution&&{resolution}),
          ...(quality&&{quality}),
          ...(outputFormat&&{outputFormat:outputFormat.toLowerCase()}),
          ...(refImages.length>0&&{refImageUrls:refImages.filter(r=>r.url).map(r=>r.url)}),
          ...(speed&&{speed}),
      });
      const{taskId,error:err}=await res.json();
      if(!taskId)throw new Error(err||'创建任务失败');
      let retries=0;const MAX_RETRIES=60;
      const poll=async()=>{
        if(++retries>MAX_RETRIES){setPendingTasks(prev=>prev.map(t=>t.id===taskUid?{...t,status:'failed',error:'生成超时'}:t));return;}
        const d=await(await api.generate.status(taskId)).json();
        if(d.status==='success'){
          removePendingTask(taskUid);
          const newImgs=d.images.map((url,i)=>({
            id:crypto.randomUUID(),prompt:snapPrompt,model:snapModel,
            ratio:snapRatio,date:new Date().toISOString().slice(0,10),
            fav:false,imageUrl:url,color:snapColor,type:'generate',
          }));
          addImages(newImgs);
        }else if(d.status==='failed'){
          setPendingTasks(prev=>prev.map(t=>t.id===taskUid?{...t,status:'failed',error:d.error||'生成失败'}:t));
        }else setTimeout(poll,3000);
      };
      setTimeout(poll,3000);
    }catch(e){
      setPendingTasks(prev=>prev.map(t=>t.id===taskUid?{...t,status:'failed',error:e.message}:t));
    }
  };

  const handleEditComplete=(urls,editedPrompt)=>{
    if(!urls?.length)return;
    const today=new Date().toISOString().slice(0,10);
    const newImgs=urls.map((url,i)=>({
      id:crypto.randomUUID(),prompt:editedPrompt,model:'Nano Banana Edit',
      ratio:editImage?.ratio||'1:1',date:today,fav:false,
      imageUrl:url,color:'#1a2030',type:'generate',
    }));
    addImages(newImgs);
  };

  return(
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      {/* Logo 标题 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",paddingTop:28,marginBottom:44}}>
        <span style={{fontFamily:"'Outfit',sans-serif",fontSize:44,fontWeight:800,letterSpacing:"-.03em",color:"var(--t1)"}}>PictureMe</span>
      </div>

      {/* generate / video / enhance 输入区：用 display 隐藏保留状态 */}
      <div style={{display:tab==="generate"?'block':'none'}}>
          {/* ── 主输入区 ── */}
          <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} style={{background:"var(--bgc)",borderRadius:12,border:dragging&&supportsRef?"1.5px dashed var(--ac)":"1px solid var(--bd)",marginBottom:14,position:"relative",zIndex:10,transition:"border .15s"}}>
            {/* 拖拽提示遮罩 */}
            {dragging&&supportsRef&&(
              <div style={{position:"absolute",inset:0,borderRadius:12,background:"rgba(212,165,116,.08)",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                <span style={{fontSize:15,fontWeight:600,color:"var(--ac)"}}>松开以添加参考图</span>
              </div>
            )}
            {/* hidden file input for ref image */}
            <input ref={refInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{display:"none"}} onChange={e=>handleRefFiles(e.target.files)}/>
            {/* 参考图预览（输入框内顶部，支持多张） */}
            {refImages.length>0&&(
              <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid var(--bd)",background:"rgba(212,165,116,.04)",flexWrap:"wrap"}}>
                {refImages.map(ref=>(
                  <div key={ref.id} style={{position:"relative",flexShrink:0}}>
                    <img src={ref.preview} style={{width:44,height:44,borderRadius:8,objectFit:"cover",border:ref.uploading?"1.5px solid var(--t3)":"1.5px solid var(--ac)",opacity:ref.uploading?.6:1,display:"block"}}/>
                    {ref.uploading?(
                      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,background:"rgba(0,0,0,.5)"}}>
                        <span style={{width:12,height:12,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>
                      </div>
                    ):(
                      <button onClick={e=>removeRefImage(e,ref.id)} title="移除参考图" style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",border:"none",background:"rgba(0,0,0,.75)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,fontSize:12,lineHeight:1,fontWeight:700}}>×</button>
                    )}
                  </div>
                ))}
                <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:2,marginLeft:4}}>
                  <div style={{fontSize:13,fontWeight:500,color:refImages.some(r=>r.uploading)?"var(--t3)":"var(--t1)"}}>{refImages.some(r=>r.uploading)?"上传中...":`${refImages.length} 张参考图`}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span onClick={()=>refInputRef.current?.click()} style={{fontSize:11,color:"var(--ac)",cursor:"pointer"}}>继续添加</span>
                    <span onClick={clearAllRefs} style={{fontSize:11,color:"var(--t3)",cursor:"pointer"}}>全部移除</span>
                  </div>
                </div>
              </div>
            )}
            {/* 提示词输入框 */}
            <textarea
              ref={promptRef}
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
                        {refImages.length>0?(
                          <button onClick={()=>refInputRef.current?.click()} style={pillStyle(false)}>
                            {Icons.pillRef}
                            {refImages.some(r=>r.uploading)?"上传中...":`参考图 ${refImages.length}`}
                            <button onClick={clearAllRefs} style={{display:"flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",border:"none",background:"rgba(255,255,255,.12)",color:"var(--t3)",cursor:"pointer",padding:0,fontSize:10,lineHeight:1,fontWeight:700,marginLeft:2}}>×</button>
                          </button>
                        ):(
                          <button onClick={()=>refInputRef.current?.click()} style={pillStyle(false)}>
                            {Icons.pillRef}
                            参考图
                          </button>
                        )}
                      </div>
                    )}

                    {/* Ratio pill */}
                    <div style={{position:"relative"}} data-pill>
                      <button onClick={()=>setOpenDropdown(openDropdown==='ratio'?null:'ratio')} style={pillStyle(openDropdown==='ratio')}>
                        {Icons.pillRatio}
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
                          {Icons.pillRes}
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
                          {Icons.pillQuality}
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
                          {Icons.pillSpeed}
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
                          {Icons.pillFormat}
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
                    <button onClick={doGen} style={{marginLeft:"auto",padding:"0 18px",height:32,borderRadius:6,border:"none",cursor:"pointer",background:"var(--ac)",color:"var(--bg0)",fontFamily:"inherit",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6,transition:"all .2s",flexShrink:0}}>
                      {Icons.pillSend}
                      生成
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
      </div>
      <div style={{display:tab==="video"?'block':'none'}}>
        <VideoTab refreshCredits={refreshCredits} addImages={addImages} pendingVideoTasks={pendingVideoTasks} setPendingVideoTasks={setPendingVideoTasks} pendingRefImage={pendingRefImage} clearPendingRef={clearPendingRef}/>
      </div>
      <div style={{display:tab==="enhance"?'block':'none'}}>
        <EnhanceTab addImages={addImages} refreshCredits={refreshCredits}/>
      </div>

      {/* 最近生成 — 按 tab 过滤 */}
      {(()=>{
        const typeMap={generate:'generate',video:'video',enhance:'enhance'};
        const currentType=typeMap[tab]||'generate';
        const filtered=images.filter(img=>(img.type||'generate')===currentType);
        const isVideo=tab==='video';
        const isEnhance=tab==='enhance';
        return(
          <div style={{marginTop:32,position:"relative",zIndex:0}}>
            <h3 style={{fontSize:15,fontWeight:600,marginBottom:14,color:"var(--t2)"}}>最近{isVideo?'生成的视频':isEnhance?'增强的图片':'生成'}</h3>
            {loadingImages?(
              <div style={{display:"flex",alignItems:"center",gap:10,color:"var(--t3)",fontSize:13,padding:"20px 0"}}>
                <span style={{width:16,height:16,border:"2px solid var(--bd)",borderTopColor:"var(--ac)",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>
                加载历史记录...
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:isVideo?"repeat(auto-fill,minmax(360px,1fr))":"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
                {/* 图像生成 tab 显示 pending 任务 */}
                {tab==='generate'&&pendingTasks.map(task=>(
                  <div key={task.id} style={{borderRadius:10,overflow:"hidden",background:"var(--bgc)",border:task.status==='failed'?"1px solid rgba(239,68,68,.3)":"1px solid var(--bd)"}}>
                    <div style={{aspectRatio:"1/1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,background:task.status==='failed'?"rgba(239,68,68,.04)":`linear-gradient(135deg,${task.color}10,${task.color}05)`}}>
                      {task.status==='generating'?(
                        <>
                          <span style={{width:28,height:28,border:"3px solid var(--bd)",borderTopColor:"var(--ac)",borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block"}}/>
                          <span style={{fontSize:12,color:"var(--t3)"}}>生成中...</span>
                        </>
                      ):(
                        <>
                          <span style={{fontSize:13,color:"#ef4444",textAlign:"center",padding:"0 16px",lineHeight:1.5}}>{task.error}</span>
                          <button onClick={()=>removePendingTask(task.id)} style={{padding:"6px 16px",borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.1)",color:"#ef4444",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
                            {Icons.trash}删除
                          </button>
                        </>
                      )}
                    </div>
                    <div style={{padding:"10px 12px"}}>
                      <p style={{fontSize:12,fontWeight:500,lineHeight:1.5,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--t1)"}}>{task.prompt}</p>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:10,color:"var(--t3)"}}>{task.model}</span>
                        <span style={{fontSize:10,color:"var(--t3)"}}>{task.ratio}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {isVideo?(
                  <>
                    {pendingVideoTasks.map(task=>(
                      <div key={task.id} style={{borderRadius:14,overflow:"hidden",border:task.status==='failed'?"1px solid rgba(239,68,68,.3)":"1px solid var(--bdl)",background:"var(--bgc)"}}>
                        <div style={{aspectRatio:"16/9",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,background:task.status==='failed'?"rgba(239,68,68,.04)":`linear-gradient(135deg,${task.color}10,${task.color}05)`}}>
                          {task.status==='generating'?(
                            <>
                              <span style={{width:28,height:28,border:"3px solid var(--bd)",borderTopColor:task.color,borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block"}}/>
                              <span style={{fontSize:12,color:"var(--t3)"}}>视频生成中{task.progress>0?` ${task.progress}%`:"..."}</span>
                            </>
                          ):(
                            <>
                              <span style={{fontSize:13,color:"#ef4444",textAlign:"center",padding:"0 16px",lineHeight:1.5}}>{task.error}</span>
                              <button onClick={()=>setPendingVideoTasks(prev=>prev.filter(t=>t.id!==task.id))} style={{padding:"6px 16px",borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.1)",color:"#ef4444",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
                                {Icons.trash}删除
                              </button>
                            </>
                          )}
                        </div>
                        <div style={{padding:"12px 14px"}}>
                          <p style={{fontSize:12,fontWeight:500,lineHeight:1.5,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--t1)"}}>{task.prompt}</p>
                          <span style={{fontSize:10,color:"var(--t3)"}}>{task.model} · {task.ratio} · {task.duration}s</span>
                        </div>
                      </div>
                    ))}
                    {filtered.slice(0,12).map(img=>(
                      <div key={img.id} style={{borderRadius:14,overflow:"hidden",border:"1px solid var(--bdl)",background:"var(--bgc)"}}>
                        <video src={img.imageUrl} controls style={{width:"100%",display:"block",maxHeight:400,background:"#111"}}/>
                        <div style={{padding:"12px 14px"}}>
                          <p style={{fontSize:12,fontWeight:500,lineHeight:1.5,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--t1)"}}>{img.prompt}</p>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontSize:10,color:"var(--t3)"}}>{img.model}{img.ratio?' · '+img.ratio:''}</span>
                            <button onClick={()=>deleteImage(img.id)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid var(--bd)",background:"transparent",color:"var(--t3)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{Icons.trash}</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filtered.length===0&&pendingVideoTasks.length===0&&<p style={{fontSize:13,color:"var(--t3)",padding:"20px 0"}}>暂无视频记录</p>}
                  </>
                ):(
                  (filtered.length===0&&(tab!=='generate'||pendingTasks.length===0)?
                    (tab==='generate'?SAMPLE_IMAGES.slice(0,4):[]
                  ):filtered.slice(0,12)).map(img=>(
                    <ImageCard key={img.id} image={img} onFav={toggleFav} onDelete={deleteImage} onEdit={img.imageUrl?setEditImage:undefined} onUseAsRef={useImageAsRef} onUseAsVideoRef={useImageAsVideoRef}/>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })()}

      {editImage&&(
        <EditModal
          image={editImage}
          onClose={()=>setEditImage(null)}
          onEditComplete={handleEditComplete}
        />
      )}
    </div>
  );
}

function LibraryPage({favorites=false,images=[],toggleFav,deleteImage,useImageAsRef,useImageAsVideoRef}){
  const[filter,setFilter]=useState("全部");
  const now=new Date();
  const weekAgo=new Date(now);weekAgo.setDate(now.getDate()-7);
  const monthAgo=new Date(now);monthAgo.setMonth(now.getMonth()-1);
  const base=favorites?images.filter(i=>i.fav):images;
  const displayed=base.filter(img=>{
    if(filter==="全部")return true;
    const raw=img.created_at||img.date;
    if(!raw)return false;
    const d=new Date(raw);
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
          {displayed.map(img=>img.type==='video'?(
            <div key={img.id} style={{borderRadius:10,overflow:"hidden",border:"1px solid var(--bd)",background:"var(--bgc)"}}>
              <video src={img.imageUrl} controls style={{width:"100%",display:"block",maxHeight:300,background:"#111"}}/>
              <div style={{padding:"10px 12px"}}>
                <p style={{fontSize:12,fontWeight:500,lineHeight:1.5,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--t1)"}}>{img.prompt}</p>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"var(--t3)"}}>{img.model}{img.ratio?' · '+img.ratio:''}</span>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>toggleFav(img.id)} style={{padding:"4px 8px",borderRadius:6,border:"1px solid var(--bd)",background:img.fav?"rgba(212,165,116,.1)":"transparent",color:img.fav?"var(--ac)":"var(--t3)",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center"}}>{Icons.heart}</button>
                    <button onClick={()=>deleteImage(img.id)} style={{padding:"4px 8px",borderRadius:6,border:"1px solid var(--bd)",background:"transparent",color:"var(--t3)",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center"}}>{Icons.trash}</button>
                  </div>
                </div>
              </div>
            </div>
          ):(
            <ImageCard key={img.id} image={img} onFav={toggleFav} onDelete={deleteImage} onUseAsRef={useImageAsRef} onUseAsVideoRef={useImageAsVideoRef}/>
          ))}
        </div>
      )}
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
      const res=await api.auth.login(username,password);
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'登录失败');
      onLogin(data.token,data.user);
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  const inputStyle={padding:"12px 16px",borderRadius:8,border:"1px solid var(--bd)",background:"var(--bgc)",color:"var(--t1)",fontFamily:"inherit",fontSize:14,outline:"none",width:"100%"};
  return(
    <div style={{position:"fixed",inset:0,background:"var(--bg0)",display:"flex",alignItems:"center",justifyContent:"center"}}>
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

// ─── AI 提示词助手 ──────────────────────────────────────
const LLM_MODELS=[
  {id:"gpt-5.2",name:"GPT-5.2",color:"#10a37f",path:"gpt-5-2"},
  {id:"gemini-3-flash",name:"Gemini 3 Flash",color:"#4285f4",path:"gemini-3-flash"},
];

const FURNITURE_STYLES=[
  {id:"american-modern",name:"美国现代风",desc:"简约线条、中性色调、开放空间",prompt:"American modern style interior, clean lines, neutral color palette, open space layout, minimalist furniture, natural light, warm wood accents"},
  {id:"rural",name:"乡村风",desc:"温馨质朴、自然材质、手工质感",prompt:"Rustic country style interior, warm and cozy, natural materials, handmade textures, wooden beams, vintage furniture, earth tones"},
  {id:"farmhouse",name:"农舍风",desc:"白色基调、原木元素、乡村气息",prompt:"Farmhouse style interior, white shiplap walls, reclaimed wood, barn doors, mason jars, linen textiles, rustic charm"},
  {id:"industrial",name:"工业风",desc:"裸露砖墙、金属管道、粗犷质感",prompt:"Industrial style interior, exposed brick walls, metal pipes, raw concrete floors, factory lighting, steel frame furniture, loft space"},
  {id:"mediterranean",name:"地中海风",desc:"拱形门窗、蓝白配色、手工瓷砖",prompt:"Mediterranean style interior, arched doorways, blue and white palette, terracotta tiles, hand-painted ceramics, wrought iron details, natural sunlight"},
  {id:"french-cream",name:"法国奶油风",desc:"柔和奶白、优雅曲线、浪漫氛围",prompt:"French cream style interior, soft creamy whites, elegant curved furniture, romantic atmosphere, ornate mirrors, crystal chandeliers, silk fabrics"},
  {id:"luxury",name:"轻奢风",desc:"金属点缀、大理石纹理、精致细节",prompt:"Modern luxury style interior, metallic gold accents, marble textures, velvet upholstery, crystal lighting, sophisticated details, high-end finishes"},
  {id:"wabi-sabi",name:"日本侘寂风",desc:"不完美之美、自然素材、极简空间",prompt:"Japanese wabi-sabi style interior, beauty of imperfection, natural materials, minimalist space, earthy tones, handmade pottery, organic textures, soft diffused light"},
  {id:"scandinavian",name:"北欧风",desc:"白色极简、功能至上、温暖木质",prompt:"Scandinavian style interior, white minimalist walls, functional design, warm wood floors, cozy textiles, clean aesthetic, abundant natural light"},
  {id:"mid-century",name:"中古世纪风",desc:"有机曲线、大胆色彩、复古未来",prompt:"Mid-century modern style interior, organic curves, bold accent colors, retro-futuristic design, tapered legs, geometric patterns, walnut wood"},
  {id:"chinese-zen",name:"新中式禅意",desc:"东方意境、留白空间、天然材质",prompt:"New Chinese zen style interior, oriental aesthetics, negative space, natural materials, bamboo elements, ink wash inspired, subtle elegance, silk screens"},
  {id:"bohemian",name:"波西米亚风",desc:"多彩混搭、民族图案、自由随性",prompt:"Bohemian style interior, colorful mix-and-match, ethnic patterns, macrame wall hangings, layered textiles, plants, eclectic furniture, free-spirited vibe"},
];

function AiPromptPage({sendPromptToGen}){
  // 会话列表管理
  const[convos,setConvos]=useState(()=>{try{return JSON.parse(localStorage.getItem('ai_prompt_convos'))||[];}catch{return[];}});
  const[activeId,setActiveId]=useState(()=>localStorage.getItem('ai_prompt_active')||null);
  const activeConvo=convos.find(c=>c.id===activeId)||null;
  const[messages,setMessages]=useState(()=>activeConvo?.messages||[]);
  const[input,setInput]=useState("");
  const[selModel,setSelModel]=useState(()=>{const v=localStorage.getItem('ai_prompt_model');const n=v?Number(v):0;return n<LLM_MODELS.length?n:0;});
  const[loading,setLoading]=useState(false);
  const[refImages,setRefImages]=useState([]);
  const[dragOver,setDragOver]=useState(false);
  const[sideCol,setSideCol]=useState(()=>localStorage.getItem('ai_chat_side_col')==='1');
  const chatEndRef=useRef(null);
  const inputRef=useRef(null);
  const abortRef=useRef(null);

  // 切换会话时加载消息
  useEffect(()=>{
    const c=convos.find(c=>c.id===activeId);
    setMessages(c?.messages||[]);
  },[activeId]);

  // 新建会话
  const newConvo=()=>{
    if(loading)return;
    const id=crypto.randomUUID();
    const c={id,title:"新对话",date:new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}),messages:[]};
    setConvos(prev=>[c,...prev]);
    setActiveId(id);
    setMessages([]);
    setInput("");
    setRefImages([]);
  };

  // 删除会话
  const deleteConvo=(id,e)=>{
    e.stopPropagation();
    setConvos(prev=>prev.filter(c=>c.id!==id));
    if(activeId===id){setActiveId(null);setMessages([]);}
  };

  // 持久化（去掉 data: 图片避免超出 localStorage 配额）
  useEffect(()=>{
    if(loading)return;
    try{
      const stripImg=v=>{if(typeof v==='string'&&v.startsWith('data:'))return '[image]';return v;};
      const saved=convos.map(c=>({...c,messages:c.messages.map(m=>{
        const cleaned={...m};
        if(cleaned._images)cleaned._images=cleaned._images.map(stripImg);
        if(Array.isArray(cleaned.content))cleaned.content=cleaned.content.filter(p=>p.type==='text');
        return cleaned;
      })}));
      localStorage.setItem('ai_prompt_convos',JSON.stringify(saved));
    }catch{}
  },[convos,loading]);
  useEffect(()=>{if(activeId)localStorage.setItem('ai_prompt_active',activeId);},[activeId]);
  useEffect(()=>{localStorage.setItem('ai_prompt_model',String(selModel));},[selModel]);
  useEffect(()=>{localStorage.setItem('ai_chat_side_col',sideCol?'1':'0');},[sideCol]);

  // 同步 messages 回 convos
  const syncMessages=(msgs)=>{
    setMessages(msgs);
    if(!activeId)return;
    setConvos(prev=>prev.map(c=>c.id===activeId?{...c,messages:msgs}:c));
  };

  // 自动生成标题（取第一条用户消息前20字）
  const autoTitle=(msgs)=>{
    const first=msgs.find(m=>m.role==='user');
    const text=first?._display||first?.content||'';
    const title=typeof text==='string'?text.slice(0,20):'对话';
    return title||(first?._images?.length?'图片对话':'新对话');
  };

  const scrollToBottom=()=>{chatEndRef.current?.scrollIntoView({behavior:'smooth'});};
  useEffect(scrollToBottom,[messages]);

  // 读取图片为 data URL
  const readAsDataUrl=f=>new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(f);});

  const handleFiles=async files=>{
    const valid=[...files].filter(f=>f.type.startsWith('image/'));
    if(!valid.length)return;
    const urls=await Promise.all(valid.map(f=>readAsDataUrl(f)));
    setRefImages(prev=>[...prev,...urls]);
  };

  const onDrop=e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files);};
  const onDragOver=e=>{e.preventDefault();setDragOver(true);};
  const onDragLeave=()=>setDragOver(false);

  const onPaste=e=>{
    const files=[...e.clipboardData.items].filter(i=>i.type.startsWith('image/')).map(i=>i.getAsFile()).filter(Boolean);
    if(files.length)handleFiles(files);
  };

  const sendMessage=async()=>{
    const text=input.trim();
    if(!text&&!refImages.length)return;
    if(loading)return;

    // 如果没有激活会话，自动新建
    let curId=activeId;
    if(!curId){
      const id=crypto.randomUUID();
      const c={id,title:"新对话",date:new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}),messages:[]};
      setConvos(prev=>[c,...prev]);
      setActiveId(id);
      curId=id;
    }

    // 构建用户消息 content
    let content;
    if(refImages.length){
      content=[{type:"text",text:text||"请分析这张图片"}];
      for(const img of refImages){
        content.push({type:"image_url",image_url:{url:img}});
      }
    }else{
      content=text;
    }

    const userMsg={role:"user",content,_display:text,_images:[...refImages]};
    const newMessages=[...messages,userMsg];
    syncMessages(newMessages);
    setInput("");
    setRefImages([]);
    setLoading(true);

    // 自动更新标题（第一条消息时）
    if(newMessages.filter(m=>m.role==='user').length===1){
      const title=autoTitle(newMessages);
      setConvos(prev=>prev.map(c=>c.id===curId?{...c,title}:c));
    }

    // 构建 API messages（加入 system prompt）
    const sysMsg={role:"system",content:"你是一个有创意、有个性的 AI 助手，平时帮用户聊创意、分析图片、写图像生成提示词。说话要自然，像朋友聊天一样，别老是用「首先/其次/最后」这种结构化格式，也不要每次都分条列点。语气可以轻松一点，偶尔可以表达自己的看法或倾向，别像在写报告。如果用户需要图像生成提示词，就生成高质量的英文提示词（用代码块包裹），然后用几句话聊聊你的思路，别搞成正式说明文。"};
    const apiMsgs=[sysMsg,...newMessages.map(m=>({role:m.role,content:m.content}))];

    const assistantMsg={role:"assistant",content:"",_display:""};
    const withAssistant=[...newMessages,assistantMsg];
    syncMessages(withAssistant);

    try{
      abortRef.current=new AbortController();
      const res=await fetch(`${import.meta.env.VITE_API_BASE||''}/api/chat`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token')}`},
        body:JSON.stringify({model:LLM_MODELS[selModel].id,path:LLM_MODELS[selModel].path,messages:apiMsgs,stream:true}),
        signal:abortRef.current.signal,
      });

      if(!res.ok){
        const err=await res.text();
        const errMsgs=[...newMessages,{...assistantMsg,content:`错误: ${err}`,_display:`错误: ${err}`}];
        syncMessages(errMsgs);
        setLoading(false);
        return;
      }

      const reader=res.body.getReader();
      const decoder=new TextDecoder();
      let buf="";
      let full="";

      while(true){
        const{done,value}=await reader.read();
        if(done)break;
        buf+=decoder.decode(value,{stream:true});
        const lines=buf.split('\n');
        buf=lines.pop()||"";
        for(const line of lines){
          if(!line.startsWith('data: '))continue;
          const data=line.slice(6);
          if(data==='[DONE]')break;
          try{
            const json=JSON.parse(data);
            const delta=json.choices?.[0]?.delta?.content;
            if(delta){
              full+=delta;
              setMessages(prev=>{const a=[...prev];a[a.length-1]={...a[a.length-1],content:full,_display:full};return a;});
            }
          }catch{}
        }
      }
      // 流结束，同步最终结果到 convos
      setMessages(prev=>{
        const final=[...prev];
        setConvos(pc=>pc.map(c=>c.id===curId?{...c,messages:final}:c));
        return final;
      });
    }catch(e){
      if(e.name!=='AbortError'){
        const errMsgs=[...newMessages,{...assistantMsg,content:`请求失败: ${e.message}`,_display:`请求失败: ${e.message}`}];
        syncMessages(errMsgs);
      }
    }
    setLoading(false);
    abortRef.current=null;
  };

  const stopGeneration=()=>{abortRef.current?.abort();setLoading(false);};

  // 从消息中提取代码块
  const extractCodeBlock=(text)=>{
    const m=text.match(/```[\s\S]*?\n([\s\S]*?)```/);
    return m?m[1].trim():null;
  };

  const copyText=(text)=>{navigator.clipboard.writeText(text).catch(()=>{});};

  // 渲染 markdown 代码块
  const renderContent=(text)=>{
    if(!text)return null;
    const parts=text.split(/(```[\s\S]*?```)/g);
    return parts.map((part,i)=>{
      const codeMatch=part.match(/```(\w*)\n?([\s\S]*?)```/);
      if(codeMatch){
        const code=codeMatch[2].trim();
        return <div key={i} style={{position:"relative",margin:"8px 0"}}>
          <pre style={{background:"rgba(0,0,0,.3)",border:"1px solid var(--bd)",borderRadius:8,padding:"14px 16px",fontSize:13,lineHeight:1.7,overflowX:"auto",color:"var(--ac)",fontFamily:"'JetBrains Mono',monospace",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{code}</pre>
          <div style={{position:"absolute",top:8,right:8,display:"flex",gap:4}}>
            <button onClick={()=>copyText(code)} style={{padding:"4px 10px",borderRadius:5,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"var(--t2)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>复制</button>
            {sendPromptToGen&&<button onClick={()=>sendPromptToGen(code)} style={{padding:"4px 10px",borderRadius:5,border:"1px solid rgba(212,165,116,.3)",background:"rgba(212,165,116,.1)",color:"var(--ac)",fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}>{Icons.pillSend} 生图</button>}
          </div>
        </div>;
      }
      return <span key={i} style={{whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{part}</span>;
    });
  };

  return(
    <div style={{display:"flex",height:"calc(100vh - 52px)"}}>
      {/* ── 左侧面板 ── */}
      <div style={{width:sideCol?44:200,minWidth:sideCol?44:200,flexShrink:0,borderRight:"1px solid var(--bd)",display:"flex",flexDirection:"column",transition:"width .2s ease,min-width .2s ease",overflow:"hidden"}}>
        {/* 顶部按钮 */}
        <div style={{display:"flex",alignItems:"center",gap:4,padding:sideCol?"6px 6px 8px":"6px 6px 8px",flexShrink:0}}>
          <button onClick={()=>setSideCol(v=>!v)} title={sideCol?"展开":"折叠"} style={{width:30,height:30,borderRadius:8,border:"1px solid var(--bd)",background:"transparent",color:"var(--t3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--ac)';e.currentTarget.style.color='var(--t1)';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.color='var(--t3)';}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          </button>
          {!sideCol&&(
            <button onClick={newConvo} style={{flex:1,padding:"6px 0",borderRadius:8,border:"1px dashed rgba(212,165,116,.25)",background:"transparent",color:"var(--ac)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background='rgba(212,165,116,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新对话
            </button>
          )}
          {sideCol&&(
            <button onClick={newConvo} title="新对话" style={{width:30,height:30,borderRadius:8,border:"1px dashed rgba(212,165,116,.25)",background:"transparent",color:"var(--ac)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background='rgba(212,165,116,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          )}
        </div>
        {/* 会话列表 */}
        <div style={{flex:1,overflowY:"auto",overflowX:"hidden",display:"flex",flexDirection:"column",gap:1,padding:"0 4px"}}>
          {convos.map(c=>(
            <div key={c.id} className="convo-item" onClick={()=>{if(!loading){setActiveId(c.id);if(sideCol)setSideCol(false);}}} style={{padding:sideCol?"6px":"8px 8px",borderRadius:8,cursor:"pointer",background:activeId===c.id?"rgba(212,165,116,.1)":"transparent",border:activeId===c.id?"1px solid rgba(212,165,116,.15)":"1px solid transparent",transition:"all .15s",display:"flex",alignItems:"center",gap:8,position:"relative",minHeight:sideCol?32:undefined}} onMouseEnter={e=>{if(activeId!==c.id)e.currentTarget.style.background='rgba(255,255,255,.03)';}} onMouseLeave={e=>{if(activeId!==c.id)e.currentTarget.style.background='transparent';}}>
              {sideCol?(
                <div style={{width:22,height:22,borderRadius:6,background:activeId===c.id?"rgba(212,165,116,.15)":"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,margin:"0 auto"}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={activeId===c.id?"var(--ac)":"var(--t3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
              ):(
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,color:activeId===c.id?"var(--t1)":"var(--t2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:2}}>{c.title||"新对话"}</div>
                  <div style={{fontSize:10,color:"var(--t3)"}}>{c.date}</div>
                </div>
              )}
              {!sideCol&&<button className="convo-del" onClick={e=>deleteConvo(c.id,e)} style={{opacity:0,position:"absolute",top:6,right:4,width:18,height:18,borderRadius:4,border:"none",background:"transparent",color:"var(--t3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.color='#ff6b6b';}} onMouseLeave={e=>{e.currentTarget.style.color='var(--t3)';}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>}
            </div>
          ))}
          {!sideCol&&convos.length===0&&<div style={{padding:"16px 8px",textAlign:"center",fontSize:11,color:"var(--t3)",lineHeight:1.6}}>暂无对话<br/>点击上方新建</div>}
        </div>
      </div>

      {/* ── 主聊天区 ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,position:"relative"}}>
        {/* 消息滚动区 */}
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,maxWidth:720,width:"100%",margin:"0 auto",padding:"20px 24px 16px",display:"flex",flexDirection:"column",gap:20}}>
            {messages.length===0&&(
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,color:"var(--t3)"}}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.3}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:600,color:"var(--t2)",marginBottom:6}}>AI 对话</div>
                  <div style={{fontSize:13,lineHeight:1.6,color:"var(--t3)"}}>交流创意灵感、分析参考图、生成提示词</div>
                </div>
              </div>
            )}
            {messages.map((msg,i)=>(
              msg.role==="user"?(
                <div key={i} style={{display:"flex",justifyContent:"flex-end"}}>
                  <div style={{maxWidth:"75%"}}>
                    {msg._images?.length>0&&msg._images[0]!=='[image]'&&(
                      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                        {msg._images.map((img,j)=>(
                          img!=='[image]'&&<img key={j} src={img} style={{width:80,height:80,objectFit:"cover",borderRadius:10,border:"1px solid var(--bd)"}}/>
                        ))}
                      </div>
                    )}
                    <div style={{padding:"10px 16px",borderRadius:"18px 18px 4px 18px",background:"var(--ac)",color:"var(--bg0)",fontSize:13,lineHeight:1.7,wordBreak:"break-word"}}>
                      {msg._display||"[图片]"}
                    </div>
                  </div>
                </div>
              ):(
                <div key={i} style={{maxWidth:"85%"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <div style={{width:22,height:22,borderRadius:6,background:`${LLM_MODELS[selModel].color}18`,border:`1px solid ${LLM_MODELS[selModel].color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>✨</div>
                    <span style={{fontSize:11,fontWeight:600,color:LLM_MODELS[selModel].color}}>{LLM_MODELS[selModel].name}</span>
                  </div>
                  <div style={{fontSize:13,lineHeight:1.8,color:"var(--t1)",wordBreak:"break-word"}}>
                    {renderContent(msg._display)}
                    {loading&&i===messages.length-1&&<span style={{display:"inline-block",width:6,height:15,background:"var(--ac)",marginLeft:2,animation:"blink 1s infinite",verticalAlign:"text-bottom",borderRadius:1}}/>}
                  </div>
                  {/* 助手消息底部操作栏 */}
                  {msg._display&&!(loading&&i===messages.length-1)&&(
                    <div style={{display:"flex",gap:4,marginTop:6}}>
                      <button onClick={()=>copyText(msg._display)} style={{padding:"3px 10px",borderRadius:5,border:"1px solid var(--bd)",background:"transparent",color:"var(--t3)",fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
                        {Icons.copy} 复制全部
                      </button>
                      {sendPromptToGen&&extractCodeBlock(msg._display)&&(
                        <button onClick={()=>sendPromptToGen(extractCodeBlock(msg._display))} style={{padding:"3px 10px",borderRadius:5,border:"1px solid rgba(212,165,116,.25)",background:"rgba(212,165,116,.06)",color:"var(--ac)",fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
                          {Icons.pillSend} 发送到生图
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            ))}
            <div ref={chatEndRef}/>
          </div>
        </div>

        {/* 底部输入区 */}
        <div style={{flexShrink:0,padding:"0 24px 16px",display:"flex",justifyContent:"center"}}>
          <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} style={{width:"100%",maxWidth:720,border:dragOver?"1.5px solid var(--ac)":"1px solid var(--bd)",borderRadius:16,background:"var(--bg2)",transition:"border .15s"}}>
            {refImages.length>0&&(
              <div style={{display:"flex",gap:6,padding:"10px 14px 0",flexWrap:"wrap"}}>
                {refImages.map((img,i)=>(
                  <div key={i} style={{position:"relative",width:56,height:56}}>
                    <img src={img} style={{width:56,height:56,objectFit:"cover",borderRadius:8,border:"1px solid var(--bd)"}}/>
                    <button onClick={()=>setRefImages(prev=>prev.filter((_,j)=>j!==i))} style={{position:"absolute",top:-5,right:-5,width:16,height:16,borderRadius:"50%",background:"var(--bg0)",border:"1px solid var(--bd)",color:"var(--t3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,padding:0}}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",alignItems:"flex-end",gap:8,padding:"10px 14px"}}>
              <label style={{cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",width:30,height:30,borderRadius:8,background:"transparent",color:"var(--t3)",flexShrink:0,transition:"color .15s"}} title="上传图片" onMouseEnter={e=>e.currentTarget.style.color='var(--t1)'} onMouseLeave={e=>e.currentTarget.style.color='var(--t3)'}>
                <input type="file" accept="image/*" multiple hidden onChange={e=>handleFiles(e.target.files)}/>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </label>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                onPaste={onPaste}
                placeholder="输入消息... Enter 发送，Shift+Enter 换行"
                rows={1}
                style={{flex:1,resize:"none",background:"transparent",border:"none",outline:"none",color:"var(--t1)",fontFamily:"inherit",fontSize:14,lineHeight:1.6,padding:"5px 0",maxHeight:120,overflowY:"auto"}}
                onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';}}
              />
              {loading?(
                <button onClick={stopGeneration} style={{width:30,height:30,borderRadius:8,border:"none",background:"rgba(255,80,80,.12)",color:"#ff6b6b",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                </button>
              ):(
                <button onClick={sendMessage} disabled={!input.trim()&&!refImages.length} style={{width:30,height:30,borderRadius:8,border:"none",background:(input.trim()||refImages.length)?"var(--ac)":"rgba(255,255,255,.06)",color:(input.trim()||refImages.length)?"var(--bg0)":"var(--t3)",cursor:(input.trim()||refImages.length)?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                </button>
              )}
            </div>
            {/* 模型切换 */}
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 14px 8px"}}>
              {LLM_MODELS.map((m,i)=>(
                <button key={m.id} onClick={()=>setSelModel(i)} style={{padding:"3px 10px",borderRadius:6,border:selModel===i?`1px solid ${m.color}40`:"1px solid transparent",background:selModel===i?`${m.color}10`:"transparent",color:selModel===i?m.color:"var(--t3)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{m.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 提示词模板库 ──────────────────────────────────────────
const DEFAULT_PROMPT_CATEGORIES=[
  {id:"style-preset",name:"风格预设"},
];

const DEFAULT_PROMPT_TEMPLATES=FURNITURE_STYLES.map(s=>({
  id:s.id,title:s.name,prompt:s.prompt,categoryId:"style-preset",coverImg:null,desc:s.desc,
}));

function PromptLibPage({sendPromptToGen}){
  const[categories,setCategories]=useState(()=>{
    try{const v=JSON.parse(localStorage.getItem('prompt_categories'));return v&&v.length?v:DEFAULT_PROMPT_CATEGORIES;}catch{return DEFAULT_PROMPT_CATEGORIES;}
  });
  const[templates,setTemplates]=useState(()=>{
    try{const v=JSON.parse(localStorage.getItem('prompt_templates'));return v&&v.length?v:DEFAULT_PROMPT_TEMPLATES;}catch{return DEFAULT_PROMPT_TEMPLATES;}
  });
  const[activeCat,setActiveCat]=useState("all");
  const[editModal,setEditModal]=useState(null);
  const[catModal,setCatModal]=useState(null);
  const[copied,setCopied]=useState(null);
  const[hovered,setHovered]=useState(null);
  const[dragCat,setDragCat]=useState(null);
  const[dragOverCat,setDragOverCat]=useState(null);

  useEffect(()=>{try{localStorage.setItem('prompt_categories',JSON.stringify(categories));}catch{}},[categories]);
  useEffect(()=>{try{localStorage.setItem('prompt_templates',JSON.stringify(templates));}catch{}},[templates]);

  const copyPrompt=(id,text)=>{navigator.clipboard.writeText(text).catch(()=>{});setCopied(id);setTimeout(()=>setCopied(null),1500);};
  const sendToGen=(prompt)=>{if(sendPromptToGen)sendPromptToGen(prompt);};

  const saveCard=(card)=>{
    if(editModal.mode==='add'){setTemplates(prev=>[{...card,id:crypto.randomUUID()},...prev]);}
    else{setTemplates(prev=>prev.map(t=>t.id===card.id?card:t));}
    setEditModal(null);
  };
  const deleteCard=(id)=>{setTemplates(prev=>prev.filter(t=>t.id!==id));};
  const saveCat=(cat)=>{
    if(catModal.mode==='add'){setCategories(prev=>[...prev,{...cat,id:crypto.randomUUID()}]);}
    else{setCategories(prev=>prev.map(c=>c.id===cat.id?cat:c));}
    setCatModal(null);
  };
  const deleteCat=(id)=>{
    setCategories(prev=>prev.filter(c=>c.id!==id));
    setTemplates(prev=>prev.map(t=>t.categoryId===id?{...t,categoryId:"other"}:t));
    if(activeCat===id)setActiveCat("all");
  };
  const readAsDataUrl=f=>new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(f);});

  // 单张卡片渲染（与 ImageCard 同风格）
  const PromptCard=({card})=>{
    const isH=hovered===card.id;
    return(
      <div onMouseEnter={()=>setHovered(card.id)} onMouseLeave={()=>setHovered(null)} style={{borderRadius:10,overflow:"hidden",position:"relative",background:"var(--bgc)",border:"1px solid var(--bd)",transition:"all .2s ease",transform:isH?"translateY(-2px)":"none",boxShadow:isH?"0 6px 20px rgba(0,0,0,.2)":"none"}}>
        {/* 图片区：按比例自适应 */}
        <div style={{overflow:"hidden",background:"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",...(card.coverImg?{}:{aspectRatio:"4/3"})}}>
          {card.coverImg
            ? <img src={card.coverImg} alt={card.title} style={{width:"100%",display:"block",height:"auto"}}/>
            : <span style={{color:"var(--t3)",display:"flex",opacity:.4}}>{Icons.image}</span>
          }
          {/* hover 操作层 */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.75),transparent 60%)",opacity:isH?1:0,transition:"opacity .2s",display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:10}}>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>copyPrompt(card.id,card.prompt)} style={{height:28,padding:"0 10px",borderRadius:6,border:"none",background:copied===card.id?"rgba(74,222,128,.25)":"rgba(255,255,255,.12)",color:copied===card.id?"#4ade80":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,backdropFilter:"blur(8px)",fontSize:11,fontFamily:"inherit",fontWeight:500}}>
                {copied===card.id?Icons.check:Icons.copy}{copied===card.id?'已复制':'复制'}
              </button>
              <button onClick={()=>sendToGen(card.prompt)} style={{height:28,padding:"0 10px",borderRadius:6,border:"none",background:"rgba(212,165,116,.25)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,backdropFilter:"blur(8px)",fontSize:11,fontFamily:"inherit",fontWeight:500}}>
                {Icons.pillSend} 生图
              </button>
            </div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>setEditModal({mode:'edit',card})} style={{width:28,height:28,borderRadius:6,border:"none",background:"rgba(255,255,255,.12)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>{Icons.edit}</button>
              <button onClick={()=>{if(confirm('确定删除此提示词？'))deleteCard(card.id);}} style={{width:28,height:28,borderRadius:6,border:"none",background:"rgba(255,255,255,.12)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>{Icons.trash}</button>
            </div>
          </div>
        </div>
        {/* 文字区 */}
        <div style={{padding:"10px 12px"}}>
          <p style={{fontSize:12,fontWeight:600,lineHeight:1.5,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--t1)"}}>{card.title}</p>
          <p style={{fontSize:11,color:"var(--t3)",lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.prompt}</p>
        </div>
      </div>
    );
  };

  // 按分类分组渲染
  const renderByCategory=()=>{
    if(activeCat!=="all"){
      const cards=templates.filter(t=>t.categoryId===activeCat);
      return(
        <>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <h3 style={{fontSize:15,fontWeight:600,color:"var(--t2)"}}>{categories.find(c=>c.id===activeCat)?.name}</h3>
            <button onClick={()=>setCatModal({mode:'edit',cat:categories.find(c=>c.id===activeCat)})} style={{padding:"3px 10px",borderRadius:6,border:"1px solid var(--bd)",background:"transparent",color:"var(--t3)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>编辑</button>
            <button onClick={()=>{if(confirm('确定删除此分类？该分类下的提示词将移至"其他"'))deleteCat(activeCat);}} style={{padding:"3px 10px",borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.06)",color:"#ef4444",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>删除</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
            {cards.map(card=><PromptCard key={card.id} card={card}/>)}
          </div>
          {cards.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:"var(--t3)",fontSize:13}}>此分类下暂无提示词</div>}
        </>
      );
    }
    // "全部"：按分类分组展示
    const catOrder=[...categories];
    const uncategorized=templates.filter(t=>!categories.some(c=>c.id===t.categoryId));
    return(
      <>
        {catOrder.map(cat=>{
          const cards=templates.filter(t=>t.categoryId===cat.id);
          if(cards.length===0)return null;
          return(
            <div key={cat.id} style={{marginBottom:32}}>
              <h3 style={{fontSize:15,fontWeight:600,marginBottom:14,color:"var(--t2)"}}>{cat.name}</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
                {cards.map(card=><PromptCard key={card.id} card={card}/>)}
              </div>
            </div>
          );
        })}
        {uncategorized.length>0&&(
          <div style={{marginBottom:32}}>
            <h3 style={{fontSize:15,fontWeight:600,marginBottom:14,color:"var(--t2)"}}>未分类</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
              {uncategorized.map(card=><PromptCard key={card.id} card={card}/>)}
            </div>
          </div>
        )}
        {templates.length===0&&<div style={{padding:"60px 20px",textAlign:"center",color:"var(--t3)"}}><div style={{fontSize:14,marginBottom:8}}>暂无提示词</div><div style={{fontSize:12}}>点击右上角「新增提示词」添加</div></div>}
      </>
    );
  };

  // Card edit modal
  const CardModal=()=>{
    if(!editModal)return null;
    const[form,setForm]=useState(editModal.card);
    return createPortal(
      <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}} onClick={()=>setEditModal(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:16,padding:28,width:480,maxHeight:"80vh",overflowY:"auto"}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:20}}>{editModal.mode==='add'?'新增提示词':'编辑提示词'}</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>标题</label>
              <input value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid var(--bd)",background:"var(--bgc)",color:"var(--t1)",fontFamily:"inherit",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>提示词内容（英文 prompt）</label>
              <textarea value={form.prompt||''} onChange={e=>setForm({...form,prompt:e.target.value})} rows={4} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid var(--bd)",background:"var(--bgc)",color:"var(--t1)",fontFamily:"inherit",fontSize:13,outline:"none",resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>所属分类</label>
              <select value={form.categoryId||''} onChange={e=>setForm({...form,categoryId:e.target.value})} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid var(--bd)",background:"var(--bgc)",color:"var(--t1)",fontFamily:"inherit",fontSize:13,outline:"none"}}>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:12,color:"var(--t3)",display:"block",marginBottom:4}}>封面图（可选）</label>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {form.coverImg&&<img src={form.coverImg} style={{width:80,height:'auto',maxHeight:80,objectFit:"contain",borderRadius:8,border:"1px solid var(--bd)"}}/>}
                <label style={{padding:"6px 14px",borderRadius:6,border:"1px solid var(--bd)",background:"var(--bgc)",color:"var(--t2)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  上传图片
                  <input type="file" accept="image/*" hidden onChange={async e=>{const f=e.target.files[0];if(f){const url=await readAsDataUrl(f);setForm({...form,coverImg:url});}}}/>
                </label>
                {form.coverImg&&<button onClick={()=>setForm({...form,coverImg:null})} style={{padding:"6px 10px",borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.1)",color:"#ef4444",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>移除</button>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20}}>
            <button onClick={()=>setEditModal(null)} style={{padding:"8px 18px",borderRadius:8,border:"1px solid var(--bd)",background:"transparent",color:"var(--t2)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>取消</button>
            <button onClick={()=>saveCard(form)} disabled={!form.title?.trim()||!form.prompt?.trim()} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"var(--ac)",color:"var(--bg0)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:(!form.title?.trim()||!form.prompt?.trim())?.5:1}}>保存</button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const CatModal=()=>{
    if(!catModal)return null;
    const[name,setName]=useState(catModal.cat?.name||'');
    return createPortal(
      <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}} onClick={()=>setCatModal(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:"var(--bg1)",border:"1px solid var(--bd)",borderRadius:16,padding:28,width:360}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:16}}>{catModal.mode==='add'?'新增分类':'编辑分类'}</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="分类名称" style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid var(--bd)",background:"var(--bgc)",color:"var(--t1)",fontFamily:"inherit",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:16}}/>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <button onClick={()=>setCatModal(null)} style={{padding:"8px 18px",borderRadius:8,border:"1px solid var(--bd)",background:"transparent",color:"var(--t2)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>取消</button>
            <button onClick={()=>{if(name.trim())saveCat({...catModal.cat,name:name.trim()});}} disabled={!name.trim()} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"var(--ac)",color:"var(--bg0)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:name.trim()?1:.5}}>保存</button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return(
    <div style={{maxWidth:1200,margin:"0 auto"}}>
      {/* 顶部：分类标签栏 + 新增按钮 */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        <button onClick={()=>setActiveCat("all")} style={{padding:"6px 16px",borderRadius:20,border:activeCat==="all"?"1px solid var(--ac)":"1px solid var(--bd)",background:activeCat==="all"?"rgba(212,165,116,.12)":"transparent",color:activeCat==="all"?"var(--ac)":"var(--t2)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>全部</button>
        {categories.map((cat,idx)=>(
          <button key={cat.id} draggable
            onDragStart={e=>{setDragCat(idx);e.dataTransfer.effectAllowed='move';}}
            onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';setDragOverCat(idx);}}
            onDragLeave={()=>setDragOverCat(null)}
            onDrop={e=>{e.preventDefault();if(dragCat!==null&&dragCat!==idx){setCategories(prev=>{const a=[...prev];const[item]=a.splice(dragCat,1);a.splice(idx,0,item);return a;});}setDragCat(null);setDragOverCat(null);}}
            onDragEnd={()=>{setDragCat(null);setDragOverCat(null);}}
            onClick={()=>setActiveCat(cat.id)} onContextMenu={e=>{e.preventDefault();setCatModal({mode:'edit',cat});}}
            style={{padding:"6px 16px",borderRadius:20,border:activeCat===cat.id?"1px solid var(--ac)":dragOverCat===idx?"1px solid var(--ac)":"1px solid var(--bd)",background:activeCat===cat.id?"rgba(212,165,116,.12)":dragOverCat===idx?"rgba(212,165,116,.06)":"transparent",color:activeCat===cat.id?"var(--ac)":"var(--t2)",fontSize:12,fontWeight:600,cursor:dragCat!==null?"grabbing":"grab",fontFamily:"inherit",transition:"all .15s",opacity:dragCat===idx?.5:1,transform:dragOverCat===idx&&dragCat!==idx?"scale(1.08)":"none"}}>
            {cat.name}
          </button>
        ))}
        <button onClick={()=>setCatModal({mode:'add',cat:{id:'',name:''}})} style={{padding:"6px 12px",borderRadius:20,border:"1px dashed rgba(212,165,116,.3)",background:"transparent",color:"var(--ac)",fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}} title="新增分类">
          {Icons.plus} 分类
        </button>
        <div style={{flex:1}}/>
        <button onClick={()=>setEditModal({mode:'add',card:{title:'',prompt:'',categoryId:activeCat!=='all'?activeCat:categories[0]?.id||'other',coverImg:null}})} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"var(--ac)",color:"var(--bg0)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
          {Icons.plus} 新增提示词
        </button>
      </div>

      {renderByCategory()}
      <CardModal/>
      <CatModal/>
    </div>
  );
}

// ─── 管理员面板 ──────────────────────────────────────────
function AdminPage(){
  const[users,setUsers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[newUser,setNewUser]=useState({username:'',password:'',role:'user',credits:100});
  const[recharge,setRecharge]=useState({userId:'',amount:100});
  const[msg,setMsg]=useState(null);
  // 编辑用户状态：{id, username, password}
  const[editUser,setEditUser]=useState(null);

  const loadUsers=async()=>{
    try{
      const res=await api.admin.listUsers();
      const data=await res.json();
      setUsers(data.users||[]);
    }catch{}
    finally{setLoading(false);}
  };
  useEffect(()=>{loadUsers();},[]);

  const createUser=async e=>{
    e.preventDefault();setMsg(null);
    try{
      const res=await api.admin.createUser(newUser);
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
      const res=await api.admin.recharge(recharge.userId, recharge.amount);
      const data=await res.json();
      if(!res.ok)throw new Error(data.error);
      setMsg({type:'ok',text:`已为 ${data.user.username} 充值，当前积分 ${data.user.credits}`});
      loadUsers();
    }catch(e){setMsg({type:'err',text:e.message});}
  };

  const deleteUser=async id=>{
    if(!confirm('确定删除此用户？'))return;
    try{
      const res=await api.admin.deleteUser(id);
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
      const res=await api.admin.updateUser(body);
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
  const[page,_setPage]=useState(()=>sessionStorage.getItem('pm_page')||PAGES.HOME);
  const setPage=v=>{sessionStorage.setItem('pm_page',v);_setPage(v);};
  const[col,setCol]=useState(false);
  const[tab,_setTab]=useState(()=>sessionStorage.getItem('pm_tab')||"generate");
  const setTab=v=>{sessionStorage.setItem('pm_tab',v);_setTab(v);};

  // ── Auth 状态 ──
  const[token,setToken]=useState(()=>localStorage.getItem('token'));
  const[currentUser,setCurrentUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(!!localStorage.getItem('token'));

  const logout=()=>{
    setToken(null);setCurrentUser(null);localStorage.removeItem('token');
  };

  // 同步 token 到 api 模块
  useEffect(()=>{
    api.setToken(token);
    api.setOnUnauthorized(logout);
  },[token]);

  const handleLogin=(newToken,user)=>{
    localStorage.setItem('token',newToken);
    setToken(newToken);setCurrentUser(user);
    setPage(PAGES.HOME);
  };

  // 启动时用 token 获取用户信息
  useEffect(()=>{
    if(!token){setAuthLoading(false);return;}
    api.auth.me()
      .then(r=>{if(!r.ok)throw new Error();return r.json();})
      .then(data=>setCurrentUser(data.user))
      .catch(()=>{logout();})
      .finally(()=>setAuthLoading(false));
  },[token]);

  // 登录后检查是否需要配置 API Key
  const[showKeyPrompt,setShowKeyPrompt]=useState(false);
  useEffect(()=>{
    if(!token)return;
    api.apiKey.get().then(r=>r.json()).then(d=>{
      if(d.needKey)setShowKeyPrompt(true);
    }).catch(()=>{});
  },[token]);

  // 刷新积分
  const refreshCredits=()=>{
    if(!token)return;
    api.auth.me()
      .then(r=>r.ok?r.json():null)
      .then(data=>{if(data?.user)setCurrentUser(prev=>({...prev,credits:data.user.credits}));})
      .catch(()=>{});
  };

  // ── 共享图片状态 ──
  const[images,setImages]=useState([]);
  const[loadingImages,setLoadingImages]=useState(true);

  useEffect(()=>{
    if(!token)return;
    api.images.list()
      .then(r=>r.json())
      .then(data=>{setImages(Array.isArray(data)?data:[]);})
      .catch(()=>{})
      .finally(()=>setLoadingImages(false));
  },[token]);

  const addImages=newImgs=>{
    setImages(prev=>[...newImgs,...prev]);
    api.images.save(newImgs).catch(()=>{});
    // 刷新积分
    setTimeout(refreshCredits,500);
  };

  const toggleFav=id=>{
    setImages(prev=>prev.map(i=>{
      if(i.id!==id)return i;
      const next={...i,fav:!i.fav};
      api.images.update(id, {fav:next.fav}).catch(()=>{});
      return next;
    }));
  };

  const deleteImage=id=>{
    setImages(prev=>prev.filter(i=>i.id!==id));
    api.images.remove(id).catch(()=>{});
  };

  // ── 跨页面参考图注入 ──
  const[pendingRefImage,setPendingRefImage]=useState(null); // {url, target:'generate'|'video'}
  const useImageAsRef=(image)=>{
    setPendingRefImage({url:image.imageUrl,prompt:image.prompt||'',target:'generate'});
    setPage(PAGES.HOME);setTab('generate');
  };
  const sendPromptToGen=(prompt)=>{
    setPendingRefImage({url:null,prompt,target:'generate',promptOnly:true});
    setPage(PAGES.HOME);setTab('generate');
  };
  const useImageAsVideoRef=(image)=>{
    setPendingRefImage({url:image.imageUrl,target:'video'});
    setPage(PAGES.HOME);setTab('video');
  };

  // 显示加载或登录页
  if(authLoading)return(<div style={{minHeight:"100vh",background:"var(--bg0)",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{CSS}</style><span style={{width:24,height:24,border:"3px solid var(--bd)",borderTopColor:"var(--ac)",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/></div>);
  if(!token)return <LoginPage onLogin={handleLogin}/>;

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg0)"}}>
      <style>{CSS}</style>
      <Sidebar page={page} setPage={setPage} col={col} setCol={setCol} tab={tab} setTab={setTab} currentUser={currentUser}/>
      <main style={{flex:1,marginLeft:col?56:"var(--sw)",transition:"margin-left .25s ease",minHeight:"100vh"}}>
        <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(17,17,19,.9)",backdropFilter:"blur(12px)",borderBottom:"1px solid var(--bd)",padding:"0 28px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"var(--t3)",fontWeight:500}}>{page===PAGES.HOME&&"首页"}{page===PAGES.LIBRARY&&"我的作品"}{page===PAGES.FAVORITES&&"收藏"}{page===PAGES.AI_PROMPT&&"AI 对话"}{page===PAGES.PROMPT_LIB&&"提示词模板"}{page===PAGES.ADMIN&&"管理面板"}</span>
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
        {/* AiPromptPage 常驻，避免切换时丢失对话状态 */}
        <div style={{display:page===PAGES.AI_PROMPT?'flex':'none',flexDirection:'column'}}><AiPromptPage sendPromptToGen={sendPromptToGen}/></div>
        <div style={{display:page===PAGES.AI_PROMPT?'none':'block',padding:"24px 28px 48px"}}>
          {/* HomePage 常驻，切换时隐藏而非卸载，保留生图进度/参考图等状态 */}
          <div style={{display:page===PAGES.HOME?'block':'none'}}><HomePage tab={tab} setTab={setTab} images={images} addImages={addImages} loadingImages={loadingImages} toggleFav={toggleFav} deleteImage={deleteImage} currentUser={currentUser} refreshCredits={refreshCredits} pendingRefImage={pendingRefImage} clearPendingRef={()=>setPendingRefImage(null)} useImageAsRef={useImageAsRef} useImageAsVideoRef={useImageAsVideoRef}/></div>
          {page===PAGES.LIBRARY&&<LibraryPage images={images} toggleFav={toggleFav} deleteImage={deleteImage} useImageAsRef={useImageAsRef} useImageAsVideoRef={useImageAsVideoRef}/>}
          {page===PAGES.FAVORITES&&<LibraryPage favorites images={images} toggleFav={toggleFav} deleteImage={deleteImage} useImageAsRef={useImageAsRef} useImageAsVideoRef={useImageAsVideoRef}/>}
          {page===PAGES.PROMPT_LIB&&<PromptLibPage sendPromptToGen={sendPromptToGen}/>}
          {page===PAGES.ADMIN&&currentUser?.role==='admin'&&<AdminPage/>}
        </div>
      </main>
      {showKeyPrompt&&<ApiKeyModal onClose={()=>setShowKeyPrompt(false)}/>}
    </div>
  );
}
