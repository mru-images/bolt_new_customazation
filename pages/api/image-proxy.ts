import type { NextApiRequest, NextApiResponse } from 'next';

const AUTH_TOKEN = 'fE93KkZMjhg7ZtHMudQY9CHj5m8MDH3CFxLEKsw1y';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fileid = req.query.fileid as string;

  if (!fileid) {
    return res.status(400).json({ error: 'Missing fileid' });
  }

  try {
    const meta = await fetch(`https://api.pcloud.com/getfilelink?fileid=${fileid}&auth=${AUTH_TOKEN}`);
    const json = await meta.json();

    if (json.result !== 0) {
      return res.status(500).json({ error: json.error });
    }

    const fileUrl = `https://${json.hosts[0]}${json.path}`;
    const imageRes = await fetch(fileUrl);

    res.setHeader('Content-Type', imageRes.headers.get('Content-Type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = await imageRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Image proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}
