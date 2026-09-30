const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('mobile-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    menuButton.click();
    menuButton.focus();
  }
});

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const download = (filename, content) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const registerTool = tool => {
  if (!document.modelContext?.registerTool) return;
  const lifecycle = new AbortController();
  addEventListener('pagehide', () => lifecycle.abort(), { once: true });
  try { Promise.resolve(document.modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Standard is optional; visible controls stay available. */ }
};

const workshopForm = document.querySelector('#workshop-controls');
if (workshopForm) {
  const people = document.querySelector('#people');
  const days = document.querySelector('#days');
  const rate = document.querySelector('#day-rate');
  const morning = document.querySelector('#free-morning');
  const status = document.querySelector('#workshop-status');
  let workshop;
  const agendaFor = (d, free) => {
    const blocks = free
      ? [['Day 1 · 13:00', 'Align on what matters', 'Agree on the questions and outcomes worth working toward.'], ['Day 1 · 14:30', 'Explore possibilities', 'Work in small groups, then share what deserves a closer look.']]
      : [['Day 1 · 9:30', 'Align on what matters', 'Agree on the questions and outcomes worth working toward.'], ['Day 1 · 13:00', 'Explore possibilities', 'Work in small groups, then share what deserves a closer look.']];
    blocks.push([d === 2 ? 'Day 2 · 9:30' : 'Day 1 · 15:30', 'Turn ideas into a plan', 'Choose a direction, name the next steps, and identify owners.']);
    if (d === 2) blocks.push(['Day 2 · 13:00', 'Make the commitments concrete', 'Review the plan and agree on what each person will take forward.']);
    return blocks;
  };
  const updateWorkshop = () => {
    if (!workshopForm.checkValidity()) { status.textContent = 'Use 4–60 people and a daily cost from $0–$300.'; return null; }
    const p = Number(people.value), d = Number(days.value), r = Number(rate.value);
    workshop = { people: p, days: d, dailyCostPerPerson: r, firstMorningFree: morning.checked, groups: Math.ceil(p / 6), budget: p * d * r + d * 500, agenda: agendaFor(d, morning.checked) };
    document.querySelector('#people-result').textContent = p;
    document.querySelector('#days-result').textContent = d;
    document.querySelector('#budget-result').textContent = money(workshop.budget);
    document.querySelector('#group-tag').textContent = `${workshop.groups} small groups`;
    document.querySelector('#cost-breakdown').textContent = `${p} people × ${d} ${d === 1 ? 'day' : 'days'} × ${money(r)}, plus $500 per day for a room.`;
    document.querySelector('#agenda').innerHTML = workshop.agenda.map(([time, title, description]) => `<div><span>${time}</span><h3>${title}</h3><p>${description}</p></div>`).join('');
    document.querySelector('#apply-request').textContent = morning.checked ? 'Change applied' : 'Apply this change';
    status.textContent = morning.checked ? 'The first morning is free. The agenda now starts at 13:00.' : '';
    return workshop;
  };
  workshopForm.addEventListener('submit', event => event.preventDefault());
  workshopForm.addEventListener('input', updateWorkshop);
  workshopForm.addEventListener('change', updateWorkshop);
  document.querySelector('#apply-request').addEventListener('click', () => { morning.checked = true; updateWorkshop(); });
  document.querySelector('#reset-workshop').addEventListener('click', () => { workshopForm.reset(); updateWorkshop(); });
  document.querySelector('#download-workshop').addEventListener('click', () => {
    if (!updateWorkshop()) return;
    const text = `WORKSHOP PLAN\n\n${workshop.people} people · ${workshop.days} days · ${workshop.groups} small groups\nSample budget: ${money(workshop.budget)}\nFirst morning free: ${workshop.firstMorningFree ? 'Yes' : 'No'}\n\n${workshop.agenda.map(([t,h,p])=>`${t}\n${h}\n${p}`).join('\n\n')}\n\nILLUSTRATIVE ASSUMPTIONS\n${workshop.people} people × ${workshop.days} days × ${money(workshop.dailyCostPerPerson)}, plus $500 per day for a room. Travel, accommodation, and taxes excluded.\n\nThis is a website example, not an AI session.`;
    download('workshop-plan.txt', text);
    status.textContent = 'Your plan is ready to download.';
  });
  updateWorkshop();
  registerTool({name:'get_workshop_example',title:'Read the workshop example',description:'Read the visible illustrative workshop settings and calculated plan. Does not run AI or access files.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({...workshop})});
  registerTool({name:'configure_workshop_example',title:'Adjust the workshop example',description:'Adjust the same settings as the visible workshop controls, then return the updated illustrative plan. Does not run AI, book a venue, or save outside this page.',inputSchema:{type:'object',properties:{people:{type:'integer',minimum:4,maximum:60},days:{type:'integer',enum:[1,2]},dailyCostPerPerson:{type:'integer',minimum:0,maximum:300,multipleOf:5},firstMorningFree:{type:'boolean'}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Provide an object of workshop settings.');
    const allowed=['people','days','dailyCostPerPerson','firstMorningFree'];
    if(Object.keys(input).some(key=>!allowed.includes(key))) throw new Error('Unknown workshop setting.');
    if(input.people!==undefined && (!Number.isInteger(input.people)||input.people<4||input.people>60)) throw new Error('People must be an integer from 4 to 60.');
    if(input.days!==undefined && ![1,2].includes(input.days)) throw new Error('Days must be 1 or 2.');
    if(input.dailyCostPerPerson!==undefined && (!Number.isInteger(input.dailyCostPerPerson)||input.dailyCostPerPerson<0||input.dailyCostPerPerson>300||input.dailyCostPerPerson%5!==0)) throw new Error('Daily cost must be a multiple of 5 from 0 to 300.');
    if(input.firstMorningFree!==undefined && typeof input.firstMorningFree!=='boolean') throw new Error('First morning free must be true or false.');
    if(input.people!==undefined) people.value=input.people;
    if(input.days!==undefined) days.value=input.days;
    if(input.dailyCostPerPerson!==undefined) rate.value=input.dailyCostPerPerson;
    if(input.firstMorningFree!==undefined) morning.checked=input.firstMorningFree;
    return {...updateWorkshop()};
  }});
}

const briefRecommendation = document.querySelector('#brief-recommendation');
if (briefRecommendation) {
  const versions = {
    continuity: ['Keep the current workspace for everyday work. Run a two-week pilot of the new approach with four volunteers.', 'The team values its familiar routines [1]. A small pilot lets us test the promising parts of the trial [2] while keeping the estimated setup effort contained [3].', 'Ask each volunteer to bring one real task each week. Review the results together, including what was awkward or unfinished.'],
    adaptability: ['Give four volunteers a two-week pilot focused on repeat tasks. Use the current workspace as a fallback while they explore.', 'Three interviewees were interested in making small tools for recurring work [1], and the trial produced two reusable results [2]. A focused pilot tests that opportunity within the estimated setup effort [3].', 'Ask each volunteer to bring one recurring task. Review whether their result remains useful in the second week, and record the setup and support needed.']
  };
  const updateBrief = () => {
    const selected = document.querySelector('input[name="brief-priority"]:checked').value;
    const [recommendation, rationale, step] = versions[selected];
    briefRecommendation.textContent = recommendation;
    document.querySelector('#brief-rationale').textContent = rationale;
    document.querySelector('#brief-next-step').textContent = step;
    document.querySelector('#brief-version').textContent = selected === 'continuity' ? '01' : '02';
    document.querySelector('#brief-status').textContent = selected === 'continuity' ? '' : 'The brief now gives more weight to adaptability.';
    return {priority:selected,recommendation,rationale,nextStep:step};
  };
  document.querySelectorAll('input[name="brief-priority"]').forEach(input=>input.addEventListener('change',updateBrief));
  document.querySelectorAll('a[href^="#source-"]').forEach(anchor=>anchor.addEventListener('click',()=>{document.querySelector(anchor.getAttribute('href')).open=true;}));
  document.querySelector('#download-brief').addEventListener('click',()=>{
    const v=updateBrief();
    download('decision-brief.txt',`TEAM WORKSPACE / DECISION BRIEF\n\n${v.recommendation}\n\nWHY THIS DIRECTION\n${v.rationale}\n\nNEXT STEP\n${v.nextStep}\n\nOPEN QUESTION\nWill the new workspace remain useful after the novelty wears off?\n\nILLUSTRATIVE SOURCES\n[1] Six interviewees; five wanted familiar routines and three were curious about small tools.\n[2] A trial produced a checklist and template, with help needed at setup. Long-term use was not measured.\n[3] Half a day estimated to prepare a pilot for four volunteers.\n\nFictional source material created for this website example. Not an AI session.`);
    document.querySelector('#brief-status').textContent='Your brief is ready to download.';
  });
}

const priorityTable = document.querySelector('.priority-table');
if (priorityTable) {
  let ranking=[];
  const defaultTasks=[['Update the onboarding guide',9,8,4],['Build a weekly checklist',7,9,3],['Refresh the team dashboard',8,6,6]];
  const updatePriorities = () => {
    const weight=Number(document.querySelector('input[name="effort-weight"]:checked').value);
    const valid=[...priorityTable.querySelectorAll('input[type="number"]')].every(input=>input.checkValidity());
    if(!valid){document.querySelector('#priority-validation').textContent='Use a whole-number score from 1 to 10 for each criterion.';return false;}
    document.querySelector('#priority-validation').textContent='';
    ranking=[...priorityTable.querySelectorAll('tbody tr')].map((row,i)=>{
      const inputs=row.querySelectorAll('input');
      const values=[...inputs].slice(1).map(input=>Number(input.value));
      return {task:inputs[0].value.trim()||`Task ${i+1}`,impact:values[0],confidence:values[1],effort:values[2],score:(3*values[0]+2*values[1]+weight*(11-values[2]))/(5+weight),index:i};
    }).sort((a,b)=>b.score-a.score||a.index-b.index);
    const list=document.querySelector('#priority-results');
    list.removeAttribute('aria-label');list.replaceChildren();
    ranking.forEach(item=>{const li=document.createElement('li'),name=document.createElement('span'),score=document.createElement('strong');name.textContent=item.task;score.textContent=item.score.toFixed(1);li.append(name,score);list.append(li);});
    document.querySelector('#formula-copy').textContent=`Weighted score = (3 × impact + 2 × confidence + ${weight} × (11 − effort)) ÷ ${5+weight}. The result stays on a 1–10 scale.`;
    return true;
  };
  priorityTable.addEventListener('input',updatePriorities);
  document.querySelectorAll('input[name="effort-weight"]').forEach(input=>input.addEventListener('change',updatePriorities));
  document.querySelector('#reset-priorities').addEventListener('click',()=>{
    priorityTable.querySelectorAll('tbody tr').forEach((row,i)=>row.querySelectorAll('input').forEach((input,j)=>input.value=defaultTasks[i][j]));
    document.querySelector('input[name="effort-weight"][value="2"]').checked=true;updatePriorities();
  });
  document.querySelector('#download-priorities').addEventListener('click',()=>{if(!updatePriorities())return;download('priority-comparison.txt',`PRIORITY COMPARISON\n\n${ranking.map((r,i)=>`${i+1}. ${r.task}: ${r.score.toFixed(1)} / 10\nImpact ${r.impact}, confidence ${r.confidence}, effort ${r.effort}`).join('\n\n')}\n\n${document.querySelector('#formula-copy').textContent}\n\nIllustrative website example. Scores reflect your judgments, not predictions.`);});
  updatePriorities();
}

const platformNote=document.querySelector('#platform-note');
if(platformNote){
  const platforms={mac:['On a Mac','Use the macOS prerequisites and installation steps in the current setup guide. You’ll run Unified on your Mac and open its workspace in your browser.'],windows:['On Windows','The current setup guide uses Windows Subsystem for Linux (WSL). Follow its Windows prerequisites before installing Unified, then open the workspace in your browser.'],linux:['On Linux','Follow the Linux prerequisites in the current setup guide. Run Unified on your chosen host, then open its workspace in a browser with access to that host.']};
  document.querySelectorAll('input[name="platform"]').forEach(input=>input.addEventListener('change',()=>{const [title,copy]=platforms[input.value];platformNote.querySelector('strong').textContent=title;platformNote.querySelector('p').textContent=copy;}));
  document.querySelectorAll('.prompt-choice').forEach(button=>button.addEventListener('click',async()=>{
    const status=document.querySelector('#prompt-status');
    try{await navigator.clipboard.writeText(button.dataset.prompt);status.textContent='Prompt copied. Paste it into your Amplifier Unified conversation.';}
    catch{status.textContent=`Copy this prompt: ${button.dataset.prompt}`;}
  }));
}
