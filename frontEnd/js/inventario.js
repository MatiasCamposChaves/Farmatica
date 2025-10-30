import { API_BASE, $, $all, toast } from './common.js';
import { requireAuth, mountHeaderActive, getUser } from './auth.js';

const user = requireAuth();
mountHeaderActive('inv');

const isAdmin = user?.role === 'admin';
$('#admin-tools').style.display = isAdmin ? 'block' : 'none';

const tbody = $('#tbody');
const q = $('#q');
const categoria = $('#categoria');

$('#btnBuscar').addEventListener('click', load);
q.addEventListener('keydown', e=>{ if(e.key==='Enter'){ load(); } });

$('#btnNuevo')?.addEventListener('click', ()=> openDialog());
$('#dlgClose').addEventListener('click', closeDialog);
$('#cancelar').addEventListener('click', closeDialog);

let editingId = null;

async function load(){
  const params = new URLSearchParams();
  if(q.value.trim()) params.append('search', q.value.trim());
  if(categoria.value) params.append('categoria', categoria.value);

  const res = await fetch(`${API_BASE}/medicamentos?${params.toString()}`);
  const data = await res.json();
  if(!data.ok) return toast('No se pudo obtener inventario','error');

  render(data.data);
}
load();

function render(items){
  tbody.innerHTML = '';
  if(!items.length){
    tbody.innerHTML = `<tr><td colspan="7" class="muted" style="padding:16px">Sin resultados</td></tr>`;
    return;
  }
  for(const it of items){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.codigo}</td>
      <td>${it.nombre}</td>
      <td>${it.categoria || '-'}</td>
      <td>₡${Number(it.precio_unitario).toFixed(2)}</td>
      <td>
        ${stockBadge(it.stock_actual)}
      </td>
      <td>${it.fecha_vencimiento ? it.fecha_vencimiento.slice(0,10) : '-'}</td>
      <td>
        ${isAdmin ? actionButtons(it.id) : '<span class="muted">Solo lectura</span>'}
      </td>
    `;
    tbody.appendChild(tr);

    if(isAdmin){
      tr.querySelector('.edit').addEventListener('click', ()=> openDialog(it));
      tr.querySelector('.del').addEventListener('click', ()=> removeItem(it));
    }
  }
}

function stockBadge(n){
  const cls = n < 10 ? 'badge low' : 'badge ok';
  const txt = n < 10 ? 'Bajo' : 'OK';
  return `<span class="${cls}">${n} · ${txt}</span>`;
}

function actionButtons(id){
  return `
    <div class="tools">
      <button class="btn edit" data-id="${id}">Editar</button>
      <button class="btn danger del" data-id="${id}">Eliminar</button>
    </div>
  `;
}

function openDialog(item){
  editingId = item?.id ?? null;
  $('#dlgTitle').textContent = editingId ? 'Editar producto' : 'Nuevo producto';
  const f = $('#frm');
  f.reset();
  if(item){
    f.codigo.value = item.codigo;
    f.nombre.value = item.nombre;
    f.categoria.value = item.categoria || '';
    f.precio_unitario.value = Number(item.precio_unitario).toFixed(2);
    f.stock_actual.value = item.stock_actual;
    f.fecha_vencimiento.value = item.fecha_vencimiento ? item.fecha_vencimiento.slice(0,10) : '';
    f.proveedor.value = item.proveedor || '';
  }
  $('#dlg').showModal();
}

function closeDialog(){ $('#dlg').close(); }

$('#frm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const f = e.currentTarget;
  const payload = {
    codigo: f.codigo.value.trim(),
    nombre: f.nombre.value.trim(),
    categoria: f.categoria.value.trim() || null,
    precio_unitario: Number(f.precio_unitario.value),
    stock_actual: Number(f.stock_actual.value),
    fecha_vencimiento: f.fecha_vencimiento.value || null,
    proveedor: f.proveedor.value.trim() || null
  };

  try{
    if(editingId){
      // update
      const res = await fetch(`${API_BASE}/medicamentos/${editingId}`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!data.ok) return toast(data.msg || 'No se pudo actualizar','error');
      toast('Producto actualizado');
    }else{
      // create
      const res = await fetch(`${API_BASE}/medicamentos`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!data.ok) return toast(data.msg || 'No se pudo crear','error');
      toast('Producto creado');
    }
    closeDialog();
    load();
  }catch(err){
    toast('Error de red','error');
  }
});

async function removeItem(item){
  if(!confirm(`¿Eliminar "${item.nombre}"?`)) return;
  try{
    const res = await fetch(`${API_BASE}/medicamentos/${item.id}`, { method:'DELETE' });
    const data = await res.json();
    if(!data.ok) return toast(data.msg || 'No se pudo eliminar','error');
    toast('Eliminado');
    load();
  }catch(err){
    toast('Error de red','error');
  }
}