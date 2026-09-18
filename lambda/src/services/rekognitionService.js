import { RekognitionClient, IndexFacesCommand, CreateCollectionCommand } from "@aws-sdk/client-rekognition";
import { config } from "../config.js";

const client = new RekognitionClient({ region: config.rekognitionRegion });

const PERMANENT_FAILURE_CODES = new Set([
  "InvalidImageFormatException",
  "ImageTooLargeException",
  "InvalidParameterException",
]);

export class RekognitionPermanentError extends Error {
  constructor(originalError) {
    super(`Permanent Rekognition failure: ${originalError.name} - ${originalError.message}`);
    this.name = "RekognitionPermanentError";
    this.cause = originalError;
  }
}

export async function indexFaces(collectionId, imageBuffer) {
  try {
    const result = await client.send(
      new IndexFacesCommand({
        CollectionId: collectionId,
        Image: { Bytes: imageBuffer },
        QualityFilter: "AUTO",
      })
    );
    return result.FaceRecords || [];
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`Collection ${collectionId} not found, creating it automatically...`);
      await client.send(new CreateCollectionCommand({ CollectionId: collectionId }));
      
      const retryResult = await client.send(
        new IndexFacesCommand({
          CollectionId: collectionId,
          Image: { Bytes: imageBuffer },
          QualityFilter: "AUTO",
        })
      );
      return retryResult.FaceRecords || [];
    }

    if (PERMANENT_FAILURE_CODES.has(err.name)) {
      throw new RekognitionPermanentError(err);
    }
    throw err;
  }
}
