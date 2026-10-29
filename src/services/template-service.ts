import type { Prisma } from "@/app/generated/prisma/client";
import { TemplateRepository } from "@/repository/template-repository";

// The shape of one system template as the repository returns it
type SystemTemplate = Awaited<
  ReturnType<typeof TemplateRepository.findSystemTemplatesWithTasks>
>[number];

// 1. Mapper: system template → a copy owned by this owner
function toOwnerCopyData(
  template: SystemTemplate,
  ownerId: string
): Prisma.CleaningSessionTemplateCreateInput {
  return {
    name: template.name,                          // ✅ same
    description: template.description,            // ✅ same
    owner: { connect: { userId: ownerId } },      // 🔁 change: now owned by this owner
    templateTasks: {
      create: template.templateTasks.map((task) => ({
        name: task.name,                          // ✅ same
        description: task.description,
        room: task.room,
        requiresCleanerPhoto: task.requiresCleanerPhoto,
        ownerReferenceImageUrl: task.ownerReferenceImageUrl,
      })),
    },
    // ⏭️ id, createdAt, archivedAt → left out, the DB handles them
  };
}

// 2. Service
export class TemplateService {
  // 📋 Copies every active system template (+ tasks) to this owner
  static async copySystemTemplatesToOwner(
    ownerId: string,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    const systemTemplates =
      await TemplateRepository.findSystemTemplatesWithTasks(tx);   // 📖 read

    for (const template of systemTemplates) {
      await TemplateRepository.createTemplate(
        toOwnerCopyData(template, ownerId),                          // 🛠️ build copy
        tx
      );                                                             // ✏️ write
    }
  }
}