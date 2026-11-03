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
  await p.click("nav >> text=Lerngruppen");ok(await p.locator("text=DEMO Mathe").count()>0,"Beispielklasse geladen");
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
  await p.click("nav >> text=Einstellungen");
  await p.click("button:has-text('Sicherung speichern')");
  await dlgIn("geheim123");await dlgIn("geheim123");await dlgBtn("Merken");
  const [dl]=await Promise.all([p.waitForEvent("download"),dlgBtn("Verstanden")]);
  const file=path.join(require("os").tmpdir(),"somi-test.json");await dl.saveAs(file);
  const sic=JSON.parse(fs.readFileSync(file,"utf8"));ok(sic.somi===1&&sic.ct&&!JSON.stringify(sic).includes("7B-01"),"Sicherung verschlüsselt, ohne Klartext");
  ok(await p.locator("text=Einrichtung: noch").count()===0,"Einrichtung fertig");
  // Gruppe löschen (vor Fristende, doppelte Rückfrage) und aus Sicherung wiederherstellen
  await p.click("nav >> text=Lerngruppen");await p.locator(".card.tap",{hasText:"7B Mathe E"}).click();
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
  await p.click("nav >> text=Heute");ok(await p.locator("text=Schnell erfassen").count()===1,"Schnell erfassen auf Heute");
  // 0.2.2 Ganze Klasse: Kriterien wählen, Note, überspringen, nicht anwesend
  await p.click(".card >> button:has-text('DEMO Mathe: ganze Klasse')");ok(await p.locator("h1",{hasText:"Erfassen"}).count()===1,"Erfassen geöffnet");
  ok(await p.locator("text=Was hast du heute beobachtet?").count()===1,"Runde beginnt mit Kriterienwahl");
  await p.click(".chips button:has-text('Kooperation')");
  ok(await p.locator("button:has-text('Runde starten (2 Kriterien)')").count()===1,"zwei Kriterien gewählt");
  await p.click("button:has-text('Runde starten')");
  ok(await p.locator(".seqsus:has-text('DEMO-01')").count()===1&&await p.locator(".seqk:has-text('Qualität')").count()===1,"Start: DEMO-01, erstes Kriterium");
  let s0=await p.evaluate(()=>db.obs.length);
  await p.click(".pad button:text-is('3')");ok(await p.locator(".seqsus:has-text('DEMO-01')").count()===1&&await p.locator(".seqk:has-text('Kooperation')").count()===1,"nach Note: nächstes Kriterium");
  await p.click("button:has-text('überspringen')");ok(await p.locator(".seqsus:has-text('DEMO-02')").count()===1,"überspringen: weiter zu DEMO-02");
  await p.click("button:has-text('nicht anwesend')");ok(await p.locator(".seqsus:has-text('DEMO-03')").count()===1,"nicht anwesend: ganzes Kürzel übersprungen");
  ok(await p.evaluate(n=>db.obs.length===n+1,s0),"nur die echte Note gespeichert");
  await p.click(".three button:has-text('Zurück')");await p.click(".three button:has-text('Zurück')");await p.click(".three button:has-text('Zurück')");
  ok(await p.locator("text=schon bewertet").count()===1,"Zurück zeigt: schon bewertet");
  await p.click(".pad button:text-is('2')");ok(await p.evaluate(n=>db.obs.length===n+1&&db.obs.at(-1).n==="2",s0),"neue Note ersetzt die alte");
  const nM=await p.evaluate(()=>groupById(ER.gid).members.length);
  await p.click("button:has-text('überspringen')");
  for(let i=1;i<nM;i++)await p.click("button:has-text('nicht anwesend')");
  ok(await p.locator(".seqdone:has-text('1 bewertet')").count()===1,"Fertig-Anzeige");
  await p.evaluate(n=>{db.obs=db.obs.slice(0,n);save()},s0);
  await p.click(".pick button:has-text('Einzeln bewerten')");ok(await p.locator(".tile").count()>0,"Umschalten auf Einzeln");
  const n0=await p.evaluate(()=>db.obs.length);ok(n0>0,"Beispielklasse hat fiktive Einträge");
  await p.click(".pad button:text-is('2')");ok(await p.locator(".toast",{hasText:"Tippe zuerst"}).count()===1,"ohne Auswahl keine Note");
  await p.click(".chips button:has-text('Kooperation')");
  await p.click(".tile:has-text('DEMO-01')");await p.click(".tile:has-text('DEMO-02')");
  ok(await p.locator("text=2 ausgewählt").count()===1,"Mehrfachauswahl");
  await p.fill("#erT","Gruppenarbeit Station 3");await p.click(".pad button:text-is('2−')");
  await p.waitForSelector(".toast:has-text('2 Einträge gespeichert')");
  ok(await p.locator(".toast",{hasText:"2−"}).count()===0,"Sichtschutz: Note nicht im Hinweis");
  let o=await p.evaluate(()=>db.obs.slice(-2));ok(o.length===2&&o.every(x=>x.n==="2-"&&x.k==="koop"&&x.t==="Gruppenarbeit Station 3"&&!x.fb),"zwei Einträge mit Kriterium, Note und Stichwort");
  ok(await p.locator(".tile.on").count()===0&&await p.locator(".tile:has-text('DEMO-01') .done").count()===1,"Auswahl zurückgesetzt, Haken für heute");
  await p.locator("label.swr:has-text('Nur Rückmeldung') input").check();await p.click(".tile:has-text('DEMO-03')");await p.click(".pad button:text-is('5')");
  o=await p.evaluate(()=>db.obs.at(-1));ok(o.fb===true&&o.n==="5","nur Rückmeldung gespeichert");
  await p.click(".pad button:text-is('4+')");// ohne Auswahl
  await p.click("button:has-text('Übersicht DEMO Mathe')");ok(await p.locator("h1",{hasText:"Übersicht"}).count()===1,"Übersicht geöffnet");
  ok(await p.locator(".tbl").innerText().then(t=>!/\d,\d/.test(t)&&!t.includes("2−")),"Sichtschutz: keine Noten in der Übersicht");
  await p.click("button:has-text('Noten zeigen')");ok(await p.locator(".tbl tr:has-text('DEMO-01')").innerText().then(t=>t.includes("2−")),"Noten zeigen");
  ok(await p.locator(".tbl tr:has-text('DEMO-03')").innerText().then(t=>/ \+[12]/.test(t)),"Rückmeldung zählt nicht mit");
  await p.click(".tbl tr:has-text('DEMO-01')");ok(await p.locator("text=Sonstige Mitarbeit in DEMO Mathe").count()===1,"Einträge auf der Kürzel-Seite");
  const c1=await p.locator(".obsl li").count();await p.locator(".obsl li").first().locator("button[aria-label='Eintrag löschen']").click();
  ok(await p.locator(".obsl li").count()===c1-1,"Eintrag gelöscht");await p.click(".toast button:has-text('Rückgängig')");
  ok(await p.locator(".obsl li").count()===c1,"Löschen rückgängig");
  await p.click("nav >> text=Einstellungen");await p.locator("label.swr:has-text('Hausaufgaben') input").check();
  await p.click("nav >> text=Heute");await p.click(".card >> button:has-text('DEMO Mathe')");
  ok(await p.locator(".chips button:has-text('Hausaufgaben')").count()===1,"Kriterium Hausaufgaben zuschaltbar");
  ok(await p.evaluate(()=>!okObs({id:"a",gid:"b",sid:"c",k:"qual",n:"7",d:"2026-01-01"})&&!okObs({id:"a",gid:"b",sid:"c",k:"x",n:"2",d:"2026-01-01"})&&okObs({id:"a",gid:"b",sid:"c",k:"qual",n:"2+",d:"2026-01-01"})),"Prüfhelfer okObs");
  // Sport: Stundenstatus
  await p.click("nav >> text=Heute");await p.click("button:has-text('DEMO Sport: Stundenstatus')");
  ok(await p.locator("h1",{hasText:"Stundenstatus"}).count()===1,"Sport: Stundenstatus geöffnet");
  await p.click(".stgrid button:has-text('aktiv')");await p.click(".stgrid button:has-text('ohne Sportsachen')");await p.click(".stgrid button:has-text('sportunfähig')");
  await p.click("button:has-text('Alle übrigen: aktiv')");ok(await p.locator(".seqdone:has-text('4 aktiv')").count()===1,"Sport: alle übrigen aktiv");
  ok(await p.evaluate(()=>db.att.length===6&&db.att.every(okAtt)),"Sport: 6 Status gespeichert");
  await p.click("button:has-text('Letzte ansehen')");await p.click(".stgrid button:has-text('nicht anwesend')");
  ok(await p.evaluate(()=>db.att.length===6&&db.att.filter(a=>a.st==="abw").length===1),"Sport: Status ersetzt, nicht doppelt");
  await p.click("button:has-text('Zur Übersicht')");ok(await p.locator(".tbl tr:has-text('DEMO-02') td").nth(1).innerText().then(t=>t==="1"),"Sport-Übersicht zählt ohne Sachen");
  ok(await p.evaluate(()=>!okAtt({id:"a",gid:"b",sid:"c",st:"x",d:"2026-01-01",upd:1})),"Prüfhelfer okAtt");
  // XSS: Kürzel mit HTML wird maskiert
  await p.click("nav >> text=Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Mathe"}).click();
  await p.click("text=+ Schüler:in");await p.fill("#scode",'7<img src=x onerror=alert(1)>');await p.click("button:has-text('Hinzufügen')");
  ok(await p.locator("main img").count()===0&&await p.locator(".toast",{hasText:"keinen Namen"}).count()===1,"Kürzel mit Sonderzeichen werden abgelehnt");
  ok(!errs.length,"keine Fehler in der Konsole"+(errs.length?": "+errs.join(" | "):""));
  for(const w of [390,820,1280]){await p.setViewportSize({width:w,height:900});await p.click("nav >> text=Heute");await p.screenshot({path:path.join(require("os").tmpdir(),`somi-${w}.png`),fullPage:true})}
  await b.close();srv.close();console.log("Alle Prüfungen bestanden.")})().catch(e=>{console.error(e.message);process.exit(1)});
