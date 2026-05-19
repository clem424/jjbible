/**
 * Convertit une URL publique YouTube/TikTok/Instagram en URL d'embed iframe.
 */
export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');

    // YouTube
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      // /shorts/xxxx
      const m = u.pathname.match(/\/shorts\/([\w-]+)/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
    if (host === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }

    // TikTok : on utilise l'embed officiel
    if (host.endsWith('tiktok.com')) {
      const m = u.pathname.match(/\/video\/(\d+)/);
      if (m) return `https://www.tiktok.com/embed/v2/${m[1]}`;
    }

    // Instagram : reels et posts
    if (host.endsWith('instagram.com')) {
      // garde le path et ajoute /embed
      const cleanPath = u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname;
      return `https://www.instagram.com${cleanPath}/embed`;
    }
  } catch {
    return null;
  }
  return null;
}
