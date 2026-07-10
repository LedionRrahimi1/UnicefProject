# LexoLehtë AI

Materiale mësimore që adaptohen për çdo nxënës.

Learning materials that adapt for every student.

**GitHub:** https://github.com/LedionRrahimi1/UnicefProject

---

## Shqip

### Çfarë është

LexoLehtë AI është një aplikacion për shkolla. Mësuesja ngarkon një tekst (p.sh. nga libri i biologjisë), AI e bën më të thjeshtë, dhe nxënësi e lexon me ndihmë — fjalor, shpjegime, kuiz.

Ideja erdhi nga një problem i thjeshtë: shumë fëmijë e kanë të vështirë të kuptojnë tekstet e klasës, ndërsa mësuesit nuk kanë kohë të shkruajnë një version të veçantë për secilin.

Ne nuk duam që fëmija të krahasohet me të tjerët. Prandaj në vend të “XP” dhe “badge”, në UI përdorim **Yje** dhe **Tituj**.

### Pse e bëmë

- Rreth 1 në 5 nxënës ka vështirësi me leximin
- Materialet e njëjta për të gjithë shpesh lënë disa fëmijë mbrapa
- Mësuesit e dinë këtë, por përgatitja individuale merr shumë kohë

LexoLehtë synon ta shkurtojë atë kohë, pa e hequr kontrollin nga mësuesja. AI propozon, mësuesja rishikon dhe publikon.

### Kush e përdor

**Mësuesja**
- Krijon material (ngjit tekst ose ngarkon skedar)
- Zgjedh klasën / nxënësit
- Vendos sa i thjeshtë të jetë teksti dhe sa pyetje të ketë kuizi
- Pret që AI të gjenerojë versionin e ri
- Kontrollon, ndryshon nëse duhet, pastaj publikon

**Nxënësi**
- Sheh detyrat në panel
- Lexon me opsione aksesueshmërie (madhësi teksti, hapësirë, focus mode)
- Mund të zgjedhë një fjali dhe të kërkojë shpjegim
- Bën kuizin
- Fiton yje dhe tituj

### Si të provohet (demo)

1. Hyr si mësuese: `mesuesi@lexolehte.com` / `demo123`
2. Krijo material → ngjit një tekst → Adapto me AI
3. Shiko review-n → Publiko për nxënësit
4. Dil dhe hyr si nxënës: `nxenesi@lexolehte.com` / `demo123`
5. Në panel duhet të shfaqet detyra → lexo → kuiz

E gjithë kjo funksionon në të njëjtin browser, sepse të dhënat ruhen në `localStorage` (nuk kemi databazë ende).

### Çfarë ka brenda

- Adaptim me OpenAI (tekst i thjeshtësuar, përmbledhje, fjalor, kuiz, shënime për mësuesen)
- Publikimi krijon detyra automatikisht për nxënësit e klasës
- Hapësirë leximi me fontë të lexueshëm (Lexend, Atkinson)
- Kuiz me hint dhe feedback
- Yje, nivele, tituj (edhe nga mësuesja)
- Analytics bazë për klasën
- UI në shqip, dizajn i thjeshtë (e bardhë + theks vjollcë e butë)

### Si ta nisësh lokalisht

Duhet Node.js 18+ dhe një çelës OpenAI.

```bash
git clone https://github.com/LedionRrahimi1/UnicefProject.git
cd UnicefProject
npm install
cp .env.example .env
```

Në `.env` vendos:

```
VITE_OPENAI_API_KEY=sk-proj-...
```

Pastaj:

```bash
npm run dev
```

Hape në http://localhost:5173

**Kujdes:** skedari `.env` nuk shkon në GitHub. Mos e commit-o çelësin.

### Kufizimet (të ndershme)

- Pa backend/DB: mësuesja dhe nxënësi duhet të jenë në të njëjtin kompjuter/browser
- Audio “Dëgo” në UI ende nuk luan zë real (është planifikuar)
- Çelësi OpenAI është në frontend për demo — për prodhim duhet të jetë në server

### Çfarë duam të shtojmë më vonë

- Backend + databazë
- Audio me zë (TTS)
- Ngarkim PDF/Word
- Panel për prindër
- PWA / offline për shkolla me internet të dobët

### Struktura e shkurtër

```
src/app/
  MaterialCreate.tsx   → krijimi + AI
  MaterialReview.tsx   → rishikimi + publikimi
  ReadingWorkspace.tsx → leximi
  Quiz.tsx / Results.tsx
  services.ts          → logjika e shërbimeve
  localDb.ts           → ruajtja lokale
  openai.ts            → thirrjet te OpenAI
```

---

## English

### What this is

LexoLehtë AI is a school app. A teacher pastes a hard text (for example from a biology book), AI makes a simpler version, and the student reads it with support — vocabulary, explanations, quiz.

We built it because a lot of kids struggle with classroom texts, and teachers don’t have time to rewrite everything by hand for each student.

We also didn’t want a competitive leaderboard vibe. So in the UI we show **Stars** and **Titles** instead of raw “XP” / “badges”.

### Why it matters

- Many students find reading difficult
- One-size-fits-all materials leave some kids behind
- Teachers know this, but personalizing content takes too long

LexoLehtë tries to save that time. AI drafts the adaptation; the teacher still reviews and publishes.

### Who uses it

**Teacher**
- Creates a material (paste text or upload a file)
- Picks the class / students
- Chooses how simple the text should be and how many quiz questions
- Runs AI adaptation
- Checks the result, edits if needed, then publishes

**Student**
- Sees assignments on the dashboard
- Reads with accessibility options (font size, spacing, focus mode)
- Can select a sentence and ask for an explanation
- Takes the quiz
- Earns stars and titles

### How to demo it

1. Log in as teacher: `mesuesi@lexolehte.com` / `demo123`
2. Create material → paste text → Adapt with AI
3. Open review → Publish for students
4. Log out and log in as student: `nxenesi@lexolehte.com` / `demo123`
5. The new assignment should appear → read → quiz

This works in the same browser because data is stored in `localStorage` (no database yet).

### What’s included

- OpenAI adaptation (simplified text, summary, vocabulary, quiz, teacher notes)
- Publishing auto-creates assignments for the class
- Reading view with accessible fonts (Lexend, Atkinson)
- Quiz with hints and feedback
- Stars, levels, titles (including teacher-awarded ones)
- Basic class analytics
- Albanian UI, simple white + soft purple look

### Run it locally

You need Node.js 18+ and an OpenAI key.

```bash
git clone https://github.com/LedionRrahimi1/UnicefProject.git
cd UnicefProject
npm install
cp .env.example .env
```

Put this in `.env`:

```
VITE_OPENAI_API_KEY=sk-proj-...
```

Then:

```bash
npm run dev
```

Open http://localhost:5173

**Note:** `.env` is gitignored. Don’t commit your API key.

### Honest limitations

- No backend/DB yet → teacher and student need the same browser
- The “Listen” audio button doesn’t play real speech yet
- OpenAI key is in the frontend for the demo — production should move it to a server

### Next steps we want

- Backend + database
- Real text-to-speech
- PDF/Word upload
- Parent view
- Offline-friendly version for weak school internet

### Quick structure

```
src/app/
  MaterialCreate.tsx   → create + AI
  MaterialReview.tsx   → review + publish
  ReadingWorkspace.tsx → reading
  Quiz.tsx / Results.tsx
  services.ts          → app services
  localDb.ts           → local storage
  openai.ts            → OpenAI calls
```

---

## Stack

React, TypeScript, Vite, Tailwind, React Router, Recharts, Radix UI, Lucide, OpenAI (`gpt-4o-mini`).

## License

Projekt për hackathon / Unicef.  
Hackathon / Unicef demo project.
