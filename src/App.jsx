import { useMemo, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'
import { analyzeJD } from './engine.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const SAMPLE = `Senior Data Analyst
About the role
We're looking for a Senior Data Analyst to turn complex data into clear business recommendations. You will partner with product, engineering, and commercial teams to build trusted reporting and improve decision-making.
Responsibilities
• Design and maintain dashboards using SQL, Python, and Power BI.
• Analyze large datasets, identify trends, and communicate insights to stakeholders.
• Build reliable data pipelines and improve data quality.
• Collaborate with cross-functional teams and present findings to senior leadership.
• Develop and maintain data models and automated reports.
Requirements
• 4+ years of experience in data analytics or a similar role.
• Strong SQL skills and hands-on experience with Python and pandas.
• Experience with Power BI or Tableau and data visualization best practices.
• Knowledge of statistics, experimentation, and A/B testing.
• Excellent communication, analytical thinking, and problem-solving skills.
• Bachelor's degree in Computer Science, Statistics, Mathematics, or a related field.
Preferred qualifications
• Experience with cloud platforms such as AWS or Azure.
• Familiarity with dbt, Airflow, or modern data warehouses.
• Master's degree or relevant analytics certification is a plus.
Work location: Hybrid
Employment type: Full-time`

const TIER_LABEL = { ess: 'Essential', pref: 'Preferred', opt: 'Optional' }
const TIER_ORDER = ['ess', 'pref', 'opt']
const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 15 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6M10 10v6m4-6v6"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    chevron: <path d="m6 9 6 6 6-6"/>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  }
  return <svg {...common}>{paths[name] || paths.file}</svg>
}

function Chip({ skill }) {
  return <span className={`skill-chip ${skill.tier}`} title={`${TIER_LABEL[skill.tier]}${skill.count > 1 ? ` · mentioned ${skill.count} times` : ''}`}>
    {skill.name}{skill.count > 1 && <b>×{skill.count}</b>}
  </span>
}

function CategoryCard({ title, subtitle, list = [], type = 'skills' }) {
  return <article className="category-card">
    <div className="category-heading"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div><span className="count-badge">{list.length}</span></div>
    {list.length ? type === 'skills' ? <div className="chips">{list.map(s => <Chip key={s.name} skill={s} />)}</div> :
      <ul className="detail-list">{list.slice(0, 14).map((item, i) => <li key={`${item.text}-${i}`}><span>{item.kind}</span>{item.text}</li>)}</ul>
      : <p className="empty-state">Nothing detected in this category.</p>}
    {type !== 'skills' && list.length > 14 && <p className="muted small">+{list.length - 14} more in the annotated text</p>}
  </article>
}

function App() {
  const [text, setText] = useState(SAMPLE)
  const [result, setResult] = useState(() => analyzeJD(SAMPLE))
  const [filter, setFilter] = useState('all')
  const [showAll, setShowAll] = useState(false)
  const [status, setStatus] = useState('Example loaded — replace it with your own job description.')
  const [error, setError] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)
  const inputRef = useRef(null)

  const setMessage = (message, isError = false) => { setStatus(message); setError(isError) }

  const runAnalysis = (value = text) => {
    if (value.trim().length < 30) {
      setResult(null); setMessage('Paste or upload a job description with at least a few lines.', true); return
    }
    try {
      const next = analyzeJD(value)
      setResult(next); setFilter('all'); setShowAll(false); setMessage('Analysis complete.')
    } catch {
      setResult(null); setMessage('Something went wrong while analyzing this text.', true)
    }
  }

  const loadSample = () => { setText(SAMPLE); runAnalysis(SAMPLE); setMessage('Example loaded — replace it with your own job description.') }
  const clear = () => { setText(''); setResult(null); setFilter('all'); setMessage('Ready for a new job description.'); inputRef.current?.focus() }

  async function handleFile(file) {
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    setMessage(`Reading ${file.name}…`)
    try {
      let extracted = ''
      if (ext === 'txt') extracted = await file.text()
      else if (ext === 'pdf') {
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
        const pages = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          let line = '', lastY = null, prevEnd = null
          for (const item of content.items) {
            if (typeof item.str !== 'string') continue
            const x = item.transform[4], y = item.transform[5]
            if (lastY !== null && Math.abs(y - lastY) > 3) { pages.push(line); line = ''; prevEnd = null }
            if (line && prevEnd !== null && x - prevEnd > 1.5 && !/\s$/.test(line) && !/^\s/.test(item.str)) line += ' '
            line += item.str; lastY = y; prevEnd = x + (item.width || 0)
            if (item.hasEOL) { pages.push(line); line = ''; lastY = null; prevEnd = null }
          }
          if (line) pages.push(line)
          pages.push('')
        }
        extracted = pages.join('\n')
      } else if (ext === 'docx') {
        extracted = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value
      } else if (ext === 'doc') throw new Error('Old .doc files are not supported. Save as .docx or PDF and try again.')
      else throw new Error('Use a PDF, DOCX or TXT file.')
      extracted = extracted.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim()
      if (extracted.length < 30) throw new Error(`No readable text found in ${file.name}. Scanned PDFs are images, so paste the text instead.`)
      setText(extracted)
      runAnalysis(extracted)
      setMessage(`Extracted ${(extracted.match(/\S+/g) || []).length.toLocaleString()} words from ${file.name}.`)
    } catch (e) { setMessage(e.message || 'Could not read that file.', true) }
    if (fileRef.current) fileRef.current.value = ''
  }

  const rows = useMemo(() => (result?.skills || []).filter(skill => filter === 'all' || skill.tier === filter), [result, filter])
  const shownRows = showAll ? rows : rows.slice(0, 14)
  const maxCount = Math.max(1, ...(result?.skills || []).map(s => s.count))
  const tierCounts = result?.tiers || { ess: 0, pref: 0, opt: 0 }
  const totalSkills = result?.skills.length || 0
  const summary = result?.summary

  function annotatedText() {
    if (!result) return null
    const parts = []; let pos = 0
    result.mentions.forEach((m, i) => {
      if (m.start < pos) return
      if (m.start > pos) parts.push(result.text.slice(pos, m.start))
      parts.push(<mark key={`${m.start}-${i}`} className={m.tier} title={`${m.skill} · ${TIER_LABEL[m.tier]}`}>{result.text.slice(m.start, m.end)}</mark>)
      pos = m.end
    })
    parts.push(result.text.slice(pos))
    return parts
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={e => e.preventDefault()} aria-label="JD Lens home">
        <span className="brand-icon">JD<span>•</span></span>
        <span><strong>JD Lens</strong><small>Job description intelligence</small></span>
      </a>
      <div className="privacy-pill"><span className="privacy-dot" /><span>Private by design</span><span className="privacy-divider" />Runs in your browser</div>
    </header>

    <main className="page">
      <section className="welcome">
        <div className="eyebrow"><span className="eyebrow-line" /> JOB DESCRIPTION ANALYZER</div>
        <h1>Make every job description <span>clearer.</span></h1>
        <p>Understand what matters most in a role. Spot key skills, qualifications, and priorities in seconds.</p>
      </section>

      <div className="workspace">
        <aside className="input-panel panel">
          <div className="panel-heading"><span className="step-number">01</span><div><h2>Add a job description</h2><p>Upload a file or paste the text.</p></div></div>
          <button className={`dropzone ${dragging ? 'dragging' : ''}`} onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }}>
            <span className="upload-icon"><Icon name="upload" size={21} /></span>
            <strong>Drop your file here</strong><span>or <u>browse files</u></span>
            <small>PDF, DOCX or TXT · up to 20 MB</small>
          </button>
          <input ref={fileRef} className="visually-hidden" type="file" accept=".pdf,.docx,.txt,.doc" onChange={e => handleFile(e.target.files?.[0])} />
          <div className="or-divider"><span />OR PASTE TEXT<span /></div>
          <label className="field-label" htmlFor="jd-input">Job description</label>
          <textarea ref={inputRef} id="jd-input" value={text} onChange={e => { setText(e.target.value); if (e.target.value.trim().length >= 30) runAnalysis(e.target.value) }} placeholder="Paste the full job description here…" spellCheck="false" />
          <div className="input-footer"><span>{text.trim() ? text.trim().split(/\s+/).length.toLocaleString() : 0} words</span><button className="text-button" onClick={clear}><Icon name="trash" size={14} /> Clear</button></div>
          <div className="input-actions"><button className="primary-button" onClick={() => runAnalysis()}><Icon name="spark" size={16} /> Analyze job description</button><button className="secondary-button" onClick={loadSample}>Load example</button></div>
          <p className={`status-message ${error ? 'error' : ''}`} role="status"><span className="status-indicator" />{status}</p>
          <div className="privacy-note"><Icon name="shield" size={16} /><span><strong>Your content stays yours.</strong> Analysis happens in this browser. Your job description is not uploaded to a server.</span></div>
        </aside>

        <section className="results-column" aria-live="polite">
          {!result ? <div className="empty-results panel"><div className="empty-art"><Icon name="file" size={28} /></div><h2>Your insights will appear here</h2><p>Add a job description to see a clear summary, skill priorities, and requirements breakdown.</p><button className="secondary-button" onClick={loadSample}>Try the example <Icon name="arrow" size={15} /></button></div> : <>
            <section className="panel summary-panel">
              <div className="results-topline"><div><div className="section-kicker">ROLE OVERVIEW</div><h2>{summary.title}</h2>{summary.company && <p className="company-name">{summary.company}</p>}</div><span className="complete-badge"><Icon name="check" size={14} /> Analyzed</span></div>
              <div className="summary-grid">
                <div><span className="meta-label">Experience</span><strong>{summary.experience || 'Not stated'}</strong></div>
                <div><span className="meta-label">Education</span><strong>{summary.levels.length ? summary.levels.join(', ') : 'Not stated'}</strong></div>
                <div><span className="meta-label">Location / work mode</span><strong>{[summary.location, summary.workMode && !(new RegExp(summary.workMode, 'i')).test(summary.location || '') ? summary.workMode : ''].filter(Boolean).join(' · ') || 'Not stated'}</strong></div>
                <div><span className="meta-label">Employment type</span><strong>{summary.empTypes.length ? summary.empTypes.join(', ') : 'Not stated'}</strong></div>
              </div>
              <div className="skill-mix">
                <div className="mix-heading"><strong>Skills by importance</strong><span>{totalSkills} skills detected</span></div>
                <div className="stacked-bar" aria-label={`Essential ${tierCounts.ess}, preferred ${tierCounts.pref}, optional ${tierCounts.opt}`}>
                  {TIER_ORDER.map(t => <span key={t} className={t} style={{ width: `${totalSkills ? tierCounts[t] / totalSkills * 100 : 0}%` }} />)}
                </div>
                <div className="mix-legend">{TIER_ORDER.map(t => <span key={t}><i className={t} />{TIER_LABEL[t]} <b>{tierCounts[t]}</b></span>)}</div>
              </div>
              <div className="responsibilities"><div className="subheading">Key responsibilities</div>{summary.resp.length ? <ul>{summary.resp.slice(0, 5).map((r, i) => <li key={`${r}-${i}`}>{r}</li>)}</ul> : <p className="muted">No responsibilities section found.</p>}</div>
            </section>

            <section className="panel skill-panel">
              <div className="section-header"><div><div className="section-kicker">PRIORITIZATION</div><h2>Skill importance</h2></div><span className="subtle-count">{rows.length} shown</span></div>
              <p className="section-description">Priorities are inferred from wording such as “required”, “preferred”, and “a plus”, plus the section where each skill appears.</p>
              <div className="filter-row" role="group" aria-label="Filter skills by importance">
                {[['all','All skills'],['ess','Essential'],['pref','Preferred'],['opt','Optional']].map(([key,label]) => <button key={key} className={`filter-button ${filter === key ? 'active' : ''}`} aria-pressed={filter === key} onClick={() => { setFilter(key); setShowAll(false) }}>{label}{key === 'all' && <span>{totalSkills}</span>}</button>)}
              </div>
              {rows.length ? <div className="skill-rows">{shownRows.map(skill => <div className="skill-row" key={skill.name}>
                <div className="skill-name">{skill.name}{skill.emph > 0 && <small>Emphasized ×{skill.emph}</small>}</div>
                <div className="skill-bar"><span className={skill.tier} style={{ width: `${skill.count / maxCount * 100}%` }} /></div>
                <span className={`tier-pill ${skill.tier}`}>{TIER_LABEL[skill.tier]}</span><span className="mention-count">×{skill.count}</span>
              </div>)}</div> : <p className="empty-state">No skills in this group.</p>}
              {rows.length > 14 && <button className="show-more" onClick={() => setShowAll(v => !v)}>{showAll ? 'Show top 14' : `Show all ${rows.length} skills`} <Icon name="chevron" size={15} /></button>}
            </section>

            <section className="panel breakdown-panel">
              <div className="section-header"><div><div className="section-kicker">BREAKDOWN</div><h2>Requirements by category</h2></div><span className="subtle-count">5 categories</span></div>
              <div className="category-grid">
                <CategoryCard title="Technical skills" subtitle="Languages, frameworks and concepts" list={result.cats.tech} />
                <CategoryCard title="Tools & technologies" subtitle="Platforms, databases and software" list={result.cats.tools} />
                <CategoryCard title="Soft skills" subtitle="Collaboration and working style" list={result.cats.soft} />
                <CategoryCard title="Education & certifications" subtitle="Degrees and credentials mentioned" list={result.cats.edu} type="items" />
                <CategoryCard title="Experience & responsibilities" subtitle="Experience expectations and day-to-day work" list={result.cats.exp} type="items" />
              </div>
            </section>

            <section className="panel annotated-panel">
              <div className="section-header"><div><div className="section-kicker">SOURCE VIEW</div><h2>Annotated job description</h2></div><span className="subtle-count">Original text</span></div>
              <p className="section-description">Detected skills are highlighted in context. Hover a highlight to see its importance.</p>
              <div className="annotation-legend"><span><i className="ess" />Essential</span><span><i className="pref" />Preferred</span><span><i className="opt" />Optional</span></div>
              <div className="annotated-text">{annotatedText()}</div>
            </section>
          </>}
        </section>
      </div>
      <footer className="footer"><span>JD Lens</span><span>Clearer job descriptions. Better decisions.</span></footer>
    </main>
  </div>
}

export default App
