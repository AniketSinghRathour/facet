import prismaClientPkg from "@prisma/client";
const { PrismaClient } = prismaClientPkg;

import { PrismaNeon } from "@prisma/adapter-neon";
import { config } from "../config.js";

if (!config.database.connectionString) {
  throw new Error(
    `DATABASE_URL connection string is missing or undefined. Current process.env.DATABASE_URL: ${JSON.stringify(process.env.DATABASE_URL)}`
  );
}

const adapter = new PrismaNeon({ connectionString: config.database.connectionString });
const prisma = new PrismaClient({ adapter });

export async function isAlreadyIndexed(photoId) {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { status: true },
  });
  return photo?.status === "INDEXED" || photo?.status === "indexed";
}

export async function saveIndexingResult({ photoId, faceRecords, previewKey }) {
  await prisma.$transaction([
    prisma.face.deleteMany({ where: { photoId } }),
    ...faceRecords.map((face) =>
      prisma.face.create({
        data: {
          photoId,
          rekognitionFaceId: face.Face.FaceId,
          boundingBox: face.Face.BoundingBox,
          confidence: face.Face.Confidence,
        },
      })
    ),
    prisma.photo.update({
      where: { id: photoId },
      data: {
        status: "INDEXED",
        indexedAt: new Date(),
        r2KeyPreview: previewKey,
        errorMessage: null,
      },
    }),
  ]);
}

export async function markPhotoFailed(photoId, errorMessage) {
  try {
    await prisma.photo.updateMany({
      where: { id: photoId, status: { notIn: ["INDEXED", "indexed"] } },
      data: { status: "FAILED", errorMessage: errorMessage?.slice(0, 500) || null },
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        message: "Failed to record photo failure state",
        photoId,
        error: err.message,
      })
    );
  }
}
