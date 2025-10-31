// Lightweight tabs + live catalog loader + GitHub issue link builder
// Catalog loader
async function loadCatalogs(){
const catalogs = $all('.catalog');
for(const sec of catalogs){
const sources = [];
const labels = ['Apps', 'Games', 'Themes'];
for(let i = 1; ; i++){
const src = sec.getAttribute('data-src' + (i > 1 ? i : ''));
if(!src) break;
sources.push({url: src, label: labels[i-1] || 'Unknown'});
}
const allData = [];
for(const s of sources){
try{
const res = await fetch(s.url, { cache: 'no-store' });
const data = await res.json();
const items = (Array.isArray(data) ? data : []).map(item => ({...item, type: s.label}));
allData.push(...items);
}catch(err){
console.error('Catalog load error', s.url, err);
}
}
const frag = document.createDocumentFragment();
allData.forEach(item => {
const el = document.createElement('article');
el.className = 'item';
el.innerHTML = `
<span class="badge">${item.type}</span>
<h4>${escapeHtml(item.name || 'Untitled')}</h4>
<div class="meta">by ${escapeHtml(item.author || 'unknown')}</div>
<p>${escapeHtml(item.desc || '')}</p>
${item.url ? `<a href="${getDownloadUrl(item.url)}" target="_blank" rel="noopener" class="btn">Download</a>` : '<span class="muted">No download available</span>'}
`;
frag.appendChild(el);
});
sec.innerHTML = '';
sec.appendChild(frag);
}
}


// Prefilled GitHub issue links for submission
function initSubmitForm(){
const form = $('#submitForm');
if(!form) return;
form.addEventListener('submit', e => {
e.preventDefault();
const f = new FormData(form);
const type = f.get('type');
const name = (f.get('name')||'').trim();
const desc = (f.get('desc')||'').trim();
const icon = (f.get('icon')||'').trim();
const author = (f.get('author')||'').trim();
const url = (f.get('url')||'').trim();


const title = encodeURIComponent(`${capitalize(type)} submission: ${name}`);
const body = encodeURIComponent(`### ${capitalize(type)} submission\n\n`+
`**Name**: ${name}\n\n`+
`**Description**: ${desc}\n\n`+
`**Icon**: ${icon}\n\n`+
`**Author**: ${author}\n\n`+
(url ? `**URL**: ${url}\n\n` : '')+
`**Checklist**\n- [ ] I confirm this content is safe and does not include harmful scripts\n- [ ] I understand HTML apps may not work offline`);


const labels = encodeURIComponent(type);
const link = `https://github.com/nautilus-os/community/issues/new?title=${title}&body=${body}&labels=${labels}`;
window.open(link, '_blank','noopener');
});
}


// Feature/content request builder
function initRequestForm(){
const form = $('#requestForm');
if(!form) return;
form.addEventListener('submit', e => {
e.preventDefault();
const f = new FormData(form);
const target = f.get('target');
const title = encodeURIComponent((f.get('title')||'').trim());
const body = encodeURIComponent((f.get('body')||'').trim());


const base = target === 'core'
? 'https://github.com/nautilus-os/NautilusOS/issues/new'
: 'https://github.com/nautilus-os/community/issues/new';


const labels = encodeURIComponent('feature');
const link = `${base}?title=${title}&body=${body}&labels=${labels}`;
window.open(link, '_blank','noopener');
});
}


function escapeHtml(s){
return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}
function capitalize(s){ return (s||'').charAt(0).toUpperCase() + (s||'').slice(1); }
function getDownloadUrl(url){
if(!url) return null;
const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
if(match){
const [, user, repo, branch, path] = match;
return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
}
return url;
}


// Tabs
function initTabs(){
const tabs = $all('[data-tab]');
if(!tabs.length) return;
tabs.forEach(btn => {
btn.addEventListener('click', () => {
const target = btn.getAttribute('data-tab');
const parent = btn.closest('.tabs').parentElement;
parent.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
parent.querySelectorAll('.catalog').forEach(c => c.classList.add('hidden'));
parent.querySelector(`[data-content="${target}"]`).classList.remove('hidden');
});
});
}

// Utility
function $(s){ return document.querySelector(s); }
function $all(s){ return document.querySelectorAll(s); }

// Run
window.addEventListener('DOMContentLoaded', () => {
initTabs();
loadCatalogs();
initSubmitForm();
initRequestForm();
});