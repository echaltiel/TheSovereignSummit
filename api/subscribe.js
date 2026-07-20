export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const email = ((req.body && req.body.email) || '').toString().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ error: 'Invalid email' });
  }
  const key = process.env.MAILERLITE_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Not configured' });
  }
  const r = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email: email })
  });
  if (r.ok) {
    return res.status(200).json({ ok: true });
  }
  return res.status(502).json({ error: 'Upstream error' });
}
