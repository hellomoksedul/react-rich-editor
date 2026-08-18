import { readAsDataUrl } from "./image-upload";

export interface FileAttachmentMeta {
  url: string;
  name: string;
  size: number;
}

/**
 * Resolve a picked/dropped file to a URL + metadata: hands off to
 * `onFileUpload` when provided, otherwise falls back to embedding it as a
 * base64 data URL (fine for small files; pass `onFileUpload` for a real
 * backend so large attachments don't bloat the saved HTML).
 */
export async function resolveFileUpload(
  file: File,
  onFileUpload?: (file: File) => Promise<string>,
): Promise<FileAttachmentMeta> {
  const url = onFileUpload ? await onFileUpload(file) : await readAsDataUrl(file);
  return { url, name: file.name, size: file.size };
}
