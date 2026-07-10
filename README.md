# LexoLehtë AI (Unicef Project)

Platformë edukative për mësues dhe nxënës — adaptim materiali me AI, lexim i aksesueshëm, kuiz, yje dhe tituj.

Educational platform for teachers and students — AI material adaptation, accessible reading, quizzes, stars and titles.

---

## 🇦🇱 Shqip

### Përshkrim

**LexoLehtë AI** ndihmon mësuesit të thjeshtësojnë dhe adaptojnë materialet mësimore për nxënësit që kanë vështirësi me leximin. Nxënësit lexojnë, dëgjojnë, bëjnë kuiz dhe fitojnë **Yje** e **Tituj**.

### Si ta nisësh

```bash
npm install
cp .env.example .env
```

Në skedarin `.env` vendos çelësin OpenAI:

```
VITE_OPENAI_API_KEY=sk-proj-your-key-here
```

```bash
npm run dev
```

Hap: [http://localhost:5173](http://localhost:5173)

### Llogari demo

| Roli    | Email                     | Fjalëkalimi |
|---------|---------------------------|-------------|
| Mësuese | `mesuesi@lexolehte.com`   | `demo123`   |
| Nxënës  | `nxenesi@lexolehte.com`   | `demo123`   |

### Funksionalitetet kryesore

- **Mësuesja:** krijon material, adapton me AI, rishikon dhe publikon për klasën
- **Nxënësi:** sheh detyrat, lexon, bën kuiz, fiton yje dhe tituj
- **AI:** thjeshtësim teksti, përmbledhje, fjalor, kuiz, shpjegime
- **Ruajtja:** të dhënat ruhen lokalisht në browser (`localStorage`) — pa databazë

### Shënime

- Skedari `.env` **nuk** commit-ohet (përmban sekretet)
- Publikimi i materialit krijon detyra për nxënësit e klasës në të **njëjtin browser**
- Për dy pajisje të ndryshme nevojitet backend + databazë

---

## 🇬🇧 English

### Description

**LexoLehtë AI** helps teachers simplify and adapt learning materials for students who struggle with reading. Students read, listen, take quizzes, and earn **Stars** and **Titles**.

### Getting started

```bash
npm install
cp .env.example .env
```

Add your OpenAI API key in `.env`:

```
VITE_OPENAI_API_KEY=sk-proj-your-key-here
```

```bash
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

### Demo accounts

| Role    | Email                     | Password  |
|---------|---------------------------|-----------|
| Teacher | `mesuesi@lexolehte.com`   | `demo123` |
| Student | `nxenesi@lexolehte.com`   | `demo123` |

### Main features

- **Teacher:** create materials, adapt with AI, review and publish to the class
- **Student:** view assignments, read, take quizzes, earn stars and titles
- **AI:** text simplification, summary, vocabulary, quiz, explanations
- **Storage:** data is stored locally in the browser (`localStorage`) — no database

### Notes

- The `.env` file is **not** committed (it contains secrets)
- Publishing a material creates assignments for class students in the **same browser**
- For different devices, a backend + database is required

---

## Tech stack / Teknologjia

- React + Vite + TypeScript
- Tailwind CSS
- OpenAI API (`gpt-4o-mini`)
- React Router

## License / Licenca

Projekt demonstrues për Unicef / Demo project for Unicef.
