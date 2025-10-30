export const ok = (res, data) => res.status(200).json({ ok: true, data });
export const created = (res, data) => res.status(201).json({ ok: true, data });
export const badRequest = (res, msg) => res.status(400).json({ ok: false, msg });
export const notFound = (res, msg = 'No encontrado') => res.status(404).json({ ok: false, msg });
export const fail = (res, err) => {
  console.error(err);
  return res.status(500).json({ ok: false, msg: 'Error interno', detail: String(err?.message || err) });
};