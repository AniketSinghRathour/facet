import sharp from "sharp";
import { config } from "../config.js";

export async function generatePreview(originalBuffer) {
  return sharp(originalBuffer)
    .resize({ width: config.image.previewWidth, withoutEnlargement: true })
    .webp({ quality: config.image.previewQuality })
    .toBuffer();
}

export async function generateIndexingCopy(originalBuffer) {
  return sharp(originalBuffer)
    .resize({ width: config.image.indexingCopyWidth, withoutEnlargement: true })
    .jpeg({ quality: config.image.indexingCopyQuality })
    .toBuffer();
}
