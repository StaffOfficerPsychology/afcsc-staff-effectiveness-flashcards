let bank, phase='multiple_choice', list=[], pos=0, choice=null, shown=false, progress={}, gapResponse='';
const $=id=>document.getElementById(id);
const key=()=>`sc48_second_v2_${phase}`;
const blankProgress=()=>({correct:0,reviewed:0,seen:[]});
function load(){try{return JSON.parse(localStorage.getItem(key())||'null')||blankProgress()}catch{return blankProgress()}}
function save(){localStorage.setItem(key(),JSON.stringify(progress))}
function setPhase(p){phase=p;pos=0;choice=null;shown=false;gapResponse='';progress=load();document.querySelectorAll('[data-p]').forEach(b=>b.classList.toggle('active',b.dataset.p===p));const topics=[...new Set(bank.phases[p].map(q=>q.topic))];$('topic').innerHTML='<option value="all">All lecture topics</option>'+topics.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');filter()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function filter(){list=bank.phases[phase].filter(q=>$('topic').value==='all'||q.topic===$('topic').value);pos=0;choice=null;shown=false;gapResponse='';render()}
function render(){if(!list.length){$('q').textContent='No questions in this topic.';return}const q=list[pos];$('tag').textContent=q.topic;$('q').textContent=q.question;$('count').textContent=`Question ${pos+1} / ${list.length}`;$('opts').innerHTML='';$('feedback').innerHTML='';$('gapWrap').hidden=phase!=='fill_in_gap';$('answerInput').value=gapResponse;$('answerInput').disabled=shown;$('checkGap').hidden=phase!=='fill_in_gap';$('checkGap').disabled=shown;
 if(phase==='multiple_choice')Object.entries(q.options).forEach(([k,v])=>addOption(`${k}. ${v}`,k));
 else if(phase==='true_false')['True','False'].forEach(v=>addOption(v,v));
 if(shown)showFeedback(q);
 $('reveal').hidden=phase==='fill_in_gap';$('reveal').textContent='Reveal answer';$('score').textContent=`${progress.correct} correct`;$('reviewed').textContent=`${progress.reviewed} reviewed`;
}
function addOption(label,val){const b=document.createElement('button');b.textContent=label;if(choice===val)b.classList.add('chosen');if(shown){const good=phase==='multiple_choice'?val===list[pos].answer:((val==='True')===list[pos].answer);if(good)b.classList.add('correct');else if(choice===val)b.classList.add('wrong')}b.onclick=()=>{if(!shown){choice=val;render()}};$('opts').appendChild(b)}
function record(correct){const q=list[pos];if(!progress.seen.includes(q.id)){progress.seen.push(q.id);progress.reviewed++;if(correct)progress.correct++;save()}}
function showFeedback(q){let answer=phase==='multiple_choice'?`${q.answer}. ${q.options[q.answer]}`:phase==='true_false'?(q.answer?'True':'False'):q.answer;let result=phase==='fill_in_gap'?`<strong>${isGapCorrect(q,gapResponse)?'Correct!':'Not quite.'}</strong> Your answer: <em>${escapeHtml(gapResponse)}</em><br>`:'';$('feedback').innerHTML=`${result}<strong>Answer: ${escapeHtml(answer)}</strong><small>${escapeHtml(q.explanation)}</small>`}
function reveal(){if(shown)return;const q=list[pos];if(choice===null){$('feedback').textContent='Select an answer before revealing the key.';return}const correct=phase==='multiple_choice'?choice===q.answer:((choice==='True')===q.answer);record(correct);shown=true;render()}
function normalizeAnswer(s){return String(s??'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ')}
function isGapCorrect(q,given){const accepted=[q.answer,...(Array.isArray(q.accepted_answers)?q.accepted_answers:[])];const candidate=normalizeAnswer(given);return !!candidate&&accepted.some(a=>normalizeAnswer(a)===candidate)}
function checkGap(){if(shown)return;const q=list[pos],given=$('answerInput').value.trim();if(!given){$('feedback').textContent='Please type your answer in the box before selecting Check answer.';$('answerInput').focus();return}gapResponse=given;record(isGapCorrect(q,given));shown=true;render()}
function move(n){pos=(pos+n+list.length)%list.length;choice=null;shown=false;gapResponse='';render()}
$('answerInput').onkeydown=e=>{if(e.key==='Enter')checkGap()};
$('tabs').onclick=e=>{const b=e.target.closest('[data-p]');if(b)setPhase(b.dataset.p)};$('topic').onchange=filter;$('reveal').onclick=reveal;$('checkGap').onclick=checkGap;$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);$('shuffle').onclick=()=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}pos=0;choice=null;shown=false;gapResponse='';render()};$('reset').onclick=()=>{if(confirm('Reset progress for this phase?')){localStorage.removeItem(key());progress=load();render()}};
fetch('data/question_bank.json').then(r=>{if(!r.ok)throw Error('load');return r.json()}).then(d=>{bank=d;setPhase('multiple_choice')}).catch(()=>$('q').textContent='Question bank could not be loaded. Refresh the page or check that data/question_bank.json is present.');
if('serviceWorker' in navigator && location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
