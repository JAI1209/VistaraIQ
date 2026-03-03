import { Blueprint, Version } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export class ServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type BlueprintWithVersions = Blueprint & { versions: Version[] };

async function ensureBlueprintOwnership(
  blueprintId: string,
  userId: string
): Promise<BlueprintWithVersions> {
  const blueprint = await prisma.blueprint.findUnique({
    where: { id: blueprintId },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!blueprint) {
    throw new ServiceError("Blueprint not found", 404);
  }

  if (blueprint.userId !== userId) {
    throw new ServiceError("Forbidden", 403);
  }

  return blueprint;
}

export async function createBlueprint(userId: string, title: string, content: string) {
  if (!title || !content) {
    throw new ServiceError("Title and content are required", 400);
  }

  return prisma.blueprint.create({
    data: {
      userId,
      title,
      content,
    },
  });
}

export async function listUserBlueprints(userId: string) {
  return prisma.blueprint.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getBlueprintById(id: string, userId: string) {
  return ensureBlueprintOwnership(id, userId);
}

export async function createVersionSnapshot(blueprintId: string, content: string) {
  return prisma.version.create({
    data: {
      blueprintId,
      content,
    },
  });
}

export async function updateBlueprint(id: string, userId: string, content: string) {
  if (!content) {
    throw new ServiceError("Content is required", 400);
  }

  await ensureBlueprintOwnership(id, userId);

  return prisma.$transaction(async (tx) => {
    await tx.version.create({
      data: {
        blueprintId: id,
        content,
      },
    });

    return tx.blueprint.update({
      where: { id },
      data: { content },
    });
  });
}

export async function deleteBlueprint(id: string, userId: string) {
  await ensureBlueprintOwnership(id, userId);

  return prisma.$transaction(async (tx) => {
    await tx.version.deleteMany({ where: { blueprintId: id } });
    await tx.blueprint.delete({ where: { id } });
    return { deleted: true };
  });
}
