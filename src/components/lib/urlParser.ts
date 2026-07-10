// Converts a normal YouTube/Vimeo link into an embeddable iframe src.
export function getEmbedVideoUrl(url: string): string {
  if (!url) return "";
  try {
    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Already an embed link or unrecognized provider — pass through.
    return url;
  } catch {
    return url;
  }
}

// Converts a Google Drive "view" link into a direct-download link.
// Other URLs (e.g. direct PDF links, S3 links) are passed through unchanged.
export function getDownloadableFileUrl(url: string): string {
  if (!url) return "";
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }
  return url;
}