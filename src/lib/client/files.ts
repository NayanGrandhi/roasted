import type { SubjectFile } from "@/lib/types";

const MAX_PDF = 4 * 1024 * 1024;
const MAX_RAW = 25 * 1024 * 1024;

export class FileError extends Error {}

function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new FileError("Couldn't read that file."));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new FileError("Couldn't open that image. Try a JPG or PNG."));
    img.src = src;
  });
}

/** Resize + recompress images in the browser so uploads are fast and fit free-tier limits. */
async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<SubjectFile & { previewUrl: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return {
      name: file.name,
      mimeType: "image/jpeg",
      data: dataUrl.split(",")[1],
      previewUrl: dataUrl,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareFile(
  file: File,
  kinds: ("image" | "pdf")[],
): Promise<SubjectFile & { previewUrl?: string }> {
  if (file.size > MAX_RAW) throw new FileError("That file is huge. Keep it under 25MB.");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(file.name);

  if (isPdf) {
    if (!kinds.includes("pdf")) throw new FileError("This one needs an image, not a PDF.");
    if (file.size > MAX_PDF) throw new FileError("PDF is over 4MB. Export a lighter version or upload a screenshot.");
    const dataUrl = await readAsDataURL(file);
    return { name: file.name, mimeType: "application/pdf", data: dataUrl.split(",")[1] };
  }
  if (isImage) {
    if (!kinds.includes("image")) throw new FileError("This mode doesn't take images.");
    return compressImage(file);
  }
  throw new FileError(kinds.includes("pdf") ? "Upload a PDF or an image." : "Upload an image (JPG, PNG, WebP).");
}
