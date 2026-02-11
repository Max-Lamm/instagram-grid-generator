# Instagram Grid Generator - Deployment Anleitung für Uberspace

## 🎯 Übersicht
Diese Anleitung zeigt dir Schritt-für-Schritt, wie du den Instagram Grid Generator auf deinem Uberspace-Server unter `https://tools.maxlamm.de` installierst.

---

## 📋 Voraussetzungen
- SSH-Zugang zu deinem Uberspace-Server
- Die Subdomain `tools.maxlamm.de` ist bereits eingerichtet ✅

---

## 🚀 Installation & Deployment

### Schritt 1: Mit Uberspace verbinden
Öffne dein Terminal (Mac/Linux) oder PowerShell/Git Bash (Windows) und verbinde dich mit deinem Uberspace:

```bash
ssh DEIN-USERNAME@DEIN-SERVER.uberspace.de
```

Ersetze `DEIN-USERNAME` und `DEIN-SERVER` mit deinen tatsächlichen Zugangsdaten.

---

### Schritt 2: Node.js installieren
Uberspace hat Node.js bereits vorinstalliert, aber wir stellen sicher, dass wir eine aktuelle Version nutzen:

```bash
# Prüfe die aktuelle Node.js Version
node --version

# Falls die Version älter als 18.x ist, installiere eine neuere:
uberspace tools version use node 20
```

Überprüfe die Installation:
```bash
node --version
npm --version
```

---

### Schritt 3: Projektdateien hochladen

**Option A - Mit SFTP/SCP (empfohlen für Anfänger):**

1. Lade das Projekt-ZIP herunter (siehe separate Datei)
2. Entpacke es auf deinem lokalen Rechner
3. Nutze ein SFTP-Programm wie FileZilla, Cyberduck oder WinSCP:
   - Host: `DEIN-SERVER.uberspace.de`
   - Port: `22`
   - Protokoll: `SFTP`
   - Benutzername: `DEIN-USERNAME`
   - Passwort: dein Uberspace-Passwort

4. Lade den entpackten Ordner `instagram-grid-project` nach `/home/DEIN-USERNAME/` hoch

**Option B - Mit rsync (für fortgeschrittene Nutzer):**

Vom lokalen Rechner aus (nachdem du das ZIP entpackt hast):
```bash
rsync -avz instagram-grid-project/ DEIN-USERNAME@DEIN-SERVER.uberspace.de:~/instagram-grid-project/
```

---

### Schritt 4: Dependencies installieren
Zurück in der SSH-Verbindung:

```bash
# Wechsle ins Projektverzeichnis
cd ~/instagram-grid-project

# Installiere alle benötigten Pakete
npm install
```

⏱️ Dies kann 2-5 Minuten dauern. Warte, bis der Prozess abgeschlossen ist.

---

### Schritt 5: Projekt bauen (Build)
```bash
# Erstelle die produktionsreife Version
npm run build
```

✅ Nach erfolgreichem Build solltest du einen neuen Ordner `dist` im Projektverzeichnis sehen.

Überprüfe dies mit:
```bash
ls -la dist/
```

---

### Schritt 6: Dateien ins Web-Verzeichnis kopieren

Da die Subdomain `tools.maxlamm.de` bereits eingerichtet ist, kopieren wir die Build-Dateien ins richtige Verzeichnis:

```bash
# Erstelle das Verzeichnis (falls noch nicht vorhanden)
mkdir -p ~/html

# Kopiere den Build-Inhalt
cp -r dist/* ~/html/

# Überprüfe, dass die Dateien kopiert wurden
ls -la ~/html/
```

Du solltest jetzt Dateien wie `index.html`, `assets/` etc. in `~/html/` sehen.

---

### Schritt 7: Berechtigungen setzen
```bash
# Stelle sicher, dass alle Dateien die richtigen Berechtigungen haben
chmod -R 755 ~/html/
```

---

### Schritt 8: Testen! 🎉

Öffne deinen Browser und gehe zu:
```
https://tools.maxlamm.de
```

Du solltest jetzt den Instagram Grid Generator sehen!

---

## 🔄 Updates deployen

Wenn du später Änderungen am Tool vornehmen möchtest:

```bash
# 1. Verbinde dich wieder mit SSH
ssh DEIN-USERNAME@DEIN-SERVER.uberspace.de

# 2. Wechsle ins Projektverzeichnis
cd ~/instagram-grid-project

# 3. Lade neue Dateien hoch (via SFTP) oder mache Code-Änderungen

# 4. Baue neu
npm run build

# 5. Kopiere ins Web-Verzeichnis
cp -r dist/* ~/html/

# 6. Fertig! Aktualisiere die Seite im Browser
```

---

## 🐛 Troubleshooting

### Problem: "npm: command not found"
**Lösung:**
```bash
uberspace tools version use node 20
```

### Problem: "Permission denied"
**Lösung:**
```bash
chmod -R 755 ~/html/
```

### Problem: Website zeigt nur leere Seite
**Lösung:**
1. Überprüfe Browser-Konsole (F12) auf Fehler
2. Stelle sicher, dass `index.html` in `~/html/` liegt:
   ```bash
   ls -la ~/html/index.html
   ```
3. Prüfe, ob der Build erfolgreich war:
   ```bash
   ls -la ~/instagram-grid-project/dist/
   ```

### Problem: Build-Fehler bei npm install
**Lösung:**
```bash
# Lösche node_modules und package-lock.json
rm -rf node_modules package-lock.json

# Installiere erneut
npm install
```

---

## 📝 Zusammenfassung der Befehle

Hier nochmal alle Befehle in Kurzform:

```bash
# 1. SSH-Verbindung
ssh DEIN-USERNAME@DEIN-SERVER.uberspace.de

# 2. Node.js Version setzen
uberspace tools version use node 20

# 3. Ins Projektverzeichnis wechseln (nach Upload)
cd ~/instagram-grid-project

# 4. Dependencies installieren
npm install

# 5. Build erstellen
npm run build

# 6. Ins Web-Verzeichnis kopieren
cp -r dist/* ~/html/

# 7. Berechtigungen setzen
chmod -R 755 ~/html/
```

---

## ✅ Fertig!

Dein Instagram Grid Generator läuft jetzt unter:
**https://tools.maxlamm.de**

Teile diesen Link mit deinem Team und sie können das Tool sofort nutzen! 🚀

---

## 💡 Tipps für dein Team

**So nutzt man das Tool:**
1. Öffne `https://tools.maxlamm.de`
2. Lade ein Hintergrundbild (3240×1920) hoch
3. Lade ein Filmplakat (790×1122) hoch
4. Wähle die Reel-Position (Links/Mitte/Rechts)
5. Klicke auf "3 Dateien Exportieren"
6. Die Dateien werden automatisch heruntergeladen

**Posting-Reihenfolge für Instagram:**
1. Poste zuerst `DATUM_1.png`
2. Dann `DATUM_2.png` (oder `DATUM_2_reel.png`)
3. Zuletzt `DATUM_3.png` (oder `DATUM_3_reel.png`)

So erscheint im Grid alles in der richtigen Reihenfolge!

---

Bei Fragen oder Problemen: Melde dich einfach! 👋
