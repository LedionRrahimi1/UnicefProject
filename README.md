# LexoLehtë AI (Unicef Project)

Platformë edukative për mësues dhe nxënës: adaptim materiali me AI, lexim, kuiz, yje dhe tituj.

## Setup

```bash
npm install
cp .env.example .env
```

Në `.env` vendos çelësin OpenAI:

```
VITE_OPENAI_API_KEY=sk-proj-your-key-here
```

```bash
npm run dev
```

Hap http://localhost:5173

## Llogari demo

- Mësuese: `mesuesi@lexolehte.com` / `demo123`
- Nxënës: `nxenesi@lexolehte.com` / `demo123`

## Shënim

Të dhënat ruhen lokalisht në browser (`localStorage`). Skedari `.env` nuk commit-ohet.
