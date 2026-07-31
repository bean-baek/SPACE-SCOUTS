import { chromium } from "@playwright/test";
const br = await chromium.launch();
const p = await br.newPage();
await p.goto("http://localhost:5173/");
const r = await p.evaluate(async () => {
  const load=(s)=>new Promise((r2,j)=>{const i=new Image();i.onload=()=>r2(i);i.onerror=j;i.src=s;});
  const S=12;
  const grab=async(src,W,H)=>{const img=await load(src);const c=document.createElement("canvas");
    c.width=W*S;c.height=H*S;const x=c.getContext("2d");x.drawImage(img,0,0,c.width,c.height);
    return {d:x.getImageData(0,0,c.width,c.height).data,w:c.width,h:c.height};};
  const bbox=({d,w,h},pred)=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,n=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<40)continue;
      if(pred(d[i],d[i+1],d[i+2])){n++;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}
    return n?{x:x0/S,y:y0/S,w:(x1-x0)/S,h:(y1-y0)/S}:null;};
  const isOutline=(r,g,b)=>b>120&&r<110&&g<110;

  const ref = await grab("/_ref_ufo.svg", 57, 50);          // 원본, 자기 비율
  const refOut = bbox(ref, isOutline);
  const refFill = bbox(ref, (r,g,b)=>!isOutline(r,g,b));

  const lines = await grab("/images/community/ufo_lines.svg", 181, 147);
  const linesOut = bbox(lines, ()=>true);

  // 채움 SVG 3개 path의 합집합 bbox (49x35 좌표계)
  const ns="http://www.w3.org/2000/svg";
  const svg=document.createElementNS(ns,"svg");
  svg.setAttribute("viewBox","0 0 49 35");
  const ds=[window.__M,window.__T,window.__B];
  ds.forEach(d=>{const q=document.createElementNS(ns,"path");q.setAttribute("d",d);svg.appendChild(q);});
  document.body.appendChild(svg);
  let fx0=1e9,fy0=1e9,fx1=-1e9,fy1=-1e9;
  [...svg.querySelectorAll("path")].forEach(q=>{const b=q.getBBox();
    fx0=Math.min(fx0,b.x);fy0=Math.min(fy0,b.y);fx1=Math.max(fx1,b.x+b.width);fy1=Math.max(fy1,b.y+b.height);});
  const fillBox={x:fx0,y:fy0,w:fx1-fx0,h:fy1-fy0};
  return {refOut,refFill,linesOut,fillBox};
}, );
console.log("원본 외곽선 bbox :", JSON.stringify(r.refOut));
console.log("원본 색상 bbox   :", JSON.stringify(r.refFill));
console.log("lines 외곽선 bbox:", JSON.stringify(r.linesOut));
console.log("채움 path bbox   :", JSON.stringify(r.fillBox));
// 상대 위치 계산
const rel={ x:(r.refFill.x-r.refOut.x)/r.refOut.w, y:(r.refFill.y-r.refOut.y)/r.refOut.h,
            w:r.refFill.w/r.refOut.w, h:r.refFill.h/r.refOut.h };
console.log("색상영역/외곽선 상대비:", JSON.stringify(Object.fromEntries(Object.entries(rel).map(([k,v])=>[k,+v.toFixed(4)]))));
const target={ x:r.linesOut.x+rel.x*r.linesOut.w, y:r.linesOut.y+rel.y*r.linesOut.h,
               w:rel.w*r.linesOut.w, h:rel.h*r.linesOut.h };
console.log("lines 좌표계 목표 :", JSON.stringify(Object.fromEntries(Object.entries(target).map(([k,v])=>[k,+v.toFixed(2)]))));
const s = target.w / r.fillBox.w, sy = target.h / r.fillBox.h;
console.log(`배율 x=${s.toFixed(4)}  y=${sy.toFixed(4)}  (평균 ${((s+sy)/2).toFixed(4)})`);
const S=(s+sy)/2;
console.log(`translate(${(target.x - r.fillBox.x*S).toFixed(2)} ${(target.y - r.fillBox.y*S).toFixed(2)}) scale(${S.toFixed(4)})`);
await br.close();
