import { API_BASE, $, toast } from './common.js';

const KEY = 'farmaticas_user';

export function getUser(){
  try { return JSON.parse(localStorage.getItem(KEY)) || null; }
  catch { return null; }
}
export function setUser(u){ localStorage.setItem(KEY, JSON.stringify(u)); }
export function clearUser(){ localStorage.removeItem(KEY); }

export function requireAuth(){
  const u = getUser();
  if(!u){ window.location.href = 'index.html'; }
  return u;
}
export function requireRole(role){
  const u = requireAuth();
  if(!u || u.role !== role){ return false; }
  return true;
}

export async function handleLogin(){
  const form = $('#login-form');
  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = $('#email').value.trim();
    const password = $('#password').value.trim();
    if(!email || !password){ return toast('Completá email y contraseña','error'); }

    try{
      const res = await fetch(`${API_BASE}/login`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if(!data.ok) return toast(data.msg || 'Credenciales inválidas','error');

      setUser(data.data); 
      toast('Bienvenido');
      window.location.href = 'info.html';
    }catch(err){
      toast('No se pudo iniciar sesión','error');
    }
  });
}

export function mountHeaderActive(active){
  const u = getUser();
  const name = u ? u.name : '';
  const role = u ? u.role : '';
  const nav = document.querySelector('.nav');
  if(!nav) return;

  // set del link activo
  document.querySelectorAll('.nav a').forEach(a=>{
    if(a.getAttribute('data-active') === active){ a.classList.add('active'); }
  });

  // cerrar sesión y nombre usuario
  const right = document.createElement('div');
  right.className='right';
  right.innerHTML = `
    <span class="badge">${name} · ${role}</span>
    <button class="btn" id="logoutBtn">Salir</button>
  `;
  nav.appendChild(right);

  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{
    clearUser(); window.location.href='index.html';
  });
}