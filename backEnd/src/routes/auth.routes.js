import { Router } from 'express';
const router = Router();

// Usuarios quemados
const USERS = [
  { email: 'admin@farmaticas.com', password: 'Admin123', name: 'Matias', role: 'admin' },
  { email: 'user@farmaticas.com', password: 'User123', name: 'Cliente', role: 'user' }
];

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });
  res.json({ ok: true, data: { email: user.email, name: user.name, role: user.role } });
});

export default router;