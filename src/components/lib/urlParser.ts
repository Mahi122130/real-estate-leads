export function getEmbedVideoUrl(url: string): string {
  if (!url) return "";
  try {
    if (url.includes("/embed/")) return url;

    // Dynamically extract video ID from any standard YouTube/youtu.be link format
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  } catch (error) {
    console.error("Video URL parsing error:", error);
    return url;
  }
}

export function getDownloadableFileUrl(url: string): string {
  if (!url) return "";
  try {
    // Dynamically extract file ID from common cloud storage sharing link patterns (like Google Drive)
    const fileIdMatch = url.match(/[-\w]{25,}/);
    if (url.includes("drive.google.com") && fileIdMatch) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[0]}`;
    }
    return url;
  } catch (error) {
    console.error("File URL parsing error:", error);
    return url;
  }
}