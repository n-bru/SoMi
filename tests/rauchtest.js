// Rauchtest für SoMi: startet einen lokalen Server, spielt Einrichtung, Lerngruppen, Sicherung und Sperre durch.
// Aufruf im Repo-Ordner: node tests/rauchtest.js   (braucht Playwright mit Chromium)
const {chromium}=require("playwright"),http=require("http"),fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,"..");
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";
  if(!f.startsWith(root)||!fs.existsSync(f)){r.writeHead(404);return r.end()}
  r.writeHead(200,{"Content-Type":{".html":"text/html",".js":"text/javascript",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png"}[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(r)}).listen(8765);
const ok=(c,m)=>{if(!c)throw new Error("FEHLER: "+m);console.log("✓ "+m)};
(async()=>{const b=await chromium.launch(),ctx=await b.newContext({acceptDownloads:true}),p=await ctx.newPage(),errs=[];
  p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
  const dlgBtn=async t=>{await p.locator(".cele button",{hasText:t}).last().click()};
  // Beim Erfassen ist die Menüleiste ausgeblendet (ab 0.4.5): erst zurück, dann Menü
  const nav=async x=>{while(await p.evaluate(()=>document.body.classList.contains("erf")))await p.click(".erhd button[aria-label='Zurück']");await p.click("nav >> text="+x)};
  const dlgIn=async v=>{await p.fill("#dlgIn",v);await p.press("#dlgIn","Enter")};
  await p.goto("http://localhost:8765/beta/");
  ok(await p.locator("h1",{hasText:"Heute"}).count()===1,"Startseite Heute");
  ok(await p.locator("text=Einrichtung: noch 3 von 3").count()===1,"Einrichtung mit 3 Schritten");
  // 1. App-Sperre
  await p.click("button:has-text('Code für die App-Sperre festlegen')");
  await p.locator('input.sw').first().check();
  await dlgIn("2468");await dlgIn("2468");
  await p.waitForSelector("text=SoMi ist jetzt gesperrt und verschlüsselt");
  const raw=await p.evaluate(()=>localStorage.getItem("somi-beta"));
  ok(raw.includes('"somiEnc":1')&&!raw.includes("groups"),"Speicher verschlüsselt");
  // 2. Beispielklasse
  await p.click("button:has-text('Fiktive Beispielklasse laden')");
  ok(await p.locator("text=Tippe auf „Sicherung speichern“").count()===1,"Einrichtung führt weiter zur Sicherung");
  await nav("Lerngruppen");ok(await p.locator("text=DEMO Mathe").count()>0,"Beispielklasse geladen");
  // eigene Lerngruppe
  await p.click("text=+ Lerngruppe");await p.fill("#gcls","7b");await p.click("button:has-text('E-Kurs')");await p.click("button:has-text('Anlegen')");
  ok(await p.locator("h1",{hasText:"7B Mathe E"}).count()===1,"Lerngruppe 7B Mathe E angelegt");
  await p.click("text=+ Schüler:in");ok(await p.inputValue("#scode")==="7B-01","Kürzel-Vorschlag 7B-01");
  await p.click("button:has-text('Hinzufügen')");await p.click("button:has-text('Hinzufügen')");
  await p.fill("#scode","Max Muster");await p.click("button:has-text('Hinzufügen')");
  ok(await p.locator(".toast",{hasText:"keinen Namen"}).count()===1,"Namen werden abgelehnt");
  await p.click("button:has-text('Abbrechen')");
  ok(await p.locator(".card.tap .code").count()===2,"zwei Kürzel in der Gruppe");
  await p.locator(".card.tap",{hasText:"7B-02"}).click();
  await p.click("button:has-text('Nachteilsausgleich')");await p.fill("#na","Mehr Zeit");await p.locator("#na").blur();
  ok(await p.locator(".pick .on",{hasText:"Nachteilsausgleich"}).count()===1,"Profil gesetzt");
  await p.click("text=‹ Zurück");
  // Archivieren
  await p.click("text=Lerngruppe archivieren");await dlgBtn("Archivieren");
  ok(await p.locator("text=Archiviert am").count()===1,"archiviert");
  await p.locator("text=Wieder aktivieren").click();
  // 3. Sicherung
  await nav("Einstellungen");
  await p.click("button:has-text('Sicherung speichern')");
  await dlgIn("geheim123");await dlgIn("geheim123");await dlgBtn("Merken");
  const [dl]=await Promise.all([p.waitForEvent("download"),dlgBtn("Verstanden")]);
  const file=path.join(require("os").tmpdir(),"somi-test.json");await dl.saveAs(file);
  const sic=JSON.parse(fs.readFileSync(file,"utf8"));ok(sic.somi===1&&sic.ct&&!JSON.stringify(sic).includes("7B-01"),"Sicherung verschlüsselt, ohne Klartext");
  ok(await p.locator("text=Einrichtung: noch").count()===0,"Einrichtung fertig");
  // Gruppe löschen (vor Fristende, doppelte Rückfrage) und aus Sicherung wiederherstellen
  await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"7B Mathe E"}).click();
  await p.click("text=Lerngruppe archivieren");await dlgBtn("Archivieren");
  await p.click("button:text-is('Löschen')");await dlgBtn("Endgültig löschen");await dlgBtn("Ja, löschen");
  ok(await p.locator(".card.tap",{hasText:"7B Mathe E"}).count()===0,"Gruppe gelöscht");
  // Laden: Löschung bleibt (neuere Löschung gilt), also in frischem Kontext laden
  const c2=await b.newContext(),p2=await c2.newPage();p2.on("pageerror",e=>errs.push(e.message));
  await p2.goto("http://localhost:8765/beta/");await p2.click("nav >> text=Einstellungen");
  await p2.setInputFiles("#imp",file);await p2.fill("#dlgIn","falsch123");await p2.press("#dlgIn","Enter");
  await p2.waitForSelector(".toast:has-text('Passwort falsch')");await p2.fill("#dlgIn","geheim123");await p2.press("#dlgIn","Enter");
  await p2.click("button:has-text('Übernehmen')");
  ok(await p2.locator(".card.tap",{hasText:"7B Mathe E"}).count()===1,"Sicherung auf neuem Gerät geladen");
  ok(await p2.locator("text=DEMO").count()===0,"Beispielklasse nicht in der Sicherung");
  ok(await p2.evaluate(()=>db.obs.every(o=>!o.demo)),"keine Beispiel-Einträge in der Sicherung");
  // Sperre nach Neuladen
  await p.reload();ok(await p.locator("#lock").count()===1,"Nach Neustart gesperrt");
  for(const d of "1111")await p.click(`#lock .keys button:text-is("${d}")`);
  await p.waitForSelector("#lock:has-text('Falscher Code')");
  for(const d of "2468")await p.click(`#lock .keys button:text-is("${d}")`);
  await p.waitForSelector("#lock",{state:"detached"});ok(true,"Entsperrt mit richtigem Code");
  ok(await p.locator("text=DEMO Mathe").count()>0,"Daten nach Entsperren da");
  // 0.2 Sonstige Mitarbeit: Erfassen, Sichtschutz, nur Rückmeldung, Übersicht
  await nav("Heute");ok(await p.locator(".hrow").count()===2&&/ohne Eintrag|alle mit Eintrag/.test(await p.locator(".hrow:has-text('DEMO Mathe') .nm").innerText())&&await p.locator(".stat").count()===0,"Heute: eine Zeile pro Gruppe mit Zusatzinfo, keine Zahlenkacheln");
  // 0.4.3 Ganze Klasse: feste Kriterien und Störungs-Knopf pro Kind auf einem Bildschirm
  await p.click(".hrow:has-text('DEMO Mathe') >> button:has-text('Runde')");ok(await p.locator("h1",{hasText:"Erfassen"}).count()===1,"Erfassen geöffnet");
  ok(await p.locator(".seqsus:has-text('DEMO-01')").count()===1&&await p.locator("text=Was hast du heute beobachtet?").count()===0,"Runde startet ohne Kriterienwahl");
  {const vp=p.viewportSize();for(const [w,h] of [[375,548],[390,664],[430,740]]){await p.setViewportSize({width:w,height:h});
  ok(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.querySelector("#erT").getBoundingClientRect().bottom<=innerHeight),`${w}×${h}: Runde passt ohne Scrollen, Stichwort sichtbar`)}
  await p.setViewportSize({width:390,height:664});
  ok(await p.evaluate(()=>{const s=document.querySelector(".stb").getBoundingClientRect(),w=document.querySelector(".padwrap").getBoundingClientRect();return s.bottom<=w.top+1&&w.bottom<=innerHeight&&scrollY===0&&!document.querySelector("nav").offsetParent}),"iPhone: alle Knöpfe der Runde ohne Scrollen, Menüleiste ausgeblendet");
  await p.setViewportSize(vp)}
  ok(await p.evaluate(()=>JSON.stringify(ER.ks)===JSON.stringify(["qual","kont","selbst","koop"])),"immer Qualität, Beteiligung, Selbstständigkeit, Kooperation");
  ok(await p.locator(".seqk:has-text('Präsentation')").count()===0&&await p.locator(".seqk:has-text('Werkzeuge')").count()===0,"Präsentation & Co. nicht in der Runde, Werkzeuge nur zugeschaltet");
  let s0=await p.evaluate(()=>db.obs.length),a0=await p.evaluate(()=>db.asv.length);
  await p.click(".pad button[data-k='qual'][data-s='2']");await p.click(".pad button[data-k='kont'][data-s='3']");
  ok(await p.locator(".seqsus:has-text('DEMO-01')").count()===1&&await p.locator(".pad button.cur").count()===2,"Tippen speichert, bleibt beim Kind");
  await p.click(".pad button[data-k='qual'][data-s='3']");ok(await p.evaluate(n=>db.obs.length===n+2&&db.obs.at(-1).s==="3"&&db.obs.at(-1).k==="qual",s0),"neue Stufe ersetzt die alte");
  await p.click(".pad button[data-k='kont'][data-s='3']");ok(await p.evaluate(n=>db.obs.length===n+1,s0),"nochmal tippen nimmt zurück");
  await p.click("button.stb");await p.fill("#dlgIn","");await p.press("#dlgIn","Enter");
  ok(await p.evaluate(n=>db.asv.length===n,a0)&&await p.locator("button.stb.cur").count()===0,"Störung ohne Notiz wird nicht gespeichert");
  await p.click("button.stb");await dlgIn("Fiktiv: Arbeitsblatt zerrissen");
  ok(await p.evaluate(n=>db.asv.length===n+1&&db.asv.at(-1).m==="stoer"&&db.asv.at(-1).t==="Fiktiv: Arbeitsblatt zerrissen",a0)&&await p.locator("button.stb.cur").count()===1,"Knopf massive Unterrichtsstörung mit Pflicht-Notiz");
  await p.click("button:has-text('Weiter ›')");ok(await p.locator(".seqsus:has-text('DEMO-02')").count()===1,"Weiter: nächstes Kind");
  await p.click("button:has-text('abwesend')");ok(await p.locator(".seqsus:has-text('DEMO-03')").count()===1,"nicht anwesend: ganzes Kürzel übersprungen");
  ok(await p.evaluate(([n,m])=>db.obs.length===n+1&&db.asv.length===m+1,[s0,a0]),"nur Getipptes gespeichert");
  await p.click(".three button:has-text('Zurück')");await p.click(".three button:has-text('Zurück')");
  ok(await p.locator(".pad button.cur[data-k='qual'][data-s='3']").count()===1&&await p.locator("button.stb.cur").count()===1,"Zurück zeigt die Auswahl");
  await p.evaluate(()=>{ER.i=99;render()});
  ok(await p.locator(".seqdone:has-text('1 bewertet')").count()===1,"Fertig-Anzeige");
  await p.evaluate(([n,m])=>{db.obs=db.obs.slice(0,n);db.asv=db.asv.slice(0,m);save()},[s0,a0]);
  await p.click(".pick button:has-text('Einzeln bewerten')");ok(await p.locator(".tile").count()>0,"Umschalten auf Einzeln");
  ok(await p.locator(".pad.st button[data-s='3']",{hasText:"erfüllt"}).count()===1&&await p.locator(".pad.st .nt").count()===4,"Stufenknöpfe mit Note darunter");
  if(process.env.SHOT2)await p.locator(".padwrap").first().screenshot({path:process.env.SHOT2});
  const n0=await p.evaluate(()=>db.obs.length);ok(n0>0,"Beispielklasse hat fiktive Einträge");
  await p.click(".pad button[data-s='3']");ok(await p.locator(".toast",{hasText:"Tippe zuerst"}).count()===1,"ohne Auswahl keine Note");
  await p.click(".chips button:has-text('Kooperation')");
  await p.click(".tile:has-text('DEMO-01')");await p.click(".tile:has-text('DEMO-02')");
  ok(await p.locator("text=2 ausgewählt").count()===1,"Mehrfachauswahl");
  await p.fill("#erT","Gruppenarbeit Station 3");await p.click(".pad button[data-s='3']");
  await p.waitForSelector(".toast:has-text('2 Einträge gespeichert')");
  ok(await p.locator(".toast",{hasText:": +"}).count()===0,"Sichtschutz: Stufe nicht im Hinweis");
  let o=await p.evaluate(()=>db.obs.slice(-2));ok(o.length===2&&o.every(x=>x.s==="3"&&!x.n&&x.k==="koop"&&x.t==="Gruppenarbeit Station 3"&&!x.fb),"zwei Einträge mit Kriterium, Note und Stichwort");
  ok(await p.locator(".tile.on").count()===0&&await p.locator(".tile:has-text('DEMO-01') .done").count()===1,"Auswahl zurückgesetzt, Haken für heute");
  ok(await p.locator("label.swr:has-text('Nur Rückmeldung')").count()===0,"kein Schalter „Nur Rückmeldung“ mehr (0.4.7)");
  await p.click(".tile:has-text('DEMO-03')");await p.click(".pad button[data-s='1']");
  o=await p.evaluate(()=>db.obs.at(-1));ok(o.fb===false&&o.s==="1","neuer Eintrag zählt immer");
  await p.evaluate(()=>{const x=db.obs.at(-1);x.fb=true;save()});// alter Eintrag als Rückmeldung bleibt gültig
  await p.click(".pad button[data-s='2']");// ohne Auswahl
  await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Mathe"}).click();await p.click("button:has-text('Übersicht Sonstige Mitarbeit')");ok(await p.locator("h1",{hasText:"Übersicht"}).count()===1,"Übersicht geöffnet");
  ok(await p.evaluate(()=>[...document.querySelectorAll(".tbl tbody tr")].every(tr=>{const c=tr.cells;return !/[+−o]|\d/.test(c[2].innerText)&&!/[+−]/.test(c[3].innerText)})),"Sichtschutz: keine Noten in der Übersicht");
  await p.click("button:has-text('Noten zeigen')");ok(await p.locator(".tbl tr:has-text('DEMO-01')").innerText().then(t=>t.includes("+")),"Noten zeigen");
  ok(await p.evaluate(()=>noteOf(2)==="2"&&noteOf(2.34)==="2-"&&noteOf(2.66)==="3+"&&noteOf(1)==="1"&&noteOf(5.9)==="6"&&mean([{s:"4"},{s:"3"}])===1.5),"Umrechnung Stufen in Note mit + und −");
  ok(await p.evaluate(()=>{const z=[{k:"qual",s:"3"},{k:"qual",s:"3"},{k:"qual",s:"3"},{k:"port",s:"1"}];db.kgw={qual:1};const a=noteMean(z)===3.5;db.kgw={qual:3};const b=noteMean(z)===2.75;const c=!okKgw({qual:4})&&!okKgw({xyz:2})&&okKgw({qual:2})&&okKgw({mot:5})&&!okKgw({mot:6});delete db.kgw;return a&&b&&c}),"Notenvorschlag: erst je Kriterium, dann gewichtet");
  ok(await p.evaluate(()=>!genug([{k:"qual"},{k:"qual"},{k:"qual"}])&&!genug([{k:"qual"},{k:"port"}])&&genug([{k:"qual"},{k:"qual"},{k:"port"}])),"Notenvorschlag erst ab 3 Beobachtungen in 2 Kriterien");
  ok(await p.evaluate(()=>okObs({id:"a",gid:"b",sid:"c",k:"qual",s:"3",d:"2026-01-01",upd:1})&&!okObs({id:"a",gid:"b",sid:"c",k:"qual",s:"5",d:"2026-01-01",upd:1})&&okObs({id:"a",gid:"b",sid:"c",k:"qual",n:"2+",d:"2026-01-01",upd:1})),"Prüfhelfer: Stufe neu, Note alt gültig");
  ok(await p.locator(".tbl tr:has-text('DEMO-03')").innerText().then(t=>/ \+[12]/.test(t)),"Rückmeldung zählt nicht mit");
  await p.click(".tbl tr:has-text('DEMO-01')");ok(await p.locator("text=Sonstige Mitarbeit in DEMO Mathe").count()===1,"Einträge auf der Kürzel-Seite");
  const c1=await p.locator(".obsl li").count();await p.locator(".obsl li").first().locator("button[aria-label='Eintrag löschen']").click();
  ok(await p.locator(".obsl li").count()===c1-1,"Eintrag gelöscht");await p.click(".toast button:has-text('Rückgängig')");
  ok(await p.locator(".obsl li").count()===c1,"Löschen rückgängig");
  await nav("Einstellungen");await p.locator("label.swr:has-text('Hausaufgaben') input").check();
  ok(await p.evaluate(()=>!db.kgw&&kgw("qual")===2&&kgw("kont")===1),"Qualität zählt standardmäßig doppelt");
  await p.locator('[aria-label="Gewicht Qualität der Beiträge"] button',{hasText:"1×"}).click();
  ok(await p.evaluate(()=>db.kgw&&db.kgw.qual===1),"Gewicht je Kriterium einstellbar");
  await p.locator('button',{hasText:"Gewichte zurücksetzen"}).click();
  ok(await p.evaluate(()=>!db.kgw),"Gewichte zurückgesetzt");
  await p.screenshot({path:process.env.SHOT||"/dev/null",fullPage:true}).catch(()=>{});
  await nav("Heute");await p.click(".hrow:has-text('DEMO Mathe') >> button:has-text('Runde')");
  ok(await p.locator(".pad button[data-k='hausa']").count()===4,"Kriterium Hausaufgaben zuschaltbar");
  ok(await p.evaluate(()=>!okObs({id:"a",gid:"b",sid:"c",k:"qual",n:"7",d:"2026-01-01"})&&!okObs({id:"a",gid:"b",sid:"c",k:"x",n:"2",d:"2026-01-01"})&&okObs({id:"a",gid:"b",sid:"c",k:"qual",n:"2+",d:"2026-01-01"})),"Prüfhelfer okObs");
  // Sport: Stundenstatus
  await nav("Heute");await p.click(".hrow:has-text('DEMO Sport') >> button:has-text('Status')");
  ok(await p.locator("h1",{hasText:"Stundenstatus"}).count()===1,"Sport: Stundenstatus geöffnet");
  const sa0=await p.evaluate(()=>db.asv.length);
  await p.click("button.stb");await dlgIn("Fiktiv: Ball weggeschossen");ok(await p.evaluate(n=>db.asv.length===n+1&&db.asv.at(-1).t==="Fiktiv: Ball weggeschossen"&&ER.i===0,sa0),"Sport: Störung im Stundenstatus, bleibt beim Kind");
  await p.click("button.stb");ok(await p.evaluate(n=>db.asv.length===n,sa0),"Sport: Störung zurückgenommen");
  // 0.5.6 Schulplaner: Tippen merkt „fehlt“, wird mit dem Status gespeichert, Tippen nimmt zurück
  await p.click("button.plb");ok(await p.evaluate(()=>ER.np[msOf(groupById(ER.gid))[0].id]===true&&ER.i===0)&&await p.locator("button.plb.cur").count()===1,"Sport: Schulplaner fehlt vorgemerkt");
  await p.click("button.plb");ok(await p.locator("button.plb.cur").count()===0,"Sport: Schulplaner zurückgenommen");await p.click("button.plb");
  {const vp=p.viewportSize();for(const [w,h] of [[375,548],[390,664],[430,740]]){await p.setViewportSize({width:w,height:h});
  ok(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&[...document.querySelectorAll(".seqc button")].every(b=>b.getBoundingClientRect().bottom<=innerHeight)),`${w}×${h}: Stundenstatus mit Schulplaner ohne Scrollen`)}
  await p.setViewportSize(vp)}
  await p.click(".stgrid button:has-text('aktiv')");await p.click(".stgrid button:has-text('ohne Sportsachen')");await p.click(".stgrid button:has-text('sportunfähig')");
  await p.click("button:has-text('Alle übrigen: aktiv')");ok(await p.locator(".seqdone:has-text('4 aktiv')").count()===1,"Sport: alle übrigen aktiv");
  ok(await p.evaluate(()=>db.att.length===6&&db.att.every(okAtt)),"Sport: 6 Status gespeichert");
  ok(await p.evaluate(()=>db.att.filter(a=>a.np).length===1&&db.att.find(a=>a.np).st==="akt"&&!Object.keys(ER.np).length),"Sport: ohne Schulplaner mit Status gespeichert");
  ok(await p.evaluate(()=>!okAtt({id:"a",gid:"b",sid:"c",st:"abw",np:true,d:"2026-01-01",upd:1})&&!okAtt({id:"a",gid:"b",sid:"c",st:"akt",np:"ja",d:"2026-01-01",upd:1})&&okAtt({id:"a",gid:"b",sid:"c",st:"akt",np:true,d:"2026-01-01",upd:1})),"Prüfhelfer okAtt mit Schulplaner");
  await p.click("button:has-text('Letzte ansehen')");await p.click(".stgrid button:has-text('nicht anwesend')");
  ok(await p.evaluate(()=>db.att.length===6&&db.att.filter(a=>a.st==="abw").length===1),"Sport: Status ersetzt, nicht doppelt");
  await p.click("button:has-text('Zur Übersicht')");ok(await p.locator(".tbl tr:has-text('DEMO-02') td").nth(1).innerText().then(t=>t==="1"),"Sport-Übersicht zählt ohne Sachen");
  ok(await p.locator(".tbl tr:has-text('DEMO-01') td").nth(4).innerText().then(t=>t==="1"),"Sport-Übersicht zählt ohne Schulplaner");
  ok(await p.evaluate(()=>!okAtt({id:"a",gid:"b",sid:"c",st:"x",d:"2026-01-01",upd:1})),"Prüfhelfer okAtt");
  // 0.4.6 Sport: Kriterien nach SILP Sport, Runde als Matrix, Fragezeichen zeigt Ankertexte
  await nav("Heute");await p.click(".hrow:has-text('DEMO Sport') >> button:has-text('Runde')");
  ok(await p.evaluate(()=>JSON.stringify(ER.ks)==='["mot","kog","soz","arb"]')&&await p.locator(".mxh").count()===1,"Sport-Runde: Motorik, Wissen, Sozial- und Arbeitsverhalten als Matrix");
  const so0=await p.evaluate(()=>db.obs.length);await p.click(".pad button[data-k='mot'][data-s='3']");
  ok(await p.evaluate(n=>db.obs.length===n+1&&db.obs.at(-1).k==="mot"&&groupById(db.obs.at(-1).gid).fach==="Sport",so0),"Sport: Motorik gespeichert");
  await p.click(".seqk:has-text('Motorik')");ok(await p.locator(".cele:has-text('Kondition')").count()===1,"Fragezeichen zeigt Hinweis und Ankertexte");await dlgBtn("Schließen");
  ok(await p.evaluate(()=>{const z=[{k:"mot",s:"4"},{k:"kog",s:"1"}];return Math.abs(noteMean(z)-(5*1+1*5)/6)<1e-9}),"Sport: Gewicht Motorik 5, Wissen 1");
  await p.click(".pick.sm button:has-text('Status')");ok(await p.locator("h1",{hasText:"Stundenstatus"}).count()===1,"Sport: Umschalten auf Stundenstatus");
  // 0.3 Klassenarbeiten: anlegen, Punkte eintragen, Notenschlüssel, Notenspiegel, Gesamtvorschlag
  await p.evaluate(()=>{SHOW=false});await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Mathe"}).click();
  await p.click("button:has-text('Klassenarbeiten')");ok(await p.locator("h1",{hasText:"Klassenarbeiten"}).count()===1&&await p.locator(".card.tap",{hasText:"KA 1 (fiktiv)"}).count()===1,"Klassenarbeiten mit fiktiver Beispielarbeit");
  await p.click("button:has-text('+ Klassenarbeit')");await p.fill("#kdt","KA 2 Test");await p.click("button:has-text('Anlegen')");
  ok(await p.locator(".toast",{hasText:"Höchstpunktzahl"}).count()===1,"ohne Höchstpunktzahl keine Klassenarbeit");
  await p.fill("#kdm","40");await p.click("button:has-text('Anlegen')");ok(await p.locator("h1",{hasText:"KA 2 Test"}).count()===1,"Klassenarbeit angelegt");
  ok(await p.evaluate(()=>JSON.stringify(kaGr("-",40))==="[34,28,22,16,8]"&&JSON.stringify(kaGr("E",40))==="[35,29,23.5,18,7]"),"Notenschlüssel SILP 4.3 ohne Kurs und E/G");
  ok(await p.evaluate(()=>kaNoteP("-",40,40)==="1+"&&kaNoteP("-",40,34)==="1-"&&kaNoteP("-",40,28)==="2-"&&kaNoteP("-",40,30)==="2"&&kaNoteP("-",40,33)==="2+"&&kaNoteP("-",40,26)==="3+"&&kaNoteP("-",40,7.5)==="6"&&kaNoteP("-",40,0)==="6"),"Punkte in Note mit + und −");
  ok(await p.locator(".seqsus:has-text('DEMO-01')").count()===1,"Eintragen beginnt bei DEMO-01");
  await p.fill("#kp","50");await p.press("#kp","Enter");ok(await p.locator(".toast",{hasText:"von 0 bis 40"}).count()===1,"zu viele Punkte abgelehnt");
  await p.fill("#kp","30,5");await p.press("#kp","Enter");ok(await p.locator(".seqsus:has-text('DEMO-02')").count()===1,"Enter speichert und springt weiter");
  ok(await p.evaluate(()=>document.activeElement?.id==="kp"),"Punktefeld behält den Fokus");
  await p.click("button:has-text('schreibt nach')");ok(await p.locator(".seqsus:has-text('DEMO-03')").count()===1,"schreibt nach: weiter");
  ok(await p.locator("label.swr:has-text('Nachteilsausgleich gewährt')").count()===1,"NA-Vermerk bei Profil Nachteilsausgleich");
  await p.locator("label.swr:has-text('Nachteilsausgleich gewährt') input").check();await p.fill("#knat","Fiktiv: mehr Zeit");await p.fill("#kp","20");await p.click("button:has-text('Speichern und weiter')");
  await p.fill("#kp","12");await p.press("#kp","Enter");
  ok(await p.locator("#kmx").count()===1,"eigene Höchstpunktzahl bei zieldifferent");await p.fill("#kmx","20");await p.locator("#kmx").blur();await p.fill("#kp","15");await p.press("#kp","Enter");
  const ka=await p.evaluate(()=>db.ka.find(a=>a.t==="KA 2 Test"));const ids=await p.evaluate(()=>groupById(db.ka.find(a=>a.t==="KA 2 Test").gid).members);
  ok(ka.r[ids[0]].p===30.5&&ka.r[ids[1]].st==="nach"&&ka.r[ids[2]].na===true&&ka.r[ids[2]].nat==="Fiktiv: mehr Zeit"&&ka.r[ids[4]].mx===20&&ka.r[ids[4]].p===15,"Punkte, Status, NA-Vermerk und eigene Höchstpunktzahl gespeichert");
  ok(await p.evaluate(()=>{const a=db.ka.find(a=>a.t==="KA 2 Test");return kaNote(a,groupById(a.gid).members[4])==="2"}),"zieldifferent: Note aus eigener Höchstpunktzahl");
  ok(await p.evaluate(()=>[...document.querySelectorAll(".spg b")].every(b=>b.innerText.includes("●"))&&[...document.querySelectorAll(".tbl tbody tr")].slice(0,5).every(tr=>!/\d/.test(tr.cells[2].innerText))),"Sichtschutz: Notenspiegel und Noten verborgen");
  await p.click("button:has-text('Noten zeigen')").catch(()=>{});
  ok(await p.locator(".tbl tr:has-text('DEMO-01')").first().innerText().then(t=>t.includes("30,5")&&/\b2\b/.test(t)),"Punkte und Note in der Tabelle");
  ok(await p.evaluate(()=>okKa({id:"a",gid:"b",t:"KA",d:"2026-01-01",max:40,sk:"-",r:{c:{p:12}},upd:1})&&!okKa({id:"a",gid:"b",t:"KA",d:"2026-01-01",max:40,sk:"-",r:{c:{p:41}},upd:1})&&!okKa({id:"a",gid:"b",t:"KA",d:"2026-01-01",max:40,sk:"X",r:{},upd:1})&&!okKa({id:"a",gid:"b",t:"",d:"2026-01-01",max:40,sk:"-",r:{},upd:1})&&okKa({id:"a",gid:"b",t:"KA",d:"2026-01-01",max:40,sk:"E",r:{c:{p:18,mx:20}},upd:1})),"Prüfhelfer okKa");
  ok(await p.evaluate(()=>Math.abs(gesamt(2,3)-2.6)<1e-9&&gesamt(null,3)===null),"Gesamtvorschlag 40/60");
  await p.click("text=‹ Zurück");await p.click("text=‹ Zurück");await p.click("button:has-text('Übersicht Sonstige Mitarbeit')");
  ok(await p.locator(".tbl thead th",{hasText:"Gesamt"}).count()===1&&await p.locator(".tbl thead th",{hasText:"KA"}).count()===1,"Übersicht mit Klassenarbeiten und Gesamt");
  await nav("Einstellungen");await p.locator("label.swr:has-text('Noten mit + und −') input").uncheck();
  ok(await p.evaluate(()=>kaNoteP("-",40,40)==="1"&&kaNoteP("-",40,26)==="3"),"Tendenz abschaltbar");await p.locator("label.swr:has-text('Noten mit + und −') input").check();
  await p.locator('[aria-label="Anteil schriftlich Mathe"] button',{hasText:"50 %"}).click();
  ok(await p.evaluate(()=>db.kaw.Mathe===50&&Math.abs(gesamt(2,3,"Mathe")-2.5)<1e-9&&!okKaw({Mathe:55})&&!okKaw({Kunst:50})),"Anteil schriftlich je Fach einstellbar");
  await p.locator('[aria-label="Anteil schriftlich Mathe"] button',{hasText:"60 %"}).click();ok(await p.evaluate(()=>!db.kaw),"Mathe zurück auf 60 %");
  await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Sport"}).click();await p.click("button:has-text('Schriftliche Überprüfungen')");
  await p.click("button:has-text('+ Schriftliche Überprüfung')");await p.fill("#kdt","Test Regeln");await p.fill("#kdm","20");await p.click("button:has-text('Anlegen')");
  await p.fill("#kp","18");await p.press("#kp","Enter");ok(await p.evaluate(()=>{const a=db.ka.find(a=>a.t==="Test Regeln");return a&&groupById(a.gid).fach==="Sport"&&Object.keys(a.r).length===1}),"Schriftliche Überprüfung in Sport");
  // 0.5.0 Punktuelle Überprüfungen in Sport mit Gruppen
  await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Sport"}).click();await p.click("button:has-text('Punktuelle Überprüfungen')");
  ok(await p.locator(".card.tap",{hasText:"Handstand (fiktiv)"}).count()===1,"fiktive Überprüfung Handstand");
  await p.click("button:has-text('+ Punktuelle Überprüfung')");await p.click(".pick button:text-is('Motorischer Test')");ok(await p.locator("#kdm").count()===0,"Überprüfung: keine Punkte");
  await p.fill("#kdt","Cooper-Test Probe");await p.click("button:has-text('Anlegen')");
  ok(await p.evaluate(()=>{const a=db.ka.find(a=>a.t==="Cooper-Test Probe");return a&&a.k==="pue"&&a.b==="mot"&&a.art==="Motorischer Test"&&a.rg&&Object.keys(a.rg).length===6&&okKa(a)}),"Überprüfung angelegt, Gruppen übernommen");
  await p.click(".rgbar button:has-text('Gr. 2')");ok(await p.locator(".card b",{hasText:"Gruppe 2: 1 von 3"}).count()===1,"nur Gruppe 2");
  {const vp=p.viewportSize();for(const [w,h] of [[375,548],[390,664],[430,740]]){await p.setViewportSize({width:w,height:h});
  ok(await p.evaluate(()=>{const b=[...document.querySelectorAll(".kan .four button,.kan .padn button")].map(x=>x.getBoundingClientRect());return document.documentElement.scrollHeight<=innerHeight&&b.every(r=>r.bottom<=innerHeight&&r.height>=30)}),`${w}×${h}: Noten eintragen passt ohne Scrollen`)}
  await p.setViewportSize(vp)}
  await p.click(".pad button[data-n='2']");
  ok(await p.evaluate(()=>{const a=db.ka.find(a=>a.t==="Cooper-Test Probe"),m=groupById(a.gid).members;return a.r[m[1]]?.n==="2"&&!a.r[m[0]]&&plObs(a.gid,m[1]).some(o=>o.k==="mot"&&o.n==="2")}),"Note in Gruppe 2 gespeichert, zählt bei Motorik");
  await p.click(".pad button[data-n='3']");await p.click(".pad button[data-n='4']");ok(await p.locator("button:has-text('Weiter mit Gruppe')").count()===0&&await p.locator("text=Gruppe 2 fertig").count()===1,"Gruppe 2 fertig");
  ok(await p.evaluate(()=>document.body.classList.contains("erf")),"Noten eintragen als Vollbild");
  await p.click(".erhd button[aria-label='Zurück']");await p.click(".rgbar button:has-text('Gr. 1')");await p.click("button:text-is('Einteilen')");
  await p.locator("[aria-label='Gruppe für DEMO-01'] button",{hasText:"3"}).click();
  ok(await p.evaluate(()=>{const a=db.ka.find(a=>a.t==="Cooper-Test Probe");return a.rg[groupById(a.gid).members[0]]===3}),"Gruppe umgeteilt");
  await p.locator("[aria-label='Gruppe für DEMO-01'] button",{hasText:"3"}).click();
  ok(await p.evaluate(()=>{const a=db.ka.find(a=>a.t==="Cooper-Test Probe");return a.rg[groupById(a.gid).members[0]]==null}),"nochmal tippen nimmt heraus");
  await p.locator(".card button:text-is('Fertig')").click();
  ok(await p.evaluate(()=>!okKa({id:"x1",gid:"g1",t:"x",d:"2026-11-05",k:"pue",r:{},upd:1})&&!okKa({id:"x1",gid:"g1",t:"x",d:"2026-11-05",k:"pue",b:"qual",r:{},upd:1})&&!okKa({id:"x1",gid:"g1",t:"x",d:"2026-11-05",k:"pue",b:"mot",rg:{s1:7},r:{},upd:1})&&!okKa({id:"x1",gid:"g1",t:"x",d:"2026-11-05",k:"port",b:"mot",r:{},upd:1})&&okKa({id:"x1",gid:"g1",t:"x",d:"2026-11-05",k:"pue",b:"kog",art:"Sonstiges",rg:{s1:2},r:{s1:{n:"2-"}},upd:1})),"okKa prüft punktuelle Überprüfungen");
  ok(await p.evaluate(()=>!kritGew("Sport").some(k=>k.k==="pue")&&!plk({fach:"Mathe"}).some(k=>k.k==="pue")),"Überprüfung ohne eigenes Gewicht, nicht in Mathe");
  // 0.4.3 Störungen und gesonderte Leistungen (Präsentation, Heft, Übung)
  await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Mathe"}).click();
  ok(await p.locator("button:has-text('Verhalten')").count()===0,"kein Arbeits- und Sozialverhalten mehr");
  ok(await p.evaluate(()=>!okAsv({id:"a1",gid:"g1",sid:"s1",m:"xx",v:"+",d:"2026-11-05"})&&!okAsv({id:"a1",gid:"g1",sid:"s1",m:"stoer",v:"+",d:"2026-11-05"})&&okAsv({id:"a1",gid:"g1",sid:"s1",m:"stoer",v:"-",d:"2026-11-05"})&&okAsv({id:"a1",gid:"g1",sid:"s1",m:"av",v:"o",d:"2026-11-05"})),"okAsv prüft Fremddaten");
  await p.click("button:has-text('Präsentation, Heft, Übung')");ok(await p.locator("h1",{hasText:"Präsentation, Heft, Übung"}).count()===1&&await p.locator(".card.tap",{hasText:"Referat (fiktiv)"}).count()===1,"gesonderte Leistungen mit fiktivem Referat");
  await p.click("button:has-text('+ Präsentation, Heft oder Übung')");await p.click(".pick button:text-is('Portfolio, Heft')");await p.fill("#kdt","Heftkontrolle Test");
  ok(await p.locator("#kdm").count()===0,"Heft: keine Punkte");await p.click("button:has-text('Anlegen')");
  ok(await p.locator("h1",{hasText:"Heftkontrolle Test"}).count()===1,"Heftkontrolle angelegt");
  await p.click(".pad button[data-n='2+']");await p.click("button:text-is('fehlt')");
  ok(await p.evaluate(()=>{const a=db.ka.find(a=>a.t==="Heftkontrolle Test"),m=groupById(a.gid).members;return a.k==="port"&&a.max==null&&a.r[m[0]].n==="2+"&&a.r[m[1]].st==="fehlt"&&okKa(a)}),"Note direkt und „fehlt“ gespeichert");
  ok(await p.evaluate(()=>{const a=db.ka.find(a=>a.t==="Heftkontrolle Test");return plObs(a.gid,groupById(a.gid).members[0]).some(o=>o.k==="port"&&o.n==="2+")&&!kaOf(a.gid).some(x=>x.k)}),"zählt zur Sonstigen Mitarbeit, nicht zu den Klassenarbeiten");
  ok(await p.evaluate(()=>!okKa({id:"x1",gid:"g1",t:"x",d:"2026-11-05",k:"port",max:10,sk:"-",r:{},upd:1})&&!okKa({id:"x1",gid:"g1",t:"x",d:"2026-11-05",k:"qual",r:{},upd:1})&&!okKa({id:"x1",gid:"g1",t:"x",d:"2026-11-05",k:"port",r:{s1:{n:"7"}},upd:1})),"okKa prüft gesonderte Leistungen");
  await p.click(".erhd button[aria-label='Zurück']");await p.click("text=‹ Zurück");await p.click("button:has-text('+ Präsentation, Heft oder Übung')");await p.click(".pick button:text-is('Schriftliche Übung')");
  ok(await p.locator("#kdm").count()===1,"Schriftliche Übung mit Punkten");await p.fill("#kdm","20");await p.click("button:has-text('Anlegen')");
  await p.fill("#kp","15");await p.press("#kp","Enter");ok(await p.evaluate(()=>{const a=db.ka.find(a=>a.k==="sue"&&a.max===20);return a&&kaNote(a,groupById(a.gid).members[0])!=null}),"Übung: Punkte ergeben Note");
  await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Mathe"}).click();await p.click("button:has-text('Übersicht Sonstige Mitarbeit')");
  ok(await p.locator(".tbl thead th",{hasText:"Stör."}).count()===1,"Übersicht mit Spalte Störungen");
  await p.locator(".tbl tbody tr",{hasText:"DEMO-01"}).click();if(!await p.evaluate(()=>SHOW))await p.click(".card button:has-text('Noten zeigen') >> nth=0");
  ok(await p.locator(".obsl li",{hasText:"Heftkontrolle Test"}).filter({hasText:"gesondert"}).count()===1,"Kürzel-Seite zeigt gesonderte Leistung");
  await p.click("button:has-text('Noten verbergen') >> nth=0");
  ok(await p.evaluate(()=>{const g=db.groups.find(g=>g.demo&&g.fach==="Mathe"),x={id:"zzasv1",gid:g.id,sid:g.members[0],m:"stoer",v:"-",d:today(),t:"",upd:Date.now()};
    IMP={d:{groups:[],sus:[],obs:[],att:[],ka:[],asv:[x,{...x,id:"zzasv2",m:"böse"}].filter(okAsv),rl:[],del:[]},settings:false};applyImport();return db.asv.some(a=>a.id==="zzasv1")&&!db.asv.some(a=>a.id==="zzasv2")}),"Sicherung laden übernimmt Störungen, prüft sie vorher");
  // 0.4.1 Rücklauf-Listen: anlegen, abhaken, Teilbetrag, Summe, Heute-Hinweis, abschließen
  await nav("Heute");ok(await p.locator(".rlrow",{hasText:"Wandertag (fiktiv)"}).count()===1,"Heute zeigt offene Rückläufe");
  await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Mathe"}).click();await p.click("button:has-text('Rückläufe')");
  await p.click("button:has-text('+ Rücklauf-Liste')");await p.fill("#rdt","Elternbrief Ausflug");await p.click(".pick button:text-is('Geld')");await p.click("button:has-text('Anlegen')");
  ok(await p.locator(".toast",{hasText:"Betrag"}).count()===1,"Geld ohne Betrag wird abgelehnt");
  await p.fill("#rdb","12,50");await p.click("button:has-text('Anlegen')");
  ok(await p.locator("h1",{hasText:"Elternbrief Ausflug"}).count()===1&&await p.evaluate(()=>db.rl.some(a=>a.t==="Elternbrief Ausflug"&&a.ct===1250&&a.art==="g")),"Geld-Liste mit 12,50 € angelegt");
  ok(await p.locator("text=Fehlt noch: 8 von 8").count()===1&&await p.locator("text=0,00 €").count()>0,"anfangs fehlen alle");
  await p.locator(".obsl li",{hasText:"DEMO-01"}).locator("button",{hasText:"erledigt"}).click();
  await p.locator(".obsl li",{hasText:"DEMO-02"}).locator("button",{hasText:"Teilbetrag"}).click();await dlgIn("5");
  ok(await p.locator("text=Fehlt noch: 7 von 8").count()===1&&await p.locator("text=Eingesammelt: 17,50 €").count()===1,"abhaken und Teilbetrag, Summe stimmt");
  await p.locator(".obsl li",{hasText:"DEMO-01"}).locator("button",{hasText:"erledigt"}).click();ok(await p.locator("text=Fehlt noch: 8 von 8").count()===1,"nochmal tippen macht es wieder offen");
  ok(await p.evaluate(()=>!okRl({id:"r1",gid:"g1",t:"x",art:"u",aus:"2026-11-05",ct:100,r:{},upd:1})&&!okRl({id:"r1",gid:"g1",t:"x",art:"g",aus:"2026-11-05",ct:100,r:{s1:{st:"teil",pc:100}},upd:1})&&okRl({id:"r1",gid:"g1",t:"x",art:"g",aus:"2026-11-05",ct:100,r:{s1:{st:"teil",pc:50}},upd:1})&&parseEur("12,5")===1250&&isNaN(parseEur("abc"))),"okRl und parseEur prüfen Fremddaten");
  await p.click("button:has-text('Liste abschließen')");await dlgBtn("Abschließen");
  ok(await p.evaluate(()=>!!db.rl.find(a=>a.t==="Elternbrief Ausflug").arch)&&await p.locator("button",{hasText:"Teilbetrag"}).count()===0,"Liste abgeschlossen und nur lesbar");
  // Namen: getrennt, verschlüsselt, nicht in der Sicherung
  await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Mathe"}).click();
  await p.click("button:has-text('Namen eintragen')");await p.locator("input[aria-label='Name zu DEMO-01']").fill("Fiktiv Testname");
  await p.click("button:has-text('Namen speichern')");ok(await p.locator(".nm:has-text('Fiktiv Testname')").count()===1,"Name wird beim Kürzel angezeigt");
  await p.waitForTimeout(300);
  ok(await p.evaluate(()=>{const n=localStorage.getItem("somi-beta-namen"),m=localStorage.getItem("somi-beta");return !!n&&n.includes('"somiEnc":1')&&!n.includes("Testname")&&!m.includes("Testname")&&!JSON.stringify(db).includes("Testname")}),"Namen getrennt und verschlüsselt gespeichert");
  await nav("Heute");await p.click(".hrow:has-text('DEMO Mathe') >> button:has-text('Runde')");
  await p.click(".erhd button:has-text('Namen aus')");ok(await p.locator(".nm").count()===0,"Namen verbergen");await p.click(".erhd button:has-text('Namen an')");
  await p.reload();for(const d of "2468")await p.click(`#lock .keys button:text-is("${d}")`);await p.waitForSelector("#lock",{state:"detached"});
  ok(await p.evaluate(()=>NAMES[db.sus.find(s=>s.code==="DEMO-01").id]==="Fiktiv Testname"),"Namen nach Entsperren wieder da");
  await nav("Einstellungen");
  const [dn]=await Promise.all([p.waitForEvent("download"),p.click("button:has-text('Namensliste sichern')")]);
  const nf=path.join(require("os").tmpdir(),"somi-namen-test.json");await dn.saveAs(nf);
  ok(JSON.parse(fs.readFileSync(nf,"utf8")).art==="namen"&&!fs.readFileSync(nf,"utf8").includes("Testname"),"Namensliste als verschlüsselte Datei");
  // Klassenlisten (ab 0.4.9): Liste einfügen, Namen landen verschlüsselt in der Namensliste, Kurs aus Klassenlisten wählen
  await nav("Lerngruppen");await p.click("button:has-text('+ Klassenliste')");await p.fill("#klcls","9z");
  await p.fill("#kltxt","Fiktiv Eins\nFiv\n9Z-07\n\nFiktiv Eins\n");await p.click("button:has-text('Anlegen')");
  ok(await p.locator("h1",{hasText:"Klasse 9Z"}).count()===1&&await p.evaluate(()=>{const k=db.sus.filter(s=>s.cls==="9Z").map(s=>s.code).sort().join();return k==="9Z-01,9Z-02,9Z-07"&&db.sus.filter(s=>s.cls==="9Z").every(s=>s.kl)}),"Klassenliste 9Z mit 3 Kürzeln (doppelte Zeile übersprungen)");
  ok(await p.evaluate(()=>NAMES[db.sus.find(s=>s.code==="9Z-01").id]==="Fiktiv Eins"&&!JSON.stringify(db).includes("Fiktiv Eins")),"Namen aus der Liste nur in der Namensliste");
  await p.click("button:has-text('+ Weitere Kinder einfügen')");await p.fill("#kltxt","Fiktiv Drei");await p.click("button:has-text('Hinzufügen')");
  ok(await p.locator(".nm",{hasText:"Fiktiv Drei"}).count()===1&&await p.evaluate(()=>NAMES[db.sus.find(s=>s.code==="9Z-03").id]==="Fiktiv Drei"),"weitere Kinder einfügen");
  await nav("Lerngruppen");await p.click("text=+ Lerngruppe");await p.fill("#gcls","9");await p.click("button:has-text('G-Kurs')");await p.click("button:has-text('Anlegen')");
  await p.click("button:has-text('Aus Klassenlisten wählen')");
  ok(await p.locator(".cele b",{hasText:"Klasse 9Z"}).count()===1&&await p.locator(".cele b",{hasText:"Klasse DEMO"}).count()===0&&await p.locator(".cele input:checked").count()===0,"Auswahl nach Klassen, nichts vorausgewählt, keine Beispielkinder");
  await p.locator(".cele label",{hasText:"9Z-01"}).click();await p.locator(".cele label",{hasText:"9Z-07"}).click();await dlgBtn("Übernehmen");
  ok(await p.locator(".card.tap .code").count()===2,"zwei Kinder in den Kurs übernommen");
  await p.click("text=Lerngruppe archivieren");await dlgBtn("Archivieren");await p.click("button:text-is('Löschen')");await dlgBtn("Endgültig löschen");await dlgBtn("Ja, löschen");
  ok(await p.evaluate(()=>db.sus.filter(s=>s.cls==="9Z").length===4),"Kurs gelöscht, Klassenliste bleibt");
  // Schuljahreswechsel (ab 0.4.10): Klasse versetzen, alte Lerngruppen archivieren
  await p.locator(".card.tap",{hasText:"Klasse 9Z"}).click();await p.click("button:has-text('Klasse versetzen')");
  ok(await p.inputValue("#dlgIn")==="10Z","Vorschlag nächste Klasse 10Z");await dlgBtn("Versetzen");
  ok(await p.locator("h1",{hasText:"Klasse 10Z"}).count()===1&&await p.evaluate(()=>db.sus.filter(s=>s.cls==="10Z").map(s=>s.code).sort().join()==="10Z-01,10Z-02,10Z-03,10Z-07"&&NAMES[db.sus.find(s=>s.code==="10Z-01").id]==="Fiktiv Eins"),"Klasse versetzt, Kürzel und Namen passen");
  await p.evaluate(()=>{const g=touch({id:uid(),fach:"Mathe",cls:"5A",kurs:"-",sy:"2020/21",members:[],arch:null});db.groups.push(g);save()});
  await nav("Heute");await nav("Lerngruppen");ok(await p.locator("text=aus einem früheren Schuljahr noch aktiv").count()===1,"Hinweis auf alte Lerngruppen");
  await p.click("button:has-text('Alle 1 archivieren')");await dlgBtn("Archivieren");
  ok(await p.evaluate(()=>!!db.groups.find(g=>g.sy==="2020/21").arch)&&await p.locator("text=aus einem früheren Schuljahr noch aktiv").count()===0,"alte Lerngruppen archiviert");
  await p.locator(".card.tap",{hasText:"Klasse 10Z"}).click();await p.click("button:has-text('Kürzel ohne Lerngruppe löschen')");await dlgBtn("Löschen");
  ok(await p.evaluate(()=>!db.sus.some(s=>s.cls==="9Z")&&!Object.values(NAMES).includes("Fiktiv Eins")&&!db.sus.some(s=>s.cls==="10Z")),"Klassenliste samt Namen gelöscht");
  // 0.5.3 Förderplanziele (LE)
  ok(await p.evaluate(()=>{const s=db.sus.find(x=>x.code==="DEMO-05");return lezOf(s,"Mathe").length===2&&okSus(s)&&!okSus({...s,lez:{Mathe:[1,2]}})&&!okSus({...s,lez:{Bio:[]}})&&!okSus({...s,lez:{Mathe:Array.from({length:5},(_,i)=>({id:"z"+i,t:"x"}))}})}),"okSus prüft Förderplanziele");
  ok(await p.evaluate(()=>!okObs({id:"o1",gid:"g1",sid:"s1",k:"lez",s:"3",d:"2026-11-05",upd:1})&&okObs({id:"o1",gid:"g1",sid:"s1",k:"lez",z:"z1",s:"3",d:"2026-11-05",upd:1})&&!okObs({id:"o1",gid:"g1",sid:"s1",k:"qual",z:"z1",s:"3",d:"2026-11-05",upd:1})),"okObs prüft Ziel-Einträge");
  await p.evaluate(()=>{const g=db.groups.find(g=>g.demo&&g.fach==="Mathe");ER={...erNeu(g.id,"k"),i:4};go({tab:"gruppen",group:g.id,erf:g.id})});
  ok(await p.locator(".seqsus:has-text('DEMO-05')").count()===1&&await p.locator(".mxz").count()===2&&await p.locator(".seqk:has-text('Qualität')").count()===0,"Runde zeigt bei LE die Förderplanziele statt Kriterien");
  {const vp=p.viewportSize();await p.setViewportSize({width:375,height:548});ok(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),"375×548: Runde mit Zielen ohne Scrollen");await p.setViewportSize(vp)}
  {const n0=await p.evaluate(()=>db.obs.length);await p.locator(".mxz").first().locator("button[data-s='4']").click();
  ok(await p.evaluate(n=>{const o=db.obs.at(-1),s=db.sus.find(x=>x.code==="DEMO-05");return db.obs.length===n+1&&o.k==="lez"&&o.z===s.lez.Mathe[0].id&&o.s==="4"&&okObs(o)},n0),"Ziel-Eintrag gespeichert")}
  await p.evaluate(()=>{const g=db.groups.find(g=>g.demo&&g.fach==="Mathe");SHOW=true;go({tab:"gruppen",group:g.id,sus:g.members[4]})});
  ok(await p.locator("text=Textbausteine fürs Zeugnis").count()===1&&await p.locator("text=Notenvorschlag").count()>0,"Seite zeigt Ziele, Textbausteine und Notenvorschlag");
  await p.fill("#lezNeu","Uhrzeit ablesen (fiktiv)");await p.click("button:text-is('Hinzufügen')");
  ok(await p.evaluate(()=>lezOf(db.sus.find(x=>x.code==="DEMO-05"),"Mathe").length===3),"Ziel hinzugefügt");
  await p.click("label.swr:has-text('Note im Zeugnis') input");ok(await p.locator("text=Bericht statt Note").count()===1,"ohne Note: Bericht statt Notenvorschlag");
  await p.click("label.swr:has-text('Note im Zeugnis') input");await p.evaluate(()=>{SHOW=false;render();return true});
  // 0.5.4 LE auf Wunsch wie alle anderen bewerten
  await p.click("label.swr:has-text('Nach Förderplanzielen bewerten') input");
  ok(await p.evaluate(()=>{const s=db.sus.find(x=>x.code==="DEMO-05");return s.lezAus?.[0]==="Mathe"&&lezOf(s,"Mathe").length===0&&lezRoh(s,"Mathe").length===3&&okSus(s)&&!okSus({...s,lezAus:["Bio"]})}),"Schalter: LE wie alle anderen, Ziele bleiben");
  ok(await p.locator("#lezNeu").count()===0&&await p.locator("text=Textbausteine fürs Zeugnis").count()===0,"Ziele ausgeblendet");
  await p.evaluate(()=>{const g=db.groups.find(g=>g.demo&&g.fach==="Mathe");ER={...erNeu(g.id,"k"),i:4};go({tab:"gruppen",group:g.id,erf:g.id})});
  ok(await p.locator(".mxz").count()===0&&await p.locator(".seqk:has-text('Qualität')").count()===1,"Runde zeigt bei ausgeschalteten Zielen die Kriterien");
  await p.evaluate(()=>{const g=db.groups.find(g=>g.demo&&g.fach==="Mathe");go({tab:"gruppen",group:g.id,sus:g.members[4]})});
  await p.click("label.swr:has-text('Nach Förderplanzielen bewerten') input");ok(await p.evaluate(()=>!db.sus.find(x=>x.code==="DEMO-05").lezAus),"wieder nach Zielen");
  // 0.5.2 PDF pro Kürzel
  await p.evaluate(()=>{const g=db.groups.find(g=>g.demo&&g.fach==="Sport");go({tab:"gruppen",group:g.id,sus:g.members[0]})});OVP="all";
  await p.evaluate(()=>{OVP="all";render()});
  {const [dl]=await Promise.all([p.waitForEvent("download"),p.click("button:has-text('PDF erstellen')")]);const pf=path.join(require("os").tmpdir(),"somi-test.pdf");await dl.saveAs(pf);
  const t=fs.readFileSync(pf,"latin1");ok(t.startsWith("%PDF-1.4")&&t.includes("%%EOF")&&t.includes("(DEMO-01)")&&t.includes("Leistungs\xfcbersicht Sport")&&t.includes("Handstand")&&t.includes("Stundenstatus")&&!t.includes("Fiktiv Testname"),"PDF pro Kürzel mit Sport-Einträgen, ohne Namen");
  }
  await p.click("label.swr:has-text('Name ins PDF') input");
  {const [dl]=await Promise.all([p.waitForEvent("download"),p.click("button:has-text('PDF erstellen')")]);const pf=path.join(require("os").tmpdir(),"somi-test2.pdf");await dl.saveAs(pf);
  ok(fs.readFileSync(pf,"latin1").includes("Fiktiv Testname"),"Name nur, wenn eingeschaltet")}
  await p.evaluate(()=>{PDFNM=false;const g=db.groups.find(g=>g.demo&&g.fach==="Mathe");go({tab:"gruppen",group:g.id,sus:g.members[2]})});
  {const [dl]=await Promise.all([p.waitForEvent("download"),p.click("button:has-text('PDF erstellen')")]);const pf=path.join(require("os").tmpdir(),"somi-test3.pdf");await dl.saveAs(pf);
  const t=fs.readFileSync(pf,"latin1");ok(t.includes("Klassenarbeiten")&&t.includes("KA 1")&&t.includes("NA gew")&&t.includes("Nachteilsausgleich"),"Mathe-PDF mit Klassenarbeit und NA-Vermerk")}
  // XSS: Kürzel mit HTML wird maskiert
  await nav("Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Mathe"}).click();
  await p.click("text=+ Schüler:in");await p.fill("#scode",'7<img src=x onerror=alert(1)>');await p.click("button:has-text('Hinzufügen')");
  ok(await p.locator("main img").count()===0&&await p.locator(".toast",{hasText:"keinen Namen"}).count()===1,"Kürzel mit Sonderzeichen werden abgelehnt");
  // 0.5.5 Startseite: Beispielgruppen weg, sobald eigene da sind; 6 Gruppen + 1 Rücklauf passen ohne Scrollen aufs iPhone SE
  await p.evaluate(()=>{const dm=db.groups.find(g=>g.demo&&g.fach==="Mathe");for(const [f,c] of [["Mathe","5A"],["Mathe","7B"],["Mathe","9A"],["Sport","6C"],["Sport","8D"],["Mathe","10E"]])db.groups.push(touch({id:"t"+c,fach:f,cls:c,kurs:"-",sy:syNow(),members:c==="7B"?dm.members.slice():[],arch:null}));
    db.rl.filter(a=>!a.arch).forEach(a=>a.arch=today());db.rl.push(touch({id:"trl",gid:"t7B",t:"Fiktiv: Ausflug",art:"z",aus:today(),ct:0,r:{},arch:null}));db.lastBackup=Date.now();save()});
  await nav("Heute");ok(await p.locator(".hrow").count()===6&&await p.locator(".hrow:has-text('DEMO')").count()===0,"Heute: nur eigene Gruppen, Beispiele ausgeblendet");
  {const vp=p.viewportSize();await p.setViewportSize({width:375,height:548});
  ok(await p.evaluate(()=>[...document.querySelectorAll("#app > *")].pop().getBoundingClientRect().bottom<=document.querySelector("nav").getBoundingClientRect().top),"375×548: Heute mit 6 Gruppen und Rücklauf ohne Scrollen");await p.setViewportSize(vp)}
  await p.evaluate(()=>{db.groups=db.groups.filter(g=>!g.id.startsWith("t"));db.rl=db.rl.filter(a=>a.id!=="trl");save()});
  ok(!errs.length,"keine Fehler in der Konsole"+(errs.length?": "+errs.join(" | "):""));
  for(const w of [390,820,1280]){await p.setViewportSize({width:w,height:900});await nav("Heute");await p.screenshot({path:path.join(require("os").tmpdir(),`somi-${w}.png`),fullPage:true})}
  await b.close();srv.close();console.log("Alle Prüfungen bestanden.")})().catch(e=>{console.error(e.message);process.exit(1)});
