# Instagram Grid Post Generator

Ein browserbasiertes Tool zur Erstellung von nahtlosen 3er-Grid-Posts für Instagram mit Filmplakat-Overlay.

## 🎯 Features

- ✅ Automatische Skalierung/Cropping von Bildern auf die korrekten Formate
- ✅ 3 Reel-Positionen: Links, Mitte, Rechts
- ✅ Live-Vorschau des Grid-Ergebnisses
- ✅ Export von 3 Dateien in korrekter Posting-Reihenfolge
- ✅ Automatische Dateinamen mit Datum
- ✅ Narrensichere Bedienung für grafisch ungeschultes Personal

## 📐 Technische Spezifikationen

### Input-Formate:
- **Hintergrundbild:** 3240×1920 px (wird automatisch skaliert/gecroppt)
- **Filmplakat:** 790×1122 px (wird automatisch skaliert/gecroppt)

### Output-Formate:
- **Reel-Post:** 1080×1920 px (9:16 Format)
- **Bild-Posts:** 1080×1440 px (3:4 Format)

### Dateinamen:
- Format: `YYYY-MM-DD_N.png` oder `YYYY-MM-DD_N_reel.png`
- Beispiel: `2024-02-10_1.png`, `2024-02-10_2_reel.png`, `2024-02-10_3.png`

## 🚀 Installation & Deployment

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für die vollständige Anleitung zur Installation auf Uberspace.

### Kurz-Anleitung:

```bash
# 1. Dependencies installieren
npm install

# 2. Build erstellen
npm run build

# 3. Deployment auf Server
cp -r dist/* ~/html/
```

## 💡 Nutzung

1. Öffne die Webseite (z.B. `https://tools.maxlamm.de`)
2. Lade das Hintergrundbild hoch (3240×1920)
3. Lade das Filmplakat hoch (790×1122)
4. Wähle die Reel-Position (Links/Mitte/Rechts)
5. Überprüfe die Grid-Vorschau
6. Klicke auf "3 Dateien Exportieren"

### Posting-Reihenfolge für Instagram:

Instagram baut das Grid **rückwärts auf** (neuester Post = links). Daher:

**Bei "Reel Links":**
1. Poste zuerst: `DATUM_1.png` (rechtes Bild)
2. Poste dann: `DATUM_2.png` (mittiges Bild)
3. Poste zuletzt: `DATUM_3_reel.png` (Reel links)

**Bei "Reel Mitte":**
1. Poste zuerst: `DATUM_1.png` (rechtes Bild)
2. Poste dann: `DATUM_2_reel.png` (Reel mitte)
3. Poste zuletzt: `DATUM_3.png` (linkes Bild)

**Bei "Reel Rechts":**
1. Poste zuerst: `DATUM_1_reel.png` (Reel rechts)
2. Poste dann: `DATUM_2.png` (mittiges Bild)
3. Poste zuletzt: `DATUM_3.png` (linkes Bild)

## 🛠️ Tech Stack

- React 18
- Vite (Build-Tool)
- Tailwind CSS (Styling)
- Lucide React (Icons)
- Canvas API (Bildverarbeitung)

## 📝 Lizenz

Dieses Projekt wurde für den internen Gebrauch erstellt.

## 🤝 Support

Bei Fragen oder Problemen siehe [DEPLOYMENT.md](DEPLOYMENT.md) → Troubleshooting-Sektion.
