import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";

export class TemplateRepository {
  // 📖 System templates (ownerId = null) + their tasks, active only
  static async findSystemTemplatesWithTasks(
    db: Prisma.TransactionClient = prisma
  ) {
    return db.cleaningSessionTemplate.findMany({
      where: { ownerId: null, archivedAt: null },
      include: { templateTasks: { where: { archivedAt: null } } },
    });
  }

  // ✏️ Create a template (+ its tasks, if included in data)
  static async createTemplate(
    data: Prisma.CleaningSessionTemplateCreateInput,
    db: Prisma.TransactionClient = prisma
  ) {
    return db.cleaningSessionTemplate.create({ data });
  }
}

