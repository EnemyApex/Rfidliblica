let allBooks=[], currentUser=null;
function checkSession(){ let u=localStorage.getItem('user'); if(u){ currentUser=JSON.parse(u); showApp(); } }
function showApp(){ login.style.display='none'; app.style.display='block'; userName.innerText=currentUser.name; load(); }
async function doAuth(action){
  let email=document.getElementById('email').value.trim(), pass=document.getElementById('pass').value, name=document.getElementById('name').value;
  if(!email||!pass) return msg.innerText='Email + mdp requis';
  let r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,email,password:pass,name})});
  let d=await r.json(); if(!r.ok) return msg.innerText=d.error;
  if(action==='register'){ msg.style.color='green'; msg.innerText='Compte créé! Connecte-toi'; return; }
  localStorage.setItem('user',JSON.stringify(d)); currentUser=d; showApp();
}
function logout(){ localStorage.clear(); location.reload(); }
async function load(){ let r=await fetch('/api/rfid'); allBooks=await r.json(); render(allBooks); }
function render(books){
  total.innerText=books.length; dispo.innerText=books.filter(b=>b.status=='disponible').length;
  empr.innerText=books.filter(b=>b.borrowedBy==currentUser.email).length;
  if(!books.length){ empty.style.display='block'; document.getElementById('books').innerHTML=''; return; } empty.style.display='none';
  document.getElementById('books').innerHTML=books.slice().reverse().map(b=>`
  <div class="card"><div><h3>${b.title}</h3><small>${b.uid} • ${b.author||''}</small><br>${b.status=='emprunté'?`<span style="color:red;font-size:12px">Emprunté par ${b.borrowedName}</span>`:`<span style="color:green;font-size:12px">Disponible</span>`}<br><small style="color:#bbb">${b.lastScan}</small></div><span class="badge ${b.status=='disponible'?'dispo':'emprunte'}">${b.status}</span></div>`).join('');
}
function filterBooks(){ let q=search.value.toLowerCase(); render(allBooks.filter(b=>b.title.toLowerCase().includes(q)||b.uid.toLowerCase().includes(q))); }
checkSession(); setInterval(()=>{ if(currentUser) load(); },2000);
