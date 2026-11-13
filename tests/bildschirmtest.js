// Bildschirmtest für SoMi (übernommen aus Pfad, 0.5.11): öffnet die Beta mit der fiktiven Beispielklasse auf iPhone- und iPad-Größen,
// macht von jeder wichtigen Ansicht ein Bildschirmfoto und prüft automatisch:
//   - nichts ragt seitlich aus dem Bildschirm (kein Wischen nach links/rechts nötig)
//   - Schrift in Eingabefeldern mind. 16 px (sonst zoomt iOS beim Antippen hinein)
//   - Tippziele mind. 40 px (Knöpfe, Auswahllisten, Schalter)
//   - Text in Knöpfen wird nicht abgeschnitten
//   - Erfassen-Seiten passen ohne Scrollen (auch bei Schriftgröße „Sehr groß“)
// Aufruf im Repo-Ordner: node tests/bildschirmtest.js   (nach dem Beta-Bau, braucht Playwright mit Chromium)
// Ergebnis: Bilder und Übersicht (uebersicht.html) in tests/bilder/ (nicht im Repo).
// Ohne Fehler endet der Test mit „Bildschirmtest bestanden.“ Hinweise (z. B. kleine Tippziele) stoppen ihn nicht,
// mit --streng aber schon. Nur fiktive Daten verwenden (Beispielklasse DEMO).
const {chromium}=require("playwright"),http=require("http"),fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,".."),out=path.join(__dirname,"bilder"),streng=process.argv.includes("--streng");
const TYPES={".html":"text/html",".js":"text/javascript",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith(path.sep))f+="index.html";
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{"Content-Type":TYPES[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(r)}).listen(8770);
const URL="http://localhost:8770/beta/";

const GERAETE=[
  {name:"iphone-se",titel:"iPhone SE als App",w:375,h:548,mobil:true},
  {name:"iphone",titel:"iPhone 13 als App",w:390,h:664,mobil:true},
  {name:"iphone-dunkel",titel:"iPhone 13, dunkel",w:390,h:664,mobil:true,dunkel:true},
  {name:"iphone-max",titel:"iPhone Max als App",w:430,h:740,mobil:true},
  {name:"iphone-se-gross",titel:"iPhone SE, Schrift sehr groß",w:375,h:548,mobil:true,fs:"xl"},
  {name:"ipad",titel:"iPad hochkant",w:820,h:1180,mobil:true},
  {name:"ipad-quer",titel:"iPad quer",w:1180,h:820,mobil:true},
];
// Ansichten: Name, Titel, Vorbereitung im Browser. „voll“ = ganze Seite fotografieren, „erf“ = muss ohne Scrollen passen.
const GM='db.groups.find(g=>g.demo&&g.fach==="Mathe")',GS='db.groups.find(g=>g.demo&&g.fach==="Sport")';
const ANSICHTEN=[
  {name:"heute",titel:"Heute",js:`go({tab:"heute"})`,voll:true},
  {name:"gruppen",titel:"Lerngruppen",js:`go({tab:"gruppen"})`,voll:true},
  {name:"gruppe",titel:"Lerngruppe Mathe",js:`go({tab:"gruppen",group:${GM}.id})`,voll:true},
  {name:"runde",titel:"Runde Mathe",js:`ER=erNeu(${GM}.id,"k");go({tab:"heute",group:${GM}.id,erf:${GM}.id})`,erf:true},
  {name:"runde-le",titel:"Runde LE-Ziele",js:`ER={...erNeu(${GM}.id,"k"),i:4};go({tab:"heute",group:${GM}.id,erf:${GM}.id})`,erf:true},
  {name:"einzeln",titel:"Einzeln bewerten",js:`ER=erNeu(${GM}.id,"e");go({tab:"heute",group:${GM}.id,erf:${GM}.id})`,erf:true},
  {name:"sport-runde",titel:"Runde Sport",js:`ER=erNeu(${GS}.id,"k");go({tab:"heute",group:${GS}.id,erf:${GS}.id})`,erf:true},
  {name:"status",titel:"Stundenstatus",js:`ER=erNeu(${GS}.id,"s");go({tab:"heute",group:${GS}.id,erf:${GS}.id})`,erf:true},
  {name:"punkte",titel:"Punkte eintragen",js:`{const a=db.ka.find(a=>a.demo&&!a.k);KE={kid:a.id,i:2,rg:0};go({tab:"gruppen",group:a.gid,ka:a.gid,kad:a.id,kae:true})}`,erf:true},
  {name:"noten",titel:"Noten eintragen",js:`{const a=db.ka.find(a=>a.demo&&a.k==="praes");KE={kid:a.id,i:0,rg:0};go({tab:"gruppen",group:a.gid,ka:a.gid,plm:true,kad:a.id,kae:true})}`,erf:true},
  {name:"uebersicht",titel:"Übersicht",js:`SHOW=true;go({tab:"gruppen",group:${GM}.id,ov:${GM}.id})`,voll:true},
  {name:"kuerzel",titel:"Kürzel",js:`go({tab:"gruppen",group:${GM}.id,sus:${GM}.members[0]})`,voll:true},
  {name:"einstellungen",titel:"Einstellungen",js:`go({tab:"profil"})`,voll:true},
  {name:"noten-berechnen",titel:"Noten berechnen",js:`go({tab:"profil",sub:"noten"})`,voll:true},
  {name:"sperre-daten",titel:"Sperre und Daten",js:`go({tab:"profil",sub:"sich"})`,voll:true},
];

// Läuft im Browser: sucht Probleme in der aktuellen Ansicht.
function pruefen(){
  const sicht=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0};
  const name=e=>e.closest("svg")?"Punkt im Diagramm":e.matches("input.sw")?"Schalter "+(e.closest(".row,label,div")?.innerText||"").trim().slice(0,30):(e.getAttribute("aria-label")||e.innerText||e.value||e.title||e.getAttribute("class")||e.tagName).toString().trim().replace(/\s+/g," ").slice(0,40);
  const fehler=[],hinweise=[],W=document.documentElement.clientWidth;
  if(document.documentElement.scrollWidth>W+1)fehler.push(`Seite ist ${document.documentElement.scrollWidth-W} px zu breit (seitliches Wischen nötig)`);
  for(const e of document.querySelectorAll("body *")){
    if(!sicht(e))continue;const r=e.getBoundingClientRect();
    if(r.right>W+1&&!e.closest("[style*='overflow'],.scroll,table")&&getComputedStyle(e).position!=="fixed"){
      // abgeschnitten mit „…“ (overflow hidden) ist gewollt, kein Überlaufen
      let cl=false;for(let q=e.parentElement;q&&q!==document.body;q=q.parentElement){const st=getComputedStyle(q);if(st.overflowX==="hidden"&&q.getBoundingClientRect().right<=W+1){cl=true;break}}if(cl)continue;
      const p=e.parentElement;if(!p||p.getBoundingClientRect().right<=W+1)fehler.push(`ragt rechts ${Math.round(r.right-W)} px heraus: ${e.tagName.toLowerCase()} „${name(e)}“`)}}
  for(const e of document.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]),select,textarea")){
    if(!sicht(e))continue;const f=parseFloat(getComputedStyle(e).fontSize);
    if(f<16)fehler.push(`Schrift im Feld nur ${f} px (iOS zoomt): „${name(e)}“`)}
  for(const e of document.querySelectorAll("button,select,a[href],[onclick],input[type=checkbox],input[type=radio],label.sw")){
    if(!sicht(e)||e.closest("p,li")&&e.tagName==="A")continue;
    if(e.parentElement&&e.parentElement.closest("button,[onclick]"))continue;
    const r=e.getBoundingClientRect(),z=e.matches("input")&&e.closest("label,.row")||e,rz=z.getBoundingClientRect();
    const hoch=Math.max(r.height,rz.height),breit=Math.max(r.width,rz.width);
    if(hoch<39.5||breit<39.5)hinweise.push(`Tippziel ${Math.round(breit)}×${Math.round(hoch)} px: ${e.tagName.toLowerCase()} „${name(e)}“`)}
  for(const e of document.querySelectorAll("button")){
    if(!sicht(e))continue;const s=getComputedStyle(e);
    if(e.scrollWidth>e.clientWidth+1&&s.overflowX!=="visible")fehler.push(`Text im Knopf abgeschnitten: „${name(e)}“`)}
  if(document.body.classList.contains("erf")&&document.documentElement.scrollHeight>innerHeight+1)fehler.push(`Erfassen-Seite ist ${document.documentElement.scrollHeight-innerHeight} px zu hoch (Scrollen nötig)`);
  const uniq=a=>[...new Set(a)];return {fehler:uniq(fehler),hinweise:uniq(hinweise)};
}

(async()=>{fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch(),bericht=[];let fehlerZahl=0,hinweisZahl=0;
  for(const g of GERAETE){
    const ctx=await b.newContext({viewport:{width:g.w,height:g.h},isMobile:g.mobil,hasTouch:g.mobil,deviceScaleFactor:1,colorScheme:g.dunkel?"dark":"light"});
    // Jede Ansicht auf einer frischen Seite: Ein Ganzseiten-Foto schaltet in Chromium die Touch-Nachbildung ab,
    // danach würden die Touch-Regeln der App (Tippziele 40 px) nicht mehr greifen.
    const konsole=[];
    {const p=await ctx.newPage();await p.goto(URL);await p.close()}
    for(const a of ANSICHTEN){
      const p=await ctx.newPage();p.on("pageerror",e=>konsole.push(e.message));await p.goto(URL);
      await p.waitForSelector("h1");
      await p.evaluate(fs=>{if(!db.groups.some(g=>g.demo)){db.setupDone=1;db.lastBackup=Date.now();demo()}sessionStorage.setItem("hideEnv",1);document.querySelectorAll(".toast").forEach(t=>t.remove());db.fs=fs||"m";applyTheme()},g.fs||null);
      if(a.js)await p.evaluate(a.js);
      await p.waitForTimeout(250);
      if(g.mobil&&!await p.evaluate(()=>matchMedia("(pointer:coarse)").matches))throw new Error("Touch-Nachbildung fehlt, Prüfung wäre falsch");
      const r=await p.evaluate(pruefen),datei=`${g.name}-${a.name}.png`;
      await p.screenshot({path:path.join(out,datei),fullPage:!!a.voll});
      fehlerZahl+=r.fehler.length;hinweisZahl+=r.hinweise.length;
      bericht.push({g,a,datei,...r});
      const zeile=`${g.titel} · ${a.titel}`;
      if(r.fehler.length)console.log(`✗ ${zeile}\n`+r.fehler.map(f=>"    "+f).join("\n"));else console.log(`✓ ${zeile}`);
      if(r.hinweise.length)console.log(r.hinweise.map(f=>"    Hinweis: "+f).join("\n"));
      await p.close();
    }
    if(konsole.length){fehlerZahl+=konsole.length;console.log(`✗ ${g.titel}: Fehler in der Konsole: ${konsole.join(" | ")}`)}
    await ctx.close()}
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SoMi Bildschirmtest</title>
<style>body{font:15px system-ui,sans-serif;margin:16px;background:#f5f6f1;color:#1f2622}h2{margin-top:28px}.reihe{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
figure{margin:0;flex:0 0 auto;width:220px}img{width:100%;border:1px solid #d9cbbb;border-radius:8px;background:#fff}figcaption{font-weight:600;margin:4px 0}
ul{margin:4px 0;padding-left:18px;font-size:13px}.f{color:#b03a2e}.h{color:#8a6200}</style>
<h1>SoMi Bildschirmtest</h1><p>${fehlerZahl} Fehler, ${hinweisZahl} Hinweise. Fiktive Beispielklasse.</p>
${GERAETE.map(g=>`<h2>${esc(g.titel)} (${g.w}×${g.h})</h2><div class="reihe">${bericht.filter(x=>x.g===g).map(x=>`<figure><figcaption>${esc(x.a.titel)}</figcaption><a href="${x.datei}"><img src="${x.datei}" alt="${esc(x.a.titel)}"></a>
<ul>${x.fehler.map(f=>`<li class="f">${esc(f)}</li>`).join("")}${x.hinweise.map(f=>`<li class="h">${esc(f)}</li>`).join("")}</ul></figure>`).join("")}</div>`).join("")}`;
  fs.writeFileSync(path.join(out,"uebersicht.html"),html);
  await b.close();srv.close();
  console.log(`\n${fehlerZahl} Fehler, ${hinweisZahl} Hinweise. Bilder und Übersicht: ${path.relative(root,out)}/uebersicht.html`);
  if(fehlerZahl||(streng&&hinweisZahl))process.exit(1);console.log("Bildschirmtest bestanden.")})().catch(e=>{console.error(e.message);srv.close();process.exit(1)});
