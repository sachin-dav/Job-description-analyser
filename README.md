# JD Lens — React project

A React + Vite frontend for the JD Lens job-description analysis tool. The original analysis engine has been retained and separated into `src/engine.js`; the interface is implemented in React components.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Production build
```bash
npm run build
npm run preview
```

## Project structure
```text
jd-lens-react/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx       # React entry point
    ├── App.jsx        # Interface and file/text workflows
    ├── styles.css     # Responsive visual design
    └── engine.js      # Job description analysis rules
```

## Features retained
- Paste text, edit it, clear it, load the sample job description, and analyze.
- Upload PDF, DOCX, and TXT files; drag and drop is supported.
- Role summary, experience/education/location/employment metadata, and responsibilities.
- Skill detection and essential/preferred/optional importance tiers.
- Importance filters, show-all toggle, category breakdown, and annotated source text.

## Notes
- Analysis runs in the browser; there is no application backend.
- PDF/DOCX parsing uses `pdfjs-dist` and `mammoth`.
- The engine is heuristic/rule-based, so detected skills and importance should be treated as helpful estimates rather than definitive judgments.
