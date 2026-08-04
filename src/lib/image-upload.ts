export interface MediaItem {
  url: string;
  name?: string;
  type?: "image" | "video";
}

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Resolve a picked/dropped/pasted image file to a URL: hands off to
 * `onImageUpload` when provided, otherwise falls back to embedding it as a
 * base64 data URL.
 */
export function resolveImageUpload(
  file: File,
  onImageUpload?: (file: File) => Promise<string>,
): Promise<string> {
  return onImageUpload ? onImageUpload(file) : readAsDataUrl(file);
}
