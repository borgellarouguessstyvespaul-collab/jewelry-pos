# Guide de Configuration du Matériel POS (Hardware Setup)

Ce document décrit comment configurer les périphériques matériels d'une bijouterie (scanner code-barres, imprimante thermique de tickets, et poste de caisse).

---

## 1. Lecteur de Code-Barres (Barcode Scanner)

### Mode de Fonctionnement Recommandé : Emulation Clavier (HID Keyboard)
Les lecteurs code-barres USB ou sans-fil (Bluetooth / 2.4GHz) doivent être configurés en mode **HID Keyboard**.
Dans ce mode, le scanner agit comme un clavier qui saisit la chaîne de caractères à haute vitesse et termine par la touche `Enter` (`CR` / `LF`).

### Configuration du Scanner :
1. Branchez le récepteur USB sur l'ordinateur de caisse.
2. Scannez le code-barres de configuration **"Restore Factory Defaults"** présent dans le manuel de votre appareil (ex: Honeywell, Zebra, Datalogic ou scanner générique).
3. Scannez le code-barres **"Add CR/Enter Suffix"** pour vous assurer qu'un retour chariot est envoyé après chaque lecture.
4. Dans l'application web Jewelry POS, le hook `useBarcode` détecte automatiquement les frappes ultra-rapides (<50ms) et ajoute immédiatement le bijou au panier, même sans avoir cliqué dans le champ de recherche !

---

## 2. Imprimante Thermique de Tickets (Thermal Receipt Printer)

### Modèles Supportés :
- Imprimantes thermiques standards de **80mm** ou **58mm** (ex: Epson TM-T20 / TM-T88, Star Micronics, Xprinter, MUNBYN).

### Configuration sous Windows :
1. Installez le pilote officiel du fabricant de votre imprimante thermique (ex: *Epson Advanced Printer Driver*).
2. Définissez-la comme imprimante par défaut ou configurez une imprimante dédiée pour les tickets de caisse.
3. Dans les propriétés d'impression Windows :
   - Format de papier : sélectionnez **Roll Paper 80 x 297 mm** (ou **58 x 297 mm**).
   - Coupure de papier (Paper Cut) : activez **Cut at end of document**.
   - Tiroir-caisse (Cash Drawer) : configurez **Open Drawer #1 before printing** si vous avez un tiroir-caisse connecté via câble RJ11/RJ12 à l'imprimante.

### Impression Web Silencieuse (Kiosk Mode) :
Pour imprimer instantanément sans afficher la boîte de dialogue d'impression du navigateur :
- **Google Chrome** : Lancez Chrome avec le paramètre :
  ```bash
  chrome.exe --kiosk --kiosk-printing "http://localhost:5173"
  ```
- Dès qu'une vente est validée, le ticket s'imprime instantanément et le tiroir-caisse s'ouvre automatiquement.

---

## 3. Configuration du Poste de Caisse (POS Computer)
- **Résolution d'écran recommandée** : 1920x1080 (tactile ou classique).
- **Navigateur recommandé** : Google Chrome ou Microsoft Edge à jour.
- **Réseau** : Connexion Ethernet filaire ou Wi-Fi 5GHz stable pour communiquer avec l'API FastAPI locale ou sur serveur réseau.
