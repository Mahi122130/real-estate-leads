// ---------------------------------------------------------------------------
// VIDEO EMBEDDING
// ---------------------------------------------------------------------------

export type VideoEmbedInfo =
  | { type: "iframe"; src: string }
  | { type: "direct"; src: string } // render with a native <video> tag
  | { type: "unsupported"; src: string };

function withProtocol(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

// Inspects a pasted URL and returns how the frontend should render it.
// Covers: YouTube (watch/embed/youtu.be/shorts), Vimeo, Loom, Google Drive,
// and direct video files (.mp4/.webm/.ogg/.mov).
export function getVideoEmbedInfo(rawUrl: string): VideoEmbedInfo {
  if (!rawUrl || !rawUrl.trim()) return { type: "unsupported", src: "" };

  const url = withProtocol(rawUrl.trim());

  try {
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (youtubeMatch) {
      return { type: "iframe", src: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
    }

    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    }

    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
      return { type: "iframe", src: `https://www.loom.com/embed/${loomMatch[1]}` };
    }

    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      // Google Drive's /preview endpoint is the one that's actually
      // embeddable in an iframe — the normal "view" link is not.
      return { type: "iframe", src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
    }

    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
      return { type: "direct", src: url };
    }

    // Already looks like an embed URL (e.g. pasted an /embed/ link directly).
    if (/\/embed\//i.test(url) || /player\.vimeo\.com/i.test(url)) {
      return { type: "iframe", src: url };
    }

    return { type: "unsupported", src: url };
  } catch {
    return { type: "unsupported", src: rawUrl };
  }
}

// ---------------------------------------------------------------------------
// DOCUMENT DOWNLOAD (used by the Telegram bot)
// ---------------------------------------------------------------------------

// Converts common "share/view" links into a direct-download link.
// IMPORTANT: For Google Drive files above ~25MB (or any file Google flags),
// Drive shows an HTML "can't scan for viruses" confirmation page instead of
// the file itself — and that HTML page is what gets sent to Telegram. The
// `confirm=t` param below bypasses that for most files, but it is not
// bulletproof. For production, prefer hosting documents on a direct file
// host (S3, Vercel Blob, Cloudinary, your own CDN) over Google Drive.
export function getDownloadableFileUrl(url: string): string {
  if (!url) return "";
  const clean = withProtocol(url.trim());

  const driveMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.usercontent.google.com/download?id=${driveMatch[1]}&export=download&confirm=t`;
  }

  const dropboxMatch = clean.match(/dropbox\.com\/(s|scl)\/(.+)/);
  if (dropboxMatch) {
    // Dropbox share links preview by default; dl=1 forces a raw download.
    if (clean.includes("dl=0")) return clean.replace("dl=0", "dl=1");
    if (clean.includes("dl=1")) return clean;
    return clean + (clean.includes("?") ? "&dl=1" : "?dl=1");
  }

  return clean;
}

// Quick heuristic used by the admin panel to warn about likely-broken
// document links before they get saved.
export function isLikelyLargeDriveFile(url: string): boolean {
  return /drive\.google\.com\/file\/d\//i.test(url);
}