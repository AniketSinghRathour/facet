import { parsePhotoKey, InvalidPhotoKeyError } from "../utils/parsePhotoKey.js";
import { createLogger } from "../utils/logger.js";
import { downloadObject } from "../services/s3Service.js";
import { generatePreview, generateIndexingCopy } from "../services/imageService.js";
import { uploadPreview } from "../services/r2Service.js";
import { indexFaces, RekognitionPermanentError } from "../services/rekognitionService.js";
import { isAlreadyIndexed, saveIndexingResult, markPhotoFailed } from "../services/dbService.js";

const rootLogger = createLogger({ handler: "indexPhoto" });

function parsePhotoKeyFromRecordSafely(record) {
  try {
    const s3Event = JSON.parse(record.body);
    const key = decodeURIComponent(s3Event.Records[0].s3.object.key.replace(/\+/g, " "));
    const match = key.match(/^originals\/([^/]+)\/([^/.]+)\.[a-zA-Z0-9]+$/);
    if (match) {
      return { eventId: match[1], photoId: match[2] };
    }
  } catch {
    // best-effort parsing only
  }
  return { eventId: null, photoId: null };
}

async function processRecord(record) {
  const s3Event = JSON.parse(record.body);
  const s3Info = s3Event.Records[0].s3;
  const bucket = s3Info.bucket.name;
  const key = decodeURIComponent(s3Info.object.key.replace(/\+/g, " "));

  if (key.endsWith("/")) {
    rootLogger.info("Ignoring folder creation event", { key, messageId: record.messageId });
    return;
  }

  const { eventId, photoId } = parsePhotoKey(key);
  const logger = rootLogger.child({ eventId, photoId, messageId: record.messageId });

  logger.info("Processing photo");

  const alreadyDone = await isAlreadyIndexed(photoId);
  if (alreadyDone) {
    logger.info("Photo already indexed, skipping (idempotent retry)");
    return;
  }

  const originalBuffer = await downloadObject(bucket, key);

  const [previewBuffer, indexingCopyBuffer] = await Promise.all([
    generatePreview(originalBuffer),
    generateIndexingCopy(originalBuffer),
  ]);

  const previewKey = `previews/${eventId}/${photoId}.webp`;
  await uploadPreview(previewKey, previewBuffer);

  const faceRecords = await indexFaces(eventId, indexingCopyBuffer);
  logger.info("Indexing complete", { facesFound: faceRecords.length });

  await saveIndexingResult({ photoId, faceRecords, previewKey });
}

export const handler = async (event) => {
  const batchItemFailures = [];

  for (const record of event.Records) {
    try {
      await processRecord(record);
    } catch (err) {
      rootLogger.error("Failed to process record", { messageId: record.messageId, error: err });

      const receiveCount = parseInt(record.attributes?.ApproximateReceiveCount || "1", 10);
      const isPermanent = err instanceof RekognitionPermanentError || err instanceof InvalidPhotoKeyError;

      // Mark failed in DB immediately for permanent errors, or when max retries reached prior to DLQ
      if (isPermanent || receiveCount >= 3) {
        try {
          const { photoId } = parsePhotoKeyFromRecordSafely(record);
          const failureReason = isPermanent
            ? err.message
            : `Exceeded maximum retries (${receiveCount} attempts, sent to DLQ): ${err.message}`;
          if (photoId) await markPhotoFailed(photoId, failureReason);
        } catch {
          // best-effort only
        }
      }

      // Retry transient errors until maxReceiveCount triggers DLQ
      if (!isPermanent) {
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }
  }

  return { batchItemFailures };
};
