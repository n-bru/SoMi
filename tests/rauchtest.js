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
  // Sperre nach Neuladen
  await p.reload();ok(await p.locator("#lock").count()===1,"Nach Neustart gesperrt");
  for(const d of "1111")await p.click(`#lock .keys button:text-is("${d}")`);
  await p.waitForSelector("#lock:has-text('Falscher Code')");
  for(const d of "2468")await p.click(`#lock .keys button:text-is("${d}")`);
  await p.waitForSelector("#lock",{state:"detached"});ok(true,"Entsperrt mit richtigem Code");
  ok(await p.locator("text=DEMO Mathe").count()>0,"Daten nach Entsperren da");
  // XSS: Kürzel mit HTML wird maskiert
  await p.click("nav >> text=Lerngruppen");await p.locator(".card.tap",{hasText:"DEMO Mathe"}).click();
  await p.click("text=+ Schüler:in");await p.fill("#scode",'7<img src=x onerror=alert(1)>');await p.click("button:has-text('Hinzufügen')");
  ok(await p.locator("main img").count()===0&&await p.locator(".toast",{hasText:"keinen Namen"}).count()===1,"Kürzel mit Sonderzeichen werden abgelehnt");
  ok(!errs.length,"keine Fehler in der Konsole"+(errs.length?": "+errs.join(" | "):""));
  for(const w of [390,820,1280]){await p.setViewportSize({width:w,height:900});await p.click("nav >> text=Heute");await p.screenshot({path:path.join(require("os").tmpdir(),`somi-${w}.png`),fullPage:true})}
  await b.close();srv.close();console.log("Alle Prüfungen bestanden.")})().catch(e=>{console.error(e.message);process.exit(1)});
