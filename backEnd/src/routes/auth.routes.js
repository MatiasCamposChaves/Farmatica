import { Router } from 'express';
import { ok, badRequest } from '../utils/http.js';

const router = Router();

// Usuarios quemados
const USERS = [
  { email: 'admin@farmaticas.com', password: 'Admin123', role: 'admin', name: 'Admin' },
  { email: 'user@farmaticas.com',  password: 'User123',  role: 'viewer', name: 'Usuario' }
];

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return badRequest(res, 'Email y contraseña son requeridos');

  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) return badRequest(res, 'Credenciales inválidas');

  // En un futuro podés retornar un JWT. Por ahora devolvemos el perfil.
  return ok(res, { email: user.email, role: user.role, name: user.name });
});

export default router;