let allBooks=[], currentUser=null;
function checkSession(){ let u=localStorage.getItem('user'); if(u){ currentUser=JSON.parse(u); showApp(); } }
function showApp(){ document.getElementById('login').style.display='none'; document.getElementById('app').style.display='block'; document.getElementById('userName').innerText=currentUser.name; load(); }
async function doAuth(action){
  const email=document.getElementById('email').value.trim();
  const pass=document.getElementById('pass').value.trim();
  const name=document.getElementById('name').value.trim();
  const msgEl=document.getElementById('msg');
  if(!email||!pass){ msgEl.innerText='Remplis email + mode passe'; return; }
  msgEl.innerText='Chargement...';
  try{
    let r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,email,password:pass,name})});
    let d=await r.json(); if(!r.ok){ msgEl.innerText=d.error; return; }
    if(action==='register'){ msgEl.style.color='green'; msgEl.innerText='Compte créé! Clique Se connecter maintenant'; return; }
    localStorage.setItem('user',JSON.stringify(d)); currentUser=d; showApp();
  }catch(e){ msgEl.innerText='Erreur serveur: '+e.message; }
}
function logout(){ localStorage.clear(); location.reload(); }
async function load(){ let r=await fetch('/api/rfid'); allBooks=await r.json(); render(allBooks); }
function render(books){ document.getElementById('total').innerText=books.length; document.getElementById('dispo').innerText=books.filter(b=>b.status=='disponible').length; document.getElementById('empr').innerText=currentUser? books.filter(b=>b.borrowedBy==currentUser.email).length : 0; if(!books.length){document.getElementById('empty').style.display='block';document.getElementById('books').innerHTML='';return;}document.getElementById('empty').style.display='none';document.getElementById('books').innerHTML=books.slice().reverse().map(b=>`<div class="card"><div><h3>${b.title}</h3><small>${b.uid}</small><br>${b.status=='emprunté'?`<span style="color:red">Emprunté par ${b.borrowedName}</span>`:`<span style="color:green">Dispo</span>`}<br><small>${b.lastScan}</small></div><span class="badge ${b.status=='disponible'?'dispo':'emprunte'}">${b.status}</span></div>`).join('');}
function filterBooks(){ let q=document.getElementById('search').value.toLowerCase(); render(allBooks.filter(b=>b.title.toLowerCase().includes(q)||b.uid.toLowerCase().includes(q))); }
checkSession(); setInterval(()=>{ if(currentUser) load(); },2000);
