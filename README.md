# LexoLehtë AI

### Materiale mësimore që adaptohen për çdo nxënës  
### Learning materials that adapt for every student

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)](https://openai.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**Repo:** [github.com/LedionRrahimi1/UnicefProject](https://github.com/LedionRrahimi1/UnicefProject)

> Një platformë edukative e ndërtuar për të mbështetur fëmijët me vështirësi leximi — me fuqinë e AI, dizajn inkluziv dhe gamifikim pozitiv.  
> An educational platform built to support children with reading difficulties — powered by AI, inclusive design, and positive gamification.

---

## Table of contents / Përmbajtja

1. [Shqip — Dokumentacioni i plotë](#-shqip)
2. [English — Full documentation](#-english)
3. [Tech stack](#tech-stack--teknologjia)
4. [Project structure](#project-structure--struktura)
5. [License](#license--licenca)

---

# 🇦🇱 Shqip

## 1. Pitch (30 sekonda)

**LexoLehtë AI** është një platformë SaaS edukative ku mësuesja ngarkon një tekst të vështirë, AI e adapton për nivelin e nxënësit, dhe fëmija e lexon me mbështetje (fjalor, shpjegime, kuiz). Në vend të krahasimit negativ, fëmija fiton **Yje** dhe **Tituj** — motivim pozitiv, jo stres.

**Problemi që zgjidhim:** 1 në 5 nxënës has vështirësi me leximin. Materialet standarde shpesh janë tepër komplekse. Mësuesit nuk kanë kohë të krijojnë versione individuale për çdo fëmijë.

**Zgjidhja jonë:** AI + workflow mësues–nxënës + aksesueshmëri + gamifikim i butë.

---

## 2. Pse kjo ka rëndësi (Unicef / arsim inkluziv)

| Sfida | Si ndihmon LexoLehtë |
|--------|----------------------|
| Vështirësi leximi / dyslexia | Tekst i thjeshtësuar, fontë të lexueshëm, hapësira të rregullueshme |
| Mungesë kohe e mësuesve | Adaptim automatik me AI në minuta, jo orë |
| Motivim i ulët | Yje, nivele dhe tituj — pa krahasim publik mes nxënësve |
| Barazia në klasë | I njëjti përmbajtje, nivele të ndryshme të thjeshtësimit |
| Gjuhë shqipe | UI dhe përmbajtja e AI janë në shqip |

Ky projekt mbështet ideali e **arsimit cilësor dhe inkluziv** (SDG 4) dhe të drejtën e fëmijës për të mësuar me ritmin e vet.

---

## 3. Përdoruesit

### Mësuesja
- Krijon / ngarkon material mësimor
- Zgjedh audiencën (klasë ose nxënës specifikë)
- Vendos nivelin e thjeshtësimit, gjatësinë, numrin e pyetjeve
- AI gjeneron: tekst të thjeshtësuar, përmbledhje, pika kryesore, fjalor, kuiz, shënime
- Rishikon, editon, aprovon dhe **publikon**
- Shikon analytics, jep yje dhe tituj manualisht

### Nxënësi
- Sheh detyrat e publikuara në panel
- Lexon me toolbar aksesueshmërie (madhësi teksti, hapësirë, focus mode)
- Zgjedh tekst dhe kërkon shpjegim nga AI
- Bën kuiz me ndihmë (hint) dhe feedback
- Fiton **Yje**, ngjitet në nivele, mbledh **Tituj**

---

## 4. Fluksi i produktit (demo për jurinë)

```
1. Login si Mësuese (mesuesi@lexolehte.com)
2. Krijo material → ngjit tekst → zgjidh klasën
3. Vendos adaptimin → "Adapto me AI"
4. Rishiko rezultatin → Publiko për nxënësit
5. Logout → Login si Nxënës (nxenesi@lexolehte.com)
6. Paneli tregon detyrën e re → Fillo leximin → Kuiz → Yje
```

**Koha e demos:** ~3–5 minuta.

---

## 5. Funksionalitetet në detaje

### 5.1 Adaptimi me AI
- Model: **OpenAI GPT-4o-mini**
- Gjeneron JSON të strukturuar: tekst, summary, key points, vocabulary, quiz, teacher notes
- Nivele thjeshtësimi: i lehtë / mesatar / i avancuar
- Kontroll i plotë nga mësuesja para publikimit (human-in-the-loop)

### 5.2 Publikimi → Detyrat
Kur mësuesja publikon:
1. Materiali kalon në status `published`
2. Sistemi krijon automatikisht **Assignment** për çdo nxënës të klasës
3. Nxënësi e sheh menjëherë në panel (në të njëjtin browser)

### 5.3 Hapësira e leximit
- Madhësi fontesh, hapësirë rreshtash
- Fontë të përshtatshëm (Lexend, Atkinson Hyperlegible)
- Focus mode (një paragraf në qendër)
- Shpjegim AI për tekstin e zgjedhur
- Fjalor i vështirë me përkufizime dhe shembuj

### 5.4 Kuizi & rezultatet
- Pyetje: multiple choice, po/jo, përgjigje e shkurtër, ideja kryesore
- Hint + feedback pedagogjik
- Llogaritje rezultati + shpërblim Yje
- Ekran rezultatesh me “çfarë kuptove mirë” / “çfarë të rilexosh”

### 5.5 Gamifikimi pozitiv
| Koncepti teknik | Emri në UI |
|-----------------|------------|
| XP             | **Yje**    |
| Badges         | **Tituj**  |

- Progres niveli, histori yjesh
- Tituj automatikë + tituj të dhuruar nga mësuesja
- Pa leaderboard publik (shmang krahasimin e dëmshëm)

### 5.6 Analytics për mësuesen
- Përqindje përfundimi, rezultat mesatar
- Përdorim audio / fjalë të shpjeguara
- Nxënës që mund të kenë nevojë për mbështetje

### 5.7 Dizajni
- Estetikë premium SaaS: e bardhë, gri e lehtë, theks indigo/lavender (`#6D5EF5`)
- UI e qetë, e pastër, e aksesueshme
- Gjithë përmbajtja e dukshme në **shqip**

---

## 6. Arkitektura (si funksionon)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   React UI  │────▶│  services.ts     │────▶│ localStorage│
│  (Vite)     │     │  (API layer)     │     │  (pa DB)    │
└─────────────┘     └────────┬─────────┘     └─────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  OpenAI API      │
                    │  (adapt / explain)│
                    └──────────────────┘
```

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Shtresa e shërbimeve:** `auth`, `materials`, `assignments`, `ai`, `gamification`, `analytics`
- **Persistenca:** `localDb.ts` (localStorage) — demo pa backend
- **AI:** `openai.ts` — thirrje direkte me `VITE_OPENAI_API_KEY`

> Për prodhim: OpenAI key duhet të jetë vetëm në backend; localStorage zëvendësohet me API + databazë.

---

## 7. Instalimi dhe nisja

### Kërkesat
- Node.js 18+
- npm
- Çelës OpenAI (https://platform.openai.com/api-keys)

### Hapat

```bash
git clone https://github.com/LedionRrahimi1/UnicefProject.git
cd UnicefProject
npm install
cp .env.example .env
```

Në `.env`:

```env
VITE_OPENAI_API_KEY=sk-proj-your-key-here
```

```bash
npm run dev
```

Aplikohet zakonisht në `http://localhost:5173`

### Llogari demo

| Roli    | Email                   | Fjalëkalimi |
|---------|-------------------------|-------------|
| Mësuese | mesuesi@lexolehte.com   | demo123     |
| Nxënës  | nxenesi@lexolehte.com   | demo123     |

---

## 8. Skripti i demos (për hackathon)

1. **Landing** — trego problemin dhe CTA  
2. **Login mësuese** — panel + “Krijo material”  
3. **Ngjit tekst** (p.sh. paragraf biologjie) → Adaptim mesatar → AI  
4. **Review** — trego tekstin e thjeshtësuar, fjalorin, kuizin  
5. **Publiko** — toast: “X nxënës e kanë si detyrë”  
6. **Login nxënës** — detyra e re në panel  
7. **Lexim** — focus mode + shpjegim AI për një fjali  
8. **Kuiz** — përfundo → Yje → Tituj  

**Mesazhi mbyllës:** “I njëjti material. Ritme të ndryshme. Çdo fëmijë mund të mësojë.”

---

## 9. Impakti i pritur

- Mësuesit kursejnë orë përgatitjeje
- Nxënësit me vështirësi leximi marrin material të përshtatur
- Motivim pozitiv pa stigmatizim
- Bazë e gatshme për shkallëzim në shkolla (me backend)

---

## 10. Roadmap (hapat e ardhshëm)

- [ ] Backend + databazë (multi-device, multi-school)
- [ ] OpenAI key vetëm në server
- [ ] Audio TTS reale (Web Speech / OpenAI TTS)
- [ ] Upload PDF/DOCX → ekstraktim teksti
- [ ] Dashboard prindërish
- [ ] Multilingual (EN/SQ) për UI
- [ ] Offline / PWA për shkolla me internet të dobët

---

# 🇬🇧 English

## 1. Elevator pitch (30 seconds)

**LexoLehtë AI** is an educational SaaS where a teacher uploads a difficult text, AI adapts it to the student’s level, and the child reads with support (vocabulary, explanations, quiz). Instead of negative comparison, children earn **Stars** and **Titles** — positive motivation, not stress.

**Problem:** About 1 in 5 students struggle with reading. Standard materials are often too complex. Teachers lack time to create individualized versions for every child.

**Our solution:** AI + teacher–student workflow + accessibility + gentle gamification.

---

## 2. Why it matters (Unicef / inclusive education)

| Challenge | How LexoLehtë helps |
|-----------|---------------------|
| Reading difficulties / dyslexia | Simplified text, readable fonts, adjustable spacing |
| Teacher time shortage | AI adaptation in minutes, not hours |
| Low motivation | Stars, levels, titles — no public ranking |
| Equity in class | Same content, different simplification levels |
| Albanian language | UI and AI output in Albanian |

Aligned with **Quality Education (SDG 4)** and every child’s right to learn at their own pace.

---

## 3. Users

### Teacher
- Create / paste learning material
- Choose audience (class or specific students)
- Set simplification level, length, number of questions
- AI generates: simplified text, summary, key points, vocabulary, quiz, teacher notes
- Review, edit, approve and **publish**
- View analytics; award stars and titles manually

### Student
- See published assignments on the dashboard
- Read with accessibility toolbar (font size, spacing, focus mode)
- Select text and ask AI for an explanation
- Take quizzes with hints and pedagogical feedback
- Earn **Stars**, level up, collect **Titles**

---

## 4. Product flow (demo for judges)

```
1. Log in as Teacher (mesuesi@lexolehte.com)
2. Create material → paste text → select class
3. Configure adaptation → "Adapt with AI"
4. Review output → Publish for students
5. Log out → Log in as Student (nxenesi@lexolehte.com)
6. Dashboard shows the new assignment → Read → Quiz → Stars
```

**Demo time:** ~3–5 minutes.

---

## 5. Features in detail

### 5.1 AI adaptation
- Model: **OpenAI GPT-4o-mini**
- Structured JSON output: text, summary, key points, vocabulary, quiz, teacher notes
- Simplification levels: light / medium / advanced
- Full teacher control before publishing (human-in-the-loop)

### 5.2 Publish → Assignments
When the teacher publishes:
1. Material status becomes `published`
2. The system auto-creates an **Assignment** for every student in the class
3. The student sees it immediately on the dashboard (same browser)

### 5.3 Reading workspace
- Font size and line spacing controls
- Accessible fonts (Lexend, Atkinson Hyperlegible)
- Focus mode (one paragraph at a time)
- AI explanation for selected text
- Difficult vocabulary with definitions and examples

### 5.4 Quiz & results
- Question types: multiple choice, yes/no, short answer, main idea
- Hints + pedagogical feedback
- Score calculation + Star rewards
- Results screen: “what you understood” / “what to reread”

### 5.5 Positive gamification
| Technical concept | UI label |
|-------------------|----------|
| XP                | **Stars** |
| Badges            | **Titles** |

- Level progress, star history
- Automatic titles + teacher-awarded titles
- No public leaderboard (avoids harmful comparison)

### 5.6 Teacher analytics
- Completion rate, average score
- Audio usage / words explained
- Students who may need support

### 5.7 Design
- Premium SaaS look: white, light gray, soft indigo/lavender accent (`#6D5EF5`)
- Calm, clean, accessible UI
- All user-facing content in **Albanian**

---

## 6. Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   React UI  │────▶│  services.ts     │────▶│ localStorage│
│  (Vite)     │     │  (API layer)     │     │  (no DB)    │
└─────────────┘     └────────┬─────────┘     └─────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  OpenAI API      │
                    │  (adapt / explain)│
                    └──────────────────┘
```

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Service layer:** `auth`, `materials`, `assignments`, `ai`, `gamification`, `analytics`
- **Persistence:** `localDb.ts` (localStorage) — demo without a backend
- **AI:** `openai.ts` — calls with `VITE_OPENAI_API_KEY`

> For production: keep the OpenAI key on the server only; replace localStorage with API + database.

---

## 7. Installation & run

### Requirements
- Node.js 18+
- npm
- OpenAI API key (https://platform.openai.com/api-keys)

### Steps

```bash
git clone https://github.com/LedionRrahimi1/UnicefProject.git
cd UnicefProject
npm install
cp .env.example .env
```

In `.env`:

```env
VITE_OPENAI_API_KEY=sk-proj-your-key-here
```

```bash
npm run dev
```

Usually available at `http://localhost:5173`

### Demo accounts

| Role    | Email                   | Password |
|---------|-------------------------|----------|
| Teacher | mesuesi@lexolehte.com   | demo123  |
| Student | nxenesi@lexolehte.com   | demo123  |

---

## 8. Hackathon demo script

1. **Landing** — show the problem and CTA  
2. **Teacher login** — dashboard + “Create material”  
3. **Paste text** (e.g. a biology paragraph) → Medium adaptation → AI  
4. **Review** — show simplified text, vocabulary, quiz  
5. **Publish** — toast: “X students now have this as an assignment”  
6. **Student login** — new assignment on dashboard  
7. **Reading** — focus mode + AI explanation for a sentence  
8. **Quiz** — finish → Stars → Titles  

**Closing line:** “Same material. Different pace. Every child can learn.”

---

## 9. Expected impact

- Teachers save preparation hours
- Students with reading difficulties get adapted materials
- Positive motivation without stigma
- Ready foundation to scale to schools (with a backend)

---

## 10. Roadmap

- [ ] Backend + database (multi-device, multi-school)
- [ ] OpenAI key only on the server
- [ ] Real TTS audio (Web Speech / OpenAI TTS)
- [ ] PDF/DOCX upload → text extraction
- [ ] Parent dashboard
- [ ] Multilingual UI (EN/SQ)
- [ ] Offline / PWA for schools with weak internet

---

# Tech stack / Teknologjia

| Layer | Technology |
|-------|------------|
| UI | React 18, TypeScript, Vite 6 |
| Styling | Tailwind CSS 4, custom design tokens |
| Routing | React Router 7 |
| Charts | Recharts |
| UI primitives | Radix UI |
| AI | OpenAI Chat Completions (`gpt-4o-mini`) |
| Local data | `localStorage` via `localDb.ts` |
| Icons | Lucide React |

---

# Project structure / Struktura

```
src/
  app/
    Landing.tsx, Login.tsx
    Teacher*.tsx          # teacher flows
    Student*.tsx          # student flows
    MaterialCreate.tsx    # AI adaptation wizard
    MaterialReview.tsx    # review & publish
    ReadingWorkspace.tsx  # accessible reading
    Quiz.tsx, Results.tsx
    services.ts           # service / API layer
    localDb.ts            # localStorage persistence
    openai.ts             # OpenAI integration
    mockData.ts, types.ts, store.tsx
  styles/                 # theme + Tailwind
```

---

# What makes this hackathon-ready / Pse jemi gati për fitore

1. **Problem real** — reading inclusion, teacher workload  
2. **Demo e plotë** — teacher → AI → publish → student → quiz → rewards  
3. **AI e integruar** — jo vetëm mock, por OpenAI reale  
4. **Dizajn premium** — i qetë, modern, i besueshëm për edukim  
5. **Gamifikim etik** — yje/tituj pa krahasim të dëmshëm  
6. **Dokumentacion i qartë** — setup, demo script, roadmap  
7. **Shqip + English** — i kuptueshëm për jurinë lokale dhe ndërkombëtare  

---

# License / Licenca

Projekt demonstrues për hackathon / Unicef.  
Demo project for hackathon / Unicef.

---

**LexoLehtë AI** — *Çdo fëmijë meriton një tekst që e kupton.*  
**LexoLehtë AI** — *Every child deserves a text they can understand.*
