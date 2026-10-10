import { randomBytes, randomInt } from 'node:crypto';
import { questions } from './questions.mjs';
export const rooms = new Map();
const fail = message => { throw new Error(message); };
const token = () => randomBytes(24).toString('hex');
const shuffle = list => { const a=[...list]; for(let i=a.length-1;i>0;i--){let j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a; };
function nameOf(name) { name=String(name||'').trim(); if(!name||name.length>20)fail('Enter a nickname of 1–20 characters.');return name; }
function player(name) { return {id:token(),name:nameOf(name),score:0}; }
function round(r,now) { r.phase='question';r.started=now+2500;r.deadline=r.started+20000;r.answers={}; }
function fresh(r,now) { const unused=questions.filter(q=>!r.used.includes(q.id));const pool=unused.length>=10?unused:questions;r.deck=shuffle(pool);r.index=0;r.tied=null;r.winners=[];r.players.forEach(p=>p.score=0);round(r,now); }
export function advance(r,now) {
 if(r.phase==='question'&&(now>=r.deadline||r.players.every(p=>r.answers[p.id]))){
  const q=r.deck[r.index];for(const p of r.players){const a=r.answers[p.id];if(a&&a.choice===q.answer){a.points=100+Math.max(0,Math.min(50,Math.ceil(50*(r.deadline-a.at)/20000)));p.score+=a.points;}else if(a)a.points=0;}
  r.used.push(q.id);r.used=[...new Set(r.used)];r.phase='reveal';r.next=now+6000;
 }
 if(r.phase==='reveal'&&now>=r.next){
  if(r.index>=9){
   let leaders;
   if(r.tied){const max=Math.max(...r.tied.map(id=>r.answers[id]?.points||0));leaders=r.tied.filter(id=>(r.answers[id]?.points||0)===max);}
   else {const max=Math.max(...r.players.map(p=>p.score));leaders=r.players.filter(p=>p.score===max).map(p=>p.id);}
   if(leaders.length===1){r.winners=leaders;r.phase='finished';return;}
   r.tied=leaders;
  }
  r.index++;if(r.index>=r.deck.length)r.deck.push(...shuffle(questions));round(r,now);
 }
}
export function handle(action,b={},now=Date.now()) {
 for(const [code,r] of rooms)if(now-r.touched>4*60*60*1000)rooms.delete(code);
 if(action==='create'){const p=player(b.name);let code;do{code=Array.from({length:6},()=> 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[randomInt(31)]).join('');}while(rooms.has(code));const r={code,players:[p],host:p.id,phase:'lobby',used:[],touched:now};rooms.set(code,r);return {code,token:p.id};}
 const r=rooms.get(String(b.code||'').trim().toUpperCase());if(!r)fail('Room not found. Check the code or create a new room.');r.touched=now;advance(r,now);
 if(action==='join'){if(r.phase!=='lobby')fail('This game has already started.');if(r.players.length>=5)fail('Room is full (5 players).');const p=player(b.name);if(r.players.some(x=>x.name.toLowerCase()===p.name.toLowerCase()))fail('That nickname is taken.');r.players.push(p);return {code:r.code,token:p.id};}
 const p=r.players.find(x=>x.id===b.token);if(!p)fail('Your session is no longer in this room.');
 if(action==='start'||action==='rematch'){if(p.id!==r.host)fail('Only the host can start.');if(action==='start'&&r.phase!=='lobby'||action==='rematch'&&r.phase!=='finished')fail('The room is not ready to start.');if(r.players.length<2)fail('Wait for at least 2 players.');fresh(r,now);}
 else if(action==='answer'){if(r.phase!=='question'||now<r.started||now>=r.deadline)fail('This question is closed.');if(b.round!==r.index)fail('That question has ended.');if(r.answers[p.id])fail('Your answer is already locked.');if(!Number.isInteger(b.choice)||b.choice<0||b.choice>3)fail('Choose one of the four answers.');r.answers[p.id]={choice:b.choice,at:now};advance(r,now);}
 else if(action==='leave'){if(r.phase!=='lobby'&&r.phase!=='finished')fail('You can leave from the lobby or results.');r.players=r.players.filter(x=>x.id!==p.id);if(!r.players.length)rooms.delete(r.code);else if(r.host===p.id)r.host=r.players[0].id;return {left:true};}
 else if(action!=='state')fail('Unknown action.');
 const q=r.deck?.[r.index];const revealed=r.phase==='reveal'||r.phase==='finished';
 return {code:r.code,phase:r.phase,host:r.host===p.id,now,started:r.started,deadline:r.deadline,next:r.next,round:r.index,question:q?{category:q.category,text:q.text,choices:q.choices,...(revealed?{answer:q.answer}:{})}:null,me:p.id,tied:r.tied?.includes(p.id)||false,sudden:!!r.tied,winners:r.winners,selection:r.answers?.[p.id]?.choice,players:r.players.map(x=>({id:x.id===p.id?'me':r.players.indexOf(x),name:x.name,score:x.score,answered:!!r.answers?.[x.id],winner:r.winners?.includes(x.id)||false,eligible:!r.tied||r.tied.includes(x.id),...(revealed?{choice:r.answers?.[x.id]?.choice,points:r.answers?.[x.id]?.points||0}:{})}))};
}
