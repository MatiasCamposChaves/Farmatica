export const API_BASE = 'http://localhost:4000/api';

export function $(sel, root=document){ return root.querySelector(sel); }
export function $all(sel, root=document){ return [...root.querySelectorAll(sel)]; }

export function toast(msg, type='ok'){
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position='fixed'; el.style.bottom='20px'; el.style.left='50%'; el.style.transform='translateX(-50%)';
  el.style.background= type==='error' ? '#ef4444' : '#22d3ee';
  el.style.color = '#00171f'; el.style.padding='10px 14px'; el.style.borderRadius='10px'; el.style.boxShadow='0 6px 24px rgba(0,0,0,.35)';
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 1800);
}