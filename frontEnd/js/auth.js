import { API_BASE, $, toast } from './common.js';

// Clave para guardar el usuario en localStorage
const KEY = 'farmaticas_user';

// Obtener usuario actual
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

// Guardar usuario
export function setUser(u) {
  localStorage.setItem(KEY, JSON.stringify(u));
}

// Eliminar sesión
export function clearUser() {
  localStorage.removeItem(KEY);
}

// autenticación, si no hay usuario, redirige al login
export function requireAuth() {
  const u = getUser();
  if (!u) {
    window.location.href = 'index.html';
  }
  return u;
}


// Login
export async function handleLogin() {
  const form = $('#login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = $('#email').value.trim();
    const password = $('#password').value.trim();

    if (!email || !password) {
      return toast('Completá email y contraseña', 'error');
    }

    try {
      
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!data.ok) return toast(data.msg || 'Credenciales inválidas', 'error');

      // Guardar usuario y redirigir
      setUser(data.data);
      toast('Bienvenido 👋');
      window.location.href = 'info.html';
    } catch (err) {
      console.error(err);
      toast('No se pudo iniciar sesión', 'error');
    }
  });
}

// header con usuario y logout
export function mountHeaderActive(active) {
  const u = getUser();
  if (!u) return;

  const name = u.name || '';
  const role = u.role || '';
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // Resaltar la página actual
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('data-active') === active) {
      a.classList.add('active');
    }
  });

  // Mostrar chip de usuario y botón de salida
  const right = document.createElement('div');
  right.className = 'right';
  right.innerHTML = `
    <span class="badge">${name} · ${role}</span>
    <button class="btn" id="logoutBtn">Salir</button>
  `;
  nav.appendChild(right);

  // Acción del botón salir
  $('#logoutBtn').addEventListener('click', () => {
    clearUser();
    window.location.href = 'index.html';
  });
}