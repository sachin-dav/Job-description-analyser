/* JD Lens analysis engine — preserved from the original application. */
// Skill dictionary: [name, category, ...patterns]. A leading "=" makes a pattern case-sensitive.
// Categories: T technical skills, L tools and technologies, S soft skills.
const SKILLS = [
 ["Python","T","python"],["Java","T","java"],["JavaScript","T","javascript|ecmascript","=JS"],["TypeScript","T","typescript"],
 ["C++","T","c\\+\\+"],["C#","T","c#"],["SQL","T","sql"],["NoSQL","T","nosql"],["R","T","r programming|r language|rstudio"],
 ["Go","T","golang"],["Rust","T","=Rust"],["Scala","T","scala"],["Kotlin","T","kotlin"],["Swift","T","=Swift"],["PHP","T","php"],
 ["Ruby","T","=Ruby","ruby on rails"],["Shell Scripting","T","bash|shell scripting|shell scripts?|powershell"],
 ["HTML/CSS","T","html5?|css3?"],
 ["React","T","=React(?:\\.?js)?(?!\\s+Native)|reactjs"],["React Native","T","react native"],["Angular","T","angular(?:js)?"],
 ["Vue.js","T","vue(?:\\.?js)?"],["Next.js","T","next\\.?js"],["Node.js","T","node\\.?js"],["Django","T","django"],["Flask","T","=Flask"],
 ["FastAPI","T","fastapi"],["Spring Boot","T","spring boot|spring framework"],[".NET","T","\\.net(?: core)?|dotnet|asp\\.net"],
 ["Machine Learning","T","machine learning","=ML"],["Deep Learning","T","deep learning|neural networks?"],["NLP","T","nlp|natural language processing"],
 ["Computer Vision","T","computer vision"],["Generative AI","T","generative ai|gen ?ai|llms?|large language models?"],
 ["Artificial Intelligence","T","artificial intelligence","=AI"],
 ["TensorFlow","T","tensorflow"],["PyTorch","T","pytorch"],["scikit-learn","T","scikit[- ]learn|sklearn"],["Pandas","T","pandas"],["NumPy","T","numpy"],
 ["Data Analysis","T","data analy(?:sis|tics|ze)"],["Data Modeling","T","data model(?:l)?ing"],["Data Visualization","T","data visuali[sz]ation|dashboards?"],
 ["Statistics","T","statistic(?:s|al)(?: analysis| modeling)?"],["ETL / Data Pipelines","T","etl|elt|data pipelines?|pipelines?"],
 ["Data Structures & Algorithms","T","data structures?|algorithms?"],
 ["REST APIs","T","rest(?:ful)? apis?|rest(?:ful)? services|restful"],["GraphQL","T","graphql"],["Microservices","T","microservices?"],
 ["System Design","T","system design|distributed systems?"],["OOP","T","oop|object[- ]oriented"],
 ["Testing","T","unit test(?:ing|s)?|integration test(?:ing|s)?|test[- ]driven|tdd|test automation|qa"],
 ["CI/CD","T","ci\\s?\\/\\s?cd|continuous integration|continuous delivery|continuous deployment"],["DevOps","T","devops"],
 ["Agile/Scrum","T","agile|scrum|kanban"],["Cloud Computing","T","cloud computing|cloud[- ]native|cloud infrastructure"],
 ["Cybersecurity","T","cyber ?security|information security|application security|secure coding"],
 ["Mobile Development","T","android|ios|mobile (?:app )?development"],["Web Development","T","web development|full[- ]?stack|front[- ]?end|back[- ]?end"],
 ["Database Design","T","database design|database management|rdbms|relational databases?"],["A/B Testing","T","a\\/b test(?:ing|s)?|experimentation"],
 ["Version Control","T","version control"],["Monitoring & Observability","T","monitoring|observability"],
 ["AWS","L","aws|amazon web services"],["Azure","L","azure"],["GCP","L","gcp|google cloud(?: platform)?"],["Docker","L","docker"],
 ["Kubernetes","L","kubernetes|k8s"],["Terraform","L","terraform"],["Ansible","L","ansible"],["Jenkins","L","jenkins"],
 ["GitHub Actions","L","github actions"],["Git","L","git"],["GitHub","L","github"],["GitLab","L","gitlab"],["Jira","L","jira"],["Confluence","L","confluence"],
 ["Linux","L","linux|unix"],["PostgreSQL","L","postgres(?:ql)?"],["MySQL","L","mysql"],["SQL Server","L","sql server|mssql"],["MongoDB","L","mongo(?:db)?"],
 ["Redis","L","redis"],["DynamoDB","L","dynamodb"],["Elasticsearch","L","elasticsearch|elastic stack"],["Kafka","L","kafka"],["RabbitMQ","L","rabbitmq"],
 ["Spark","L","=Spark","pyspark|apache spark"],["Hadoop","L","hadoop"],["Airflow","L","airflow"],["Snowflake","L","snowflake"],["BigQuery","L","bigquery"],
 ["Redshift","L","redshift"],["Databricks","L","databricks"],["dbt","L","=dbt"],["Tableau","L","tableau"],["Power BI","L","power ?bi"],
 ["Excel","L","(?:microsoft |ms )?excel"],["Microsoft Office","L","ms office|microsoft office|office 365"],["Looker","L","looker"],["Postman","L","postman"],
 ["Figma","L","figma"],["Salesforce","L","salesforce"],["SAP","L","=SAP"],["Splunk","L","splunk"],["Datadog","L","datadog"],["Grafana","L","grafana"],
 ["Prometheus","L","prometheus"],["Selenium","L","selenium"],["Cypress","L","=Cypress"],["Jupyter","L","jupyter"],["Nginx","L","nginx"],
 ["Communication","S","communicat(?:ion|e|or)s?|verbal"],
 ["Teamwork","S","team ?work|team players?|collaborat(?:e|es|ion|ive|ing|ively)|cross[- ]functional|work(?:ing)? (?:well )?(?:in|as part of) an? team"],
 ["Leadership","S","leadership|team lead(?:ership)?|lead(?:ing)? (?:a )?teams?|people management"],
 ["Problem Solving","S","problem[- ]solving|solve (?:complex )?problems|troubleshoot(?:ing)?"],
 ["Analytical Thinking","S","analytical|critical thinking"],
 ["Time Management","S","time management|prioriti[sz](?:e|ation)|meet(?:ing)? deadlines"],
 ["Adaptability","S","adaptab(?:le|ility)|flexib(?:le|ility)|fast[- ]paced|ambiguity"],
 ["Attention to Detail","S","attention to detail|detail[- ]oriented"],
 ["Ownership","S","ownership|self[- ]motivated|self[- ]starter|proactive|take initiative"],
 ["Mentoring","S","mentor(?:ing|ship)?|coach(?:ing)?"],["Stakeholder Management","S","stakeholders?"],
 ["Presentation Skills","S","presentation skills|presenting"],["Creativity","S","creativ(?:e|ity)|innovati(?:ve|on)"],
 ["Decision Making","S","decision[- ]making"],["Interpersonal Skills","S","interpersonal"],
 ["Customer Focus","S","customer[- ](?:focus(?:ed)?|centric|obsession)|client[- ]facing"],["Negotiation","S","negotiat(?:e|ion|ing)"],
 ["Project Management","S","project management|program management"],["Curiosity","S","curious|curiosity|eager to learn|willingness to learn|quick learner|continuous learning"]
].map(([name,cat,...pats])=>({name,cat,res:pats.map(p=>{
  const cs=p.startsWith("="); const src=cs?p.slice(1):p;
  return new RegExp("(?<![A-Za-z0-9+#])(?:"+src+")(?![A-Za-z0-9+#]|\\.[A-Za-z0-9])", cs?"g":"gi");
})}));

const CUES=[
 [/\b(?:nice[- ]to[- ]have|bonus(?: points)?|an? (?:big |strong )?plus|good[- ]to[- ]have|optional|not (?:required|essential|mandatory)|added advantage|an advantage|is an asset|exposure to|familiarity with|awareness of|basic (?:knowledge|understanding) of)\b/gi,"opt"],
 [/\b(?:preferred|preferably|desired|desirable|ideally|beneficial|highly valued|would be great|we(?:'d| would) love|working knowledge)\b/gi,"pref"],
 [/\b(?:required|requires?|must|mandatory|essential|minimum|should have|need(?:s|ed)? to|necessary|critical|non[- ]negotiable)\b/gi,"ess"]
];
const EMPH=/\b(?:strong|solid|extensive|proven|hands[- ]on|deep|in[- ]depth|proficien(?:t|cy)|expert(?:ise)?|excellent|exceptional|advanced|demonstrated|outstanding)\b/gi;
const SECTION_TIER={resp:"ess",req:"ess",none:"ess",pref:"pref"};
const RANK={opt:1,pref:2,ess:3};

const PREF_X=/^(?:preferred|desired|desirable|additional|bonus|nice[- ]to[- ]haves?|good[- ]to[- ]haves?|pluses|extra credit)(?:\s+(?:qualifications?|skills|experience|requirements?|points))?$|^(?:it.?s|would be) a plus$|^bonus points$/i;
const RESP_X=/^(?:(?:key|main|core|primary|your)\s+)?(?:responsibilit(?:y|ies)|duties|tasks|accountabilities)(?:\s+(?:include|and\s+\w+))?$|^what you.?ll do$|^what you will do$|^the role$|^role overview$|^about the (?:role|job|position)$|^job (?:summary|overview|description)$|^your (?:role|impact|mission)$|^day[- ]to[- ]day$/i;
const REQ_X=/^(?:(?:key|minimum|basic|required|essential|technical|mandatory|core)\s+)*(?:requirements?|required|qualifications?|skills?|experience|education|competenc(?:y|ies))(?:\s*(?:and|&|\/)\s*(?:requirements?|qualifications?|skills?|experience|education))?$|^what you.?ll need$|^what you will need$|^what we.?re looking for$|^what we are looking for$|^who you are$|^about you$|^you have$|^you bring$|^your profile$|^must[- ]haves?$|^tech(?:nical)? stack$/i;
const SKIP_X=/^(?:about (?:us|the company|the team|[\w .&-]{2,30})|who we are|company overview|benefits(?: (?:and|&) perks)?|perks(?: (?:and|&) benefits)?|what we offer|why join(?: us)?|why [\w ]{2,25}|compensation(?: (?:and|&) benefits)?|equal opportunity(?: employer)?|diversity.*|how to apply|our (?:mission|values|story|culture))$/i;
function headerKind(l){l=l.trim();if(PREF_X.test(l))return"pref";if(RESP_X.test(l))return"resp";if(REQ_X.test(l))return"req";if(SKIP_X.test(l))return"skip";return null;}

const BULLET=/^\s*(?:[•●▪■◦‣⁃·►➢✓✔*\-–—]|\d{1,2}[.)])\s+/;
const YRS=/(\d{1,2})\s*(\+|plus)?\s*(?:(?:-|–|—|to)\s*(\d{1,2})\s*(\+)?)?\s*(?:years?|yrs?)\b/i;
const DEG_WORDS=/\b(?:bachelor|master'?s|masters|degree|diploma|ph\.?\s?d|doctorate|mba|postgraduate|undergraduate|b\.?\s?sc|m\.?\s?sc)\b/i;
const DEG_ACR=/\b(?:B\.?Tech|B\.E\.?|BE\s*\/\s*B\.?Tech|BCA|BS|B\.S\.?|M\.?Tech|M\.E\.?|MCA|M\.S\.?)(?![A-Za-z])/;
const CERT=/\b(?:certified|certification|certificate|PMP|CISSP|CISA|CFA|CPA|CCNA|CKA|Six Sigma|Scrum Master|PRINCE2|ITIL)\b/i;
const ACTION=/^(?:design|build|develop|implement|lead|manage|own|maintain|create|collaborate|work|drive|deliver|write|optimi[sz]e|improve|mentor|analy[sz]e|monitor|ensure|support|partner|define|review|architect|deploy|test|troubleshoot|coordinate|plan|identify|contribute|participate|provide|establish|research|prepare)\b/i;

function normalize(t){return String(t||"").replace(/\r/g,"").replace(/[ \t]/g," ").replace(/­/g,"").replace(/[ ]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();}
const clip=(s,n)=>{s=s.replace(/\s+/g," ").trim();return s.length>n?s.slice(0,n-1).trimEnd()+"…":s;};
const cleanItem=s=>clip(s.replace(BULLET,"").replace(/[*_`#]/g,"").replace(/[.;]\s*$/,""),220);

function degreeLevels(s){
  const out=[];
  if(/bachelor|undergraduate|b\.?\s?sc\b/i.test(s)||/\b(?:B\.?Tech|B\.E\.?|BCA|BS|B\.S\.?)(?![A-Za-z])/.test(s))out.push("Bachelor's");
  if(/master|m\.?\s?sc\b|mba\b|postgraduate/i.test(s)||/\b(?:M\.?Tech|M\.E\.?|MCA|M\.S\.?)(?![A-Za-z])/.test(s))out.push("Master's");
  if(/ph\.?\s?d|doctorate|doctoral/i.test(s))out.push("PhD");
  if(/diploma/i.test(s))out.push("Diploma");
  if(!out.length&&/\bdegree\b/i.test(s))out.push("Degree");
  return out;
}

function analyzeJD(raw){
  const text=normalize(raw);
  const units=[], recs=[];
  let off=0, section="none";
  for(const line of text.split("\n")){
    const lineOff=off; off+=line.length+1;
    if(!line.trim())continue;
    const bm=line.match(BULLET);
    const start=bm?bm[0].length:line.length-line.trimStart().length;
    const end=line.trimEnd().length;
    if(end<=start)continue;
    const body=line.slice(start,end);
    const label=body.replace(/^#+\s*/,"").replace(/[*_`]/g,"").trim();
    let cs=start, kind=null;
    const cm=label.match(/^([^:]{2,70}?)\s*:\s*(.*)$/);
    if(cm&&cm[1].split(/\s+/).length<=8&&(kind=headerKind(cm[1]))){
      section=kind;
      if(!cm[2])continue;
      const idx=body.lastIndexOf(cm[2]); cs=start+(idx>=0?idx:0);
    }else if(!bm&&label.split(/\s+/).length<=6&&(kind=headerKind(label))){section=kind;continue;}
    const seg=line.slice(cs,end);
    recs.push({text:seg,section,bullet:!!bm});
    const re=/[.!?;](?=\s|$)/g; let last=0,m; const parts=[];
    while((m=re.exec(seg))){parts.push([last,m.index+1]);last=m.index+1;}
    if(last<seg.length)parts.push([last,seg.length]);
    for(const [a,b] of parts){const t=seg.slice(a,b); if(t.trim())units.push({text:t,start:lineOff+cs+a,section,bullet:!!bm});}
  }

  // --- skill mentions with importance by nearest wording cue, falling back to the section ---
  let mentions=[];
  for(const u of units){
    if(u.section==="skip")continue;
    const cues=[];
    for(const [re,tier] of CUES)for(const m of u.text.matchAll(re))cues.push({i:m.index+m[0].length/2,tier});
    for(const sk of SKILLS)for(const re of sk.res){
      re.lastIndex=0; let m;
      while((m=re.exec(u.text))){
        const s=m.index,e=s+m[0].length;
        let tier=SECTION_TIER[u.section]||"ess",best=Infinity;
        for(const c of cues){const d=Math.abs(c.i-(s+e)/2);if(d<best){best=d;tier=c.tier;}}
        const win=u.text.slice(Math.max(0,s-45),s)+" "+u.text.slice(e,e+20);
        EMPH.lastIndex=0;
        mentions.push({skill:sk.name,cat:sk.cat,start:u.start+s,end:u.start+e,tier,emph:EMPH.test(win)});
        if(m[0].length===0)re.lastIndex++;
      }
    }
  }
  mentions.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
  const kept=[];let lastEnd=-1;
  for(const m of mentions){if(m.start>=lastEnd){kept.push(m);lastEnd=m.end;}}
  mentions=kept;

  const map=new Map();
  for(const m of mentions){
    let k=map.get(m.skill);
    if(!k){k={name:m.skill,cat:m.cat,tier:m.tier,count:0,emph:0};map.set(m.skill,k);}
    k.count++; if(m.emph)k.emph++;
    if(RANK[m.tier]>RANK[k.tier])k.tier=m.tier;
  }
  const skills=[...map.values()].sort((a,b)=>(b.count+b.emph*.5)-(a.count+a.emph*.5)||RANK[b.tier]-RANK[a.tier]||a.name.localeCompare(b.name));

  // --- job summary ---
  const live=recs.filter(r=>r.section!=="skip");
  const firstLines=text.split("\n").map(l=>l.replace(/^#+\s*/,"").replace(/[*_`]/g,"").trim()).filter(Boolean);
  const labelOf=re=>{const m=text.match(re);return m?m[1].replace(/[*_`]/g,"").trim():"";};
  let title=labelOf(/^[ \t*#_]*(?:job\s+)?(?:title|position|role)\s*[:\-–]\s*(.+)$/im);
  const TITLEWORD=/\b(engineer|developer|analyst|manager|scientist|designer|architect|consultant|specialist|lead|director|administrator|intern|associate|officer|executive|coordinator|technician|programmer|tester|sdet|devops|recruiter|accountant|writer|strategist|researcher|head)\b/i;
  if(!title)title=firstLines.slice(0,8).find(l=>l.length<=100&&l.split(/\s+/).length<=12&&!/[.!?]$/.test(l)&&!/^(?:job (?:description|posting))$/i.test(l)&&TITLEWORD.test(l))||"";
  if(!title){const h=text.match(/\b(?:hiring|looking for|seeking|looking to hire)\s+(?:an?\s+)?([A-Z][\w\/&+.\- ]{3,60}?)(?=\s+(?:to|who|with|for|in|at)\b|[.,\n])/);if(h)title=h[1];}
  if(!title)title=(firstLines.find(l=>l.length<=80&&!/^(?:job (?:description|posting))$/i.test(l))||"Title not found");
  title=title.replace(/^(?:job (?:title|description|opening)|position|role)\s*[:\-–]\s*/i,"");
  const company=labelOf(/^[ \t*#_]*(?:company|organi[sz]ation|employer)\s*[:\-–]\s*(.+)$/im);

  // experience
  let experience="";
  const expUnit=units.find(u=>u.section!=="skip"&&u.section!=="pref"&&YRS.test(u.text)&&/experience|exp\b|background|worked|work\b/i.test(u.text))||units.find(u=>u.section!=="skip"&&YRS.test(u.text));
  if(expUnit){
    const m=expUnit.text.match(YRS), plus=m[2]||m[4]||/at least|minimum|min\./i.test(expUnit.text);
    experience=m[3]?`${m[1]}–${m[3]} years`:`${m[1]}${plus?"+":""} years`;
  }else if(/\b(?:fresher|entry[- ]level|new grad|graduate (?:role|program)|0\s*[-–]\s*1 years?)\b/i.test(text))experience="Entry level";
  else if(/\b(?:senior|sr\.|principal|staff)\b/i.test(title))experience="Senior level (years not stated)";
  else experience="Not stated";

  // education + certifications
  const educ=[],certs=[],seen=new Set(),levels=[];
  for(const r of live){
    const isDeg=DEG_WORDS.test(r.text)||DEG_ACR.test(r.text), isCert=CERT.test(r.text);
    const key=r.text.toLowerCase().slice(0,80);
    if(seen.has(key))continue;
    if(isDeg){seen.add(key);educ.push({kind:"Education",text:cleanItem(r.text)});for(const l of degreeLevels(r.text))if(!levels.includes(l))levels.push(l);}
    else if(isCert){seen.add(key);certs.push({kind:"Certification",text:cleanItem(r.text)});}
  }

  // experience requirement lines + responsibilities
  const expItems=[];
  for(const r of live){if(r.section!=="resp"&&YRS.test(r.text)&&!DEG_WORDS.test(r.text)&&!expItems.some(x=>x.text===cleanItem(r.text)))expItems.push({kind:"Experience",text:cleanItem(r.text)});}
  let resp=live.filter(r=>r.section==="resp"&&r.text.split(/\s+/).length>=4).map(r=>cleanItem(r.text));
  if(!resp.length)resp=units.filter(u=>u.section!=="skip"&&ACTION.test(u.text.trim())&&u.text.split(/\s+/).length>=4).map(u=>cleanItem(u.text));
  resp=[...new Set(resp)];

  // location, work mode, employment type
  let location=labelOf(/^[ \t*#_]*(?:work\s+|job\s+)?location\s*[:\-–]\s*(.+)$/im);
  if(!location){const m=text.match(/\b(?:based (?:in|out of)|located in|office (?:is )?in|headquartered in)\s+([A-Z][\w.,' -]{2,50}?)(?=[.;\n]|\s+(?:and|with|to)\b|$)/);if(m)location=m[1].trim();}
  const modes=[["Remote",/\bremote(?:ly)?\b|work from home|\bWFH\b/gi],["Hybrid",/\bhybrid\b/gi],["On-site",/\bon[- ]?site\b|in[- ]office/gi]]
    .map(([n,re])=>[n,(text.match(re)||[]).length]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);
  const workMode=modes.length?modes[0][0]:"";
  const etLabel=labelOf(/^[ \t*#_]*(?:employment|job)?\s*type\s*[:\-–]\s*(.+)$/im)||labelOf(/^[ \t*#_]*employment\s*[:\-–]\s*(.+)$/im);
  const ET=[["Full-time",/full[- ]?time/i],["Part-time",/part[- ]?time/i],["Contract",/\bcontract(?:or|ual)?\b|fixed[- ]term/i],["Internship",/\bintern(?:ship)?\b/i],["Freelance",/freelance/i],["Temporary",/\btemporary\b|\btemp\b/i],["Permanent",/\bpermanent\b/i]];
  let empTypes=ET.filter(([,re])=>re.test(etLabel||"")).map(x=>x[0]);
  if(!empTypes.length)empTypes=ET.filter(([,re])=>re.test(text)).map(x=>x[0]).slice(0,2);
  if(workMode&&!location)location="";

  const tiers={ess:0,pref:0,opt:0}; skills.forEach(s=>tiers[s.tier]++);
  return {
    text, mentions, skills, tiers,
    summary:{title:clip(title,110),company:clip(company,80),experience,levels,location:clip(location,100),workMode,empTypes,resp,wordCount:(text.match(/\S+/g)||[]).length},
    cats:{
      tech:skills.filter(s=>s.cat==="T"),tools:skills.filter(s=>s.cat==="L"),soft:skills.filter(s=>s.cat==="S"),
      edu:[...educ,...certs],exp:[...expItems,...resp.map(t=>({kind:"Duty",text:t}))]
    }
  };
}
export { analyzeJD };
