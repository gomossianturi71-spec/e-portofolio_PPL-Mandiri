export function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') {
        const v = parsed.searchParams.get('v');
        return v && /^[\w-]{11}$/.test(v) ? v : null;
      }
      const embedMatch = parsed.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/);
      if (embedMatch) return embedMatch[1];
    }
  } catch {
    // not a valid URL — fall through to regex
  }

  const patterns = [
    /youtube\.com\/watch\?(?:[^&]*&)*v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/(?:embed|shorts)\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return getYouTubeId(url) !== null;
}

export function getVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const m = parsed.pathname.match(/(?:video\/)?(\d+)/);
      return m ? m[1] : null;
    }
  } catch {
    // fall through
  }
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export function isVimeoUrl(url: string): boolean {
  return getVimeoId(url) !== null;
}

/**
 * Converts any supported YouTube/Vimeo URL into a valid embed URL.
 * Supports: watch?v=, youtu.be/, /embed/, /shorts/, playlist params.
 * Uses the standard youtube.com/embed/ domain (not youtube-nocookie.com).
 */
export function getEmbedUrl(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) {
    const params = new URLSearchParams();

    // Preserve playlist parameter if present in original URL
    try {
      const parsed = new URL(url);
      const list = parsed.searchParams.get('list');
      if (list) {
        params.set('list', list);
      }
    } catch {
      // not a valid URL object — skip playlist param
    }

    params.set('rel', '0');
    params.set('modestbranding', '1');

    return `https://www.youtube.com/embed/${ytId}?${params.toString()}`;
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;

  return null;
}

export function canEmbed(url: string): boolean {
  return getEmbedUrl(url) !== null;
}

export function getYouTubeWatchUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}
