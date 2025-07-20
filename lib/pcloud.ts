const AUTH_TOKEN = 'fE93KkZMjhg7ZtHMudQY9CHj5m8MDH3CFxLEKsw1y';

const imageCache = new Map<number, string>();

export async function getFileLink(fileId: number): Promise<string> {
  if (imageCache.has(fileId)) return imageCache.get(fileId)!;

  const res = await fetch(`https://api.pcloud.com/getfilelink?fileid=${fileId}&auth=${AUTH_TOKEN}`);
  const data = await res.json();

  if (data.result === 0) {
    const link = `https://${data.hosts[0]}${data.path}`;
    imageCache.set(fileId, link);
    return link;
  }

  throw new Error(data.error || 'Failed to get link');
}
