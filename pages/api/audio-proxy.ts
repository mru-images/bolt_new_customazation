// /pages/api/audio-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

const token = 'fE93KkZMjhg7ZtHMudQY9CHj5m8MDH3CFxLEKsw1y';
const cache = new Map<string, string>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileid } = req.query;
  if (!fileid || typeof fileid !== 'string') {
    return res.status(400).json({ error: 'Missing fileid' });
  }

  try {
    let streamUrl = cache.get(fileid);
    if (!streamUrl) {
      const metaRes = await fetch(`https://api.pcloud.com/getfilelink?fileid=${fileid}&auth=${token}`);
      const metaData = await metaRes.json();

      if (metaData.result !== 0 || !metaData.hosts?.length || !metaData.path) {
        return res.status(500).json({ error: 'Failed to fetch link' });
      }

      streamUrl = `https://${metaData.hosts[0]}${metaData.path}`;
      cache.set(fileid, streamUrl);
    }

    https.get(
      streamUrl,
      {
        headers: {
          Range: req.headers.range || '', // Forward Range header
        },
      },
      (pcloudRes) => {
        res.writeHead(pcloudRes.statusCode || 200, pcloudRes.headers);
        pcloudRes.pipe(res);
      }
    ).on('error', (err) => {
      console.error('Proxy error:', err);
      res.status(500).end('Stream failed');
    });

  } catch (error) {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Unhandled exception' });
  }
}
