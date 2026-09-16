import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

// =========================================================
// DATE HELPERS
// Keep seeded sessions relative to today so the world
// remains useful whenever the seed script is run.
// =========================================================

function dateOnly(daysFromToday: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(0, 0, 0, 0);
  return date;
}

function timeOnly(hours: number, minutes = 0): Date {
  // PostgreSQL @db.Time only cares about the time portion.
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
}

// =========================================================
// MAIN
// =========================================================

async function main() {
  console.log("🌱 Seeding Yalla Crew...");

  // =======================================================
  // RESET DATABASE
  // Delete children before parents because not all of your
  // relations currently use onDelete: Cascade.
  // =======================================================

  await prisma.taskImage.deleteMany();
  await prisma.cleaningSessionTask.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.cleaningSession.deleteMany();
  await prisma.templateTask.deleteMany();
  await prisma.cleaningSessionTemplate.deleteMany();
  await prisma.chaletImage.deleteMany();
  await prisma.chalet.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.user.deleteMany();

  // =======================================================
  // 1. USERS
  // =======================================================

  // -----------------------
  // Admin
  // -----------------------

  const adminMain = await prisma.user.create({
    data: {
      username: "Jad Khoury",
      role: "admin",
      email: "jad.khoury@yallacrew.com",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      passwordHash: "passwordHash",
      phoneNumber: "+96170123456",
    },
  });

  // -----------------------
  // Cleaners
  // -----------------------

  // Active + available
  const cleanerAvailable = await prisma.user.create({
    data: {
      username: "Maya Fares",
      role: "cleaner",
      email: "maya.fares@yallacrew.com",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      passwordHash: "passwordHash",
      phoneNumber: "+96171234567",
      cleanerStatus: "active",
    },
  });

  // Active, but will have a conflicting booking
  const cleanerBusy = await prisma.user.create({
    data: {
      username: "Rami Nasrallah",
      role: "cleaner",
      email: "rami.nasrallah@yallacrew.com",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      passwordHash: "passwordHash",
      phoneNumber: "+96176345678",
      cleanerStatus: "active",
    },
  });

  // Has availability, but should not be eligible because inactive
  const cleanerInactive = await prisma.user.create({
    data: {
      username: "Sara Nassar",
      role: "cleaner",
      email: "sara.nassar@yallacrew.com",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      passwordHash: "passwordHash",
      phoneNumber: "+96170111222",
      cleanerStatus: "inactive",
    },
  });

  // -----------------------
  // Owners
  // -----------------------

  // Main verified owner used throughout the seeded world
  const ownerMain = await prisma.user.create({
    data: {
      username: "Karim Aoun",
      role: "owner",
      email: "karim.aoun@gmail.com",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      passwordHash: "passwordHash",
      phoneNumber: "+96178456789",
      profileImage: "https://example.com/profiles/karim.jpg",
    },
  });

  // Required persistent state for FR-003
  const ownerUnverified = await prisma.user.create({
    data: {
      username: "Layal Haddad",
      role: "owner",
      email: "layal.haddad@gmail.com",
      emailVerified: false,
      emailVerifiedAt: null,
      passwordHash: "passwordHash",
      phoneNumber: "+96179567890",
      profileImage: null,
    },
  });

  // =======================================================
  // 2. CLEANER AVAILABILITY
  // =======================================================

  // Active + free cleaner
  await prisma.availabilitySlot.createMany({
    data: [
      {
        userId: cleanerAvailable.userId,
        date: dateOnly(1),
        startTime: timeOnly(9),
        endTime: timeOnly(13),
      },
      {
        userId: cleanerAvailable.userId,
        date: dateOnly(1),
        startTime: timeOnly(14),
        endTime: timeOnly(18),
      },
      {
        userId: cleanerAvailable.userId,
        date: dateOnly(3),
        startTime: timeOnly(10),
        endTime: timeOnly(16),
      },
    ],
  });

  // Active cleaner with availability, but we'll book part of it
  await prisma.availabilitySlot.create({
    data: {
      userId: cleanerBusy.userId,
      date: dateOnly(1),
      startTime: timeOnly(9),
      endTime: timeOnly(17),
    },
  });

  // Deliberately has availability despite being inactive
  await prisma.availabilitySlot.create({
    data: {
      userId: cleanerInactive.userId,
      date: dateOnly(1),
      startTime: timeOnly(9),
      endTime: timeOnly(17),
    },
  });

  // =======================================================
  // 3. CHALETS
  // =======================================================

  // Has upcoming work
  const chaletActive = await prisma.chalet.create({
    data: {
      ownerId: ownerMain.userId,
      name: "Cedars Chalet",
      location: "Faraya, Lebanon",
      latitude: 34.01000000,
      longitude: 35.83000000,
      accessInstructions:
        "Key is available in the lockbox beside the entrance.",
      permanentNotes:
        "Use wood-safe products on the living room floor.",
    },
  });

  // Has historical sessions
  const chaletHistory = await prisma.chalet.create({
    data: {
      ownerId: ownerMain.userId,
      name: "Mountain View Chalet",
      location: "Kfardebian, Lebanon",
      latitude: 33.99000000,
      longitude: 35.84000000,
      accessInstructions: null,
      permanentNotes: null,
    },
  });

  // No sessions — useful for deletion scenario
  const chaletEmpty = await prisma.chalet.create({
    data: {
      ownerId: ownerMain.userId,
      name: "Pine Retreat",
      location: "Faqra, Lebanon",
      latitude: 33.98000000,
      longitude: 35.81000000,
    },
  });

  // =======================================================
  // 4. CHALET IMAGES
  // =======================================================

  // Multiple images
  await prisma.chaletImage.createMany({
    data: [
      {
        chaletId: chaletActive.id,
        storageKey: "chalets/cedars/front.jpg",
        url: "https://example.com/chalets/cedars/front.jpg",
        isCover: true,
        displayOrder: 1,
      },
      {
        chaletId: chaletActive.id,
        storageKey: "chalets/cedars/living-room.jpg",
        url: "https://example.com/chalets/cedars/living-room.jpg",
        isCover: false,
        displayOrder: 2,
      },
    ],
  });

  // chaletHistory deliberately has 0 images

  // One image
  await prisma.chaletImage.create({
    data: {
      chaletId: chaletEmpty.id,
      storageKey: "chalets/pine/front.jpg",
      url: "https://example.com/chalets/pine/front.jpg",
      isCover: true,
      displayOrder: 1,
    },
  });

  // =======================================================
  // 5. CLEANING SESSION TEMPLATES
  // =======================================================

  const standardTemplate =
    await prisma.cleaningSessionTemplate.create({
      data: {
        ownerId: ownerMain.userId,
        name: "Standard Chalet Cleaning",
        description: "Regular chalet cleaning checklist.",
      },
    });

  const deepCleanTemplate =
    await prisma.cleaningSessionTemplate.create({
      data: {
        ownerId: ownerMain.userId,
        name: "Deep Cleaning",
        description: "More detailed cleaning checklist.",
      },
    });

  // =======================================================
  // 6. TEMPLATE TASKS
  // =======================================================

  const kitchenSurfaces = await prisma.templateTask.create({
    data: {
      cleaningSessionTemplateId: standardTemplate.id,
      name: "Clean kitchen surfaces",
      description: "Wipe counters and exterior surfaces.",
      room: "Kitchen",
      requiresCleanerPhoto: false,
    },
  });

  const refrigerator = await prisma.templateTask.create({
    data: {
      cleaningSessionTemplateId: standardTemplate.id,
      name: "Clean refrigerator",
      description: "Clean refrigerator shelves and surfaces.",
      room: "Kitchen",
      requiresCleanerPhoto: true,
    },
  });

  const masterBed = await prisma.templateTask.create({
    data: {
      cleaningSessionTemplateId: standardTemplate.id,
      name: "Make master bed",
      description: "Prepare the bed as shown in the reference photo.",
      room: "Bedroom",
      requiresCleanerPhoto: true,
      ownerReferenceImageUrl:
        "https://example.com/reference/master-bed.jpg",
    },
  });

  const sweepBalcony = await prisma.templateTask.create({
    data: {
      cleaningSessionTemplateId: standardTemplate.id,
      name: "Sweep balcony",
      description: null,
      room: "Balcony",
      requiresCleanerPhoto: false,
    },
  });

  // Some tasks for second template
  await prisma.templateTask.createMany({
    data: [
      {
        cleaningSessionTemplateId: deepCleanTemplate.id,
        name: "Deep clean oven",
        room: "Kitchen",
        requiresCleanerPhoto: true,
      },
      {
        cleaningSessionTemplateId: deepCleanTemplate.id,
        name: "Clean bathroom tiles",
        room: "Bathroom",
        requiresCleanerPhoto: false,
      },
    ],
  });

  // =======================================================
  // 7. CLEANING SESSIONS
  // =======================================================

  // A. Normal assigned upcoming session
  const sessionUpcomingAssigned =
    await prisma.cleaningSession.create({
      data: {
        chaletId: chaletActive.id,
        ownerId: ownerMain.userId,
        cleanerId: cleanerAvailable.userId,
        cleaningSessionTemplateId: standardTemplate.id,

        sessionDate: dateOnly(3),
        startTime: timeOnly(10),
        endTime: timeOnly(13),

        assignmentStatus: "assigned",
        completionStatus: "upcoming",
        paymentStatus: "pending",

        hourlyRate: 14,
        totalCost: 42,
      },
    });

  // B. No cleaner assigned
  const sessionUpcomingUnassigned =
    await prisma.cleaningSession.create({
      data: {
        chaletId: chaletActive.id,
        ownerId: ownerMain.userId,

        // Blank task-list request: deliberately no template
        cleaningSessionTemplateId: null,
        cleanerId: null,

        sessionDate: dateOnly(2),
        startTime: timeOnly(19),
        endTime: timeOnly(21),

        assignmentStatus: "unassigned",
        completionStatus: "upcoming",
        paymentStatus: "pending",

        hourlyRate: 14,
        totalCost: 28,
      },
    });

  // C. In-progress session
  //
  // This is intentionally today's date. If your service layer requires
  // the exact scheduled start time to start a session, adjust the time
  // when using this scenario interactively.
  const sessionInProgress =
    await prisma.cleaningSession.create({
      data: {
        chaletId: chaletActive.id,
        ownerId: ownerMain.userId,
        cleanerId: cleanerBusy.userId,
        cleaningSessionTemplateId: standardTemplate.id,

        sessionDate: dateOnly(0),
        startTime: timeOnly(9),
        endTime: timeOnly(12),

        assignmentStatus: "assigned",
        completionStatus: "in_progress",
        paymentStatus: "pending",

        hourlyRate: 14,
        totalCost: 42,
      },
    });

  // D. Completed but Yalla Crew has not received payment
  const sessionCompletedPending =
    await prisma.cleaningSession.create({
      data: {
        chaletId: chaletHistory.id,
        ownerId: ownerMain.userId,
        cleanerId: cleanerAvailable.userId,
        cleaningSessionTemplateId: standardTemplate.id,

        sessionDate: dateOnly(-3),
        startTime: timeOnly(10),
        endTime: timeOnly(14),

        assignmentStatus: "assigned",
        completionStatus: "completed",
        paymentStatus: "pending",

        hourlyRate: 14,
        totalCost: 56,
      },
    });

  // E. Completed + payment received
  const sessionCompletedReceived =
    await prisma.cleaningSession.create({
      data: {
        chaletId: chaletHistory.id,
        ownerId: ownerMain.userId,
        cleanerId: cleanerAvailable.userId,
        cleaningSessionTemplateId: deepCleanTemplate.id,

        sessionDate: dateOnly(-7),
        startTime: timeOnly(9),
        endTime: timeOnly(13),

        assignmentStatus: "assigned",
        completionStatus: "completed",
        paymentStatus: "received",
        paymentReceivedAt: dateOnly(-6),

        hourlyRate: 14,
        totalCost: 56,
      },
    });

  // F. Cancelled session
  const sessionCancelled =
    await prisma.cleaningSession.create({
      data: {
        chaletId: chaletHistory.id,
        ownerId: ownerMain.userId,
        cleanerId: cleanerBusy.userId,
        cleaningSessionTemplateId: standardTemplate.id,

        sessionDate: dateOnly(-2),
        startTime: timeOnly(15),
        endTime: timeOnly(17),

        assignmentStatus: "assigned",
        completionStatus: "cancelled",
        paymentStatus: "pending",

        hourlyRate: 14,
        totalCost: 28,

        cancellationReason: "Owner unavailable",
        cancelledAt: dateOnly(-3),
        cancelledBy: ownerMain.userId,
      },
    });

  // =======================================================
  // 8. CLEANING SESSION TASKS
  // =======================================================

  // -----------------------
  // Upcoming session
  // All tasks pending
  // -----------------------

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaningSessionId: sessionUpcomingAssigned.id,
        templateTaskId: kitchenSurfaces.id,
        name: kitchenSurfaces.name,
        description: kitchenSurfaces.description,
        room: kitchenSurfaces.room,
        requiresCleanerPhoto: false,
        status: "pending",
      },
      {
        cleaningSessionId: sessionUpcomingAssigned.id,
        templateTaskId: refrigerator.id,
        name: refrigerator.name,
        description: refrigerator.description,
        room: refrigerator.room,
        requiresCleanerPhoto: true,
        status: "pending",
      },
      {
        cleaningSessionId: sessionUpcomingAssigned.id,
        templateTaskId: masterBed.id,
        name: masterBed.name,
        description: masterBed.description,
        room: masterBed.room,
        requiresCleanerPhoto: true,
        ownerReferenceImageUrl:
          masterBed.ownerReferenceImageUrl,
        status: "pending",
      },
    ],
  });

  // -----------------------
  // Blank-list session
  // Tasks don't originate from TemplateTask
  // -----------------------

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaningSessionId: sessionUpcomingUnassigned.id,
        templateTaskId: null,
        name: "Clean living room",
        room: "Living Room",
        requiresCleanerPhoto: false,
        status: "pending",
      },
      {
        cleaningSessionId: sessionUpcomingUnassigned.id,
        templateTaskId: null,
        name: "Clean fireplace",
        room: "Living Room",
        requiresCleanerPhoto: true,
        status: "pending",
      },
    ],
  });

  // -----------------------
  // In-progress session
  // Mix of completed + pending
  // -----------------------

  const inProgressCompletedTask =
    await prisma.cleaningSessionTask.create({
      data: {
        cleaningSessionId: sessionInProgress.id,
        templateTaskId: refrigerator.id,
        name: refrigerator.name,
        description: refrigerator.description,
        room: refrigerator.room,
        requiresCleanerPhoto: true,
        status: "completed",
        completedAt: new Date(),
      },
    });

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaningSessionId: sessionInProgress.id,
        templateTaskId: kitchenSurfaces.id,
        name: kitchenSurfaces.name,
        description: kitchenSurfaces.description,
        room: kitchenSurfaces.room,
        requiresCleanerPhoto: false,
        status: "completed",
        completedAt: new Date(),
      },
      {
        cleaningSessionId: sessionInProgress.id,
        templateTaskId: masterBed.id,
        name: masterBed.name,
        description: masterBed.description,
        room: masterBed.room,
        requiresCleanerPhoto: true,
        ownerReferenceImageUrl:
          masterBed.ownerReferenceImageUrl,
        status: "pending",
      },
    ],
  });

  // -----------------------
  // Completed / payment pending
  // completed + skipped + completed
  // -----------------------

  const completedProofTask =
    await prisma.cleaningSessionTask.create({
      data: {
        cleaningSessionId: sessionCompletedPending.id,
        templateTaskId: refrigerator.id,
        name: refrigerator.name,
        description: refrigerator.description,
        room: refrigerator.room,
        requiresCleanerPhoto: true,
        status: "completed",
        completedAt: dateOnly(-3),
      },
    });

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaningSessionId: sessionCompletedPending.id,
        templateTaskId: kitchenSurfaces.id,
        name: kitchenSurfaces.name,
        room: kitchenSurfaces.room,
        requiresCleanerPhoto: false,
        status: "completed",
        completedAt: dateOnly(-3),
      },
      {
        cleaningSessionId: sessionCompletedPending.id,
        templateTaskId: sweepBalcony.id,
        name: sweepBalcony.name,
        room: sweepBalcony.room,
        requiresCleanerPhoto: false,
        status: "skipped",
      },
    ],
  });

  // -----------------------
  // Completed / received
  // -----------------------

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaningSessionId: sessionCompletedReceived.id,
        name: "Deep clean oven",
        room: "Kitchen",
        requiresCleanerPhoto: true,
        status: "completed",
        completedAt: dateOnly(-7),
      },
      {
        cleaningSessionId: sessionCompletedReceived.id,
        name: "Clean bathroom tiles",
        room: "Bathroom",
        requiresCleanerPhoto: false,
        status: "completed",
        completedAt: dateOnly(-7),
      },
    ],
  });

  // -----------------------
  // Cancelled session
  // Tasks remain pending
  // -----------------------

  await prisma.cleaningSessionTask.createMany({
    data: [
      {
        cleaningSessionId: sessionCancelled.id,
        templateTaskId: kitchenSurfaces.id,
        name: kitchenSurfaces.name,
        room: kitchenSurfaces.room,
        requiresCleanerPhoto: false,
        status: "pending",
      },
      {
        cleaningSessionId: sessionCancelled.id,
        templateTaskId: refrigerator.id,
        name: refrigerator.name,
        room: refrigerator.room,
        requiresCleanerPhoto: true,
        status: "pending",
      },
    ],
  });

  // =======================================================
  // 9. TASK IMAGES
  // =======================================================

  // Proof-required completed task WITH proof
  await prisma.taskImage.create({
    data: {
      cleaningSessionTaskId: completedProofTask.id,
      storageKey: "task-proof/refrigerator-after.jpg",
      url: "https://example.com/task-proof/refrigerator-after.jpg",
    },
  });

  // Another completed proof-required task with an image
  await prisma.taskImage.create({
    data: {
      cleaningSessionTaskId: inProgressCompletedTask.id,
      storageKey: "task-proof/refrigerator-progress.jpg",
      url: "https://example.com/task-proof/refrigerator-progress.jpg",
    },
  });

  // Pending proof-required tasks intentionally have NO TaskImage.

  // =======================================================
  // 10. NOTIFICATIONS
  // =======================================================

  await prisma.notification.createMany({
    data: [
      // Cleaner notifications
      {
        userId: cleanerAvailable.userId,
        type: "session_assigned",
        title: "New Cleaning Session",
        message: "You have been assigned to Cedars Chalet.",
        relatedEntityType: "cleaning_session",
        relatedEntityId: sessionUpcomingAssigned.id,
        isRead: false,
      },
      {
        userId: cleanerBusy.userId,
        type: "session_cancelled",
        title: "Session Cancelled",
        message: "A cleaning session has been cancelled.",
        relatedEntityType: "cleaning_session",
        relatedEntityId: sessionCancelled.id,
        isRead: true,
      },
      {
        userId: cleanerAvailable.userId,
        type: "session_updated",
        title: "Session Updated",
        message: "One of your assigned sessions was updated.",
        relatedEntityType: "cleaning_session",
        relatedEntityId: sessionUpcomingAssigned.id,
        isRead: true,
      },

      // Owner notifications
      {
        userId: ownerMain.userId,
        type: "session_started",
        title: "Cleaning Started",
        message: "Cleaning has started at Cedars Chalet.",
        relatedEntityType: "cleaning_session",
        relatedEntityId: sessionInProgress.id,
        isRead: false,
      },
      {
        userId: ownerMain.userId,
        type: "session_completed",
        title: "Cleaning Completed",
        message: "Cleaning at Mountain View Chalet is complete.",
        relatedEntityType: "cleaning_session",
        relatedEntityId: sessionCompletedPending.id,
        isRead: false,
      },

      // Admin notification
      {
        userId: adminMain.userId,
        type: "session_unassigned_alert",
        title: "Unassigned Session",
        message:
          "A cleaning request could not be assigned to a cleaner.",
        relatedEntityType: "cleaning_session",
        relatedEntityId: sessionUpcomingUnassigned.id,
        isRead: false,
      },
    ],
  });

  console.log("✅ Yalla Crew seed complete.");
  console.log(`
Seed world:
  Users:        6
  Chalets:      3
  Templates:    2
  Sessions:     6

Scenarios:
  ✓ verified owner
  ✓ unverified owner
  ✓ active available cleaner
  ✓ active busy cleaner
  ✓ inactive cleaner
  ✓ empty / active / historical chalets
  ✓ template + blank-list sessions
  ✓ assigned / unassigned
  ✓ upcoming / in-progress / completed / cancelled
  ✓ pending / received payments
  ✓ pending / completed / skipped tasks
  ✓ proof images
  ✓ read / unread notifications
  `);
}

// =========================================================
// RUN
// =========================================================

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });