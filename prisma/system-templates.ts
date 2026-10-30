import type { PrismaClient } from "@/app/generated/prisma/client";

// 📚 System templates = masters, copied to every new owner at signup.
// Never edited after release. Need something different? Add a NEW template.
const SYSTEM_TEMPLATES = [
  {
    name: "Standard Turnover",
    description: "Between-guest cleaning checklist.",
    tasks: [
      { name: "Strip and remake all beds with fresh linen", room: "Bedroom", requiresCleanerPhoto: true },
      { name: "Replace towels and bath mats", room: "Bathroom", requiresCleanerPhoto: false },
      { name: "Clean and disinfect toilet, sink, and shower", room: "Bathroom", requiresCleanerPhoto: true },
      { name: "Wipe kitchen counters, stovetop, and sink", room: "Kitchen", requiresCleanerPhoto: false },
      { name: "Wash and put away all dishes", room: "Kitchen", requiresCleanerPhoto: false },
      { name: "Empty fridge of guest leftovers", room: "Kitchen", requiresCleanerPhoto: true },
      { name: "Vacuum and mop all floors", room: "Whole chalet", requiresCleanerPhoto: false },
      { name: "Empty all bins and replace bags", room: "Whole chalet", requiresCleanerPhoto: false },
      { name: "Sweep terrace or balcony", room: "Outdoor", requiresCleanerPhoto: false },
    ],
  },
];

// ♻️ Idempotent: creates missing system templates, skips existing ones.
export async function seedSystemTemplates(prisma: PrismaClient) {
  for (const template of SYSTEM_TEMPLATES) {
    // 🔎 System template = ownerId null + this name
    const existing = await prisma.cleaningSessionTemplate.findFirst({
      where: { ownerId: null, name: template.name },
    });

    if (existing) {
      console.log(`⏭️  System template exists, skipping: ${template.name}`);
      continue;
    }

    // 📋 Template + all its tasks in ONE create (all-or-nothing)
    await prisma.cleaningSessionTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        // no ownerId → null → system template
        templateTasks: { create: template.tasks },
      },
    });

    console.log(`✅ Created system template: ${template.name}`);
  }
}