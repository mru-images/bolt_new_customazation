const imageCache: Record<number, string> = {};

const AUTH_TOKEN = "fE93KkZMjhg7ZtHMudQY9CHj5m8MDH3CFxLEKsw1y";

export async function getFileLink(fileId: number): Promise<string> {
  if (imageCache[fileId]) {
    return imageCache[fileId];
  }

  const response = await fetch(`https://api.pcloud.com/getfilelink?fileid=${fileId}&auth=${AUTH_TOKEN}`);
  const data = await response.json();

  if (data.result === 0) {
    const url = `https://${data.hosts[0]}${data.path}`;
    imageCache[fileId] = url;
    return url;
  } else {
    throw new Error(data.error || "Failed to get link");
  }
}
