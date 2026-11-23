import {grades,gpa,summarize} from './model.mjs';
const $=id=>document.getElementById(id),fmt=n=>n.toLocaleString('en-US'),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let meta,rows=[],cache=new Map(),page=0,sortKey=null,direction=1,version=0;
const unique=(rs,key)=>[...new Set(rs.map(r=>r[key]))].sort((a,b)=>typeof a==='number'?a-b:String(a).localeCompare(String(b)));
function options(id,values,preferred){$(id).replaceChildren(...values.map(v=>new Option(v??'Unknown',v??'')));if(values.includes(preferred))$(id).value=preferred;$(id).disabled=!values.length;}
function courseRows(){return rows.filter(r=>String(r.Number)===$('number').value);}
function updateInstructors(){options('instructor',unique(courseRows(),'Instructor'));renderChart();}
async function loadSubject(){const request=++version,subject=$('subject').value;$('status').textContent='Loading '+subject+'…';for(const id of ['number','instructor'])$(id).disabled=true;try{let data=cache.get(subject);if(!data){const res=await fetch('data/'+encodeURIComponent(subject[0])+'.json');if(!res.ok)throw Error('HTTP '+res.status);data=(await res.json())[subject].map(v=>Object.fromEntries(meta.columns.map((k,i)=>[k,v[i]])));cache.set(subject,data);}if(request!==version)return;rows=data;options('number',unique(rows,'Number'));updateInstructors();page=0;renderTable();$('status').className='';$('status').textContent=fmt(rows.length)+' section records loaded for '+subject+'.';}catch(e){if(request!==version)return;rows=[];renderChart();renderTable();$('status').className='error';$('status').textContent='Unable to load data. Check your connection and reload. '+e.message;}}
function renderChart() {
  const selected = courseRows().filter(row => (row.Instructor ?? '') === $('instructor').value);
  const summary = summarize(selected);
  const instructor = $('instructor').value || 'No matching sections';
  const course = $('subject').value + ' ' + $('number').value;
  $('chart-title').textContent = course + (selected[0] ? ' · ' + selected[0].Title : '');
  $('chart-subtitle').textContent = instructor;
  $('enrollments').textContent = summary.enrollments === null ? '—' : fmt(summary.enrollments);
  const range = summary.firstYear === summary.lastYear ? summary.firstYear : summary.firstYear + '–' + summary.lastYear;
  $('data-coverage').textContent = summary.firstYear === null ? 'No matching records.' :
    `Selected records: ${range} · ${fmt(selected.length)} section record${selected.length === 1 ? '' : 's'} · ${summary.terms.length} available term${summary.terms.length === 1 ? '' : 's'} combined.`;
  $('term-details').hidden = !summary.terms.length;
  $('term-summary').textContent = `View included terms (${summary.terms.length})`;
  $('included-terms').innerHTML = summary.terms.map(item => `<li>${item.year} ${escape(item.term)}</li>`).join('');
  $('chart-scope').textContent = selected.length ?
    `${course} · ${instructor} · All ${summary.terms.length} available term${summary.terms.length === 1 ? '' : 's'} combined (${range}).` :
    'No matching records.';
  const quality = $('data-quality');
  quality.hidden = !summary.hasMissingGrades;
  quality.textContent = summary.hasMissingGrades ? 'Incomplete grade counts: total graded enrollments and weighted GPA are unavailable.' : '';
  $('gpa').textContent = summary.gpa === null ? '—' : summary.gpa.toFixed(2);
  $('sections').textContent = fmt(selected.length);
  const max = Math.max(1, ...Object.values(summary.counts).map(count => count ?? 0));
  const top = Math.ceil(max / 5) * 5;
  const width = 880, height = 350, left = 85, bottom = 285, plot = 235, step = 55;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img"><title>${escape(course)} historical grade distribution, cumulative enrollment counts</title><text x="20" y="167" text-anchor="middle" transform="rotate(-90 20 167)">Enrollment count</text><text x="475" y="340" text-anchor="middle">Grade</text>`;
  for (let index = 0; index <= 4; index++) {
    const y = bottom - index * plot / 4;
    svg += `<line x1="${left}" x2="865" y1="${y}" y2="${y}" stroke="#e2e8f0"/><text x="75" y="${y + 4}" text-anchor="end">${fmt(Math.round(top * index / 4))}</text>`;
  }
  grades.forEach((grade, index) => {
    const count = summary.counts[grade];
    const bar = (count ?? 0) / top * plot;
    const x = left + index * step + 8;
    svg += `<rect x="${x}" y="${bottom - bar}" width="33" height="${bar}" rx="3" fill="${index < 3 ? '#e8753b' : index < 6 ? '#31577f' : index < 9 ? '#5f83a5' : '#a1b3c6'}"><title>${escape(grade)}: ${count === null ? 'Missing' : fmt(count) + ' enrollments'}</title></rect><text x="${x + 16}" y="${bottom - bar - 7}" text-anchor="middle">${count === null ? '—' : fmt(count)}</text><text x="${x + 16}" y="310" text-anchor="middle">${escape(grade)}</text>`;
  });
  $('chart').innerHTML = svg + '</svg>';
  $('chart').setAttribute('aria-label', 'Cumulative enrollment counts across all included terms. ' + grades.map(grade => grade + ': ' + (summary.counts[grade] ?? 'missing')).join(', '));
}
function renderTable(){let data=$('filter-course').checked?courseRows():rows;const q=$('search').value.trim().toLowerCase();data=data.map(r=>({...r,GPA:gpa(r)}));if(q)data=data.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q)));if(sortKey)data.sort((a,b)=>{const x=a[sortKey],y=b[sortKey];return direction*(typeof x==='number'&&typeof y==='number'?x-y:String(x??'').localeCompare(String(y??''),undefined,{numeric:true}));});const size=Number($('page-size').value);page=Math.min(page,Math.max(0,Math.ceil(data.length/size)-1));$('table-body').innerHTML=data.slice(page*size,(page+1)*size).map(r=>'<tr>'+[...meta.columns,'GPA'].map(k=>'<td>'+escape(k==='GPA'?(r[k]===null?'—':r[k].toFixed(2)):(r[k]??'—'))+'</td>').join('')+'</tr>').join('')||`<tr><td colspan="${meta.columns.length+1}">No matching records.</td></tr>`;$('row-count').textContent=`${data.length?fmt(page*size+1):0}–${fmt(Math.min((page+1)*size,data.length))} of ${fmt(data.length)} records`;$('previous').disabled=page===0;$('next').disabled=(page+1)*size>=data.length;}
$('subject').addEventListener('change',loadSubject);$('number').addEventListener('change',()=>{updateInstructors();page=0;renderTable();});$('instructor').addEventListener('change',renderChart);for(const id of ['search','page-size','filter-course'])$(id).addEventListener(id==='search'?'input':'change',()=>{page=0;renderTable();});$('previous').onclick=()=>{page--;renderTable();};$('next').onclick=()=>{page++;renderTable();};document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>{const active=x===b;x.setAttribute('aria-pressed',active);$(x.dataset.tab).hidden=!active;});});
try{const res=await fetch('data/index.json');if(!res.ok)throw Error('HTTP '+res.status);meta=await res.json();const years=meta.years.join('–');$('dataset-info').textContent=`UIUC GPA Data: ${years} · ${fmt(meta.rows)} sections · ${meta.subjects.length} subjects`;$('about-years').textContent=years;options('subject',meta.subjects,'STAT');const tr=document.createElement('tr');[...meta.columns,'GPA'].forEach(k=>{const th=document.createElement('th'),b=document.createElement('button');th.scope='col';b.textContent=k;b.onclick=()=>{direction=sortKey===k?-direction:1;sortKey=k;tr.querySelectorAll('th').forEach(t=>t.removeAttribute('aria-sort'));th.setAttribute('aria-sort',direction===1?'ascending':'descending');page=0;renderTable();};th.append(b);tr.append(th);});$('table-head').append(tr);await loadSubject();}catch(e){$('status').className='error';$('status').textContent='Unable to load the dataset. Please reload. '+e.message;}
