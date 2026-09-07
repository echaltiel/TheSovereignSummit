export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const email = ((req.body && req.body.email) || '').toString().trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ error: 'Invalid email' });
  }
  const key = process.env.BREVO_API_KEY;
  const listId = parseInt(process.env.BREVO_LIST_ID || '', 10);
  if (!key || !listId) {
    return res.status(500).json({ error: 'Not configured' });
  }
  const payload = {
    email: email,
    listIds: [listId],
    updateEnabled: true,
    attributes: { SOURCE: 'thesovereignsummit.com' }
  };
  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  // 201 = created, 204 = existing contact updated/added to list
  if (r.ok) {
    return res.status(200).json({ ok: true });
  }
  return res.status(502).json({ error: 'Upstream error' });
}
